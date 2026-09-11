export declare class ServicoMidia {
    private static provedor;
    static listarTodas(): Promise<({
        variantes: {
            id: string;
            criado_em: Date;
            tamanho_bytes: number;
            ativo_midia_pai_id: string;
            codigo_preset: string;
            caminho_arquivo: string;
            resolucao: string | null;
            taxa_bits: number | null;
            status_processamento: string;
        }[];
    } & {
        id: string;
        criado_em: Date;
        atualizado_em: Date;
        nome_arquivo: string;
        caminho_armazenamento: string;
        url_publica: string | null;
        tipo_mime: string;
        tamanho_bytes: number;
        duracao_segundos: number | null;
        largura_pixels: number | null;
        altura_pixels: number | null;
        formato_extensao: string;
        origem_upload: string;
    })[]>;
    static salvarArquivo(nomeArquivo: string, buffer: Buffer, tipoMime: string): Promise<{
        id: string;
        criado_em: Date;
        atualizado_em: Date;
        nome_arquivo: string;
        caminho_armazenamento: string;
        url_publica: string | null;
        tipo_mime: string;
        tamanho_bytes: number;
        duracao_segundos: number | null;
        largura_pixels: number | null;
        altura_pixels: number | null;
        formato_extensao: string;
        origem_upload: string;
    }>;
}
