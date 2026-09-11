"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoMidia = void 0;
const banco_dados_1 = __importDefault(require("@gerenciador/banco-dados"));
const processador_midia_1 = require("@gerenciador/processador-midia");
class ServicoMidia {
    static provedor = new processador_midia_1.ProvedorArmazenamentoLocal();
    static async listarTodas() {
        return banco_dados_1.default.ativo_Midia.findMany({
            include: { variantes: true },
            orderBy: { criado_em: 'desc' },
        });
    }
    static async salvarArquivo(nomeArquivo, buffer, tipoMime) {
        const salvo = await this.provedor.salvarArquivo(nomeArquivo, buffer, tipoMime);
        const metadados = processador_midia_1.MotorFfmpeg.extrairMetadados(nomeArquivo);
        return banco_dados_1.default.ativo_Midia.create({
            data: {
                nome_arquivo: nomeArquivo,
                caminho_armazenamento: salvo.caminho,
                url_publica: salvo.urlPublica,
                tipo_mime: tipoMime,
                tamanho_bytes: buffer.length,
                duracao_segundos: metadados.duracaoSegundos,
                largura_pixels: metadados.largura,
                altura_pixels: metadados.altura,
                formato_extensao: metadados.formatoExtensao,
            },
        });
    }
}
exports.ServicoMidia = ServicoMidia;
//# sourceMappingURL=Servico_Midia.js.map