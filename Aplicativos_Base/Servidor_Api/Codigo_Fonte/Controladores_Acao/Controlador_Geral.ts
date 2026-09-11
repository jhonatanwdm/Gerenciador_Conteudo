import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import clienteBanco from '@gerenciador/banco-dados';
import { ServicoMetrica } from '../Servicos_Negocio/Servico_Metrica.js';
import { ServicoConteudo } from '../Servicos_Negocio/Servico_Conteudo.js';
import { ServicoComentario } from '../Servicos_Negocio/Servico_Comentario.js';
import { ServicoMidia } from '../Servicos_Negocio/Servico_Midia.js';

export class ControladorGeral {
  public static async saudeSistema(req: Request, res: Response): Promise<void> {
    try {
      await clienteBanco.$queryRaw`SELECT 1`;
      res.json({
        status: 'OPERACIONAL',
        timestamp: new Date().toISOString(),
        modoSimulado: process.env.MOCK_MODE === 'true',
        banco: 'CONECTADO',
        versao: '1.0.0',
      });
    } catch (erro: any) {
      res.status(500).json({
        status: 'DEGRADADO',
        banco: 'DESCONECTADO',
        erro: erro.message,
      });
    }
  }

  public static async resumoMetricas(req: Request, res: Response): Promise<void> {
    try {
      const resumo = await ServicoMetrica.obterResumoGeral();
      res.json(resumo);
    } catch (erro: any) {
      res.status(500).json({ erro: erro.message });
    }
  }

  public static async listarConteudos(req: Request, res: Response): Promise<void> {
    try {
      const conteudos = await ServicoConteudo.listarConteudos();
      res.json(conteudos);
    } catch (erro: any) {
      res.status(500).json({ erro: erro.message });
    }
  }

  public static async criarConteudo(req: Request, res: Response): Promise<void> {
    try {
      const conteudo = await ServicoConteudo.criarConteudo(req.body);
      res.status(201).json(conteudo);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  public static async listarModelos(req: Request, res: Response): Promise<void> {
    try {
      const modelos = await ServicoConteudo.listarModelos();
      res.json(modelos);
    } catch (erro: any) {
      res.status(500).json({ erro: erro.message });
    }
  }

  public static async listarHashtags(req: Request, res: Response): Promise<void> {
    try {
      const hashtags = await ServicoConteudo.listarConjuntosHashtags();
      res.json(hashtags);
    } catch (erro: any) {
      res.status(500).json({ erro: erro.message });
    }
  }

  public static async listarComentarios(req: Request, res: Response): Promise<void> {
    try {
      const comentarios = await ServicoComentario.listarComentarios({
        apenasNaoRespondidos: req.query.naoRespondidos === 'true',
      });
      res.json(comentarios);
    } catch (erro: any) {
      res.status(500).json({ erro: erro.message });
    }
  }

  public static async responderComentario(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { textoResposta } = req.body;
      const resposta = await ServicoComentario.responderComentario(id, textoResposta);
      res.status(201).json(resposta);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  public static async listarMidias(req: Request, res: Response): Promise<void> {
    try {
      const midias = await ServicoMidia.listarTodas();
      res.json(midias);
    } catch (erro: any) {
      res.status(500).json({ erro: erro.message });
    }
  }

  public static async sincronizarSistema(req: Request, res: Response): Promise<void> {
    try {
      await clienteBanco.$queryRaw`SELECT 1`;
      const contagemContas = await clienteBanco.conta_Social.count().catch(() => 0);
      const contagemPublicacoes = await (clienteBanco as any).publicacao_Agendada?.count().catch(() => 0) || 0;

      res.json({
        ok: true,
        timestamp: Date.now(),
        mensagem: 'Banco de dados e serviços sincronizados com sucesso',
        estatisticas: {
          contas: contagemContas,
          publicacoes: contagemPublicacoes,
        },
      });
    } catch (erro: any) {
      res.status(500).json({
        ok: false,
        erro: erro.message || 'Falha ao sincronizar banco de dados',
      });
    }
  }

  public static async verificarMudancas(req: Request, res: Response): Promise<void> {
    try {
      const contagemContas = await clienteBanco.conta_Social.count().catch(() => 0);
      const contagemPublicacoes = await (clienteBanco as any).publicacao_Agendada?.count().catch(() => 0) || 0;
      const contagemConteudos = await (clienteBanco as any).conteudo_Base?.count().catch(() => 0) || 0;
      const contagemComentarios = await (clienteBanco as any).comentario_Interacao?.count().catch(() => 0) || 0;

      // Verificação de última alteração de registros no banco de dados
      const ultConta = await clienteBanco.conta_Social.findFirst({
        select: { atualizado_em: true },
        orderBy: { atualizado_em: 'desc' },
      }).catch(() => null);

      const ultPub = await (clienteBanco as any).publicacao_Agendada?.findFirst({
        select: { atualizado_em: true },
        orderBy: { atualizado_em: 'desc' },
      }).catch(() => null);

      const ultComent = await (clienteBanco as any).comentario_Interacao?.findFirst({
        select: { atualizado_em: true },
        orderBy: { atualizado_em: 'desc' },
      }).catch(() => null);

      const tsConta = ultConta?.atualizado_em ? new Date(ultConta.atualizado_em).getTime() : 0;
      const tsPub = ultPub?.atualizado_em ? new Date(ultPub.atualizado_em).getTime() : 0;
      const tsComent = ultComent?.atualizado_em ? new Date(ultComent.atualizado_em).getTime() : 0;

      // Verificação da UI compilada (dist/index.html)
      const caminhosDist = [
        path.resolve(process.cwd(), 'Aplicativos_Base/Interface_Web/dist/index.html'),
        path.resolve(process.cwd(), '../Interface_Web/dist/index.html'),
        path.resolve(__dirname, '../../Interface_Web/dist/index.html'),
        'D:/Gerenciador_Conteudo/Aplicativos_Base/Interface_Web/dist/index.html',
      ];
      const caminhoIndex = caminhosDist.find((c) => fs.existsSync(c));
      let buildUiMtime = 0;
      if (caminhoIndex) {
        try {
          buildUiMtime = Math.round(fs.statSync(caminhoIndex).mtimeMs);
        } catch {}
      }

      const assinatura = `ui:${buildUiMtime}_cnt:${contagemContas}_${contagemPublicacoes}_${contagemConteudos}_${contagemComentarios}_mod:${tsConta}_${tsPub}_${tsComent}`;
      res.json({
        ok: true,
        assinatura,
        buildUiMtime,
        timestamp: Date.now(),
      });
    } catch (erro: any) {
      res.status(500).json({ ok: false, erro: erro.message });
    }
  }
}
