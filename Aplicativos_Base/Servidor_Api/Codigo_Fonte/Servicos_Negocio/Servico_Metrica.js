"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoMetrica = void 0;
const banco_dados_1 = __importDefault(require("@gerenciador/banco-dados"));
class ServicoMetrica {
    static async obterResumoGeral() {
        // 1. Contagens de publicações
        const totalPublicacoes = await banco_dados_1.default.publicacao_Acao.count();
        const publicacoesPublicadas = await banco_dados_1.default.publicacao_Acao.count({
            where: { status_global: 'SUCCESS' },
        });
        const publicacoesParciais = await banco_dados_1.default.publicacao_Acao.count({
            where: { status_global: 'PARTIAL' },
        });
        const publicacoesFalhas = await banco_dados_1.default.publicacao_Acao.count({
            where: { status_global: 'FAILED' },
        });
        const publicacoesPendentes = await banco_dados_1.default.publicacao_Acao.count({
            where: { status_global: 'PENDING' },
        });
        // 2. Destinos agendados
        const destinosAgendados = await banco_dados_1.default.destino_Publicacao.count({
            where: { status: 'SCHEDULED' },
        });
        // 3. Contagem de contas
        const totalContas = await banco_dados_1.default.conta_Social.count();
        const contasConectadas = await banco_dados_1.default.conta_Social.count({
            where: { status: 'CONNECTED' },
        });
        const contasComErro = await banco_dados_1.default.conta_Social.count({
            where: { status: { in: ['ERROR', 'REAUTH_REQUIRED', 'EXPIRED'] } },
        });
        // 4. Agrega métricas dos instantâneos mais recentes por destino
        const instantaneos = await banco_dados_1.default.instantaneo_Metricas.findMany({
            orderBy: { capturado_em: 'desc' },
            distinct: ['destino_publicacao_id'],
        });
        const totaisMetricas = instantaneos.reduce((acumulador, item) => ({
            visualizacoes: acumulador.visualizacoes + item.visualizacoes,
            curtidas: acumulador.curtidas + item.curtidas,
            comentarios: acumulador.comentarios + item.comentarios,
            compartilhamentos: acumulador.compartilhamentos + item.compartilhamentos,
        }), { visualizacoes: 0, curtidas: 0, comentarios: 0, compartilhamentos: 0 });
        // 5. Agrupamento de contas por plataforma
        const plataformas = await banco_dados_1.default.plataforma_Rede.findMany({
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
exports.ServicoMetrica = ServicoMetrica;
//# sourceMappingURL=Servico_Metrica.js.map