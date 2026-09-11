const { app, BrowserWindow, Menu, shell, dialog, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Força tema escuro nativo no aplicativo e na barra de título do sistema operacional
nativeTheme.themeSource = 'dark';

const NOME_APP = 'Gerenciador de Conteúdo';
let versaoAppCache = null;
let ultimaLeituraVersao = 0;

function obterVersaoApp() {
  const agora = Date.now();
  if (versaoAppCache && agora - ultimaLeituraVersao < 2000) {
    return versaoAppCache;
  }
  try {
    const caminhosPkg = [
      path.resolve(__dirname, '../../../package.json'),
      path.resolve(__dirname, '../package.json'),
      'D:/Gerenciador_Conteudo/package.json',
    ];
    for (const p of caminhosPkg) {
      if (fs.existsSync(p)) {
        const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (pkg && pkg.version) {
          versaoAppCache = pkg.version;
          ultimaLeituraVersao = agora;
          return versaoAppCache;
        }
      }
    }
  } catch {}
  return versaoAppCache || '1.1.0';
}

let inicioAppMs = Date.now();
let timerTitulo = null;

function formatarTempoOnline(msInicio) {
  const total = Math.max(0, Math.floor((Date.now() - msInicio) / 1000));
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segundos = total % 60;
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function montarTextoTitulo(nomeModulo = NOME_APP) {
  const agora = new Date();
  const dd = String(agora.getDate()).padStart(2, '0');
  const mm = String(agora.getMonth() + 1).padStart(2, '0');
  const yyyy = agora.getFullYear();
  const hh = String(agora.getHours()).padStart(2, '0');
  const mi = String(agora.getMinutes()).padStart(2, '0');
  const ss = String(agora.getSeconds()).padStart(2, '0');
  const dataHora = `${dd}-${mm}-${yyyy} | ${hh}:${mi}:${ss}`;
  const tempoOnline = formatarTempoOnline(inicioAppMs);
  const versao = obterVersaoApp();
  return (
    `|| ${nomeModulo} - v${versao} || ` +
    `Tempo Online : ${tempoOnline} || ` +
    `Data e Horario : ${dataHora} ||`
  );
}

function atualizarTituloJanela() {
  if (janelaPrincipal && !janelaPrincipal.isDestroyed()) {
    janelaPrincipal.setTitle(montarTextoTitulo(NOME_APP));
  }
}

function iniciarTituloDinamico() {
  if (inicioAppMs <= 0) inicioAppMs = Date.now();
  atualizarTituloJanela();
  if (timerTitulo) clearInterval(timerTitulo);
  timerTitulo = setInterval(atualizarTituloJanela, 1000);
}

const logFile = path.resolve(__dirname, '../../../electron_debug.log');
function log(msg) {
  if (process.env.DEBUG_ELECTRON === 'true') {
    try {
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
    } catch (e) {}
  }
}

process.on('uncaughtException', (err) => {
  log('Uncaught exception: ' + (err.stack || err));
});
process.on('unhandledRejection', (reason) => {
  log('Unhandled rejection: ' + reason);
});

// Configura nome do aplicativo e diretório de dados isolado
app.setName('GerenciadorConteudo');
try {
  const customUserData = path.join(app.getPath('appData'), 'GerenciadorConteudoApp');
  app.setPath('userData', customUserData);
  log('userData configurado para: ' + customUserData);
} catch (e) {
  log('Erro ao configurar userData: ' + e.message);
}

app.setAppUserModelId('com.gerenciador.conteudo');

let janelaPrincipal = null;
const URL_ALVO = process.env.URL_INTERFACE || 'http://localhost:3333';

function verificarServidor(url, callback) {
  let respondido = false;
  function responder(ok) {
    if (!respondido) {
      respondido = true;
      callback(ok);
    }
  }

  const req = http.get(url, (res) => {
    res.resume();
    responder(res.statusCode >= 200 && res.statusCode < 400);
  });
  req.on('error', () => responder(false));
  req.setTimeout(2000, () => {
    req.destroy();
    responder(false);
  });
}

function criarJanela() {
  log('criarJanela iniciada');
  const caminhoIcone = path.resolve(__dirname, '../../../Infraestrutura_Sistema/Recursos_Visuais/Icone_Padrao.ico');

  // Remove totalmente a barra de menu superior (Arquivo, Exibir, Ajuda)
  Menu.setApplicationMenu(null);

  const LARGURA_PADRAO = 1360;
  const ALTURA_PADRAO = 768;

  janelaPrincipal = new BrowserWindow({
    width: LARGURA_PADRAO,
    height: ALTURA_PADRAO,
    minWidth: LARGURA_PADRAO,
    minHeight: ALTURA_PADRAO,
    backgroundColor: '#0B0F17',
    icon: fs.existsSync(caminhoIcone) ? caminhoIcone : undefined,
    title: montarTextoTitulo(NOME_APP),
    autoHideMenuBar: true,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'Ponte.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Impede o <title> do HTML de sobrescrever o título personalizado
  janelaPrincipal.on('page-title-updated', (evento) => {
    evento.preventDefault();
  });

  iniciarTituloDinamico();

  // Ao sair do maximizado, volta ao tamanho padrão conforme especificação (1360 x 768)
  janelaPrincipal.on('unmaximize', () => {
    if (!janelaPrincipal || janelaPrincipal.isDestroyed()) return;
    janelaPrincipal.setSize(LARGURA_PADRAO, ALTURA_PADRAO);
  });

  // Atalhos de teclado úteis em background (sem precisar de barra de menu visual)
  janelaPrincipal.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      if (input.key === 'F11') {
        janelaPrincipal.setFullScreen(!janelaPrincipal.isFullScreen());
        event.preventDefault();
      } else if (input.key === 'F12') {
        janelaPrincipal.webContents.toggleDevTools();
        event.preventDefault();
      } else if ((input.control || input.meta) && input.key.toLowerCase() === 'r') {
        janelaPrincipal.reload();
        event.preventDefault();
      }
    }
  });

  janelaPrincipal.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith('http://localhost:3333') && !url.startsWith('http://localhost:5173')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  janelaPrincipal.webContents.on('did-finish-load', () => {
    log('webContents did-finish-load com sucesso');
  });

  janelaPrincipal.webContents.on('did-fail-load', (e, code, desc) => {
    log(`webContents did-fail-load: ${code} - ${desc}`);
  });

  janelaPrincipal.webContents.on('render-process-gone', (e, details) => {
    log(`render-process-gone: ${JSON.stringify(details)}`);
  });

  let carregamentoIniciado = false;
  function carregarComRetry(tentativa = 1) {
    if (carregamentoIniciado) return;

    verificarServidor(URL_ALVO + '/api/sistema/saude', (online) => {
      if (carregamentoIniciado) return;

      log(`Verificação servidor (tentativa ${tentativa}): online = ${online}`);
      if (online) {
        carregamentoIniciado = true;
        log(`Carregando URL no Electron: ${URL_ALVO}`);
        janelaPrincipal.loadURL(URL_ALVO);
      } else {
        if (tentativa <= 30) {
          setTimeout(() => carregarComRetry(tentativa + 1), 600);
        } else {
          carregamentoIniciado = true;
          log(`Tentativas esgotadas. Carregando URL diretamente: ${URL_ALVO}`);
          janelaPrincipal.loadURL(URL_ALVO);
        }
      }
    });
  }

  // Manipuladores de IPC para Controle de Janela e Atualização
  ipcMain.handle('janela:recarregar', () => {
    if (janelaPrincipal && !janelaPrincipal.isDestroyed()) {
      janelaPrincipal.webContents.reloadIgnoringCache();
      return true;
    }
    return false;
  });

  ipcMain.handle('janela:fechar', () => {
    if (janelaPrincipal && !janelaPrincipal.isDestroyed()) {
      janelaPrincipal.close();
      return true;
    }
    return false;
  });

  ipcMain.handle('janela:minimizar', () => {
    if (janelaPrincipal && !janelaPrincipal.isDestroyed()) {
      janelaPrincipal.minimize();
      return true;
    }
    return false;
  });

  ipcMain.handle('janela:maximizar', () => {
    if (janelaPrincipal && !janelaPrincipal.isDestroyed()) {
      if (janelaPrincipal.isMaximized()) {
        janelaPrincipal.unmaximize();
      } else {
        janelaPrincipal.maximize();
      }
      return true;
    }
    return false;
  });

  ipcMain.handle('janela:restaurar', () => {
    if (janelaPrincipal && !janelaPrincipal.isDestroyed()) {
      janelaPrincipal.unmaximize();
      janelaPrincipal.setSize(LARGURA_PADRAO, ALTURA_PADRAO);
      return true;
    }
    return false;
  });

  ipcMain.on('app:broadcast-atualizacao-iniciada', (_e, dados) => {
    if (janelaPrincipal && !janelaPrincipal.isDestroyed()) {
      janelaPrincipal.webContents.send('app:atualizacao-iniciada', dados);
    }
  });

  ipcMain.on('app:broadcast-atualizacao-concluida', (_e, resultado) => {
    if (janelaPrincipal && !janelaPrincipal.isDestroyed()) {
      janelaPrincipal.webContents.send('app:atualizacao-concluida', resultado);
    }
  });

  carregarComRetry();

  janelaPrincipal.on('close', () => {
    log('janelaPrincipal evento close disparado');
  });

  janelaPrincipal.on('closed', () => {
    log('janelaPrincipal evento closed disparado');
    if (timerTitulo) {
      clearInterval(timerTitulo);
      timerTitulo = null;
    }
    janelaPrincipal = null;
  });
}

// Garante instância única por meio da trava do Electron
const travaInstancia = app.requestSingleInstanceLock();
log('travaInstancia resultado: ' + travaInstancia);

if (!travaInstancia) {
  log('Instância já em execução detectada via trava. Encerrando duplicata.');
  app.quit();
} else {
  app.on('second-instance', () => {
    log('second-instance detectado. Restaurando janela existente.');
    if (janelaPrincipal) {
      if (janelaPrincipal.isMinimized()) janelaPrincipal.restore();
      janelaPrincipal.focus();
    }
  });

  app.whenReady().then(() => {
    log('app.whenReady concluído');
    criarJanela();
  });

  app.on('window-all-closed', () => {
    log('app window-all-closed');
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    log('app before-quit');
  });

  app.on('will-quit', () => {
    log('app will-quit');
  });

  app.on('quit', (event, exitCode) => {
    log('app quit com exitCode: ' + exitCode);
  });
}
