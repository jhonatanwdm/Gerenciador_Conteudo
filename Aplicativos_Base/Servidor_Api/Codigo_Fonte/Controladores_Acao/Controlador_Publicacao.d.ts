import { Request, Response } from 'express';
export declare class ControladorPublicacao {
    static listar(req: Request, res: Response): Promise<void>;
    static obterPorId(req: Request, res: Response): Promise<void>;
    static criar(req: Request, res: Response): Promise<void>;
    static tentarNovamente(req: Request, res: Response): Promise<void>;
    static repostar(req: Request, res: Response): Promise<void>;
}
