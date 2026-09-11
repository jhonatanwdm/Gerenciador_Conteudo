export declare class ServicoMetrica {
    static obterResumoGeral(): Promise<{
        contas: {
            total: number;
            conectadas: number;
            comErro: number;
        };
        publicacoes: {
            total: number;
            publicadas: number;
            agendadas: number;
            processando: number;
            falhas: number;
        };
        totaisMetricas: {
            visualizacoes: number;
            curtidas: number;
            comentarios: number;
            compartilhamentos: number;
        };
        distribuicaoPlataformas: {
            codigo: string;
            nome: string;
            totalContas: number;
            visualizacoes: number;
            curtidas: number;
        }[];
    }>;
}
