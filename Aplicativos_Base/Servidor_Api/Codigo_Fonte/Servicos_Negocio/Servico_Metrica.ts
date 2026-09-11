import clienteBanco from '@gerenciador/banco-dados';

export class ServicoMetrica {
  public static async obterResumoGeral() {
    // 1. Contagens de publicações
    const totalPublicacoes = await clienteBanco.publicacao_Acao.count();
    const publicacoesPublicadas = await clienteBanco.publicacao_Acao.count({
      where: { status_global: 'SUCCESS' },
    });
    const publicacoesParciais = await clienteBanco.publicacao_Acao.count({
      where: { status_global: 'PARTIAL' },
    });
    const publicacoesFalhas = await clienteBanco.publicacao_Acao.count({
      where: { status_global: 'FAILED' },
    });
    const publicacoesPendentes = await clienteBanco.publicacao_Acao.count({
      where: { status_global: 'PENDING' },
    });

    // 2. Destinos agendados
    const destinosAgendados = await clienteBanco.destino_Publicacao.count({
      where: { status: 'SCHEDULED' },
    });

    // 3. Contagem de contas
    const totalContas = await clienteBanco.conta_Social.count();
    const contasConectadas = await clienteBanco.conta_Social.count({
      where: { status: 'CONNECTED' },
    });
    const contasComErro = await clienteBanco.conta_Social.count({
      where: { status: { in: ['ERROR', 'REAUTH_REQUIRED', 'EXPIRED'] } },
    });

    // 4. Agrega métricas dos instantâneos mais recentes por destino
    const instantaneos = await clienteBanco.instantaneo_Metricas.findMany({
      orderBy: { capturado_em: 'desc' },
      distinct: ['destino_publicacao_id'],
    });

    const totaisMetricas = instantaneos.reduce(
      (acumulador, item) => ({
        visualizacoes: acumulador.visualizacoes + item.visualizacoes,
        curtidas: acumulador.curtidas + item.curtidas,
        comentarios: acumulador.comentarios + item.comentarios,
        compartilhamentos: acumulador.compartilhamentos + item.compartilhamentos,
      }),
      { visualizacoes: 0, curtidas: 0, comentarios: 0, compartilhamentos: 0 }
    );

    // 5. Agrupamento de contas por plataforma
    const plataformas = await clienteBanco.plataforma_Rede.findMany({
      include: {
        contas_sociais: {
          include: {
            destinos_publicacao: {
              include: {
                instantaneos_metricas: {
                  orderBy: { capturado_em: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    const distribuicaoPlataformas = plataformas.map((plat) => {
      let viewsPlataforma = 0;
      let curtidasPlataforma = 0;

      for (const conta of plat.contas_sociais) {
        for (const dest of conta.destinos_publicacao) {
          const m = dest.instantaneos_metricas[0];
          if (m) {
            viewsPlataforma += m.visualizacoes;
            curtidasPlataforma += m.curtidas;
          }
        }
      }

      return {
        codigo: plat.codigo,
        nome: plat.nome,
        totalContas: plat.contas_sociais.length,
        visualizacoes: viewsPlataforma,
        curtidas: curtidasPlataforma,
      };
    });

    return {
      contas: {
        total: totalContas,
        conectadas: contasConectadas,
        comErro: contasComErro,
      },
      publicacoes: {
        total: totalPublicacoes,
        publicadas: publicacoesPublicadas + publicacoesParciais,
        agendadas: destinosAgendados,
        processando: publicacoesPendentes,
        falhas: publicacoesFalhas,
      },
      totaisMetricas,
      distribuicaoPlataformas,
    };
  }
}
