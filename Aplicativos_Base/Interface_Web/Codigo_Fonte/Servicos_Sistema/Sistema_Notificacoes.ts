export type TipoNotificacao =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "process"
  | "system"
  | "media"
  | "copy";

export interface AcaoNotificacao {
  rotulo: string;
  estilo?: "primario" | "secundario";
  callback?: () => void;
  comandoIpc?: {
    canal: string;
    args?: unknown[];
  };
}

export interface DadosNotificacao {
  id?: string;
  titulo: string;
  mensagem: string;
  tipo?: TipoNotificacao;
  duracaoMs?: number;
  acoes?: AcaoNotificacao[];
  progresso?: number;
  som?: boolean;
  salvarHistorico?: boolean;
}

export interface ItemHistoricoNotificacao extends DadosNotificacao {
  id: string;
  timestamp: number;
  lida: boolean;
}

const MAX_NOTIFICACOES_TELA = 6;
const MAX_HISTORICO = 80;
const DURACAO_PADRAO_MS = 3800;
const CHAVE_STORAGE_SILENCIADO = "gerenciador_notificacoes_silenciadas";

// Armazenamento em memória da sessão
const historicoNotificacoes: ItemHistoricoNotificacao[] = [];
let contadorNaoLidas = 0;
let filtroAtualHistorico: string = "todas";

