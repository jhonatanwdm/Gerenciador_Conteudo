import { Request, Response } from 'express';
import { ServicoPublicacao } from '../Servicos_Negocio/Servico_Publicacao.js';

export class ControladorPublicacao {
  public static async listar(req: Request, res: Response): Promise<void> {
    try {
      const publicacoes = await ServicoPublicacao.listarTodas({
        status: req.query.status as string,
        campanhaId: req.query.campanhaId as string,
      });
      res.json(publicacoes);
    } catch (erro: any) {
      res.status(500).json({ erro: erro.message });
    }
  }

  public static async obterPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const pub = await ServicoPublicacao.obterPorId(id);
      if (!pub) {
        res.status(404).json({ erro: 'Publicação não encontrada' });
        return;
      }
      res.json(pub);
    } catch (erro: any) {
      res.status(500).json({ erro: erro.message });
    }
  }

  public static async criar(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await ServicoPublicacao.criarPublicacao(req.body);
      res.status(201).json(resultado);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  public static async tentarNovamente(req: Request, res: Response): Promise<void> {
    try {
      const destinoId = String(req.params.destinoId);
      const resultado = await ServicoPublicacao.tentarNovamenteDestino(destinoId);
      res.json(resultado);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  public static async repostar(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await ServicoPublicacao.repostarPublicacao(req.body);
      res.status(201).json(resultado);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }
}
