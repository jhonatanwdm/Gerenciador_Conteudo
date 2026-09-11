import clienteBanco from '@gerenciador/banco-dados';
import { RegistroPlataformas } from '@gerenciador/nucleo-plataformas';

export class TrabalhadorPublicacao {
  public static async executarJob(destinoId: string): Promise<void> {
    const destino = await clienteBanco.destino_Publicacao.findUnique({
      where: { id: destinoId },
      include: {
        conta_social: { include: { credencial_oauth: true } },
        plataforma: true,
        publicacao: { include: { conteudo: true } },
      },
    });

    if (!destino) return;

    console.log(`[Worker] Processando publicação para ${destino.plataforma.nome} - Conta: ${destino.conta_social.nome_exibicao}`);

    try {
      const registro = RegistroPlataformas.obterInstancia();
      const adaptador = registro.obterAdaptador(destino.plataforma.codigo);

      const resultado = await adaptador.publicar({
        destinoId: destino.id,
        contaId: destino.conta_social_id,
        idExternoConta: destino.conta_social.id_externo_conta,
        titulo: destino.titulo_personalizado || destino.publicacao.conteudo.titulo,
        tipoMidia: 'SHORT_VIDEO',
        tokenAcesso: 'mock_token',
      });

      await clienteBanco.destino_Publicacao.update({
        where: { id: destinoId },
        data: {
          status: 'PUBLISHED',
          id_externo: resultado.idExterno,
          url_externa: resultado.urlExterna,
          publicado_em: new Date(),
        },
      });

      console.log(`[Worker] ✓ Destino ${destinoId} publicado com sucesso.`);
    } catch (erro: any) {
      console.error(`[Worker] ✗ Falha no destino ${destinoId}: ${erro.message}`);
      await clienteBanco.destino_Publicacao.update({
        where: { id: destinoId },
        data: {
          status: 'FAILED',
          codigo_erro: erro.codigo || 'PLATFORM_ERROR',
          mensagem_erro: erro.message,
        },
      });
    }
  }
}
