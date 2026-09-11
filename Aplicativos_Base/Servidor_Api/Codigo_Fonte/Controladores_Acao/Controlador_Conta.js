"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControladorConta = void 0;
const Servico_Conta_js_1 = require("../Servicos_Negocio/Servico_Conta.js");
class ControladorConta {
    static async listar(req, res) {
        try {
            const contas = await Servico_Conta_js_1.ServicoConta.listarTodas();
            res.json(contas);
        }
        catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }
    static async conectar(req, res) {
        try {
            const { codigoPlataforma, codigoAutorizacao, urlRetorno } = req.body;
            const contas = await Servico_Conta_js_1.ServicoConta.conectarConta({
                codigoPlataforma,
                codigoAutorizacao: codigoAutorizacao || 'mock_auth_code',
                urlRetorno: urlRetorno || 'http://localhost:3333/api/callback',
            });
            res.status(201).json({ sucesso: true, contas });
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    static async testar(req, res) {
        try {
            const id = String(req.params.id);
            const resultado = await Servico_Conta_js_1.ServicoConta.testarConexao(id);
            res.json(resultado);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    static async desconectar(req, res) {
        try {
            const id = String(req.params.id);
            const resultado = await Servico_Conta_js_1.ServicoConta.desconectar(id);
            res.json(resultado);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}
exports.ControladorConta = ControladorConta;
//# sourceMappingURL=Controlador_Conta.js.map