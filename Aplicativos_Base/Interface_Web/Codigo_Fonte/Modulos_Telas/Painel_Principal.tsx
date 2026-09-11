import { Eye, Heart, MessageCircle, Share2, Video, PlaySquare, AlertCircle } from 'lucide-react';
import { IconeYoutube, IconeInstagram, IconeFacebook, IconeTiktok, IconeKwai } from '../Componentes_Base/Icones_Plataformas.js';
import { CartaoMetrica } from '../Componentes_Base/Cartao_Metrica.js';
import { EmblemaStatus } from '../Componentes_Base/Emblema_Status.js';

interface PropsPainel {
  dadosResumo: any;
  publicacoes: any[];
  onCriarPublicacao: () => void;
  onVerPublicacao: (id: string) => void;
}

export const PainelPrincipal: React.FC<PropsPainel> = ({
  dadosResumo,
  publicacoes,
  onCriarPublicacao,
  onVerPublicacao,
}) => {
  const metricas = dadosResumo?.totaisMetricas || {
    visualizacoes: 0,
    curtidas: 0,
    comentarios: 0,
    compartilhamentos: 0,
  };

  const contas = dadosResumo?.contas || { total: 0, conectadas: 0, comErro: 0 };
  const pubs = dadosResumo?.publicacoes || { total: 0, publicadas: 0, agendadas: 0, processando: 0, falhas: 0 };

  return (
    <div className="space-y-8">
      {/* 1. Alerta de Status Operacional se houver contas com erro */}
      {contas.comErro > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between text-amber-400">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">
              Atenção: <strong>{contas.comErro} conta(s)</strong> precisam de reconexão ou reautenticação OAuth.
            </span>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-amber-500/20 rounded-lg">Verificar Contas</span>
        </div>
      )}

      {/* 2. Cartões de Métricas Consolidadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <CartaoMetrica
          titulo="Visualizações Totais"
          valor={metricas.visualizacoes.toLocaleString('pt-BR')}
          subtitulo="Agregado de todas as contas"
          icone={<Eye size={20} className="text-blue-400" />}
        />
        <CartaoMetrica
          titulo="Curtidas & Reações"
          valor={metricas.curtidas.toLocaleString('pt-BR')}
          subtitulo="Engajamento direto"
          icone={<Heart size={20} className="text-rose-400" />}
        />
        <CartaoMetrica
          titulo="Comentários Recebidos"
          valor={metricas.comentarios.toLocaleString('pt-BR')}
          subtitulo="Interações na comunidade"
          icone={<MessageCircle size={20} className="text-indigo-400" />}
        />
        <CartaoMetrica
          titulo="Compartilhamentos"
          valor={metricas.compartilhamentos.toLocaleString('pt-BR')}
          subtitulo="Distribuição orgânica"
          icone={<Share2 size={20} className="text-emerald-400" />}
        />
      </div>

      {/* 3. Seção Intermediária: Status das Contas e Publicações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contas Conectadas por Rede */}
        <div className="bg-escuro-900 border border-escuro-800 rounded-2xl p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">Contas Conectadas</h3>
            <span className="text-xs font-bold px-2.5 py-1 bg-escuro-800 text-slate-300 rounded-lg border border-escuro-700">
              Total: {contas.total}
            </span>
          </div>

          <div className="space-y-3">
            {(dadosResumo?.distribuicaoPlataformas || []).map((plat: any) => {
              let icone = <Video size={18} />;
              if (plat.codigo === 'youtube') icone = <IconeYoutube size={18} />;
              if (plat.codigo === 'instagram') icone = <IconeInstagram size={18} />;
              if (plat.codigo === 'facebook') icone = <IconeFacebook size={18} />;
              if (plat.codigo === 'tiktok') icone = <IconeTiktok size={18} />;
              if (plat.codigo === 'kwai') icone = <IconeKwai size={18} />;

              return (
                <div
                  key={plat.codigo}
                  className="flex items-center justify-between p-3 rounded-xl bg-escuro-850 border border-escuro-800/80"
                >
                  <div className="flex items-center gap-3">
                    {icone}
                    <span className="text-sm font-medium text-slate-200">{plat.nome}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300 bg-escuro-800 px-2 py-0.5 rounded-md">
                    {plat.totalContas} conta(s)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo de Publicações */}
        <div className="bg-escuro-900 border border-escuro-800 rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">Status das Campanhas & Envios</h3>
              <button
                onClick={onCriarPublicacao}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition"
              >
                + Nova Publicação
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              <div className="p-4 rounded-xl bg-escuro-850 border border-escuro-800">
                <span className="text-xs font-medium text-slate-400">Publicadas</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{pubs.publicadas}</p>
              </div>
              <div className="p-4 rounded-xl bg-escuro-850 border border-escuro-800">
                <span className="text-xs font-medium text-slate-400">Agendadas</span>
                <p className="text-2xl font-bold text-purple-400 mt-1">{pubs.agendadas}</p>
              </div>
              <div className="p-4 rounded-xl bg-escuro-850 border border-escuro-800">
                <span className="text-xs font-medium text-slate-400">Processando</span>
                <p className="text-2xl font-bold text-blue-400 mt-1">{pubs.processando}</p>
              </div>
              <div className="p-4 rounded-xl bg-escuro-850 border border-escuro-800">
                <span className="text-xs font-medium text-slate-400">Com Falha</span>
                <p className="text-2xl font-bold text-rose-400 mt-1">{pubs.falhas}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-escuro-800 flex items-center justify-between text-xs text-slate-400">
            <span>Princípio: 1 Conteúdo → 1 Publicação → N Destinos Independentes</span>
            <span className="text-emerald-400 font-semibold">Resiliência Ativa</span>
          </div>
        </div>
      </div>

      {/* 4. Tabela de Publicações Recentes com Destinos e Progresso */}
      <div className="bg-escuro-900 border border-escuro-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-escuro-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Publicações Recentes & Ciclo de Vida</h3>
            <p className="text-xs text-slate-400 mt-0.5">Acompanhamento do status isolado de cada destino</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-escuro-850/60 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-escuro-800">
              <tr>
                <th className="px-6 py-4">Conteúdo</th>
                <th className="px-6 py-4">Status Geral</th>
                <th className="px-6 py-4">Progresso de Destinos</th>
                <th className="px-6 py-4">Destinos Vinculados</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-escuro-800/60">
              {publicacoes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma publicação encontrada no momento.
                  </td>
                </tr>
              ) : (
                publicacoes.map((pub) => (
                  <tr key={pub.id} className="hover:bg-escuro-850/40 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{pub.tituloConteudo}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(pub.criadoEm).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(pub.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <EmblemaStatus status={pub.statusGlobal} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-300">{pub.progresso.textoResumo}</span>
                        <div className="w-36 h-2 bg-escuro-800 rounded-full overflow-hidden flex">
                          <div
                            style={{
                              width: `${(pub.progresso.publicados / (pub.progresso.total || 1)) * 100}%`,
                            }}
                            className="bg-emerald-500 h-full"
                          ></div>
                          <div
                            style={{
                              width: `${(pub.progresso.falhas / (pub.progresso.total || 1)) * 100}%`,
                            }}
                            className="bg-rose-500 h-full"
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {pub.destinos.map((d: any) => (
                          <span
                            key={d.id}
                            title={`${d.plataformaNome}: ${d.contaNome} (${d.status})`}
                            className={`text-[11px] px-2 py-0.5 rounded-md font-medium border ${
                              d.status === 'PUBLISHED'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                : d.status === 'FAILED'
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                                : 'bg-escuro-800 text-slate-300 border-escuro-700'
                            }`}
                          >
                            {d.plataformaNome}: {d.contaNome}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onVerPublicacao(pub.id)}
                        className="px-3 py-1.5 rounded-lg bg-escuro-800 hover:bg-escuro-700 text-xs font-semibold text-slate-200 border border-escuro-700 transition"
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
