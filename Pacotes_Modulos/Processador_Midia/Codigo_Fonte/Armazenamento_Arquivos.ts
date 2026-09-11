import fs from 'fs';
import path from 'path';

export interface ProvedorArmazenamento {
  salvarArquivo(
    nomeArquivo: string,
    bufferConteudo: Buffer,
    tipoMime: string
  ): Promise<{ caminho: string; urlPublica: string }>;

  obterArquivo(caminhoArquivo: string): Promise<Buffer>;

  excluirArquivo(caminhoArquivo: string): Promise<boolean>;
}

export class ProvedorArmazenamentoLocal implements ProvedorArmazenamento {
  private diretorioBase: string;

  constructor(diretorioBase: string = process.env.CAMINHO_ARMAZENAMENTO_LOCAL || './Armazenamento_Local') {
    this.diretorioBase = path.resolve(process.cwd(), diretorioBase);
    if (!fs.existsSync(this.diretorioBase)) {
      fs.mkdirSync(this.diretorioBase, { recursive: true });
    }
  }

  public async salvarArquivo(
    nomeArquivo: string,
    bufferConteudo: Buffer,
    tipoMime: string
  ): Promise<{ caminho: string; urlPublica: string }> {
    const nomeSeguro = `${Date.now()}_${nomeArquivo.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const caminhoCompleto = path.join(this.diretorioBase, nomeSeguro);

    await fs.promises.writeFile(caminhoCompleto, bufferConteudo);

    return {
      caminho: caminhoCompleto,
      urlPublica: `/arquivos/${nomeSeguro}`,
    };
  }

  public async obterArquivo(caminhoArquivo: string): Promise<Buffer> {
    return fs.promises.readFile(caminhoArquivo);
  }

  public async excluirArquivo(caminhoArquivo: string): Promise<boolean> {
    try {
      if (fs.existsSync(caminhoArquivo)) {
        await fs.promises.unlink(caminhoArquivo);
      }
      return true;
    } catch {
      return false;
    }
  }
}
