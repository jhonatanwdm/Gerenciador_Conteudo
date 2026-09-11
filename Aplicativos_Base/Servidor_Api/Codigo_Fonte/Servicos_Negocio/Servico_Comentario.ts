import clienteBanco from '@gerenciador/banco-dados';
import { RegistroPlataformas } from '@gerenciador/nucleo-plataformas';
import { ServicoCriptografia } from './Servico_Criptografia.js';

export class ServicoComentario {
  public static async listarComentarios(filtros?: {
    apenasNaoRespondidos?: boolean;
    plataformaCodigo?: string;
  }) {
    return clienteBanco.comentario_Rede.findMany({
      where: {
        ...(filtros?.apenasNaoRespondidos ? { respondido: false } : {}),
      },
      include: {
        conta_social: { include: { plataforma: true } },
        destino_publicacao: {
          include: { publicacao: { include: { conteudo: true } } },
        },
        respostas: true,
      },
      orderBy: { data_comentario: 'desc' },
    });
  }

  public static async responderComentario(comentarioId: string, textoResposta: string) {
    const comentario = await clienteBanco.comentario_Rede.findUnique({
      where: { id: comentarioId },
      include: {
        conta_social: {
          include: { plataforma: true, credencial_oauth: true },
        },
      },
    });

    if (!comentario) {
      throw new Error('Comentário não encontrado.');
    }

    const token = comentario.conta_social.credencial_oauth?.token_acesso_cifrado
      ? ServicoCriptografia.decifrar(comentario.conta_social.credencial_oauth.token_acesso_cifrado)
      : '';

    const adaptador = RegistroPlataformas.obterInstancia().obterAdaptador(
      comentario.conta_social.plataforma.codigo
    );

    const resultado = await adaptador.responderComentario(
      comentario.id_externo_comentario,
      textoResposta,
      token
    );

    const respostaSalva = await clienteBanco.resposta_Comentario.create({
      data: {
        comentario_pai_id: comentario.id,
        texto_resposta: textoResposta,
        status_envio: 'SENT',
        id_externo_resposta: resultado.idExternoResposta,
      },
    });

    await clienteBanco.comentario_Rede.update({
      where: { id: comentario.id },
      data: { respondido: true },
    });

    return respostaSalva;
  }
}
