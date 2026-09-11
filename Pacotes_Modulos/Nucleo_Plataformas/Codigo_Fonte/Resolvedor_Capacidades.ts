import { CapacidadesPlataforma, ParametrosPublicacao } from './Modelos_Normalizados.js';
import { ErroPlataforma } from './Erros_Padronizados.js';

export class ResolvedorCapacidades {
  public static validarCapacidade(
    capacidades: CapacidadesPlataforma,
    parametros: ParametrosPublicacao,
    nomePlataforma: string
  ): void {
    // 1. Validação de formato de mídia
    switch (parametros.tipoMidia) {
      case 'VIDEO':
        if (!capacidades.video) {
          throw new ErroPlataforma({
            codigo: 'UNSUPPORTED',
            mensagem: `A plataforma ${nomePlataforma} não suporta publicação de vídeos comuns nesta conta.`,
            plataforma: nomePlataforma,
            contaId: parametros.contaId,
          });
        }
        break;

      case 'SHORT_VIDEO':
        if (!capacidades.videoCurto && !capacidades.video) {
          throw new ErroPlataforma({
            codigo: 'UNSUPPORTED',
            mensagem: `A plataforma ${nomePlataforma} não suporta vídeos curtos ou reels nesta conta.`,
            plataforma: nomePlataforma,
            contaId: parametros.contaId,
          });
        }
        break;

      case 'IMAGE':
        if (!capacidades.imagem) {
          throw new ErroPlataforma({
            codigo: 'UNSUPPORTED',
            mensagem: `A plataforma ${nomePlataforma} não suporta postagens de imagens estáticas.`,
            plataforma: nomePlataforma,
            contaId: parametros.contaId,
          });
        }
        break;

      case 'CAROUSEL':
        if (!capacidades.carrossel) {
          throw new ErroPlataforma({
            codigo: 'UNSUPPORTED',
            mensagem: `A plataforma ${nomePlataforma} não suporta postagens de carrossel.`,
            plataforma: nomePlataforma,
            contaId: parametros.contaId,
          });
        }
        break;

      case 'REEL':
        if (!capacidades.reel && !capacidades.videoCurto) {
          throw new ErroPlataforma({
            codigo: 'UNSUPPORTED',
            mensagem: `A plataforma ${nomePlataforma} não suporta o formato Reel para esta conta.`,
            plataforma: nomePlataforma,
            contaId: parametros.contaId,
          });
        }
        break;

      case 'STORY':
        if (!capacidades.story) {
          throw new ErroPlataforma({
            codigo: 'UNSUPPORTED',
            mensagem: `A plataforma ${nomePlataforma} não suporta publicação automática de Stories via API oficial.`,
            plataforma: nomePlataforma,
            contaId: parametros.contaId,
          });
        }
        break;

      default:
        break;
    }

    // 2. Validação de Agendamento
    if (parametros.agendadoPara && !capacidades.agendamento) {
      throw new ErroPlataforma({
        codigo: 'UNSUPPORTED',
        mensagem: `A plataforma ${nomePlataforma} não oferece agendamento nativo via API para esta conta. O agendamento deve ser gerenciado internamente pelo sistema.`,
        plataforma: nomePlataforma,
        contaId: parametros.contaId,
      });
    }
  }

  public static suportaVideo(capacidades: CapacidadesPlataforma): boolean {
    return capacidades.video;
  }

  public static suportaImagem(capacidades: CapacidadesPlataforma): boolean {
    return capacidades.imagem;
  }

  public static suportaCarrossel(capacidades: CapacidadesPlataforma): boolean {
    return capacidades.carrossel;
  }

  public static suportaReel(capacidades: CapacidadesPlataforma): boolean {
    return capacidades.reel;
  }

  public static suportaStory(capacidades: CapacidadesPlataforma): boolean {
    return capacidades.story;
  }

  public static suportaAgendamento(capacidades: CapacidadesPlataforma): boolean {
    return capacidades.agendamento;
  }

  public static suportaMetricas(capacidades: CapacidadesPlataforma): boolean {
    return capacidades.metricas;
  }

  public static suportaComentarios(capacidades: CapacidadesPlataforma): boolean {
    return capacidades.comentarios;
  }

  public static suportaResposta(capacidades: CapacidadesPlataforma): boolean {
    return capacidades.respostaComentario;
  }
}
