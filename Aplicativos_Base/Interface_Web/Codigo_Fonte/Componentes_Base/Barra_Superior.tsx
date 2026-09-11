import React from 'react';
import { RefreshCw, User } from 'lucide-react';
import { alternarCentralNotificacoes } from '../Servicos_Sistema/Sistema_Notificacoes.js';

interface PropsBarraSuperior {
  titulo: string;
  subtitulo?: string;
  onAtualizar: () => void;
  carregando?: boolean;
  autoAtivo?: boolean;
  segundosRestantes?: number;
  onAlternarAuto?: () => void;
}

export const BarraSuperior: React.FC<PropsBarraSuperior> = ({
  titulo,
  subtitulo,
  onAtualizar,
  carregando,
  autoAtivo = true,
  segundosRestantes = 5,
  onAlternarAuto,
}) => {
  return (
    <header className="h-16 bg-escuro-900/60 backdrop-blur-md border-b border-escuro-800 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">{titulo}</h2>
        {subtitulo && <p className="text-xs text-slate-400">{subtitulo}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Botão de Sino com Badge de Notificações */}
        <button
          type="button"
          className="btn-sino-notificacoes"
          onClick={alternarCentralNotificacoes}
          title="Central de Notificações e Histórico"
          aria-label="Abrir central de notificações"
        >
          <svg
            className="ico-sino"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="badge-notificacoes oculto">0</span>
        </button>

        {/* Botão de Atualização Manual */}
        <button
          onClick={onAtualizar}
          disabled={carregando}
          className="p-2 rounded-xl bg-escuro-850 border border-escuro-800 text-slate-300 hover:text-white hover:border-escuro-700 transition"
          title="Atualizar projeto e sincronizar banco de dados"
        >
          <RefreshCw size={18} className={carregando ? 'animate-spin text-blue-400' : ''} />
        </button>

        <div className="h-6 w-px bg-escuro-800 mx-1"></div>

        {/* Indicador e Controle de Auto-Atualização */}
        <button
          type="button"
          onClick={onAlternarAuto}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition cursor-pointer ${
            autoAtivo
              ? 'bg-escuro-850 border-emerald-500/30 hover:border-emerald-500/50'
              : 'bg-escuro-850 border-amber-500/30 hover:border-amber-500/50'
          }`}
          title={autoAtivo ? 'Auto-atualização ativa (Clique para pausar)' : 'Auto-atualização pausada (Clique para ativar)'}
        >
          <span className="relative flex h-2 w-2">
            {autoAtivo && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                autoAtivo ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
          </span>
          <span className="text-xs font-semibold text-slate-200">
            {autoAtivo ? `Tempo Real (${segundosRestantes}s)` : 'Pausado'}
          </span>
        </button>

        <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <User size={16} />
        </div>
      </div>
    </header>
  );
};
