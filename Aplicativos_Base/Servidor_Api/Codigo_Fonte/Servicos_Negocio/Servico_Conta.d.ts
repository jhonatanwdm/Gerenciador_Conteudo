export declare class ServicoConta {
    static listarTodas(): Promise<{
        id: string;
        plataformaId: string;
        plataformaCodigo: string;
        plataformaNome: string;
        idExternoConta: string;
        nome: string;
        nomeUsuario: string;
        nomeExibicao: string;
        urlAvatar: string | null;
        tipoConta: string;
        status: string;
        fusoHorario: string;
        ultimaSincronizacao: Date | null;
        totalPublicacoes: number;
        capacidades: {
            video: boolean;
            videoCurto: boolean;
            imagem: boolean;
            carrossel: boolean;
            reel: boolean;
            story: boolean;
            agendamento: boolean;
            metricas: boolean;
            comentarios: boolean;
            respostaComentario: boolean;
        } | null;
    }[]>;
    static obterPorId(id: string): Promise<({
        plataforma: {
            nome: string;
            id: string;
            ativo: boolean;
            criado_em: Date;
            atualizado_em: Date;
            codigo: string;
            icone: string | null;
        };
        capacidade_conta: {
            id: string;
            criado_em: Date;
            atualizado_em: Date;
            detalhes_json: string | null;
            conta_social_id: string;
            suporta_video: boolean;
            suporta_video_curto: boolean;
            suporta_imagem: boolean;
            suporta_carrossel: boolean;
            suporta_reel: boolean;
            suporta_story: boolean;
            suporta_agendamento: boolean;
            suporta_metricas: boolean;
            suporta_comentarios: boolean;
            suporta_resposta: boolean;
        } | null;
    } & {
        nome: string;
        status: string;
        id: string;
        criado_em: Date;
        atualizado_em: Date;
        plataforma_id: string;
        id_externo_conta: string;
        nome_usuario: string;
        nome_exibicao: string;
        url_avatar: string | null;
        tipo_conta: string;
        fuso_horario: string;
        ultima_sincronizacao: Date | null;
    }) | null>;
    static conectarConta(dados: {
        codigoPlataforma: string;
        codigoAutorizacao: string;
        urlRetorno: string;
    }): Promise<{
        nome: string;
        status: string;
        id: string;
        criado_em: Date;
        atualizado_em: Date;
        plataforma_id: string;
        id_externo_conta: string;
        nome_usuario: string;
        nome_exibicao: string;
        url_avatar: string | null;
        tipo_conta: string;
        fuso_horario: string;
        ultima_sincronizacao: Date | null;
    }[]>;
    static testarConexao(id: string): Promise<{
        valida: boolean;
        status: string;
    }>;
    static desconectar(id: string): Promise<{
        sucesso: boolean;
    }>;
}
