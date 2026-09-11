export interface DestinoEntrada {
    contaSocialId: string;
    tituloPersonalizado?: string;
    descricaoPersonalizada?: string;
    legendaPersonalizada?: string;
    hashtagsPersonalizadas?: string;
    ctaPersonalizado?: string;
    agendadoPara?: string | Date;
}
export declare class ServicoPublicacao {
    static listarTodas(filtros?: {
        status?: string;
        campanhaId?: string;
    }): Promise<{
        id: string;
        conteudoId: string;
        tituloConteudo: string;
        tipoConteudo: string;
        campanhaNome: string | undefined;
        statusGlobal: string;
        criadoEm: Date;
        progresso: {
            total: number;
            publicados: number;
            falhas: number;
            processando: number;
            agendados: number;
            textoResumo: string;
        };
        destinos: {
            id: string;
            plataformaCodigo: string;
            plataformaNome: string;
            contaNome: string;
            contaUsuario: string;
            status: string;
            agendadoPara: Date | null;
            publicadoEm: Date | null;
            urlExterna: string | null;
            codigoErro: string | null;
            mensagemErro: string | null;
            metricasRecentes: {
                visualizacoes: number;
                curtidas: number;
                comentarios: number;
                compartilhamentos: number;
                salvamentos: number;
                seguidores: number;
                alcance: number;
                impressoes: number;
                id: string;
                capturado_em: Date;
                dados_brutos_json: string | null;
                destino_publicacao_id: string;
                tempo_assistido_segundos: number;
                taxa_engajamento: number;
            };
        }[];
    }[]>;
    static obterPorId(id: string): Promise<{
        progresso: {
            total: number;
            publicados: number;
            falhas: number;
            processando: number;
        };
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
        campanha: {
            nome: string;
            status: string;
            id: string;
            criado_em: Date;
            atualizado_em: Date;
            descricao: string | null;
            cor_etiqueta: string;
            data_inicio: Date | null;
            data_fim: Date | null;
        } | null;
        destinos: ({
            plataforma: {
                nome: string;
                id: string;
                ativo: boolean;
                criado_em: Date;
                atualizado_em: Date;
                codigo: string;
                icone: string | null;
            };
            conta_social: {
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
            };
            instantaneos_metricas: {
                visualizacoes: number;
                curtidas: number;
                comentarios: number;
                compartilhamentos: number;
                salvamentos: number;
                seguidores: number;
                alcance: number;
                impressoes: number;
                id: string;
                capturado_em: Date;
                dados_brutos_json: string | null;
                destino_publicacao_id: string;
                tempo_assistido_segundos: number;
                taxa_engajamento: number;
            }[];
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
        })[];
        relacoes_como_origem: ({
            publicacao_destino: {
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
            id: string;
            criado_em: Date;
            publicacao_origem_id: string;
            publicacao_destino_id: string;
            tipo_relacao: string;
        })[];
        id: string;
        criado_em: Date;
        atualizado_em: Date;
        conteudo_id: string;
        campanha_id: string | null;
        publicacao_pai_id: string | null;
        status_global: string;
    } | null>;
    static criarPublicacao(dados: {
        conteudoId: string;
        campanhaId?: string;
        destinos: DestinoEntrada[];
        modoAgendar?: boolean;
    }): Promise<{
        publicacaoId: string;
        totalDestinos: number;
        destinos: {
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
        }[];
    }>;
    static processarDestinoIndividual(destinoId: string): Promise<void>;
    static atualizarStatusGlobal(publicacaoId: string): Promise<void>;
    static tentarNovamenteDestino(destinoId: string): Promise<{
        sucesso: boolean;
        mensagem: string;
    }>;
    static repostarPublicacao(dados: {
        publicacaoOrigemId: string;
        novosDestinos: DestinoEntrada[];
        tituloSobrescrito?: string;
        descricaoSobrescrita?: string;
    }): Promise<{
        publicacaoId: string;
        totalDestinos: number;
        destinos: {
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
        }[];
    }>;
}
