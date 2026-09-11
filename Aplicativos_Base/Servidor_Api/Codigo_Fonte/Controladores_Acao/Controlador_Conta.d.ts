import { Request, Response } from 'express';
export declare class ControladorConta {
    static listar(req: Request, res: Response): Promise<void>;
    static conectar(req: Request, res: Response): Promise<void>;
    static testar(req: Request, res: Response): Promise<void>;
    static desconectar(req: Request, res: Response): Promise<void>;
}
