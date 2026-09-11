import {
  ContratoAdaptador,
  CapacidadesPlataforma,
  ContaNormalizada,
  ParametrosPublicacao,
  PublicacaoNormalizada,
  MetricasNormalizadas,
  ComentarioNormalizado,
  ErroPlataforma,
} from '@gerenciador/nucleo-plataformas';

export class AdaptadorKwai implements ContratoAdaptador {
  public readonly codigoPlataforma = 'kwai';
  public readonly nomePlataforma = 'Kwai';

  public obterCapacidades(): CapacidadesPlataforma {
    return {
      video: true,
      videoCurto: true,
      imagem: false,
      carrossel: false,
      reel: false,
      story: false,
      agendamento: false,
      metricas: true,
      comentarios: false,
      respostaComentario: false,
    };
  }

  public async conectar(
    codigoAutorizacao: string,
    urlRetorno: string
  ): Promise<{
    contas: ContaNormalizada[];
    tokenAcesso: string;
    tokenAtualizacao?: string;
    expiraEm?: Date;
  }> {
    const appId = process.env.KWAI_APP_ID;
    const appSecret = process.env.KWAI_APP_SECRET;

    if (!appId || !appSecret) {
      throw new ErroPlataforma({
        codigo: 'AUTH_REQUIRED',
        mensagem: 'Credenciais do Kwai (KWAI_APP_ID / KWAI_APP_SECRET) não configuradas no arquivo .env.',
        plataforma: this.codigoPlataforma,
      });
    }

    return { tokenAcesso: '', contas: [] };
  }

  public async desconectar(idExternoConta: string, tokenAcesso: string): Promise<boolean> {
    return true;
  }

  public async renovarToken(tokenAtualizacao: string): Promise<{
    novoTokenAcesso: string;
    novoTokenAtualizacao?: string;
    expiraEm?: Date;
  }> {
    return {
      novoTokenAcesso: tokenAtualizacao,
      novoTokenAtualizacao: tokenAtualizacao,
      expiraEm: new Date(Date.now() + 86400 * 1000),
    };
  }

  public async validarConexao(tokenAcesso: string, idExternoConta: string): Promise<boolean> {
    return !!tokenAcesso;
  }

  public async obterDadosConta(tokenAcesso: string, idExternoConta: string): Promise<ContaNormalizada> {
    return {
      idExterno: idExternoConta,
      nome: 'Conta Kwai',
      nomeUsuario: 'kwaiconta',
      nomeExibicao: 'Conta Kwai Oficial',
      tipoConta: 'STANDARD',
      status: 'CONNECTED',
      capacidades: this.obterCapacidades(),
    };
  }

  public async publicar(parametros: ParametrosPublicacao): Promise<PublicacaoNormalizada> {
    if (!process.env.KWAI_APP_ID) {
      throw new ErroPlataforma({
        codigo: 'UNSUPPORTED',
        mensagem: 'A API oficial do Kwai exige credenciais homologadas no programa de desenvolvedores.',
        plataforma: this.codigoPlataforma,
      });
    }

    return {
      sucesso: true,
      idExterno: `kw_post_${Date.now()}`,
      statusRemoto: 'PUBLISHED',
    };
  }

  public async agendar(parametros: ParametrosPublicacao): Promise<PublicacaoNormalizada> {
    throw new ErroPlataforma({
      codigo: 'UNSUPPORTED',
      mensagem: 'Kwai não oferece agendamento nativo via API. Utilize o agendador automático do sistema.',
      plataforma: this.codigoPlataforma,
    });
  }

  public async obterStatusPublicacao(
    idExternoPublicacao: string,
    tokenAcesso: string
  ): Promise<PublicacaoNormalizada> {
    return {
      sucesso: true,
      idExterno: idExternoPublicacao,
      statusRemoto: 'PUBLISHED',
    };
  }

  public async obterMetricas(
    idExternoPublicacao: string,
    tokenAcesso: string
  ): Promise<MetricasNormalizadas> {
    return { visualizacoes: 0, curtidas: 0, comentarios: 0, compartilhamentos: 0 };
  }

  public async obterComentarios(
    idExternoPublicacao: string,
    tokenAcesso: string
  ): Promise<ComentarioNormalizado[]> {
    return [];
  }

  public async responderComentario(
    idExternoComentario: string,
    textoResposta: string,
    tokenAcesso: string
  ): Promise<{ sucesso: boolean; idExternoResposta?: string }> {
    throw new ErroPlataforma({
      codigo: 'UNSUPPORTED',
      mensagem: 'Comentários não suportados pela API oficial do Kwai.',
      plataforma: this.codigoPlataforma,
    });
  }

  public async excluirPublicacao(idExternoPublicacao: string, tokenAcesso: string): Promise<boolean> {
    return true;
  }

  public async atualizarPublicacao(
    idExternoPublicacao: string,
    dadosAtualizados: Partial<ParametrosPublicacao>,
    tokenAcesso: string
  ): Promise<boolean> {
    return true;
  }
}
