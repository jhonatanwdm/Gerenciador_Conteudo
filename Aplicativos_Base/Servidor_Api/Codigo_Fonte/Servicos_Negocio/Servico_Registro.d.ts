export declare class ServicoRegistro {
    static registrarAuditoria(parametros: {
        usuarioId?: string;
        acaoExecutada: string;
        entidadeTipo: string;
        entidadeId?: string;
        detalhes?: Record<string, unknown>;
        ip?: string;
    }): Promise<void>;
    static registrarSistema(parametros: {
        nivel: 'INFO' | 'WARN' | 'ERROR';
        modulo: string;
        mensagem: string;
        contexto?: Record<string, unknown>;
    }): Promise<void>;
}
