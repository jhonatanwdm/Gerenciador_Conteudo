const { contextBridge, ipcRenderer } = require('electron');

const apiCentral = {
  isElectron: true,

  // Controle de Janela
  recarregarJanela: () => ipcRenderer.invoke('janela:recarregar'),
  fecharJanela: () => ipcRenderer.invoke('janela:fechar'),
  minimizarJanela: () => ipcRenderer.invoke('janela:minimizar'),
  maximizarJanela: () => ipcRenderer.invoke('janela:maximizar'),
  restaurarJanela: () => ipcRenderer.invoke('janela:restaurar'),

  // Eventos de Atualização e Sincronização Sincronizada
  onAtualizacaoIniciada: (cb) => {
    const handler = (_e, dados) => cb(dados);
    ipcRenderer.on('app:atualizacao-iniciada', handler);
    return () => {
      ipcRenderer.removeListener('app:atualizacao-iniciada', handler);
    };
  },

  onAtualizacaoConcluida: (cb) => {
    const handler = (_e, res) => cb(res);
    ipcRenderer.on('app:atualizacao-concluida', handler);
    return () => {
      ipcRenderer.removeListener('app:atualizacao-concluida', handler);
    };
  },

  broadcastAtualizacaoIniciada: (dados) => {
    ipcRenderer.send('app:broadcast-atualizacao-iniciada', dados);
  },

  broadcastAtualizacaoConcluida: (resultado) => {
    ipcRenderer.send('app:broadcast-atualizacao-concluida', resultado);
  },

  executarComandoIpc: (canal, ...args) => {
    return ipcRenderer.invoke(canal, ...args);
  },
};

contextBridge.exposeInMainWorld('central', apiCentral);
contextBridge.exposeInMainWorld('desktop', apiCentral);
