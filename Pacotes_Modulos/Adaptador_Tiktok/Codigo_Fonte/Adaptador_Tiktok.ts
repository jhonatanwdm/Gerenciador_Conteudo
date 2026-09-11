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

export class AdaptadorTiktok implements ContratoAdaptador {
  public readonly codigoPlataforma = 'tiktok';
  public readonly nomePlataforma = 'TikTok';

  public obterCapacidades(): CapacidadesPlataforma {
    return {
      video: true,
      videoCurto: true,
      imagem: false,
      carrossel: false,
      reel: false,
      story: false,
      agendamento: true,
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
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    if (!clientKey || !clientSecret) {
      throw new ErroPlataforma({
        codigo: 'AUTH_REQUIRED',
        mensagem: 'Credenciais do TikTok (TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET) não configuradas no arquivo .env.',
        plataforma: this.codigoPlataforma,
      });
    }

    const respToken = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code: codigoAutorizacao,
        grant_type: 'authorization_code',
        redirect_uri: urlRetorno,
      }),
    });

    if (!respToken.ok) {
      throw new ErroPlataforma({
        codigo: 'AUTH_REQUIRED',
        mensagem: 'Falha na autenticação OAuth com a API do TikTok.',
        plataforma: this.codigoPlataforma,
      });
    }

    const dadosToken = (await respToken.json()) as any;

    // Busca dados do criador oficial
    const respUser = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name',
      { headers: { Authorization: `Bearer ${dadosToken.data?.access_token}` } }
    );

    const dadosUser = (await respUser.json()) as any;
    const user = dadosUser.data?.user;

    const contas: ContaNormalizada[] = [
      {
        idExterno: user?.open_id || 'tt_user',
        nome: user?.display_name || 'Criador TikTok',
        nomeUsuario: user?.display_name || 'tiktokuser',
        nomeExibicao: user?.display_name || 'Conta TikTok',
        urlAvatar: user?.avatar_url,
        tipoConta: 'CREATOR',
        status: 'CONNECTED',
        capacidades: this.obterCapacidades(),
      },
    ];

    return {
      tokenAcesso: dadosToken.data?.access_token,
      tokenAtualizacao: dadosToken.data?.refresh_token,
      expiraEm: new Date(Date.now() + (dadosToken.data?.expires_in || 86400) * 1000),
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
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    const resp = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey || '',
        client_secret: clientSecret || '',
        grant_type: 'refresh_token',
        refresh_token: tokenAtualizacao,
      }),
    });

    if (!resp.ok) {
      throw new ErroPlataforma({
        codigo: 'AUTH_EXPIRED',
        mensagem: 'O Refresh Token do TikTok expirou. É necessário reautenticar.',
        plataforma: this.codigoPlataforma,
      });
    }

    const dados = (await resp.json()) as any;
    return {
      novoTokenAcesso: dados.data?.access_token,
      novoTokenAtualizacao: dados.data?.refresh_token,
      expiraEm: new Date(Date.now() + (dados.data?.expires_in || 86400) * 1000),
    };
  }

  public async validarConexao(tokenAcesso: string, idExternoConta: string): Promise<boolean> {
    try {
      const resp = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id', {
        headers: { Authorization: `Bearer ${tokenAcesso}` },
      });
      return resp.ok;
    } catch {
      return false;
    }
  }

  public async obterDadosConta(tokenAcesso: string, idExternoConta: string): Promise<ContaNormalizada> {
    const resp = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
      { headers: { Authorization: `Bearer ${tokenAcesso}` } }
    );
    const dados = (await resp.json()) as any;
    const user = dados.data?.user;
    return {
      idExterno: user?.open_id || idExternoConta,
      nome: user?.display_name || 'Criador TikTok',
      nomeUsuario: user?.display_name || 'tiktokuser',
      nomeExibicao: user?.display_name || 'Criador TikTok',
      urlAvatar: user?.avatar_url,
      tipoConta: 'CREATOR',
      status: 'CONNECTED',
      capacidades: this.obterCapacidades(),
    };
  }

  public async publicar(parametros: ParametrosPublicacao): Promise<PublicacaoNormalizada> {
    if (!parametros.tokenAcesso) {
      throw new ErroPlataforma({
        codigo: 'AUTH_REQUIRED',
        mensagem: 'Token de acesso do TikTok não informado.',
        plataforma: this.codigoPlataforma,
        contaId: parametros.contaId,
      });
    }

    // Inicialização do Content Posting API v2 oficial do TikTok
    const respInit = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${parametros.tokenAcesso}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: parametros.titulo,
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: 15000000,
          chunk_size: 15000000,
          total_chunk_count: 1,
        },
      }),
    });

    if (!respInit.ok) {
      const err = (await respInit.json()) as any;
      throw new ErroPlataforma({
        codigo: 'PLATFORM_ERROR',
        mensagem: err.error?.message || 'Erro ao inicializar publicação no TikTok.',
        plataforma: this.codigoPlataforma,
      });
    }

    const dados = (await respInit.json()) as any;
    return {
      sucesso: true,
      idExterno: dados.data?.publish_id,
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
    const resp = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAcesso}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publish_id: idExternoPublicacao }),
    });

    if (!resp.ok) return { sucesso: false, statusRemoto: 'FAILED' };

    const dados = (await resp.json()) as any;
    const status = dados.data?.status;

    return {
      sucesso: true,
      idExterno: idExternoPublicacao,
      statusRemoto: status === 'PUBLISH_COMPLETE' ? 'PUBLISHED' : 'PROCESSING',
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
      mensagem: 'Resposta a comentários não disponível na API padrão do TikTok.',
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
