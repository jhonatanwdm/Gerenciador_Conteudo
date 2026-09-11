import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  Grid,
  Share2,
  MessageSquare,
  FolderOpen,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface PropsBarraLateral {
  abaAtiva: string;
  definirAbaAtiva: (aba: string) => void;
  onAbrirNovaPublicacao: () => void;
}

export const BarraLateral: React.FC<PropsBarraLateral> = ({
  abaAtiva,
  definirAbaAtiva,
  onAbrirNovaPublicacao,
}) => {
  const itensMenu = [
    { id: 'painel', rotulo: 'Painel Principal', icone: <LayoutDashboard size={20} /> },
    { id: 'publicacoes', rotulo: 'Publicações & Histórico', icone: <Layers size={20} /> },
    { id: 'matriz', rotulo: 'Matriz de Distribuição', icone: <Grid size={20} /> },
    { id: 'contas', rotulo: 'Contas Conectadas', icone: <Share2 size={20} /> },
    { id: 'comentarios', rotulo: 'Caixa de Entrada (Inbox)', icone: <MessageSquare size={20} /> },
    { id: 'midias', rotulo: 'Biblioteca de Mídia', icone: <FolderOpen size={20} /> },
    { id: 'auditoria', rotulo: 'Registros & Auditoria', icone: <ShieldCheck size={20} /> },
  ];

  return (
    <aside className="w-64 bg-escuro-900 border-r border-escuro-800 flex flex-col justify-between h-screen sticky top-0 select-none">
      <div>
        {/* Logotipo e Cabeçalho */}
        <div className="p-6 border-b border-escuro-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-tight">Social Flow</h1>
              <p className="text-[11px] text-slate-400 font-medium">Multi-Conta & Multi-Rede</p>
            </div>
          </div>
        </div>

        {/* Botão de Destaque para Nova Publicação */}
        <div className="px-4 pt-5 pb-2">
          <button
            onClick={onAbrirNovaPublicacao}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all duration-200 transform active:scale-[0.98]"
          >
            <PlusCircle size={18} />
            <span>Nova Publicação</span>
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="p-4 space-y-1.5">
          {itensMenu.map((item) => {
            const ativo = abaAtiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => definirAbaAtiva(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  ativo
                    ? 'bg-escuro-800 text-white shadow-sm border border-escuro-700/60 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-escuro-850'
                }`}
              >
                <span className={ativo ? 'text-blue-400' : 'text-slate-400'}>{item.icone}</span>
                <span>{item.rotulo}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rodapé da Barra Lateral */}
      <div className="p-4 border-t border-escuro-800/80">
        <div className="p-3 bg-escuro-850 border border-escuro-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-200">Modo Simulado</p>
            <p className="text-[10px] text-slate-400">Mock Ativo (Seguro)</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>
    </aside>
  );
};
