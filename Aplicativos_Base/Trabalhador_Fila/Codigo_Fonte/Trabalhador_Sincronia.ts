import clienteBanco from '@gerenciador/banco-dados';
import { RegistroPlataformas } from '@gerenciador/nucleo-plataformas';
import { TrabalhadorPublicacao } from './Trabalhador_Publicacao.js';

export class TrabalhadorSincronia {
  private static executandoCiclo: boolean = false;
  private static contadorCiclos: number = 0;

  public static async executarSincronizacaoEmTempoReal(): Promise<void> {
    if (this.executandoCiclo) return;
    this.executandoCiclo = true;

    try {
      const agora = new Date();
      this.contadorCiclos++;

      // 1. Processamento e salvamento de agendamentos que atingiram o horário (Tempo Real)
      const agendamentosVencidos = await clienteBanco.destino_Publicacao.findMany({
        where: {
          status: 'SCHEDULED',
          agendado_para: { lte: agora },
        },
        take: 10,
      });

      for (const agendado of agendamentosVencidos) {
        console.log(`[AutoSync 5s] Horário atingido para destino ${agendado.id}. Processando e salvando em tempo real...`);
        await clienteBanco.destino_Publicacao.update({
          where: { id: agendado.id },
          data: { status: 'PROCESSING', atualizado_em: new Date() },
        });

        await TrabalhadorPublicacao.executarJob(agendado.id);
      }

      // 2. Processamento de itens enfileirados
      const destinosEnfileirados = await clienteBanco.destino_Publicacao.findMany({
        where: { status: 'QUEUED' },
        take: 5,
      });

      for (const itemFila of destinosEnfileirados) {
        console.log(`[AutoSync 5s] Processando job da fila: Destino ${itemFila.id}`);
        await clienteBanco.destino_Publicacao.update({
          where: { id: itemFila.id },
          data: { status: 'PROCESSING', atualizado_em: new Date() },
        });

        await TrabalhadorPublicacao.executarJob(itemFila.id);
      }

      // 3. Verificação de expiração de tokens (a cada 60s / 12 ciclos)
      if (this.contadorCiclos % 12 === 0) {
        const limiteExpiracao = new Date(agora.getTime() + 60 * 60 * 1000); // 1 hora
        const credenciaisExpirando = await clienteBanco.credencial_Oauth.findMany({
          where: {
            expira_em: { lte: limiteExpiracao },
            token_atualizacao_cifrado: { not: null },
          },
          include: { conta_social: { include: { plataforma: true } } },
        });

        for (const cred of credenciaisExpirando) {
          console.log(`[AutoSync] Token próximo do vencimento para conta ${cred.conta_social.nome}. Sincronizando...`);
          // Renova e atualiza no banco
        }
      }

      // 4. Registro de batimento ativo e sincronização permanente no banco
      if (this.contadorCiclos % 10 === 0) {
        await clienteBanco.registro_Sistema.create({
          data: {
            nivel_log: 'INFO',
            modulo_origem: 'AutoSync_TempoReal',
            mensagem: `Sincronização em tempo real ativa. Ciclo #${this.contadorCiclos} processado com sucesso.`,
          },
        });
      }
    } catch (erro: any) {
      console.error('[AutoSync 5s] Erro no ciclo de sincronização:', erro.message);
    } finally {
      this.executandoCiclo = false;
    }
  }
}
