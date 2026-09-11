export declare class ServicoConteudo {
    static listarConteudos(): Promise<({
        versoes_conteudo: {
            id: string;
            criado_em: Date;
            titulo: string;
            descricao: string | null;
            conteudo_id: string;
            numero_versao: number;
            alteracoes_resumo: string | null;
        }[];
        publicacoes: ({
            destinos: {
                status: string;
            }[];
        } & {
            id: string;
            criado_em: Date;
            atualizado_em: Date;
            conteudo_id: string;
            campanha_id: string | null;
            publicacao_pai_id: string | null;
            status_global: string;
        })[];
    } & {
        status: string;
        id: string;
        criado_em: Date;
        atualizado_em: Date;
        titulo: string;
        descricao: string | null;
        tipo_conteudo: string;
        idioma_padrao: string;
        criado_por_id: string | null;
    })[]>;
    static criarConteudo(dados: {
        titulo: string;
        descricao?: string;
        tipoConteudo?: string;
        idiomaPadrao?: string;
    }): Promise<{
        status: string;
        id: string;
        criado_em: Date;
        atualizado_em: Date;
        titulo: string;
        descricao: string | null;
        tipo_conteudo: string;
        idioma_padrao: string;
        criado_por_id: string | null;
    }>;
    static listarModelos(): Promise<{
        id: string;
        criado_em: Date;
        atualizado_em: Date;
        categoria: string | null;
        nome_modelo: string;
        titulo_modelo: string | null;
        descricao_modelo: string | null;
        hashtags_modelo: string | null;
        cta_modelo: string | null;
    }[]>;
    static listarConjuntosHashtags(): Promise<{
        id: string;
        criado_em: Date;
        atualizado_em: Date;
        descricao: string | null;
        nome_conjunto: string;
        hashtags_texto: string;
    }[]>;
}