// SVGs modernos e precisos para cada tipo de notificação
const ICONES_SVG: Record<TipoNotificacao, string> = {
  success: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>`,
  error: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>`,
  warning: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>`,
  info: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>`,
  process: `
    <svg class="icone-girando" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>`,
  system: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
      <rect x="9" y="9" width="6" height="6"></rect>
      <line x1="9" y1="1" x2="9" y2="4"></line>
      <line x1="15" y1="1" x2="15" y2="4"></line>
      <line x1="9" y1="20" x2="9" y2="23"></line>
      <line x1="15" y1="20" x2="15" y2="23"></line>
      <line x1="20" y1="9" x2="23" y2="9"></line>
      <line x1="20" y1="14" x2="23" y2="14"></line>
      <line x1="1" y1="9" x2="4" y2="9"></line>
      <line x1="1" y1="14" x2="4" y2="14"></line>
    </svg>`,
  media: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
      <line x1="7" y1="2" x2="7" y2="22"></line>
      <line x1="17" y1="2" x2="17" y2="22"></line>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <line x1="2" y1="7" x2="7" y2="7"></line>
      <line x1="2" y1="17" x2="7" y2="17"></line>
      <line x1="17" y1="17" x2="22" y2="17"></line>
      <line x1="17" y1="7" x2="22" y2="7"></line>
    </svg>`,
  copy: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      <path d="M9 14l2 2 4-4"></path>
    </svg>`,
};

const ROTULOS_BADGE: Record<TipoNotificacao, string> = {
  success: "SUCESSO",
  error: "ERRO",
  warning: "ATENÇÃO",
  info: "INFO",
  process: "PROCESSO",
  system: "SISTEMA",
  media: "ESTÚDIO / MÍDIA",
  copy: "COPIADO",
};

function formatarHora(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function escaparHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function obterOuCriarContainer(): HTMLElement {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

// ============================================================================
// MOTOR DE ÁUDIO PROCEDURAL (Web Audio API)
// ============================================================================
let audioCtx: AudioContext | null = null;

export function obterSomSilenciado(): boolean {
  try {
    return localStorage.getItem(CHAVE_STORAGE_SILENCIADO) === "true";
  } catch {
    return false;
  }
}

export function alternarSomSilenciado(): boolean {
  const atual = obterSomSilenciado();
  const novo = !atual;
  try {
    localStorage.setItem(CHAVE_STORAGE_SILENCIADO, String(novo));
  } catch {}
  atualizarBotoesSilenciar();
  return novo;
}

function obterAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function tocarSomNotificacao(tipo: TipoNotificacao): void {
  if (obterSomSilenciado()) return;
  const ctx = obterAudioContext();
  if (!ctx) return;

  try {
    const agora = ctx.currentTime;
    const master = ctx.createGain();
    master.connect(ctx.destination);

    if (tipo === "copy") {
      // Estalo 'pop' suave
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, agora);
      osc.frequency.exponentialRampToValueAtTime(320, agora + 0.05);
      master.gain.setValueAtTime(0.18, agora);
      master.gain.exponentialRampToValueAtTime(0.001, agora + 0.05);
      osc.connect(master);
      osc.start(agora);
      osc.stop(agora + 0.05);
    } else if (tipo === "success") {
      // Arpeggio suave C5 -> E5 -> G5
      master.gain.setValueAtTime(0.12, agora);
      master.gain.exponentialRampToValueAtTime(0.001, agora + 0.28);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, agora);
      osc.frequency.setValueAtTime(659.25, agora + 0.08);
      osc.frequency.setValueAtTime(783.99, agora + 0.16);
      osc.connect(master);
      osc.start(agora);
      osc.stop(agora + 0.28);
    } else if (tipo === "error") {
      // Duplo tom grave
      master.gain.setValueAtTime(0.16, agora);
      master.gain.exponentialRampToValueAtTime(0.001, agora + 0.26);
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, agora);
      osc.frequency.setValueAtTime(164.81, agora + 0.12);
      osc.connect(master);
      osc.start(agora);
      osc.stop(agora + 0.26);
    } else if (tipo === "warning") {
      // Acorde de alerta
      master.gain.setValueAtTime(0.14, agora);
      master.gain.exponentialRampToValueAtTime(0.001, agora + 0.22);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, agora);
      osc.frequency.setValueAtTime(554.37, agora + 0.09);
      osc.connect(master);
      osc.start(agora);
      osc.stop(agora + 0.22);
    } else if (tipo === "process") {
      // Pulso harmônico de carregamento
      master.gain.setValueAtTime(0.09, agora);
      master.gain.exponentialRampToValueAtTime(0.001, agora + 0.16);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(392, agora);
      osc.frequency.setValueAtTime(493.88, agora + 0.07);
      osc.connect(master);
      osc.start(agora);
      osc.stop(agora + 0.16);
    } else if (tipo === "media") {
      // Tom cinematográfico
      master.gain.setValueAtTime(0.12, agora);
      master.gain.exponentialRampToValueAtTime(0.001, agora + 0.24);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, agora);
      osc.frequency.setValueAtTime(739.99, agora + 0.09);
      osc.connect(master);
      osc.start(agora);
      osc.stop(agora + 0.24);
    } else if (tipo === "system") {
      // Bipe tecnológico sutil
      master.gain.setValueAtTime(0.09, agora);
      master.gain.exponentialRampToValueAtTime(0.001, agora + 0.14);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, agora);
      osc.frequency.setValueAtTime(1174.66, agora + 0.06);
      osc.connect(master);
      osc.start(agora);
      osc.stop(agora + 0.14);
    } else {
      // Info: tom neutro suave
      master.gain.setValueAtTime(0.08, agora);
      master.gain.exponentialRampToValueAtTime(0.001, agora + 0.15);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, agora);
      osc.connect(master);
      osc.start(agora);
      osc.stop(agora + 0.15);
    }
  } catch {
    // Ignora falhas de áudio silenciosamente
  }
}

// ============================================================================
// EXIBIÇÃO DE TOASTS FLUTUANTES TOUCH
// ============================================================================
export function exibirNotificacao(
  titulo: string,
  mensagem: string,
  tipo: TipoNotificacao = "info",
  duracaoMs: number = DURACAO_PADRAO_MS,
  opcoes?: Partial<DadosNotificacao>,
): void {
  const container = obterOuCriarContainer();

  while (container.children.length >= MAX_NOTIFICACOES_TELA) {
    const maisAntigo = container.firstChild as HTMLElement | null;
    if (maisAntigo) container.removeChild(maisAntigo);
    else break;
  }

  const agora = Date.now();
  const idNotif = opcoes?.id || `notif_${agora}_${Math.random().toString(36).slice(2, 7)}`;

  if (opcoes?.salvarHistorico !== false) {
    const itemHistorico: ItemHistoricoNotificacao = {
      id: idNotif,
      titulo,
      mensagem,
      tipo,
      duracaoMs,
      acoes: opcoes?.acoes,
      progresso: opcoes?.progresso,
      timestamp: agora,
      lida: false,
    };
    historicoNotificacoes.unshift(itemHistorico);
    if (historicoNotificacoes.length > MAX_HISTORICO) {
      historicoNotificacoes.pop();
    }
    contadorNaoLidas++;
    atualizarBadgesSino();
    renderizarListaHistorico();
  }

  if (opcoes?.som !== false) {
    tocarSomNotificacao(tipo);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", tipo === "error" ? "assertive" : "polite");
  toast.dataset.id = idNotif;

  const icone = ICONES_SVG[tipo] || ICONES_SVG.info;
  const rotuloTipo = ROTULOS_BADGE[tipo] || "INFO";

  toast.innerHTML = `
    <div class="toast-badge-tipo">${rotuloTipo}</div>
    <div class="toast-corpo">
      <div class="toast-icon" aria-hidden="true">${icone}</div>
      <div class="toast-content">
        <div class="toast-title">${escaparHtml(titulo)}</div>
        <div class="toast-message">${escaparHtml(mensagem)}</div>
      </div>
      <button type="button" class="toast-close" title="Fechar notificação" aria-label="Fechar">✕</button>
    </div>
    <div class="toast-progress-track">
      <div class="toast-progress-bar"></div>
    </div>
  `;

  const fechar = () => {
    if (!toast.parentElement) return;
    toast.classList.remove("show");
    toast.classList.add("closing");
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 320);
  };

  if (opcoes?.acoes && opcoes.acoes.length > 0) {
    const acoesContainer = document.createElement("div");
    acoesContainer.className = "toast-actions";
    for (const acao of opcoes.acoes) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `toast-btn-action ${acao.estilo === "primario" ? "primario" : "secundario"}`;
      btn.textContent = acao.rotulo;
      btn.onclick = (e) => {
        e.stopPropagation();
        if (acao.callback) {
          acao.callback();
        }
        if (acao.comandoIpc && (window as unknown as { central?: { executarComandoIpc: (c: string, ...a: unknown[]) => Promise<unknown> } }).central?.executarComandoIpc) {
          void (window as unknown as { central: { executarComandoIpc: (c: string, ...a: unknown[]) => Promise<unknown> } }).central.executarComandoIpc(
            acao.comandoIpc.canal,
            ...(acao.comandoIpc.args || []),
          );
        }
        fechar();
      };
      acoesContainer.appendChild(btn);
    }
    const corpo = toast.querySelector<HTMLElement>(".toast-corpo");
    if (corpo) corpo.appendChild(acoesContainer);
  }

  const btnFechar = toast.querySelector<HTMLButtonElement>(".toast-close");
  if (btnFechar) {
    btnFechar.onclick = (e) => {
      e.stopPropagation();
      fechar();
    };
  }

  // Swipe para a direita
  let inicioX = 0;
  let inicioY = 0;
  let arrastoAtualX = 0;
  let estaArrastando = false;

  const aoIniciarToque = (clientX: number, clientY: number) => {
    inicioX = clientX;
    inicioY = clientY;
    arrastoAtualX = 0;
    estaArrastando = true;
    toast.style.transition = "none";
  };

  const aoMoverToque = (clientX: number, clientY: number) => {
    if (!estaArrastando) return;
    const deltaX = clientX - inicioX;
    const deltaY = clientY - inicioY;

    if (deltaX > 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
      arrastoAtualX = deltaX;
      toast.style.transform = `translateX(${deltaX}px)`;
      const opacidade = Math.max(0.2, 1 - deltaX / 250);
      toast.style.opacity = String(opacidade);
    }
  };

  const aoFinalizarToque = () => {
    if (!estaArrastando) return;
    estaArrastando = false;
    toast.style.transition = "all 0.3s cubic-bezier(0.19, 1, 0.22, 1)";

    if (arrastoAtualX > 75) {
      toast.style.transform = "translateX(120%)";
      toast.style.opacity = "0";
      setTimeout(fechar, 280);
    } else {
      toast.style.transform = "translateX(0)";
      toast.style.opacity = "1";
    }
  };

  toast.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches[0]) aoIniciarToque(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true },
  );

  toast.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches[0]) aoMoverToque(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true },
  );

  toast.addEventListener("touchend", aoFinalizarToque, { passive: true });
  toast.addEventListener("touchcancel", aoFinalizarToque, { passive: true });

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  const progressBar = toast.querySelector<HTMLElement>(".toast-progress-bar");
  let tempoRestanteMs = duracaoMs;
  let inicioTimer = Date.now();
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const iniciarTimer = (tempo: number) => {
    if (tempo <= 0) return;
    inicioTimer = Date.now();
    tempoRestanteMs = tempo;

    if (progressBar) {
      progressBar.style.transition = `width ${tempo}ms linear`;
      progressBar.style.width = "0%";
    }

    timerId = setTimeout(() => {
      fechar();
    }, tempo);
  };

  const pausarTimer = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    const decorrido = Date.now() - inicioTimer;
    tempoRestanteMs = Math.max(0, tempoRestanteMs - decorrido);

    if (progressBar) {
      const computedWidth = window.getComputedStyle(progressBar).width;
      progressBar.style.transition = "none";
      progressBar.style.width = computedWidth;
    }
  };

  if (duracaoMs > 0) {
    iniciarTimer(duracaoMs);
  }

  toast.addEventListener("mouseenter", () => {
    pausarTimer();
  });

  toast.addEventListener("mouseleave", () => {
    if (duracaoMs > 0 && toast.parentElement && !toast.classList.contains("closing")) {
      iniciarTimer(Math.max(tempoRestanteMs, 1400));
    }
  });
}

// ============================================================================
// CENTRAL / GAVETA DE HISTÓRICO DE NOTIFICAÇÕES (DRAWER)
// ============================================================================
export function atualizarBadgesSino(): void {
  const badges = document.querySelectorAll<HTMLElement>(".badge-notificacoes");
  for (const b of badges) {
    if (contadorNaoLidas > 0) {
      b.textContent = contadorNaoLidas > 99 ? "99+" : String(contadorNaoLidas);
      b.classList.remove("oculto");
    } else {
      b.textContent = "0";
      b.classList.add("oculto");
    }
  }
}

export function atualizarBotoesSilenciar(): void {
  const botoes = document.querySelectorAll<HTMLButtonElement>(".btn-toggle-som-notif");
  const silenciado = obterSomSilenciado();
  for (const btn of botoes) {
    btn.innerHTML = silenciado
      ? `<span class="ico" aria-hidden="true">🔇</span> Sons Desativados`
      : `<span class="ico" aria-hidden="true">🔊</span> Sons Ativos`;
    btn.title = silenciado ? "Ativar efeitos sonoros" : "Silenciar efeitos sonoros";
    btn.classList.toggle("silenciado", silenciado);
  }
}

function criarOuObterDrawerHistorico(): {
  drawer: HTMLElement;
  backdrop: HTMLElement;
} {
  let drawer = document.getElementById("painel-historico-notificacoes");
  let backdrop = document.getElementById("backdrop-historico-notificacoes");

  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "backdrop-historico-notificacoes";
    backdrop.className = "backdrop-historico-notificacoes";
    backdrop.onclick = () => fecharCentralNotificacoes();
    document.body.appendChild(backdrop);
  }

  if (!drawer) {
    drawer = document.createElement("div");
    drawer.id = "painel-historico-notificacoes";
    drawer.className = "painel-historico-notificacoes";
    drawer.innerHTML = `
      <div class="historico-header">
        <div class="historico-titulo-box">
          <div class="historico-ico-sino">🔔</div>
          <div>
            <h3 class="historico-titulo">Central de Notificações</h3>
            <span class="historico-subtitulo">Histórico de ações e eventos da sessão</span>
          </div>
        </div>
        <div class="historico-header-acoes">
          <button type="button" class="btn-toggle-som-notif" title="Alternar som"></button>
          <button type="button" class="btn-fechar-historico" title="Fechar painel" aria-label="Fechar">✕</button>
        </div>
      </div>

      <div class="historico-controles">
        <div class="historico-filtros">
          <button type="button" class="filtro-chip ativo" data-filtro="todas">Todas</button>
          <button type="button" class="filtro-chip" data-filtro="success">Sucesso</button>
          <button type="button" class="filtro-chip" data-filtro="process">Processos</button>
          <button type="button" class="filtro-chip" data-filtro="media">Mídias</button>
          <button type="button" class="filtro-chip" data-filtro="copy">Copiados</button>
          <button type="button" class="filtro-chip" data-filtro="avisos">Avisos/Erros</button>
        </div>
        <div class="historico-botoes-secundarios">
          <button type="button" class="btn-marcar-lidas" id="btn-marcar-todas-lidas">Marcar lidas</button>
          <button type="button" class="btn-limpar-historico" id="btn-limpar-notificacoes">Limpar tudo</button>
        </div>
      </div>

      <div class="historico-lista" id="historico-lista-itens">
      </div>
    `;

    document.body.appendChild(drawer);

    drawer
      .querySelector(".btn-fechar-historico")
      ?.addEventListener("click", () => fecharCentralNotificacoes());

    drawer
      .querySelector(".btn-toggle-som-notif")
      ?.addEventListener("click", () => alternarSomSilenciado());

    drawer
      .querySelector("#btn-marcar-todas-lidas")
      ?.addEventListener("click", () => {
        marcarTodasComoLidas();
      });

    drawer
      .querySelector("#btn-limpar-notificacoes")
      ?.addEventListener("click", () => {
        limparHistoricoNotificacoes();
      });

    const chips = drawer.querySelectorAll<HTMLButtonElement>(".filtro-chip");
    for (const chip of chips) {
      chip.addEventListener("click", () => {
        for (const c of chips) c.classList.remove("ativo");
        chip.classList.add("ativo");
        filtroAtualHistorico = chip.dataset.filtro || "todas";
        renderizarListaHistorico();
      });
    }

    atualizarBotoesSilenciar();
  }

  return { drawer, backdrop };
}

function renderizarListaHistorico(): void {
  const lista = document.getElementById("historico-lista-itens");
  if (!lista) return;

  const itensFiltrados = historicoNotificacoes.filter((item) => {
    if (filtroAtualHistorico === "todas") return true;
    if (filtroAtualHistorico === "avisos") {
      return item.tipo === "warning" || item.tipo === "error";
    }
    return item.tipo === filtroAtualHistorico;
  });

  if (!itensFiltrados.length) {
    lista.innerHTML = `
      <div class="historico-vazio">
        <div class="vazio-ico">📭</div>
        <p class="vazio-msg">Nenhuma notificação encontrada no momento.</p>
        <span class="vazio-sub">Todas as ações, sincronizações e processos do sistema aparecem aqui.</span>
      </div>`;
    return;
  }

  lista.innerHTML = "";
  for (const item of itensFiltrados) {
    const card = document.createElement("div");
    card.className = `historico-card historico-${item.tipo || "info"}${item.lida ? " lida" : ""}`;
    card.dataset.id = item.id;

    const iconeSvg = ICONES_SVG[item.tipo || "info"] || ICONES_SVG.info;
    const rotuloBadge = ROTULOS_BADGE[item.tipo || "info"] || "INFO";
    const hora = formatarHora(item.timestamp);

    let acoesHtml = "";
    if (item.acoes && item.acoes.length > 0) {
      acoesHtml = `<div class="historico-card-acoes">`;
      for (const a of item.acoes) {
        acoesHtml += `<button type="button" class="btn-acao-historico ${a.estilo === "primario" ? "primario" : ""}">${escaparHtml(a.rotulo)}</button>`;
      }
      acoesHtml += `</div>`;
    }

    card.innerHTML = `
      <div class="historico-card-topo">
        <span class="historico-tag-tipo">${rotuloBadge}</span>
        <span class="historico-hora">${hora}</span>
      </div>
      <div class="historico-card-conteudo">
        <div class="historico-card-ico">${iconeSvg}</div>
        <div class="historico-card-textos">
          <h4 class="historico-card-titulo">${escaparHtml(item.titulo)}</h4>
          <p class="historico-card-mensagem">${escaparHtml(item.mensagem)}</p>
          ${acoesHtml}
        </div>
      </div>
    `;

    if (item.acoes && item.acoes.length > 0) {
      const botoesAcao = card.querySelectorAll<HTMLButtonElement>(".btn-acao-historico");
      item.acoes.forEach((acao, idx) => {
        const btn = botoesAcao[idx];
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            if (acao.callback) acao.callback();
            if (acao.comandoIpc && (window as unknown as { central?: { executarComandoIpc: (c: string, ...a: unknown[]) => Promise<unknown> } }).central?.executarComandoIpc) {
              void (window as unknown as { central: { executarComandoIpc: (c: string, ...a: unknown[]) => Promise<unknown> } }).central.executarComandoIpc(
                acao.comandoIpc.canal,
                ...(acao.comandoIpc.args || []),
              );
            }
          };
        }
      });
    }

    lista.appendChild(card);
  }
}

export function abrirCentralNotificacoes(): void {
  const { drawer, backdrop } = criarOuObterDrawerHistorico();
  marcarTodasComoLidas();
  renderizarListaHistorico();
  atualizarBotoesSilenciar();

  requestAnimationFrame(() => {
    backdrop.classList.add("ativo");
    drawer.classList.add("aberto");
  });
}

export function fecharCentralNotificacoes(): void {
  const drawer = document.getElementById("painel-historico-notificacoes");
  const backdrop = document.getElementById("backdrop-historico-notificacoes");
  if (drawer) drawer.classList.remove("aberto");
  if (backdrop) backdrop.classList.remove("ativo");
}

export function alternarCentralNotificacoes(): void {
  const drawer = document.getElementById("painel-historico-notificacoes");
  if (drawer?.classList.contains("aberto")) {
    fecharCentralNotificacoes();
  } else {
    abrirCentralNotificacoes();
  }
}

export function marcarTodasComoLidas(): void {
  contadorNaoLidas = 0;
  for (const item of historicoNotificacoes) {
    item.lida = true;
  }
  atualizarBadgesSino();
  const cards = document.querySelectorAll(".historico-card");
  for (const c of cards) c.classList.add("lida");
}

export function limparHistoricoNotificacoes(): void {
  historicoNotificacoes.length = 0;
  contadorNaoLidas = 0;
  atualizarBadgesSino();
  renderizarListaHistorico();
  exibirNotificacao(
    "Histórico Limpo",
    "Todas as notificações da sessão foram removidas.",
    "info",
    2500,
    { som: false, salvarHistorico: false },
  );
}

export function inicializarSistemaNotificacoes(): void {
  if (typeof window === "undefined") return;

  const win = window as unknown as Record<string, unknown>;
  win.exibirNotificacao = exibirNotificacao;
  win.notificar = exibirNotificacao;
  win.abrirCentralNotificacoes = abrirCentralNotificacoes;
  win.alternarCentralNotificacoes = alternarCentralNotificacoes;
  win.fecharCentralNotificacoes = fecharCentralNotificacoes;

  obterOuCriarContainer();

  // Escuta tecla Escape para fechar gaveta
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const drawer = document.getElementById("painel-historico-notificacoes");
      if (drawer?.classList.contains("aberto")) {
        fecharCentralNotificacoes();
      }
    }
  });
}
