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

export class AdaptadorYoutube implements ContratoAdaptador {
  public readonly codigoPlataforma = 'youtube';
  public readonly nomePlataforma = 'YouTube';

  public obterCapacidades(): CapacidadesPlataforma {
    return {
      video: true,
      videoCurto: true, // YouTube Shorts
      imagem: false,
      carrossel: false,
      reel: false,
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
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new ErroPlataforma({
        codigo: 'AUTH_REQUIRED',
        mensagem: 'Credenciais do Google Cloud (YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET) não configuradas no arquivo .env.',
        plataforma: this.codigoPlataforma,
      });
    }

    try {
      const respostaToken = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: codigoAutorizacao,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: urlRetorno,
          grant_type: 'authorization_code',
        }),
      });

      if (!respostaToken.ok) {
        throw new ErroPlataforma({
          codigo: 'AUTH_REQUIRED',
          mensagem: 'Código de autorização inválido ou expirado no Google OAuth.',
          plataforma: this.codigoPlataforma,
          statusHttp: respostaToken.status,
        });
      }

      const dadosToken = (await respostaToken.json()) as any;

      // Busca os canais vinculados ao token oficial
      const respostaCanais = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
        { headers: { Authorization: `Bearer ${dadosToken.access_token}` } }
      );

      if (!respostaCanais.ok) {
        throw new ErroPlataforma({
          codigo: 'PLATFORM_ERROR',
          mensagem: 'Falha ao obter canais da conta no YouTube API.',
          plataforma: this.codigoPlataforma,
        });
      }

      const dadosCanais = (await respostaCanais.json()) as any;
      const contas: ContaNormalizada[] = (dadosCanais.items || []).map((item: any) => ({
        idExterno: item.id,
        nome: item.snippet.title,
        nomeUsuario: item.snippet.customUrl || item.id,
        nomeExibicao: item.snippet.title,
        urlAvatar: item.snippet.thumbnails?.default?.url,
        tipoConta: 'CHANNEL',
        status: 'CONNECTED',
        capacidades: this.obterCapacidades(),
      }));

      return {
        tokenAcesso: dadosToken.access_token,
        tokenAtualizacao: dadosToken.refresh_token,
        expiraEm: new Date(Date.now() + (dadosToken.expires_in || 3600) * 1000),
        contas,
      };
    } catch (erro: any) {
      if (erro instanceof ErroPlataforma) throw erro;
      throw new ErroPlataforma({
        codigo: 'NETWORK_ERROR',
        mensagem: `Erro de comunicação com a API do YouTube: ${erro.message}`,
        plataforma: this.codigoPlataforma,
      });
    }
  }

  public async desconectar(idExternoConta: string, tokenAcesso: string): Promise<boolean> {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${tokenAcesso}`, {
        method: 'POST',
      });
      return true;
    } catch {
      return false;
    }
  }

  public async renovarToken(tokenAtualizacao: string): Promise<{
    novoTokenAcesso: string;
    novoTokenAtualizacao?: string;
    expiraEm?: Date;
  }> {
    const resposta = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.YOUTUBE_CLIENT_ID || '',
        client_secret: process.env.YOUTUBE_CLIENT_SECRET || '',
        refresh_token: tokenAtualizacao,
        grant_type: 'refresh_token',
      }),
    });

    if (!resposta.ok) {
      throw new ErroPlataforma({
        codigo: 'AUTH_EXPIRED',
        mensagem: 'O Refresh Token do canal YouTube expirou ou foi revogado.',
        plataforma: this.codigoPlataforma,
      });
    }

    const dados = (await resposta.json()) as any;
    return {
      novoTokenAcesso: dados.access_token,
      novoTokenAtualizacao: tokenAtualizacao,
      expiraEm: new Date(Date.now() + dados.expires_in * 1000),
    };
  }

  public async validarConexao(tokenAcesso: string, idExternoConta: string): Promise<boolean> {
    try {
      const resp = await fetch('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
        headers: { Authorization: `Bearer ${tokenAcesso}` },
      });
      return resp.ok;
    } catch {
      return false;
    }
  }

  public async obterDadosConta(tokenAcesso: string, idExternoConta: string): Promise<ContaNormalizada> {
    const resp = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${idExternoConta}`,
      { headers: { Authorization: `Bearer ${tokenAcesso}` } }
    );
    const dados = (await resp.json()) as any;
    const item = dados.items?.[0];
    if (!item) {
      throw new ErroPlataforma({
        codigo: 'UNKNOWN_ERROR',
        mensagem: 'Canal não encontrado na API do YouTube.',
        plataforma: this.codigoPlataforma,
      });
    }

    return {
      idExterno: item.id,
      nome: item.snippet.title,
      nomeUsuario: item.snippet.customUrl || item.id,
      nomeExibicao: item.snippet.title,
      urlAvatar: item.snippet.thumbnails?.default?.url,
      tipoConta: 'CHANNEL',
      status: 'CONNECTED',
      capacidades: this.obterCapacidades(),
    };
  }

  public async publicar(parametros: ParametrosPublicacao): Promise<PublicacaoNormalizada> {
    if (!parametros.tokenAcesso) {
      throw new ErroPlataforma({
        codigo: 'AUTH_REQUIRED',
        mensagem: 'Token de acesso do YouTube não informado ou inválido.',
        plataforma: this.codigoPlataforma,
        contaId: parametros.contaId,
      });
    }

    // Inicialização do upload resumível oficial
    const snippet = {
      title: parametros.titulo,
      description: parametros.descricao || '',
      tags: parametros.hashtags || [],
      categoryId: '22',
    };

    const statusObj = {
      privacyStatus: parametros.privacidade?.toLowerCase() || 'public',
      selfDeclaredMadeForKids: false,
    };

    const respInit = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${parametros.tokenAcesso}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ snippet, status: statusObj }),
      }
    );

    if (!respInit.ok) {
      if (respInit.status === 403) {
        throw new ErroPlataforma({
          codigo: 'QUOTA_EXCEEDED',
          mensagem: 'Quota diária da API do YouTube atingida para esta aplicação.',
          plataforma: this.codigoPlataforma,
        });
      }
      throw new ErroPlataforma({
        codigo: 'PLATFORM_ERROR',
        mensagem: `Erro ao iniciar upload no YouTube: ${respInit.statusText}`,
        plataforma: this.codigoPlataforma,
      });
    }

    const uploadUrl = respInit.headers.get('location');
    return {
      sucesso: true,
      idExterno: uploadUrl || `yt_upload_${Date.now()}`,
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
      `https://www.googleapis.com/youtube/v3/videos?part=status&id=${idExternoPublicacao}`,
      { headers: { Authorization: `Bearer ${tokenAcesso}` } }
    );
    if (!resp.ok) {
      throw new ErroPlataforma({
        codigo: 'PLATFORM_ERROR',
        mensagem: 'Erro ao consultar status no YouTube.',
        plataforma: this.codigoPlataforma,
      });
    }

    const dados = (await resp.json()) as any;
    const statusUpload = dados.items?.[0]?.status?.uploadStatus;

    return {
      sucesso: true,
      idExterno: idExternoPublicacao,
      urlExterna: `https://youtube.com/watch?v=${idExternoPublicacao}`,
      statusRemoto: statusUpload === 'processed' ? 'PUBLISHED' : 'PROCESSING',
    };
  }

  public async obterMetricas(
    idExternoPublicacao: string,
    tokenAcesso: string
  ): Promise<MetricasNormalizadas> {
    const resp = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${idExternoPublicacao}`,
      { headers: { Authorization: `Bearer ${tokenAcesso}` } }
    );
    if (!resp.ok) {
      return { visualizacoes: 0, curtidas: 0, comentarios: 0, compartilhamentos: 0 };
    }

    const dados = (await resp.json()) as any;
    const stats = dados.items?.[0]?.statistics;
    return {
      visualizacoes: Number(stats?.viewCount || 0),
      curtidas: Number(stats?.likeCount || 0),
      comentarios: Number(stats?.commentCount || 0),
      compartilhamentos: 0,
    };
  }

  public async obterComentarios(
    idExternoPublicacao: string,
    tokenAcesso: string
  ): Promise<ComentarioNormalizado[]> {
    const resp = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${idExternoPublicacao}&maxResults=20`,
      { headers: { Authorization: `Bearer ${tokenAcesso}` } }
    );
    if (!resp.ok) return [];

    const dados = (await resp.json()) as any;
    return (dados.items || []).map((item: any) => {
      const top = item.snippet.topLevelComment.snippet;
      return {
        idExterno: item.id,
        autorNome: top.authorDisplayName,
        autorAvatar: top.authorProfileImageUrl,
        autorIdExterno: top.authorChannelId?.value,
        texto: top.textDisplay,
        curtidas: top.likeCount || 0,
        respondido: false,
        dataCriacao: new Date(top.publishedAt),
      };
    });
  }

  public async responderComentario(
    idExternoComentario: string,
    textoResposta: string,
    tokenAcesso: string
  ): Promise<{ sucesso: boolean; idExternoResposta?: string }> {
    const resp = await fetch('https://www.googleapis.com/youtube/v3/comments?part=snippet', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAcesso}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          parentId: idExternoComentario,
          textOriginal: textoResposta,
        },
      }),
    });

    if (!resp.ok) {
      throw new ErroPlataforma({
        codigo: 'PLATFORM_ERROR',
        mensagem: 'Falha ao responder comentário no YouTube.',
        plataforma: this.codigoPlataforma,
      });
    }

    const dados = (await resp.json()) as any;
    return { sucesso: true, idExternoResposta: dados.id };
  }

  public async excluirPublicacao(idExternoPublicacao: string, tokenAcesso: string): Promise<boolean> {
    const resp = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${idExternoPublicacao}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${tokenAcesso}` } }
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
