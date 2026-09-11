import { Request, Response } from 'express';
import { ServicoConta } from '../Servicos_Negocio/Servico_Conta.js';

export class ControladorConta {
  public static async listar(req: Request, res: Response): Promise<void> {
    try {
      const contas = await ServicoConta.listarTodas();
      res.json(contas);
    } catch (erro: any) {
      res.status(500).json({ erro: erro.message });
    }
  }

  public static async conectar(req: Request, res: Response): Promise<void> {
    try {
      const { codigoPlataforma, codigoAutorizacao, urlRetorno } = req.body;
      const contas = await ServicoConta.conectarConta({
        codigoPlataforma,
        codigoAutorizacao: codigoAutorizacao || 'mock_auth_code',
        urlRetorno: urlRetorno || 'http://localhost:3333/api/callback',
      });
      res.status(201).json({ sucesso: true, contas });
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  public static async testar(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const resultado = await ServicoConta.testarConexao(id);
      res.json(resultado);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  public static async desconectar(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const resultado = await ServicoConta.desconectar(id);
      res.json(resultado);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }
}
