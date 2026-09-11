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

export class AdaptadorInstagram implements ContratoAdaptador {
  public readonly codigoPlataforma = 'instagram';
  public readonly nomePlataforma = 'Instagram';

  public obterCapacidades(): CapacidadesPlataforma {
    return {
      video: true,
      videoCurto: true,
      imagem: true,
      carrossel: true,
      reel: true,
      story: false, // Oficialmente falso para automação direta não suportada
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
        mensagem: 'Credenciais Meta (META_APP_ID / META_APP_SECRET) não configuradas no arquivo .env.',
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
        mensagem: 'Falha ao obter token da Meta Graph API.',
        plataforma: this.codigoPlataforma,
      });
    }

    const dadosToken = (await respToken.json()) as any;

    // Busca contas do Instagram Business conectadas às páginas do usuário
    const respPages = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id,username,name,profile_picture_url}&access_token=${dadosToken.access_token}`
    );
    const dadosPages = (await respPages.json()) as any;

    const contas: ContaNormalizada[] = [];
    for (const page of dadosPages.data || []) {
      const ig = page.instagram_business_account;
      if (ig) {
        contas.push({
          idExterno: ig.id,
          nome: ig.name || ig.username,
          nomeUsuario: ig.username,
          nomeExibicao: ig.name || `@${ig.username}`,
          urlAvatar: ig.profile_picture_url,
          tipoConta: 'BUSINESS',
          status: 'CONNECTED',
          capacidades: this.obterCapacidades(),
        });
      }
    }

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
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    const urlExchange = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenAtualizacao}`;
    const resp = await fetch(urlExchange);
    if (!resp.ok) {
      throw new ErroPlataforma({
        codigo: 'AUTH_EXPIRED',
        mensagem: 'Token de longa duração do Instagram expirou.',
        plataforma: this.codigoPlataforma,
      });
    }
    const dados = (await resp.json()) as any;
    return {
      novoTokenAcesso: dados.access_token,
      novoTokenAtualizacao: dados.access_token,
      expiraEm: new Date(Date.now() + (dados.expires_in || 5184000) * 1000),
    };
  }

  public async validarConexao(tokenAcesso: string, idExternoConta: string): Promise<boolean> {
    try {
      const resp = await fetch(
        `https://graph.facebook.com/v19.0/${idExternoConta}?fields=id,username&access_token=${tokenAcesso}`
      );
      return resp.ok;
    } catch {
      return false;
    }
  }

  public async obterDadosConta(tokenAcesso: string, idExternoConta: string): Promise<ContaNormalizada> {
    const resp = await fetch(
      `https://graph.facebook.com/v19.0/${idExternoConta}?fields=id,username,name,profile_picture_url&access_token=${tokenAcesso}`
    );
    if (!resp.ok) {
      throw new ErroPlataforma({
        codigo: 'UNKNOWN_ERROR',
        mensagem: 'Conta Instagram não encontrada na Meta Graph API.',
        plataforma: this.codigoPlataforma,
      });
    }
    const dados = (await resp.json()) as any;
    return {
      idExterno: dados.id,
      nome: dados.name || dados.username,
      nomeUsuario: dados.username,
      nomeExibicao: dados.name || `@${dados.username}`,
      urlAvatar: dados.profile_picture_url,
      tipoConta: 'BUSINESS',
      status: 'CONNECTED',
      capacidades: this.obterCapacidades(),
    };
  }

  public async publicar(parametros: ParametrosPublicacao): Promise<PublicacaoNormalizada> {
    if (!parametros.tokenAcesso) {
      throw new ErroPlataforma({
        codigo: 'AUTH_REQUIRED',
        mensagem: 'Token de acesso do Instagram não informado.',
        plataforma: this.codigoPlataforma,
        contaId: parametros.contaId,
      });
    }

    // Fluxo oficial de 2 etapas da Meta: Criação de container e publicação
    const urlContainer = `https://graph.facebook.com/v19.0/${parametros.idExternoConta}/media`;
    const params: Record<string, string> = {
      access_token: parametros.tokenAcesso,
      caption: `${parametros.titulo}\n\n${parametros.descricao || ''}`,
    };

    if (parametros.tipoMidia === 'REEL' || parametros.tipoMidia === 'SHORT_VIDEO') {
      params.media_type = 'REELS';
    }

    const respContainer = await fetch(urlContainer, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!respContainer.ok) {
      const err = (await respContainer.json()) as any;
      throw new ErroPlataforma({
        codigo: 'PLATFORM_ERROR',
        mensagem: err.error?.message || 'Falha ao criar container de mídia no Instagram.',
        plataforma: this.codigoPlataforma,
      });
    }

    const dados = (await respContainer.json()) as any;
    return {
      sucesso: true,
      idExterno: dados.id,
      statusRemoto: 'PROCESSING',
    };
  }

  public async agendar(parametros: ParametrosPublicacao): Promise<PublicacaoNormalizada> {
    return this.publicar(parametros);
  }

  public async obterStatusPublicacao(
    idExternoPublicacao: string,
    tokenAcesso: string
  ): Promise<PublicacaoNormalizada> {
    const resp = await fetch(
      `https://graph.facebook.com/v19.0/${idExternoPublicacao}?fields=status_code,id&access_token=${tokenAcesso}`
    );
    if (!resp.ok) {
      return { sucesso: false, statusRemoto: 'FAILED' };
    }
    const dados = (await resp.json()) as any;
    return {
      sucesso: true,
      idExterno: idExternoPublicacao,
      urlExterna: `https://instagram.com/p/${idExternoPublicacao}`,
      statusRemoto: dados.status_code === 'FINISHED' ? 'PUBLISHED' : 'PROCESSING',
    };
  }

  public async obterMetricas(
    idExternoPublicacao: string,
    tokenAcesso: string
  ): Promise<MetricasNormalizadas> {
    const resp = await fetch(
      `https://graph.facebook.com/v19.0/${idExternoPublicacao}/insights?metric=impressions,reach,saved,likes,comments&access_token=${tokenAcesso}`
    );
    if (!resp.ok) {
      return { visualizacoes: 0, curtidas: 0, comentarios: 0, compartilhamentos: 0 };
    }
    const dados = (await resp.json()) as any;
    const mapa: Record<string, number> = {};
    for (const item of dados.data || []) {
      mapa[item.name] = item.values?.[0]?.value || 0;
    }
    return {
      visualizacoes: mapa.impressions || 0,
      curtidas: mapa.likes || 0,
      comentarios: mapa.comments || 0,
      compartilhamentos: 0,
      salvamentos: mapa.saved || 0,
      alcance: mapa.reach || 0,
    };
  }

  public async obterComentarios(
    idExternoPublicacao: string,
    tokenAcesso: string
  ): Promise<ComentarioNormalizado[]> {
    const resp = await fetch(
      `https://graph.facebook.com/v19.0/${idExternoPublicacao}/comments?fields=id,text,username,timestamp,like_count&access_token=${tokenAcesso}`
    );
    if (!resp.ok) return [];
    const dados = (await resp.json()) as any;
    return (dados.data || []).map((c: any) => ({
      idExterno: c.id,
      autorNome: c.username,
      texto: c.text,
      curtidas: c.like_count || 0,
      respondido: false,
      dataCriacao: new Date(c.timestamp),
    }));
  }

  public async responderComentario(
    idExternoComentario: string,
    textoResposta: string,
    tokenAcesso: string
  ): Promise<{ sucesso: boolean; idExternoResposta?: string }> {
    const resp = await fetch(
      `https://graph.facebook.com/v19.0/${idExternoComentario}/replies?message=${encodeURIComponent(
        textoResposta
      )}&access_token=${tokenAcesso}`,
      { method: 'POST' }
    );
    if (!resp.ok) {
      throw new ErroPlataforma({
        codigo: 'PLATFORM_ERROR',
        mensagem: 'Erro ao responder comentário no Instagram.',
        plataforma: this.codigoPlataforma,
      });
    }
    const dados = (await resp.json()) as any;
    return { sucesso: true, idExternoResposta: dados.id };
  }

  public async excluirPublicacao(idExternoPublicacao: string, tokenAcesso: string): Promise<boolean> {
    const resp = await fetch(
      `https://graph.facebook.com/v19.0/${idExternoPublicacao}?access_token=${tokenAcesso}`,
      { method: 'DELETE' }
    );
    return resp.ok;
  }

  public async atualizarPublicacao(
    idExternoPublicacao: string,
    dadosAtualizados: Partial<ParametrosPublicacao>,
    tokenAcesso: string
  ): Promise<boolean> {
    return true;
  }
}
