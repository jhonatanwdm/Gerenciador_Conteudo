import React, { useState } from 'react';
import { Video, PlaySquare, CheckCircle, AlertTriangle, RefreshCw, Unlink, Plus } from 'lucide-react';
import { EmblemaStatus } from '../Componentes_Base/Emblema_Status.js';
import { IconeYoutube, IconeInstagram, IconeFacebook, IconeTiktok, IconeKwai } from '../Componentes_Base/Icones_Plataformas.js';

interface PropsContas {
  contas: any[];
  onTestarConta: (id: string) => Promise<void>;
  onDesconectarConta: (id: string) => Promise<void>;
  onConectarNovaConta: (codigoPlataforma: string) => Promise<void>;
}

export const GestaoContas: React.FC<PropsContas> = ({
  contas,
  onTestarConta,
  onDesconectarConta,
  onConectarNovaConta,
}) => {
  const [testandoId, setTestandoId] = useState<string | null>(null);
  const [modalConectar, setModalConectar] = useState(false);

  const testar = async (id: string) => {
    setTestandoId(id);
    await onTestarConta(id);
    setTestandoId(null);
  };

  const getIconePlataforma = (codigo: string) => {
    switch (codigo) {
      case 'youtube':
        return <IconeYoutube size={22} />;
      case 'instagram':
        return <IconeInstagram size={22} />;
      case 'facebook':
        return <IconeFacebook size={22} />;
      case 'tiktok':
        return <IconeTiktok size={22} />;
      case 'kwai':
        return <IconeKwai size={22} />;
      default:
        return <Video size={22} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Gestão de Contas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Contas de Redes Sociais Conectadas</h2>
          <p className="text-xs text-slate-400 mt-1">
            Cada conta opera com credenciais OAuth e ciclo de publicação totalmente isolados
          </p>
        </div>

        <button
          onClick={() => setModalConectar(true)}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition active:scale-95"
        >
          <Plus size={16} />
          <span>Conectar Nova Conta</span>
        </button>
      </div>

      {/* Grid de Contas Conectadas */}
      {contas.length === 0 ? (
        <div className="bg-escuro-900 border border-escuro-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-escuro-850 border border-escuro-700 mx-auto flex items-center justify-center text-slate-400">
            <Video size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Nenhuma conta de rede social conectada</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Conecte seus canais oficiais do YouTube, perfis profissionais do Instagram, páginas do Facebook, contas do TikTok ou Kwai para iniciar a publicação e automação em tempo real.
            </p>
          </div>
          <button
            onClick={() => setModalConectar(true)}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-md transition active:scale-95"
          >
            <Plus size={16} />
            <span>Conectar Minha Primeira Conta</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {contas.map((c) => (
            <div
              key={c.id}
              className="bg-escuro-900 border border-escuro-800 hover:border-escuro-700/80 rounded-2xl p-5 shadow-sm transition flex flex-col justify-between"
            >
              <div>
                {/* Topo do Card: Plataforma + Status */}
                <div className="flex items-center justify-between pb-4 border-b border-escuro-800">
                  <div className="flex items-center gap-2.5">
                    {getIconePlataforma(c.plataformaCodigo)}
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {c.plataformaNome}
                    </span>
                  </div>
                  <EmblemaStatus status={c.status} />
                </div>

                {/* Informações da Conta */}
                <div className="flex items-center gap-3.5 my-4">
                  <div className="w-12 h-12 rounded-xl bg-escuro-800 border border-escuro-700 overflow-hidden flex items-center justify-center">
                    {c.urlAvatar ? (
                      <img src={c.urlAvatar} alt={c.nomeExibicao} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-slate-400">{c.nome[0]}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">{c.nomeExibicao}</h4>
                    <p className="text-xs text-slate-400">@{c.nomeUsuario}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">ID: {c.idExternoConta}</p>
                  </div>
                </div>

                {/* Matriz de Capacidades da Conta */}
                <div className="pt-2 pb-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Capacidades Habilitadas
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      {c.capacidades?.video ? (
                        <CheckCircle size={14} className="text-emerald-400" />
                      ) : (
                        <AlertTriangle size={14} className="text-slate-600" />
                      )}
                      Vídeo
                    </span>
                    <span className="flex items-center gap-1.5">
                      {c.capacidades?.videoCurto ? (
                        <CheckCircle size={14} className="text-emerald-400" />
                      ) : (
                        <AlertTriangle size={14} className="text-slate-600" />
                      )}
                      Shorts/Reels
                    </span>
                    <span className="flex items-center gap-1.5">
                      {c.capacidades?.imagem ? (
                        <CheckCircle size={14} className="text-emerald-400" />
                      ) : (
                        <AlertTriangle size={14} className="text-slate-600" />
                      )}
                      Imagens
                    </span>
                    <span className="flex items-center gap-1.5">
                      {c.capacidades?.agendamento ? (
                        <CheckCircle size={14} className="text-emerald-400" />
                      ) : (
                        <AlertTriangle size={14} className="text-slate-600" />
                      )}
                      Agendamento
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações da Conta */}
              <div className="pt-4 border-t border-escuro-800 flex items-center gap-2">
                <button
                  onClick={() => testar(c.id)}
                  disabled={testandoId === c.id}
                  className="flex-1 py-2 px-3 rounded-lg bg-escuro-850 hover:bg-escuro-800 border border-escuro-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw size={14} className={testandoId === c.id ? 'animate-spin text-blue-400' : ''} />
                  <span>Testar Conexão</span>
                </button>

                <button
                  onClick={() => onDesconectarConta(c.id)}
                  className="p-2 rounded-lg bg-escuro-850 hover:bg-rose-500/10 border border-escuro-700 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition"
                  title="Desconectar conta"
                >
                  <Unlink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Conectar Nova Conta */}
      {modalConectar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-escuro-900 border border-escuro-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Selecione a Plataforma para Conectar</h3>
            <p className="text-xs text-slate-400">
              O sistema autenticará diretamente com o fluxo oficial OAuth 2.0 da plataforma selecionada.
            </p>

            <div className="space-y-2 pt-2">
              {[
                { codigo: 'youtube', nome: 'YouTube (Canal)', icone: <IconeYoutube size={20} /> },
                { codigo: 'instagram', nome: 'Instagram (Profissional)', icone: <IconeInstagram size={20} /> },
                { codigo: 'facebook', nome: 'Facebook (Página)', icone: <IconeFacebook size={20} /> },
                { codigo: 'tiktok', nome: 'TikTok (Criador/Business)', icone: <IconeTiktok size={20} /> },
                { codigo: 'kwai', nome: 'Kwai (Conta Oficial)', icone: <IconeKwai size={20} /> },
              ].map((plat) => (
                <button
                  key={plat.codigo}
                  onClick={async () => {
                    await onConectarNovaConta(plat.codigo);
                    setModalConectar(false);
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-escuro-850 hover:bg-escuro-800 border border-escuro-700/80 transition"
                >
                  <div className="flex items-center gap-3">
                    {plat.icone}
                    <span className="text-sm font-semibold text-white">{plat.nome}</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-400">Conectar →</span>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setModalConectar(false)}
                className="w-full py-2.5 rounded-xl bg-escuro-800 hover:bg-escuro-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
