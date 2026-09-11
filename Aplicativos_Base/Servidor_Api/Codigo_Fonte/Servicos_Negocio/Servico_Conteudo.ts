import clienteBanco from '@gerenciador/banco-dados';

export class ServicoConteudo {
  public static async listarConteudos() {
    return clienteBanco.conteudo_Base.findMany({
      include: {
        versoes_conteudo: { orderBy: { numero_versao: 'desc' }, take: 1 },
        publicacoes: {
          include: {
            destinos: { select: { status: true } },
          },
        },
      },
      orderBy: { atualizado_em: 'desc' },
    });
  }

  public static async criarConteudo(dados: {
    titulo: string;
    descricao?: string;
    tipoConteudo?: string;
    idiomaPadrao?: string;
  }) {
    const conteudo = await clienteBanco.conteudo_Base.create({
      data: {
        titulo: dados.titulo,
        descricao: dados.descricao,
        tipo_conteudo: dados.tipoConteudo || 'VIDEO',
        idioma_padrao: dados.idiomaPadrao || 'pt-BR',
        status: 'READY',
      },
    });

    // Registra a versão inicial 1
    await clienteBanco.versao_Conteudo.create({
      data: {
        conteudo_id: conteudo.id,
        numero_versao: 1,
        titulo: dados.titulo,
        descricao: dados.descricao,
        alteracoes_resumo: 'Criação inicial do conteúdo',
      },
    });

    return conteudo;
  }

  public static async listarModelos() {
    return clienteBanco.modelo_Conteudo.findMany({
      orderBy: { nome_modelo: 'asc' },
    });
  }

  public static async listarConjuntosHashtags() {
    return clienteBanco.conjunto_Hashtag.findMany({
      orderBy: { nome_conjunto: 'asc' },
    });
  }
}
