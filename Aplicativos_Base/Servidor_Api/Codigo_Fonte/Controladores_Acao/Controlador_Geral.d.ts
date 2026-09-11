import { Request, Response } from 'express';
export declare class ControladorGeral {
    static saudeSistema(req: Request, res: Response): Promise<void>;
    static resumoMetricas(req: Request, res: Response): Promise<void>;
    static listarConteudos(req: Request, res: Response): Promise<void>;
    static criarConteudo(req: Request, res: Response): Promise<void>;
    static listarModelos(req: Request, res: Response): Promise<void>;
    static listarHashtags(req: Request, res: Response): Promise<void>;
    static listarComentarios(req: Request, res: Response): Promise<void>;
    static responderComentario(req: Request, res: Response): Promise<void>;
    static listarMidias(req: Request, res: Response): Promise<void>;
    static sincronizarSistema(req: Request, res: Response): Promise<void>;
    static verificarMudancas(req: Request, res: Response): Promise<void>;
}
