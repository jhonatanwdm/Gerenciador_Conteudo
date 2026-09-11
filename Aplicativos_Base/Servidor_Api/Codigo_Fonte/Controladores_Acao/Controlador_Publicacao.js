"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControladorPublicacao = void 0;
const Servico_Publicacao_js_1 = require("../Servicos_Negocio/Servico_Publicacao.js");
class ControladorPublicacao {
    static async listar(req, res) {
        try {
            const publicacoes = await Servico_Publicacao_js_1.ServicoPublicacao.listarTodas({
                status: req.query.status,
                campanhaId: req.query.campanhaId,
            });
            res.json(publicacoes);
        }
        catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }
    static async obterPorId(req, res) {
        try {
            const id = String(req.params.id);
            const pub = await Servico_Publicacao_js_1.ServicoPublicacao.obterPorId(id);
            if (!pub) {
                res.status(404).json({ erro: 'Publicação não encontrada' });
                return;
            }
            res.json(pub);
        }
        catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }
    static async criar(req, res) {
        try {
            const resultado = await Servico_Publicacao_js_1.ServicoPublicacao.criarPublicacao(req.body);
            res.status(201).json(resultado);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    static async tentarNovamente(req, res) {
        try {
            const destinoId = String(req.params.destinoId);
            const resultado = await Servico_Publicacao_js_1.ServicoPublicacao.tentarNovamenteDestino(destinoId);
            res.json(resultado);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    static async repostar(req, res) {
        try {
            const resultado = await Servico_Publicacao_js_1.ServicoPublicacao.repostarPublicacao(req.body);
            res.status(201).json(resultado);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}
exports.ControladorPublicacao = ControladorPublicacao;
//# sourceMappingURL=Controlador_Publicacao.js.map