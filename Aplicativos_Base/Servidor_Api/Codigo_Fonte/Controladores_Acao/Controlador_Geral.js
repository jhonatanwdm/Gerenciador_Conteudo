"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControladorGeral = void 0;
const banco_dados_1 = __importDefault(require("@gerenciador/banco-dados"));
const Servico_Metrica_js_1 = require("../Servicos_Negocio/Servico_Metrica.js");
const Servico_Conteudo_js_1 = require("../Servicos_Negocio/Servico_Conteudo.js");
const Servico_Comentario_js_1 = require("../Servicos_Negocio/Servico_Comentario.js");
const Servico_Midia_js_1 = require("../Servicos_Negocio/Servico_Midia.js");
class ControladorGeral {
    static async saudeSistema(req, res) {
        try {
            await banco_dados_1.default.$queryRaw `SELECT 1`;
            res.json({
                status: 'OPERACIONAL',
                timestamp: new Date().toISOString(),
                modoSimulado: process.env.MOCK_MODE === 'true',
                banco: 'CONECTADO',
                versao: '1.0.0',
            });
        }
        catch (erro) {
            res.status(500).json({
                status: 'DEGRADADO',
                banco: 'DESCONECTADO',
                erro: erro.message,
            });
        }
    }
    static async resumoMetricas(req, res) {
        try {
            const resumo = await Servico_Metrica_js_1.ServicoMetrica.obterResumoGeral();
            res.json(resumo);
        }
        catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }
    static async listarConteudos(req, res) {
        try {
            const conteudos = await Servico_Conteudo_js_1.ServicoConteudo.listarConteudos();
            res.json(conteudos);
        }
        catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }
    static async criarConteudo(req, res) {
        try {
            const conteudo = await Servico_Conteudo_js_1.ServicoConteudo.criarConteudo(req.body);
            res.status(201).json(conteudo);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    static async listarModelos(req, res) {
        try {
            const modelos = await Servico_Conteudo_js_1.ServicoConteudo.listarModelos();
            res.json(modelos);
        }
        catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }
    static async listarHashtags(req, res) {
        try {
            const hashtags = await Servico_Conteudo_js_1.ServicoConteudo.listarConjuntosHashtags();
            res.json(hashtags);
        }
        catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }
    static async listarComentarios(req, res) {
        try {
            const comentarios = await Servico_Comentario_js_1.ServicoComentario.listarComentarios({
                apenasNaoRespondidos: req.query.naoRespondidos === 'true',
            });
            res.json(comentarios);
        }
        catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }
    static async responderComentario(req, res) {
        try {
            const id = String(req.params.id);
            const { textoResposta } = req.body;
            const resposta = await Servico_Comentario_js_1.ServicoComentario.responderComentario(id, textoResposta);
            res.status(201).json(resposta);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    static async listarMidias(req, res) {
        try {
            const midias = await Servico_Midia_js_1.ServicoMidia.listarTodas();
            res.json(midias);
        }
        catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }
    static async sincronizarSistema(req, res) {
        try {
            await banco_dados_1.default.$queryRaw `SELECT 1`;
            const contagemContas = await banco_dados_1.default.conta_Social.count().catch(() => 0);
            const contagemPublicacoes = await banco_dados_1.default.publicacao_Agendada?.count().catch(() => 0) || 0;
            res.json({
                ok: true,
                timestamp: Date.now(),
                mensagem: 'Banco de dados e serviços sincronizados com sucesso',
                estatisticas: {
                    contas: contagemContas,
                    publicacoes: contagemPublicacoes,
                },
            });
        }
        catch (erro) {
            res.status(500).json({
                ok: false,
                erro: erro.message || 'Falha ao sincronizar banco de dados',
            });
        }
    }
    static async verificarMudancas(req, res) {
        try {
            const contagemContas = await banco_dados_1.default.conta_Social.count().catch(() => 0);
            const contagemPublicacoes = await banco_dados_1.default.publicacao_Agendada?.count().catch(() => 0) || 0;
            const contagemConteudos = await banco_dados_1.default.conteudo_Base?.count().catch(() => 0) || 0;
            const contagemComentarios = await banco_dados_1.default.comentario_Interacao?.count().catch(() => 0) || 0;
            const assinatura = `${contagemContas}_${contagemPublicacoes}_${contagemConteudos}_${contagemComentarios}`;
            res.json({
                ok: true,
                assinatura,
                timestamp: Date.now(),
            });
        }
        catch (erro) {
            res.status(500).json({ ok: false, erro: erro.message });
        }
    }
}
exports.ControladorGeral = ControladorGeral;
//# sourceMappingURL=Controlador_Geral.js.map