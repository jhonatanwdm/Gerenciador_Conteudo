import { exibirNotificacao } from './Sistema_Notificacoes.js';

export interface EstadoAtualizacao {
  atualizando: boolean;
  overlayAtivo: boolean;
  titulo: string;
  subtitulo: string;
  autoAtivo: boolean;
  intervaloSegundos: number;
  segundosRestantes: number;
}

type OuvinteEstado = (estado: EstadoAtualizacao) => void;

const DURACAO_MINIMA_OVERLAY_MS = 3500;
const CHAVE_STORAGE_AUTO = 'gerenciador_auto_atualizar_ativo';
const CHAVE_STORAGE_INTERVALO = 'gerenciador_auto_atualizar_intervalo';
const CHAVE_STORAGE_OVERLAY_RECARGA = 'gerenciador_overlay_recarga';

export class GerenciadorAtualizacao {
  private static instancia: GerenciadorAtualizacao | null = null;

  private atualizando = false;
  private overlayAtivo = false;
  private titulo = 'Recebendo atualização...';
  private subtitulo = 'Sincronizando arquivos e dados do projeto';
  private autoAtivo = true;
  private intervaloSegundos = 5;
  private segundosRestantes = 5;
  private timerAuto: ReturnType<typeof setInterval> | null = null;
  private ouvintes: Set<OuvinteEstado> = new Set();
  private callbackRecarregarDados: (() => Promise<void>) | null = null;
  private ultimaAssinatura: string | null = null;
  private ultimoBuildUi: number | null = null;
  private recargaEmAndamento: {
    inicioMs: number;
    origem: string;
  } | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        const salvoAuto = localStorage.getItem(CHAVE_STORAGE_AUTO);
        if (salvoAuto !== null) {
          this.autoAtivo = salvoAuto === 'true';
        }
        const salvoIntervalo = localStorage.getItem(CHAVE_STORAGE_INTERVALO);
        if (salvoIntervalo !== null) {
          const num = parseInt(salvoIntervalo, 10);
          if (!isNaN(num) && num >= 5) {
            this.intervaloSegundos = num;
            this.segundosRestantes = num;
          }
        }
      } catch {
        // Fallback padrão
      }

      // Restaura o overlay caso a janela tenha sido recarregada para aplicar atualizações
      try {
        const salvoOverlay = sessionStorage.getItem(CHAVE_STORAGE_OVERLAY_RECARGA);
        if (salvoOverlay) {
          const info = JSON.parse(salvoOverlay);
          const agora = Date.now();
          if (info && info.ativo && agora - info.inicioMs < 15000) {
            this.overlayAtivo = true;
            this.atualizando = true;
            if (info.titulo) this.titulo = info.titulo;
            if (info.subtitulo) this.subtitulo = info.subtitulo;
            this.recargaEmAndamento = {
              inicioMs: Number(info.inicioMs) || agora,
              origem: String(info.origem || 'auto'),
            };
          } else {
            sessionStorage.removeItem(CHAVE_STORAGE_OVERLAY_RECARGA);
          }
        }
      } catch {
        sessionStorage.removeItem(CHAVE_STORAGE_OVERLAY_RECARGA);
      }

      // Conexão com eventos IPC do Electron (se em ambiente desktop)
      const central = (window as unknown as {
        central?: {
          onAtualizacaoIniciada?: (cb: (dados: { titulo?: string; subtitulo?: string }) => void) => void;
          onAtualizacaoConcluida?: (cb: () => void) => void;
        };
      }).central;

      if (central?.onAtualizacaoIniciada) {
        central.onAtualizacaoIniciada((dados) => {
          if (!this.atualizando) {
            void this.executarAtualizacao('auto', true);
          }
        });
      }

      if (central?.onAtualizacaoConcluida) {
        central.onAtualizacaoConcluida(() => {
          if (!this.atualizando && !this.recargaEmAndamento) {
            this.ocultarOverlay();
          }
        });
      }
    }
  }

  public static obterInstancia(): GerenciadorAtualizacao {
    if (!GerenciadorAtualizacao.instancia) {
      GerenciadorAtualizacao.instancia = new GerenciadorAtualizacao();
    }
    return GerenciadorAtualizacao.instancia;
  }

  public registrarCallbackRecarga(cb: () => Promise<void>): void {
    this.callbackRecarregarDados = cb;
    if (this.recargaEmAndamento) {
      void this.concluirRecargaPosReload();
    }
  }

  private async concluirRecargaPosReload(): Promise<void> {
    const recarga = this.recargaEmAndamento;
    this.recargaEmAndamento = null;
    try {
      sessionStorage.removeItem(CHAVE_STORAGE_OVERLAY_RECARGA);
    } catch {}

    try {
      const elBootstrap = document.getElementById('bootstrap-overlay-recarga');
      if (elBootstrap) elBootstrap.remove();
    } catch {}

    const central = (window as unknown as {
      central?: {
        broadcastAtualizacaoConcluida?: (r?: unknown) => void;
      };
    }).central;

    try {
      if (this.callbackRecarregarDados) {
        try {
          await this.callbackRecarregarDados();
        } catch (e) {
          console.warn('Aviso: falha na recarga de dados pós-reload:', e);
        }
      }

      try {
        const resp = await fetch('/api/sistema/verificar-mudancas');
        if (resp.ok) {
          const dados = await resp.json();
          this.ultimaAssinatura = String(dados.assinatura || '');
          this.ultimoBuildUi = Number(dados.buildUiMtime || 0);
        }
      } catch {}

      const decorrido = recarga ? Date.now() - recarga.inicioMs : 0;
      const restante = Math.max(1200, DURACAO_MINIMA_OVERLAY_MS - decorrido);
      if (restante > 0) {
        await new Promise((resolve) => setTimeout(resolve, restante));
      }

      this.ocultarOverlay();

      if (central?.broadcastAtualizacaoConcluida) {
        central.broadcastAtualizacaoConcluida({ sucesso: true });
      }

      exibirNotificacao(
        'Projeto Atualizado',
        'Alterações aplicadas e projeto sincronizado com sucesso.',
        'success',
        3500
      );
    } catch (erro: unknown) {
      this.ocultarOverlay();
      const erroMsg = erro instanceof Error ? erro.message : String(erro);
      exibirNotificacao('Falha na Atualização', erroMsg, 'error', 4500);
    } finally {
      this.atualizando = false;
      this.notificarOuvintes();

      if (this.autoAtivo) {
        this.segundosRestantes = this.intervaloSegundos;
        this.iniciarCicloAuto();
      }
    }
  }

  public assinar(ouvinte: OuvinteEstado): () => void {
    this.ouvintes.add(ouvinte);
    ouvinte(this.obterEstado());
    return () => {
      this.ouvintes.delete(ouvinte);
    };
  }

  private notificarOuvintes(): void {
    const estado = this.obterEstado();
    for (const ouvinte of this.ouvintes) {
      ouvinte(estado);
    }
  }

  public obterEstado(): EstadoAtualizacao {
    return {
      atualizando: this.atualizando,
      overlayAtivo: this.overlayAtivo,
      titulo: this.titulo,
      subtitulo: this.subtitulo,
      autoAtivo: this.autoAtivo,
      intervaloSegundos: this.intervaloSegundos,
      segundosRestantes: this.segundosRestantes,
    };
  }

  public mostrarOverlay(titulo?: string, subtitulo?: string): void {
    this.overlayAtivo = true;
    if (titulo) this.titulo = titulo;
    if (subtitulo) this.subtitulo = subtitulo;
    this.notificarOuvintes();
  }

  public ocultarOverlay(): void {
    this.overlayAtivo = false;
    this.notificarOuvintes();
  }

  public alternarAutoAtualizar(): boolean {
    this.autoAtivo = !this.autoAtivo;
    try {
      localStorage.setItem(CHAVE_STORAGE_AUTO, String(this.autoAtivo));
    } catch {}

    if (this.autoAtivo) {
      this.segundosRestantes = this.intervaloSegundos;
      this.iniciarCicloAuto();
      exibirNotificacao(
        'Auto Atualizar',
        `Monitoramento automático ativado (${this.intervaloSegundos}s).`,
        'info',
        2500,
      );
    } else {
      this.pararCicloAuto();
      exibirNotificacao(
        'Auto Atualizar',
        'Monitoramento automático desativado.',
        'info',
        2500,
      );
    }
    this.notificarOuvintes();
    return this.autoAtivo;
  }

  public definirIntervalo(segundos: number): void {
    const val = Math.max(5, Math.min(3600, Math.round(segundos)));
    this.intervaloSegundos = val;
    this.segundosRestantes = val;
    try {
      localStorage.setItem(CHAVE_STORAGE_INTERVALO, String(val));
    } catch {}
    this.notificarOuvintes();
  }

  public async verificarMudancasSilenciosas(): Promise<{ mudou: boolean; mudouUi: boolean }> {
    try {
      const resp = await fetch('/api/sistema/verificar-mudancas');
      if (!resp.ok) return { mudou: false, mudouUi: false };
      const dados = await resp.json();
      const novaAssinatura = String(dados.assinatura || '');
      const novoBuildUi = Number(dados.buildUiMtime || 0);

      if (this.ultimaAssinatura === null) {
        // Primeira checagem no boot: memoriza assinatura e não interrompe
        this.ultimaAssinatura = novaAssinatura;
        this.ultimoBuildUi = novoBuildUi;
        return { mudou: false, mudouUi: false };
      }

      if (novaAssinatura !== this.ultimaAssinatura) {
        const mudouUi = this.ultimoBuildUi !== null && novoBuildUi !== this.ultimoBuildUi && novoBuildUi > 0;
        this.ultimaAssinatura = novaAssinatura;
        this.ultimoBuildUi = novoBuildUi;
        return { mudou: true, mudouUi };
      }

      return { mudou: false, mudouUi: false };
    } catch {
      return { mudou: false, mudouUi: false };
    }
  }

  public iniciarCicloAuto(): void {
    this.pararCicloAuto();
    if (!this.autoAtivo || this.atualizando) return;

    this.timerAuto = setInterval(() => {
      if (!this.autoAtivo || this.atualizando) {
        this.pararCicloAuto();
        return;
      }

      this.segundosRestantes -= 1;
      this.notificarOuvintes();

      if (this.segundosRestantes <= 0) {
        this.segundosRestantes = this.intervaloSegundos;
        this.notificarOuvintes();

        // Checagem SILENCIOSA em segundo plano. Só abre overlay se HOUVE alteração REAL!
        void this.verificarMudancasSilenciosas().then(({ mudou, mudouUi }) => {
          if (mudou && !this.atualizando) {
            void this.executarAtualizacao('auto', true);
          }
        });
      }
    }, 1000);
  }

  public pararCicloAuto(): void {
    if (this.timerAuto) {
      clearInterval(this.timerAuto);
      this.timerAuto = null;
    }
  }

  /**
   * Executa a atualização completa com overlay, sincronização de banco de dados
   * e recarregamento por trás do aviso da overlay antes da mesma sumir.
   */
  public async executarAtualizacao(
    origem: 'manual' | 'auto' = 'manual',
    recarregarJanela: boolean = true
  ): Promise<void> {
    if (this.atualizando) return;
    this.atualizando = true;
    this.pararCicloAuto();

    const titulo =
      origem === 'auto' ? 'Recebendo atualização...' : 'Atualizando projeto...';
    const subtitulo = 'Sincronizando arquivos e dados do projeto';

    this.mostrarOverlay(titulo, subtitulo);

    const inicioMs = Date.now();

    // Broadcast IPC se estiver no Electron
    const central = (window as unknown as {
      central?: {
        recarregarJanela?: () => Promise<boolean>;
        broadcastAtualizacaoIniciada?: (d: { titulo: string; subtitulo: string; duracaoMs: number }) => void;
        broadcastAtualizacaoConcluida?: (r?: unknown) => void;
      };
    }).central;

    if (central?.broadcastAtualizacaoIniciada) {
      central.broadcastAtualizacaoIniciada({
        titulo,
        subtitulo,
        duracaoMs: DURACAO_MINIMA_OVERLAY_MS,
      });
    }

    try {
      // 1. Sincronização de Banco de Dados via API
      try {
        await fetch('/api/sistema/sincronizar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => null);
      } catch (errDb) {
        console.warn('Aviso: sincronização do banco:', errDb);
      }

      // 2. Se for para recarregar a janela (para aplicar todas as alterações de código e visual):
      if (recarregarJanela) {
        try {
          sessionStorage.setItem(
            CHAVE_STORAGE_OVERLAY_RECARGA,
            JSON.stringify({
              ativo: true,
              titulo,
              subtitulo,
              inicioMs,
              origem,
            })
          );
        } catch {}

        // Aguarda 500ms para a animação do overlay estabilizar na tela
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Dispara o recarregamento por trás do aviso da overlay
        if (central?.recarregarJanela) {
          try {
            await central.recarregarJanela();
            return;
          } catch {
            window.location.reload();
            return;
          }
        } else {
          window.location.reload();
          return;
        }
      }

      // 3. Fallback caso recarregarJanela seja falso:
      if (this.callbackRecarregarDados) {
        await this.callbackRecarregarDados();
      }

      const decorrido = Date.now() - inicioMs;
      const restante = Math.max(0, DURACAO_MINIMA_OVERLAY_MS - decorrido);
      if (restante > 0) {
        await new Promise((resolve) => setTimeout(resolve, restante));
      }

      try {
        const respAssinatura = await fetch('/api/sistema/verificar-mudancas');
        if (respAssinatura.ok) {
          const dadosAssinatura = await respAssinatura.json();
          this.ultimaAssinatura = String(dadosAssinatura.assinatura || '');
          this.ultimoBuildUi = Number(dadosAssinatura.buildUiMtime || 0);
        }
      } catch {}

      this.ocultarOverlay();

      if (central?.broadcastAtualizacaoConcluida) {
        central.broadcastAtualizacaoConcluida({ sucesso: true });
      }

      exibirNotificacao(
        'Projeto Atualizado',
        'Banco de dados e dados do projeto sincronizados com sucesso.',
        'success',
        3500
      );
    } catch (erro: unknown) {
      try {
        sessionStorage.removeItem(CHAVE_STORAGE_OVERLAY_RECARGA);
      } catch {}
      this.ocultarOverlay();
      const erroMsg = erro instanceof Error ? erro.message : String(erro);
      exibirNotificacao('Falha na Atualização', erroMsg, 'error', 4500);
    } finally {
      this.atualizando = false;
      this.notificarOuvintes();

      if (this.autoAtivo) {
        this.segundosRestantes = this.intervaloSegundos;
        this.iniciarCicloAuto();
      }
    }
  }
}
