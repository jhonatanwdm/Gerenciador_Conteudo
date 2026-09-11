"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoConteudo = void 0;
const banco_dados_1 = __importDefault(require("@gerenciador/banco-dados"));
class ServicoConteudo {
    static async listarConteudos() {
        return banco_dados_1.default.conteudo_Base.findMany({
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
    static async criarConteudo(dados) {
        const conteudo = await banco_dados_1.default.conteudo_Base.create({
            data: {
                titulo: dados.titulo,
                descricao: dados.descricao,
                tipo_conteudo: dados.tipoConteudo || 'VIDEO',
                idioma_padrao: dados.idiomaPadrao || 'pt-BR',
                status: 'READY',
            },
        });
        // Registra a versão inicial 1
        await banco_dados_1.default.versao_Conteudo.create({
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
    static async listarModelos() {
        return banco_dados_1.default.modelo_Conteudo.findMany({
            orderBy: { nome_modelo: 'asc' },
        });
    }
    static async listarConjuntosHashtags() {
        return banco_dados_1.default.conjunto_Hashtag.findMany({
            orderBy: { nome_conjunto: 'asc' },
        });
    }
}
exports.ServicoConteudo = ServicoConteudo;
//# sourceMappingURL=Servico_Conteudo.js.map