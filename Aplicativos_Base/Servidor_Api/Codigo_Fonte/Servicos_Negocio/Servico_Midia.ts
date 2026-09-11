import clienteBanco from '@gerenciador/banco-dados';
import { ProvedorArmazenamentoLocal, MotorFfmpeg } from '@gerenciador/processador-midia';

export class ServicoMidia {
  private static provedor = new ProvedorArmazenamentoLocal();

  public static async listarTodas() {
    return clienteBanco.ativo_Midia.findMany({
      include: { variantes: true },
      orderBy: { criado_em: 'desc' },
    });
  }

  public static async salvarArquivo(
    nomeArquivo: string,
    buffer: Buffer,
    tipoMime: string
  ) {
    const salvo = await this.provedor.salvarArquivo(nomeArquivo, buffer, tipoMime);
    const metadados = MotorFfmpeg.extrairMetadados(nomeArquivo);

    return clienteBanco.ativo_Midia.create({
      data: {
        nome_arquivo: nomeArquivo,
        caminho_armazenamento: salvo.caminho,
        url_publica: salvo.urlPublica,
        tipo_mime: tipoMime,
        tamanho_bytes: buffer.length,
        duracao_segundos: metadados.duracaoSegundos,
        largura_pixels: metadados.largura,
        altura_pixels: metadados.altura,
        formato_extensao: metadados.formatoExtensao,
      },
    });
  }
}
