"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoComentario = void 0;
const banco_dados_1 = __importDefault(require("@gerenciador/banco-dados"));
const nucleo_plataformas_1 = require("@gerenciador/nucleo-plataformas");
const Servico_Criptografia_js_1 = require("./Servico_Criptografia.js");
class ServicoComentario {
    static async listarComentarios(filtros) {
        return banco_dados_1.default.comentario_Rede.findMany({
            where: {
                ...(filtros?.apenasNaoRespondidos ? { respondido: false } : {}),
            },
            include: {
                conta_social: { include: { plataforma: true } },
                destino_publicacao: {
                    include: { publicacao: { include: { conteudo: true } } },
                },
                respostas: true,
            },
            orderBy: { data_comentario: 'desc' },
        });
    }
    static async responderComentario(comentarioId, textoResposta) {
        const comentario = await banco_dados_1.default.comentario_Rede.findUnique({
            where: { id: comentarioId },
            include: {
                conta_social: {
                    include: { plataforma: true, credencial_oauth: true },
                },
            },
        });
        if (!comentario) {
            throw new Error('Comentário não encontrado.');
        }
        const token = comentario.conta_social.credencial_oauth?.token_acesso_cifrado
            ? Servico_Criptografia_js_1.ServicoCriptografia.decifrar(comentario.conta_social.credencial_oauth.token_acesso_cifrado)
            : '';
        const adaptador = nucleo_plataformas_1.RegistroPlataformas.obterInstancia().obterAdaptador(comentario.conta_social.plataforma.codigo);
        const resultado = await adaptador.responderComentario(comentario.id_externo_comentario, textoResposta, token);
        const respostaSalva = await banco_dados_1.default.resposta_Comentario.create({
            data: {
                comentario_pai_id: comentario.id,
                texto_resposta: textoResposta,
                status_envio: 'SENT',
                id_externo_resposta: resultado.idExternoResposta,
            },
        });
        await banco_dados_1.default.comentario_Rede.update({
            where: { id: comentario.id },
            data: { respondido: true },
        });
        return respostaSalva;
    }
}
exports.ServicoComentario = ServicoComentario;
//# sourceMappingURL=Servico_Comentario.js.map