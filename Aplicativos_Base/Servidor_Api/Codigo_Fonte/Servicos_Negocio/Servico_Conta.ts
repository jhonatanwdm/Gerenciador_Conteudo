import clienteBanco from '@gerenciador/banco-dados';
import { RegistroPlataformas } from '@gerenciador/nucleo-plataformas';
import { ServicoCriptografia } from './Servico_Criptografia.js';
import { ServicoRegistro } from './Servico_Registro.js';

export class ServicoConta {
  public static async listarTodas() {
    const contas = await clienteBanco.conta_Social.findMany({
      include: {
        plataforma: true,
        capacidade_conta: true,
        _count: {
          select: { destinos_publicacao: true },
        },
      },
      orderBy: { criado_em: 'desc' },
    });

    // Remove referências a credenciais sensíveis e expõe modelo seguro para frontend
    return contas.map((conta) => ({
      id: conta.id,
      plataformaId: conta.plataforma_id,
      plataformaCodigo: conta.plataforma.codigo,
      plataformaNome: conta.plataforma.nome,
      idExternoConta: conta.id_externo_conta,
      nome: conta.nome,
      nomeUsuario: conta.nome_usuario,
      nomeExibicao: conta.nome_exibicao,
      urlAvatar: conta.url_avatar,
      tipoConta: conta.tipo_conta,
      status: conta.status,
      fusoHorario: conta.fuso_horario,
      ultimaSincronizacao: conta.ultima_sincronizacao,
      totalPublicacoes: conta._count.destinos_publicacao,
      capacidades: conta.capacidade_conta
        ? {
            video: conta.capacidade_conta.suporta_video,
            videoCurto: conta.capacidade_conta.suporta_video_curto,
            imagem: conta.capacidade_conta.suporta_imagem,
            carrossel: conta.capacidade_conta.suporta_carrossel,
            reel: conta.capacidade_conta.suporta_reel,
            story: conta.capacidade_conta.suporta_story,
            agendamento: conta.capacidade_conta.suporta_agendamento,
            metricas: conta.capacidade_conta.suporta_metricas,
            comentarios: conta.capacidade_conta.suporta_comentarios,
            respostaComentario: conta.capacidade_conta.suporta_resposta,
          }
        : null,
    }));
  }

  public static async obterPorId(id: string) {
    return clienteBanco.conta_Social.findUnique({
      where: { id },
      include: {
        plataforma: true,
        capacidade_conta: true,
      },
    });
  }

  public static async conectarConta(dados: {
    codigoPlataforma: string;
    codigoAutorizacao: string;
    urlRetorno: string;
  }) {
    const registro = RegistroPlataformas.obterInstancia();
    const adaptador = registro.obterAdaptador(dados.codigoPlataforma);

    const resultadoOAuth = await adaptador.conectar(dados.codigoAutorizacao, dados.urlRetorno);

    const plataforma = await clienteBanco.plataforma_Rede.findUnique({
      where: { codigo: dados.codigoPlataforma },
    });

    if (!plataforma) {
      throw new Error(`Plataforma ${dados.codigoPlataforma} não encontrada no banco de dados.`);
    }

    const contasCriadas = [];

    for (const contaNorm of resultadoOAuth.contas) {
      const contaSalva = await clienteBanco.conta_Social.upsert({
        where: {
          plataforma_id_id_externo_conta: {
            plataforma_id: plataforma.id,
            id_externo_conta: contaNorm.idExterno,
          },
        },
        update: {
          nome: contaNorm.nome,
          nome_usuario: contaNorm.nomeUsuario,
          nome_exibicao: contaNorm.nomeExibicao,
          url_avatar: contaNorm.urlAvatar,
          status: 'CONNECTED',
          ultima_sincronizacao: new Date(),
        },
        create: {
          plataforma_id: plataforma.id,
          id_externo_conta: contaNorm.idExterno,
          nome: contaNorm.nome,
          nome_usuario: contaNorm.nomeUsuario,
          nome_exibicao: contaNorm.nomeExibicao,
          url_avatar: contaNorm.urlAvatar,
          tipo_conta: contaNorm.tipoConta,
          status: 'CONNECTED',
          capacidade_conta: {
            create: {
              suporta_video: contaNorm.capacidades.video,
              suporta_video_curto: contaNorm.capacidades.videoCurto,
              suporta_imagem: contaNorm.capacidades.imagem,
              suporta_carrossel: contaNorm.capacidades.carrossel,
              suporta_reel: contaNorm.capacidades.reel,
              suporta_story: contaNorm.capacidades.story,
              suporta_agendamento: contaNorm.capacidades.agendamento,
              suporta_metricas: contaNorm.capacidades.metricas,
              suporta_comentarios: contaNorm.capacidades.comentarios,
              suporta_resposta: contaNorm.capacidades.respostaComentario,
            },
          },
          credencial_oauth: {
            create: {
              token_acesso_cifrado: ServicoCriptografia.cifrar(resultadoOAuth.tokenAcesso),
              token_atualizacao_cifrado: resultadoOAuth.tokenAtualizacao
                ? ServicoCriptografia.cifrar(resultadoOAuth.tokenAtualizacao)
                : null,
              expira_em: resultadoOAuth.expiraEm,
            },
          },
        },
      });

      await ServicoRegistro.registrarAuditoria({
        acaoExecutada: 'CONECTAR_CONTA',
        entidadeTipo: 'Conta_Social',
        entidadeId: contaSalva.id,
        detalhes: { plataforma: dados.codigoPlataforma, conta: contaSalva.nome },
      });

      contasCriadas.push(contaSalva);
    }

    return contasCriadas;
  }

  public static async testarConexao(id: string) {
    const conta = await clienteBanco.conta_Social.findUnique({
      where: { id },
      include: { plataforma: true, credencial_oauth: true },
    });

    if (!conta || !conta.credencial_oauth) {
      throw new Error('Conta ou credenciais não localizadas.');
    }

    const tokenAcesso = ServicoCriptografia.decifrar(conta.credencial_oauth.token_acesso_cifrado);
    const adaptador = RegistroPlataformas.obterInstancia().obterAdaptador(conta.plataforma.codigo);

    const valida = await adaptador.validarConexao(tokenAcesso, conta.id_externo_conta);

    await clienteBanco.conta_Social.update({
      where: { id },
      data: {
        status: valida ? 'CONNECTED' : 'ERROR',
        ultima_sincronizacao: new Date(),
      },
    });

    return { valida, status: valida ? 'CONNECTED' : 'ERROR' };
  }

  public static async desconectar(id: string) {
    const conta = await clienteBanco.conta_Social.findUnique({
      where: { id },
      include: { credencial_oauth: true, plataforma: true },
    });

    if (conta && conta.credencial_oauth) {
      const token = ServicoCriptografia.decifrar(conta.credencial_oauth.token_acesso_cifrado);
      try {
        const adaptador = RegistroPlataformas.obterInstancia().obterAdaptador(conta.plataforma.codigo);
        await adaptador.desconectar(conta.id_externo_conta, token);
      } catch {
        // Ignora erro externo para garantir limpeza local
      }
    }

    await clienteBanco.conta_Social.update({
      where: { id },
      data: { status: 'DISCONNECTED' },
    });

    await ServicoRegistro.registrarAuditoria({
      acaoExecutada: 'DESCONECTAR_CONTA',
      entidadeTipo: 'Conta_Social',
      entidadeId: id,
    });

    return { sucesso: true };
  }
}
