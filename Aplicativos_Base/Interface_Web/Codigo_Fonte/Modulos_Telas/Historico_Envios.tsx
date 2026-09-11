import React, { useState } from 'react';
import { Layers, RefreshCw, Repeat, ExternalLink, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';
import { EmblemaStatus } from '../Componentes_Base/Emblema_Status.js';

interface PropsHistorico {
  publicacoes: any[];
  onTentarNovamenteDestino: (destinoId: string) => Promise<void>;
  onIniciarRepost: (publicacao: any) => void;
}

export const HistoricoEnvios: React.FC<PropsHistorico> = ({
  publicacoes,
  onTentarNovamenteDestino,
  onIniciarRepost,
}) => {
  const [publicacaoSelecionadaId, setPublicacaoSelecionadaId] = useState<string | null>(
    publicacoes[0]?.id || null
  );
  const [reprocessandoId, setReprocessandoId] = useState<string | null>(null);

  const publicacaoAtual = publicacoes.find((p) => p.id === publicacaoSelecionadaId) || publicacoes[0];

  const handleRetry = async (destinoId: string) => {
    setReprocessandoId(destinoId);
    await onTentarNovamenteDestino(destinoId);
    setReprocessandoId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Histórico de Publicações & Resiliência</h2>
          <p className="text-xs text-slate-400 mt-1">
            Cada destino possui ciclo de vida independente. Falhas podem ser reprocessadas isoladamente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista Lateral de Publicações (4 cols) */}
        <div className="lg:col-span-4 space-y-2 max-h-[700px] overflow-y-auto pr-1">
          {publicacoes.map((pub) => {
            const selecionada = (publicacaoAtual?.id || '') === pub.id;
            return (
              <div
                key={pub.id}
                onClick={() => setPublicacaoSelecionadaId(pub.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selecionada
                    ? 'bg-escuro-850 border-blue-500/60 shadow-md'
                    : 'bg-escuro-900 border-escuro-800 hover:border-escuro-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(pub.criadoEm).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(pub.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <EmblemaStatus status={pub.statusGlobal} />
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{pub.tituloConteudo}</h4>
                <p className="text-xs text-blue-400 font-semibold mt-2">{pub.progresso.textoResumo}</p>
              </div>
            );
          })}
        </div>

        {/* Detalhes da Publicação Selecionada (8 cols) */}
        {publicacaoAtual && (
          <div className="lg:col-span-8 bg-escuro-900 border border-escuro-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-escuro-800 pb-5">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Publicação #{publicacaoAtual.id.slice(0, 8)}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{publicacaoAtual.tituloConteudo}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <EmblemaStatus status={publicacaoAtual.statusGlobal} />
                  <span className="text-xs text-slate-400">{publicacaoAtual.progresso.textoResumo}</span>
                </div>
              </div>

              <button
                onClick={() => onIniciarRepost(publicacaoAtual)}
                className="px-4 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-2 transition"
              >
                <Repeat size={15} />
                <span>Repostar em Novas Contas</span>
              </button>
            </div>

            {/* Listagem de Destinos Individuais */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Destinos Conectados ({publicacaoAtual.destinos.length})
              </h4>

              {publicacaoAtual.destinos.map((d: any) => (
                <div
                  key={d.id}
                  className="p-4 rounded-xl bg-escuro-850 border border-escuro-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{d.plataformaNome}</span>
                      <span className="text-xs text-slate-400">· {d.contaNome}</span>
                      <EmblemaStatus status={d.status} />
                    </div>

                    {d.mensagemErro && (
                      <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5 mt-1">
                        <AlertOctagon size={13} />
                        <span>{d.mensagemErro}</span>
                      </p>
                    )}

                    {d.urlExterna && (
                      <a
                        href={d.urlExterna}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        <span>Ver postagem oficial</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  {/* Ação de Retry Isolado apenas para destinos que falharam */}
                  {d.status === 'FAILED' && (
                    <button
                      onClick={() => handleRetry(d.id)}
                      disabled={reprocessandoId === d.id}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <RefreshCw size={13} className={reprocessandoId === d.id ? 'animate-spin' : ''} />
                      <span>Tentar Novamente</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
