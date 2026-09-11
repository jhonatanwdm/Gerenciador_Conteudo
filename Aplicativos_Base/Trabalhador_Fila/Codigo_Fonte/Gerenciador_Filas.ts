import clienteBanco from '@gerenciador/banco-dados';

export interface TrabalhoPublicacaoJob {
  destinoPublicacaoId: string;
  tentativa: number;
}

export class GerenciadorFilas {
  private static filaLocal: TrabalhoPublicacaoJob[] = [];
  private static emExecucao: boolean = false;

  public static async enfileirarPublicacao(destinoPublicacaoId: string): Promise<void> {
    // Registra job no banco para rastreabilidade permanente
    await clienteBanco.trabalho_Fila.create({
      data: {
        destino_publicacao_id: destinoPublicacaoId,
        nome_fila: 'publicacao',
        status: 'QUEUED',
        prioridade: 1,
        tentativas_atuais: 0,
      },
    });

    this.filaLocal.push({
      destinoPublicacaoId,
      tentativa: 1,
    });
  }

  public static obterProximoJob(): TrabalhoPublicacaoJob | undefined {
    return this.filaLocal.shift();
  }

  public static totalEmFila(): number {
    return this.filaLocal.length;
  }
}
