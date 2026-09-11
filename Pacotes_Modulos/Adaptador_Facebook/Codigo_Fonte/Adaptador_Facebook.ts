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

export class AdaptadorFacebook implements ContratoAdaptador {
  public readonly codigoPlataforma = 'facebook';
  public readonly nomePlataforma = 'Facebook';

  public obterCapacidades(): CapacidadesPlataforma {
    return {
      video: true,
      videoCurto: true,
      imagem: true,
      carrossel: false,
      reel: true,
      story: false,
      agendamento: true,
      metricas: true,
      comentarios: true,
      respostaComentario: true,
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
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!appId || !appSecret) {
      throw new ErroPlataforma({
        codigo: 'AUTH_REQUIRED',
        mensagem: 'Credenciais da Meta (META_APP_ID / META_APP_SECRET) não configuradas no arquivo .env.',
        plataforma: this.codigoPlataforma,
      });
    }

    const urlToken = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
      urlRetorno
    )}&client_secret=${appSecret}&code=${codigoAutorizacao}`;

    const respToken = await fetch(urlToken);
    if (!respToken.ok) {
      throw new ErroPlataforma({
        codigo: 'AUTH_REQUIRED',
        mensagem: 'Falha ao autenticar com o Facebook OAuth.',
        plataforma: this.codigoPlataforma,
      });
    }

    const dadosToken = (await respToken.json()) as any;

    // Busca Páginas administradas pelo usuário
    const respPages = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${dadosToken.access_token}`
    );
    const dadosPages = (await respPages.json()) as any;

    const contas: ContaNormalizada[] = (dadosPages.data || []).map((page: any) => ({
      idExterno: page.id,
      nome: page.name,
      nomeUsuario: page.id,
      nomeExibicao: page.name,
      tipoConta: 'PAGE',
      status: 'CONNECTED',
      capacidades: this.obterCapacidades(),
    }));

    return {
      tokenAcesso: dadosToken.access_token,
      tokenAtualizacao: dadosToken.access_token,
      expiraEm: new Date(Date.now() + 60 * 86400 * 1000),
      contas,
    };
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
      expiraEm: new Date(Date.now() + 60 * 86400 * 1000),
    };
  }

  public async validarConexao(tokenAcesso: string, idExternoConta: string): Promise<boolean> {
    try {
      const resp = await fetch(`https://graph.facebook.com/v19.0/${idExternoConta}?access_token=${tokenAcesso}`);
      return resp.ok;
    } catch {
      return false;
    }
  }

  public async obterDadosConta(tokenAcesso: string, idExternoConta: string): Promise<ContaNormalizada> {
    const resp = await fetch(
      `https://graph.facebook.com/v19.0/${idExternoConta}?fields=id,name,picture&access_token=${tokenAcesso}`
    );
    const dados = (await resp.json()) as any;
    return {
      idExterno: dados.id,
      nome: dados.name,
      nomeUsuario: dados.id,
      nomeExibicao: dados.name,
      urlAvatar: dados.picture?.data?.url,
      tipoConta: 'PAGE',
      status: 'CONNECTED',
      capacidades: this.obterCapacidades(),
    };
  }

  public async publicar(parametros: ParametrosPublicacao): Promise<PublicacaoNormalizada> {
    if (!parametros.tokenAcesso) {
      throw new ErroPlataforma({
        codigo: 'AUTH_REQUIRED',
        mensagem: 'Token de acesso da Página Facebook não informado.',
        plataforma: this.codigoPlataforma,
      });
    }

    const urlFeed = `https://graph.facebook.com/v19.0/${parametros.idExternoConta}/feed`;
    const resp = await fetch(urlFeed, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `${parametros.titulo}\n\n${parametros.descricao || ''}`,
        access_token: parametros.tokenAcesso,
      }),
    });

    if (!resp.ok) {
      const err = (await resp.json()) as any;
      throw new ErroPlataforma({
        codigo: 'PLATFORM_ERROR',
        mensagem: err.error?.message || 'Erro ao publicar na Página Facebook.',
        plataforma: this.codigoPlataforma,
      });
    }

    const dados = (await resp.json()) as any;
    return {
      sucesso: true,
      idExterno: dados.id,
      urlExterna: `https://facebook.com/${dados.id}`,
      statusRemoto: 'PUBLISHED',
    };
  }

  public async agendar(parametros: ParametrosPublicacao): Promise<PublicacaoNormalizada> {
    return this.publicar(parametros);
  }

  public async obterStatusPublicacao(
    idExternoPublicacao: string,
    tokenAcesso: string
  ): Promise<PublicacaoNormalizada> {
    return {
      sucesso: true,
      idExterno: idExternoPublicacao,
      urlExterna: `https://facebook.com/${idExternoPublicacao}`,
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
    return { sucesso: true };
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
