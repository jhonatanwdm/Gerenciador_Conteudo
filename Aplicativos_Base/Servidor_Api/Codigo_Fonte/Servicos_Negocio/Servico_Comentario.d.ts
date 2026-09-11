export declare class ServicoComentario {
    static listarComentarios(filtros?: {
        apenasNaoRespondidos?: boolean;
        plataformaCodigo?: string;
    }): Promise<({
        conta_social: {
            plataforma: {
                nome: string;
                id: string;
                ativo: boolean;
                criado_em: Date;
                atualizado_em: Date;
                codigo: string;
                icone: string | null;
            };
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
        };
        destino_publicacao: {
            publicacao: {
                conteudo: {
                    status: string;
                    id: string;
                    criado_em: Date;
                    atualizado_em: Date;
                    titulo: string;
                    descricao: string | null;
                    tipo_conteudo: string;
                    idioma_padrao: string;
                    criado_por_id: string | null;
                };
            } & {
                id: string;
                criado_em: Date;
                atualizado_em: Date;
                conteudo_id: string;
                campanha_id: string | null;
                publicacao_pai_id: string | null;
                status_global: string;
            };
        } & {
            status: string;
            id: string;
            criado_em: Date;
            atualizado_em: Date;
            plataforma_id: string;
            fuso_horario: string;
            publicacao_id: string;
            conta_social_id: string;
            ativo_midia_id: string | null;
            titulo_personalizado: string | null;
            descricao_personalizada: string | null;
            legenda_personalizada: string | null;
            hashtags_personalizadas: string | null;
            cta_personalizado: string | null;
            agendado_para: Date | null;
            id_externo: string | null;
            url_externa: string | null;
            publicado_em: Date | null;
            total_tentativas: number;
            codigo_erro: string | null;
            mensagem_erro: string | null;
            chave_idempotencia: string | null;
        };
        respostas: {
            id: string;
            criado_em: Date;
            comentario_pai_id: string;
            texto_resposta: string;
            status_envio: string;
            id_externo_resposta: string | null;
            enviado_em: Date;
        }[];
    } & {
        id: string;
        criado_em: Date;
        conta_social_id: string;
        destino_publicacao_id: string;
        id_externo_comentario: string;
        autor_nome: string;
        autor_avatar: string | null;
        autor_id_externo: string | null;
        texto_conteudo: string;
        curtidas_total: number;
        respondido: boolean;
        data_comentario: Date;
    })[]>;
    static responderComentario(comentarioId: string, textoResposta: string): Promise<{
        id: string;
        criado_em: Date;
        comentario_pai_id: string;
        texto_resposta: string;
        status_envio: string;
        id_externo_resposta: string | null;
        enviado_em: Date;
    }>;
}
