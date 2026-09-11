import clienteBanco from '@gerenciador/banco-dados';
import { RegistroPlataformas, ResolvedorCapacidades } from '@gerenciador/nucleo-plataformas';
import { ServicoCriptografia } from './Servico_Criptografia.js';
import { ServicoRegistro } from './Servico_Registro.js';

export interface DestinoEntrada {
  contaSocialId: string;
  tituloPersonalizado?: string;
  descricaoPersonalizada?: string;
  legendaPersonalizada?: string;
  hashtagsPersonalizadas?: string;
  ctaPersonalizado?: string;
  agendadoPara?: string | Date;
}

export class ServicoPublicacao {
  public static async listarTodas(filtros?: { status?: string; campanhaId?: string }) {
    const publicacoes = await clienteBanco.publicacao_Acao.findMany({
      where: {
        ...(filtros?.status ? { status_global: filtros.status } : {}),
        ...(filtros?.campanhaId ? { campanha_id: filtros.campanhaId } : {}),
      },
      include: {
        conteudo: true,
        campanha: true,
        destinos: {
          include: {
            conta_social: true,
            plataforma: true,
            instantaneos_metricas: {
              orderBy: { capturado_em: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { criado_em: 'desc' },
    });

    return publicacoes.map((pub) => {
      const totalDestinos = pub.destinos.length;
      const publicados = pub.destinos.filter((d) => d.status === 'PUBLISHED').length;
      const falhas = pub.destinos.filter((d) => d.status === 'FAILED').length;
      const processando = pub.destinos.filter((d) =>
        ['QUEUED', 'VALIDATING', 'PROCESSING', 'UPLOADING', 'PUBLISHING'].includes(d.status)
      ).length;
      const agendados = pub.destinos.filter((d) => d.status === 'SCHEDULED').length;

      return {
        id: pub.id,
        conteudoId: pub.conteudo_id,
        tituloConteudo: pub.conteudo.titulo,
        tipoConteudo: pub.conteudo.tipo_conteudo,
        campanhaNome: pub.campanha?.nome,
        statusGlobal: pub.status_global,
        criadoEm: pub.criado_em,
        progresso: {
          total: totalDestinos,
          publicados,
          falhas,
          processando,
          agendados,
          textoResumo: `${publicados} / ${totalDestinos} publicados`,
        },
        destinos: pub.destinos.map((d) => ({
          id: d.id,
          plataformaCodigo: d.plataforma.codigo,
          plataformaNome: d.plataforma.nome,
          contaNome: d.conta_social.nome_exibicao,
          contaUsuario: d.conta_social.nome_usuario,
          status: d.status,
          agendadoPara: d.agendado_para,
          publicadoEm: d.publicado_em,
          urlExterna: d.url_externa,
          codigoErro: d.codigo_erro,
          mensagemErro: d.mensagem_erro,
          metricasRecentes: d.instantaneos_metricas[0] || null,
        })),
      };
    });
  }

  public static async obterPorId(id: string) {
    const pub = await clienteBanco.publicacao_Acao.findUnique({
      where: { id },
      include: {
        conteudo: true,
        campanha: true,
        destinos: {
          include: {
            conta_social: {
              include: { capacidade_conta: true },
            },
            plataforma: true,
            instantaneos_metricas: {
              orderBy: { capturado_em: 'desc' },
              take: 5,
            },
          },
        },
        relacoes_como_origem: {
          include: { publicacao_destino: { include: { conteudo: true } } },
        },
      },
    });

    if (!pub) return null;

    const totalDestinos = pub.destinos.length;
    const publicados = pub.destinos.filter((d) => d.status === 'PUBLISHED').length;
    const falhas = pub.destinos.filter((d) => d.status === 'FAILED').length;
    const processando = pub.destinos.filter((d) =>
      ['QUEUED', 'VALIDATING', 'PROCESSING', 'UPLOADING', 'PUBLISHING'].includes(d.status)
    ).length;

    return {
      ...pub,
      progresso: {
        total: totalDestinos,
        publicados,
        falhas,
        processando,
      },
    };
  }

  public static async criarPublicacao(dados: {
    conteudoId: string;
    campanhaId?: string;
    destinos: DestinoEntrada[];
    modoAgendar?: boolean;
  }) {
    const conteudo = await clienteBanco.conteudo_Base.findUnique({
      where: { id: dados.conteudoId },
    });

    if (!conteudo) {
      throw new Error('Conteúdo não encontrado.');
    }

    if (!dados.destinos || dados.destinos.length === 0) {
      throw new Error('Selecione pelo menos um destino de conta para publicar.');
    }

    // 1. Cria a publicação ação
    const publicacao = await clienteBanco.publicacao_Acao.create({
      data: {
        conteudo_id: dados.conteudoId,
        campanha_id: dados.campanhaId,
        status_global: 'PENDING',
      },
    });

    const destinosCriados = [];

    // 2. Cria cada Destino_Publicacao isolado com snapshot dos dados no momento
    for (const d of dados.destinos) {
      const conta = await clienteBanco.conta_Social.findUnique({
        where: { id: d.contaSocialId },
        include: { plataforma: true, capacidade_conta: true },
      });

      if (!conta) continue;

      const agendamentoData = d.agendadoPara ? new Date(d.agendadoPara) : null;
      const statusInicial = agendamentoData && agendamentoData > new Date() ? 'SCHEDULED' : 'QUEUED';

      const chaveIdempotencia = `${conteudo.id}_${publicacao.id}_${conta.id}`;

      const destino = await clienteBanco.destino_Publicacao.create({
        data: {
          publicacao_id: publicacao.id,
          conta_social_id: conta.id,
          plataforma_id: conta.plataforma_id,
          titulo_personalizado: d.tituloPersonalizado || conteudo.titulo,
          descricao_personalizada: d.descricaoPersonalizada || conteudo.descricao,
          legenda_personalizada: d.legendaPersonalizada,
          hashtags_personalizadas: d.hashtagsPersonalizadas,
          cta_personalizado: d.ctaPersonalizado,
          agendado_para: agendamentoData,
          status: statusInicial,
          chave_idempotencia: chaveIdempotencia,
        },
      });

      destinosCriados.push(destino);

      // Se for publicação imediata, dispara processamento independente do destino
      if (statusInicial === 'QUEUED') {
        // Disparo assíncrono isolado para não bloquear requisição HTTP
        this.processarDestinoIndividual(destino.id).catch((erro) => {
          console.error(`Erro ao processar destino ${destino.id}:`, erro);
        });
      }
    }

    await ServicoRegistro.registrarAuditoria({
      acaoExecutada: 'CRIAR_PUBLICACAO',
      entidadeTipo: 'Publicacao_Acao',
      entidadeId: publicacao.id,
      detalhes: {
        conteudo: conteudo.titulo,
        totalDestinos: destinosCriados.length,
      },
    });

    return {
      publicacaoId: publicacao.id,
      totalDestinos: destinosCriados.length,
      destinos: destinosCriados,
    };
  }

  public static async processarDestinoIndividual(destinoId: string): Promise<void> {
    const destino = await clienteBanco.destino_Publicacao.findUnique({
      where: { id: destinoId },
      include: {
        conta_social: {
          include: { credencial_oauth: true, capacidade_conta: true },
        },
        plataforma: true,
        publicacao: {
          include: { conteudo: true },
        },
      },
    });

    if (!destino || !destino.conta_social) return;

    // Atualiza status para PROCESSING
    await clienteBanco.destino_Publicacao.update({
      where: { id: destinoId },
      data: { status: 'PROCESSING', total_tentativas: { increment: 1 } },
    });

    const registro = RegistroPlataformas.obterInstancia();

    try {
      const adaptador = registro.obterAdaptador(destino.plataforma.codigo);

      // Descriptografa token de acesso com segurança
      let tokenAcesso = '';
      if (destino.conta_social.credencial_oauth?.token_acesso_cifrado) {
        tokenAcesso = ServicoCriptografia.decifrar(
          destino.conta_social.credencial_oauth.token_acesso_cifrado
        );
      }

      // Validação de regras e capacidades
      if (destino.conta_social.capacidade_conta) {
        ResolvedorCapacidades.validarCapacidade(
          {
            video: destino.conta_social.capacidade_conta.suporta_video,
            videoCurto: destino.conta_social.capacidade_conta.suporta_video_curto,
            imagem: destino.conta_social.capacidade_conta.suporta_imagem,
            carrossel: destino.conta_social.capacidade_conta.suporta_carrossel,
            reel: destino.conta_social.capacidade_conta.suporta_reel,
            story: destino.conta_social.capacidade_conta.suporta_story,
            agendamento: destino.conta_social.capacidade_conta.suporta_agendamento,
            metricas: destino.conta_social.capacidade_conta.suporta_metricas,
            comentarios: destino.conta_social.capacidade_conta.suporta_comentarios,
            respostaComentario: destino.conta_social.capacidade_conta.suporta_resposta,
          },
          {
            destinoId: destino.id,
            contaId: destino.conta_social_id,
            idExternoConta: destino.conta_social.id_externo_conta,
            titulo: destino.titulo_personalizado || destino.publicacao.conteudo.titulo,
            tipoMidia: 'SHORT_VIDEO',
            tokenAcesso,
          },
          destino.plataforma.nome
        );
      }

      // Executa publicação
      const resultado = await adaptador.publicar({
        destinoId: destino.id,
        contaId: destino.conta_social_id,
        idExternoConta: destino.conta_social.id_externo_conta,
        titulo: destino.titulo_personalizado || destino.publicacao.conteudo.titulo,
        descricao: destino.descricao_personalizada || destino.publicacao.conteudo.descricao || undefined,
        tipoMidia: 'SHORT_VIDEO',
        tokenAcesso,
      });

      // Sucesso isolado no destino
      await clienteBanco.destino_Publicacao.update({
        where: { id: destinoId },
        data: {
          status: 'PUBLISHED',
          id_externo: resultado.idExterno,
          url_externa: resultado.urlExterna,
          publicado_em: new Date(),
          codigo_erro: null,
          mensagem_erro: null,
        },
      });

      // Gera instantâneo de métricas inicial
      const metricasIniciais = await adaptador.obterMetricas(
        resultado.idExterno || 'mock',
        tokenAcesso
      );

      await clienteBanco.instantaneo_Metricas.create({
        data: {
          destino_publicacao_id: destino.id,
          visualizacoes: metricasIniciais.visualizacoes,
          curtidas: metricasIniciais.curtidas,
          comentarios: metricasIniciais.comentarios,
          compartilhamentos: metricasIniciais.compartilhamentos,
        },
      });
    } catch (erro: any) {
      // Falha isolada: registra erro somente neste destino sem cancelar os demais
      await clienteBanco.destino_Publicacao.update({
        where: { id: destinoId },
        data: {
          status: 'FAILED',
          codigo_erro: erro.codigo || 'UNKNOWN_ERROR',
          mensagem_erro: erro.message || 'Falha desconhecida no destino',
        },
      });

      await ServicoRegistro.registrarSistema({
        nivel: 'ERROR',
        modulo: `Publicacao_${destino.plataforma.codigo}`,
        mensagem: `Falha no destino ${destino.id} (${destino.conta_social.nome_exibicao}): ${erro.message}`,
      });
    } finally {
      // Recalcula o status global da publicação mãe
      await this.atualizarStatusGlobal(destino.publicacao_id);
    }
  }

  public static async atualizarStatusGlobal(publicacaoId: string): Promise<void> {
    const destinos = await clienteBanco.destino_Publicacao.findMany({
      where: { publicacao_id: publicacaoId },
    });

    if (destinos.length === 0) return;

    const todosPublicados = destinos.every((d) => d.status === 'PUBLISHED');
    const todosFalharam = destinos.every((d) => d.status === 'FAILED');
    const temAlgumPublicado = destinos.some((d) => d.status === 'PUBLISHED');
    const temAlgumaFalha = destinos.some((d) => d.status === 'FAILED');

    let statusGlobal = 'PENDING';

    if (todosPublicados) {
      statusGlobal = 'SUCCESS';
    } else if (todosFalharam) {
      statusGlobal = 'FAILED';
    } else if (temAlgumPublicado && temAlgumaFalha) {
      statusGlobal = 'PARTIAL';
    }

    await clienteBanco.publicacao_Acao.update({
      where: { id: publicacaoId },
      data: { status_global: statusGlobal },
    });
  }

  public static async tentarNovamenteDestino(destinoId: string) {
    const destino = await clienteBanco.destino_Publicacao.findUnique({
      where: { id: destinoId },
    });

    if (!destino) {
      throw new Error('Destino não encontrado.');
    }

    // Apenas este destino específico é reenviado para a fila
    await clienteBanco.destino_Publicacao.update({
      where: { id: destinoId },
      data: {
        status: 'QUEUED',
        codigo_erro: null,
        mensagem_erro: null,
      },
    });

    this.processarDestinoIndividual(destinoId).catch((erro) => {
      console.error(`Erro no retry do destino ${destinoId}:`, erro);
    });

    return { sucesso: true, mensagem: 'Reprocessamento iniciado para o destino.' };
  }

  public static async repostarPublicacao(dados: {
    publicacaoOrigemId: string;
    novosDestinos: DestinoEntrada[];
    tituloSobrescrito?: string;
    descricaoSobrescrita?: string;
  }) {
    const publicacaoOrigem = await clienteBanco.publicacao_Acao.findUnique({
      where: { id: dados.publicacaoOrigemId },
      include: { conteudo: true },
    });

    if (!publicacaoOrigem) {
      throw new Error('Publicação original não encontrada.');
    }

    // Cria nova publicação desdobrada
    const novaPublicacao = await this.criarPublicacao({
      conteudoId: publicacaoOrigem.conteudo_id,
      destinos: dados.novosDestinos,
    });

    // Registra relacionamento formal de repostagem
    await clienteBanco.relacao_Publicacao.create({
      data: {
        publicacao_origem_id: dados.publicacaoOrigemId,
        publicacao_destino_id: novaPublicacao.publicacaoId,
        tipo_relacao: 'REPOST',
      },
    });

    return novaPublicacao;
  }
}
