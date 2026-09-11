"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoRegistro = void 0;
const banco_dados_1 = __importDefault(require("@gerenciador/banco-dados"));
class ServicoRegistro {
    static async registrarAuditoria(parametros) {
        try {
            await banco_dados_1.default.registro_Auditoria.create({
                data: {
                    usuario_id: parametros.usuarioId,
                    acao_executada: parametros.acaoExecutada,
                    entidade_tipo: parametros.entidadeTipo,
                    entidade_id: parametros.entidadeId,
                    detalhes_json: parametros.detalhes ? JSON.stringify(parametros.detalhes) : null,
                    endereco_ip: parametros.ip,
                },
            });
        }
        catch (erro) {
            console.error('Erro ao registrar log de auditoria:', erro);
        }
    }
    static async registrarSistema(parametros) {
        const dataHora = new Date().toISOString();
        console.log(`[${dataHora}] [${parametros.nivel}] [${parametros.modulo}] ${parametros.mensagem}`);
        try {
            await banco_dados_1.default.registro_Sistema.create({
                data: {
                    nivel_log: parametros.nivel,
                    modulo_origem: parametros.modulo,
                    mensagem: parametros.mensagem,
                    contexto_json: parametros.contexto ? JSON.stringify(parametros.contexto) : null,
                },
            });
        }
        catch (erro) {
            console.error('Erro ao persistir log de sistema:', erro);
        }
    }
}
exports.ServicoRegistro = ServicoRegistro;
//# sourceMappingURL=Servico_Registro.js.map