import { Router } from 'express';
import { ControladorConta } from '../Controladores_Acao/Controlador_Conta.js';
import { ControladorPublicacao } from '../Controladores_Acao/Controlador_Publicacao.js';
import { ControladorGeral } from '../Controladores_Acao/Controlador_Geral.js';

export const rotaPrincipal = Router();

// 1. Saúde e Sincronização do Sistema
rotaPrincipal.get('/sistema/saude', ControladorGeral.saudeSistema);
rotaPrincipal.post('/sistema/sincronizar', ControladorGeral.sincronizarSistema);
rotaPrincipal.get('/sistema/sincronizar', ControladorGeral.sincronizarSistema);
rotaPrincipal.get('/sistema/verificar-mudancas', ControladorGeral.verificarMudancas);

// 2. Gestão de Contas Sociais
rotaPrincipal.get('/contas', ControladorConta.listar);
rotaPrincipal.post('/contas/conectar', ControladorConta.conectar);
rotaPrincipal.post('/contas/:id/testar', ControladorConta.testar);
rotaPrincipal.post('/contas/:id/desconectar', ControladorConta.desconectar);

// 3. Gestão de Publicações e Destinos
rotaPrincipal.get('/publicacoes', ControladorPublicacao.listar);
rotaPrincipal.get('/publicacoes/:id', ControladorPublicacao.obterPorId);
rotaPrincipal.post('/publicacoes', ControladorPublicacao.criar);
rotaPrincipal.post('/publicacoes/repostar', ControladorPublicacao.repostar);
rotaPrincipal.post('/destinos/:destinoId/reprocessar', ControladorPublicacao.tentarNovamente);

// 4. Conteúdos e Modelos
rotaPrincipal.get('/conteudos', ControladorGeral.listarConteudos);
rotaPrincipal.post('/conteudos', ControladorGeral.criarConteudo);
rotaPrincipal.get('/modelos', ControladorGeral.listarModelos);
rotaPrincipal.get('/hashtags', ControladorGeral.listarHashtags);

// 5. Biblioteca de Mídias
rotaPrincipal.get('/midias', ControladorGeral.listarMidias);

// 6. Métricas e Dashboard
rotaPrincipal.get('/metricas/resumo', ControladorGeral.resumoMetricas);

// 7. Comentários e Inbox
rotaPrincipal.get('/comentarios', ControladorGeral.listarComentarios);
rotaPrincipal.post('/comentarios/:id/responder', ControladorGeral.responderComentario);
