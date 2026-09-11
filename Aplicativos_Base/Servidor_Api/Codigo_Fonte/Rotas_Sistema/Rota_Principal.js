"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rotaPrincipal = void 0;
const express_1 = require("express");
const Controlador_Conta_js_1 = require("../Controladores_Acao/Controlador_Conta.js");
const Controlador_Publicacao_js_1 = require("../Controladores_Acao/Controlador_Publicacao.js");
const Controlador_Geral_js_1 = require("../Controladores_Acao/Controlador_Geral.js");
exports.rotaPrincipal = (0, express_1.Router)();
// 1. Saúde e Sincronização do Sistema
exports.rotaPrincipal.get('/sistema/saude', Controlador_Geral_js_1.ControladorGeral.saudeSistema);
exports.rotaPrincipal.post('/sistema/sincronizar', Controlador_Geral_js_1.ControladorGeral.sincronizarSistema);
exports.rotaPrincipal.get('/sistema/sincronizar', Controlador_Geral_js_1.ControladorGeral.sincronizarSistema);
exports.rotaPrincipal.get('/sistema/verificar-mudancas', Controlador_Geral_js_1.ControladorGeral.verificarMudancas);
// 2. Gestão de Contas Sociais
exports.rotaPrincipal.get('/contas', Controlador_Conta_js_1.ControladorConta.listar);
exports.rotaPrincipal.post('/contas/conectar', Controlador_Conta_js_1.ControladorConta.conectar);
exports.rotaPrincipal.post('/contas/:id/testar', Controlador_Conta_js_1.ControladorConta.testar);
exports.rotaPrincipal.post('/contas/:id/desconectar', Controlador_Conta_js_1.ControladorConta.desconectar);
// 3. Gestão de Publicações e Destinos
exports.rotaPrincipal.get('/publicacoes', Controlador_Publicacao_js_1.ControladorPublicacao.listar);
exports.rotaPrincipal.get('/publicacoes/:id', Controlador_Publicacao_js_1.ControladorPublicacao.obterPorId);
exports.rotaPrincipal.post('/publicacoes', Controlador_Publicacao_js_1.ControladorPublicacao.criar);
exports.rotaPrincipal.post('/publicacoes/repostar', Controlador_Publicacao_js_1.ControladorPublicacao.repostar);
exports.rotaPrincipal.post('/destinos/:destinoId/reprocessar', Controlador_Publicacao_js_1.ControladorPublicacao.tentarNovamente);
// 4. Conteúdos e Modelos
exports.rotaPrincipal.get('/conteudos', Controlador_Geral_js_1.ControladorGeral.listarConteudos);
exports.rotaPrincipal.post('/conteudos', Controlador_Geral_js_1.ControladorGeral.criarConteudo);
exports.rotaPrincipal.get('/modelos', Controlador_Geral_js_1.ControladorGeral.listarModelos);
exports.rotaPrincipal.get('/hashtags', Controlador_Geral_js_1.ControladorGeral.listarHashtags);
// 5. Biblioteca de Mídias
exports.rotaPrincipal.get('/midias', Controlador_Geral_js_1.ControladorGeral.listarMidias);
// 6. Métricas e Dashboard
exports.rotaPrincipal.get('/metricas/resumo', Controlador_Geral_js_1.ControladorGeral.resumoMetricas);
// 7. Comentários e Inbox
exports.rotaPrincipal.get('/comentarios', Controlador_Geral_js_1.ControladorGeral.listarComentarios);
exports.rotaPrincipal.post('/comentarios/:id/responder', Controlador_Geral_js_1.ControladorGeral.responderComentario);
//# sourceMappingURL=Rota_Principal.js.map