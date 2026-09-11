import React from 'react';
import { Check, X, Minus } from 'lucide-react';

interface PropsMatriz {
  contas: any[];
  publicacoes: any[];
}

export const MatrizPublicacao: React.FC<PropsMatriz> = ({ contas, publicacoes }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Matriz de Distribuição Cruzada</h2>
        <p className="text-xs text-slate-400 mt-1">
          Visão horizontal de cobertura de conteúdos por conta e plataforma conectada.
        </p>
      </div>

      <div className="bg-escuro-900 border border-escuro-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-escuro-850 text-slate-300 font-bold border-b border-escuro-800">
              <tr>
                <th className="px-6 py-4 min-w-[240px]">Conteúdo</th>
                {contas.map((c) => (
                  <th key={c.id} className="px-4 py-4 text-center min-w-[120px]">
                    <div className="flex flex-col items-center">
                      <span className="uppercase text-[10px] text-blue-400 font-extrabold tracking-wider">
                        {c.plataformaNome}
                      </span>
                      <span className="text-slate-200 text-xs font-semibold truncate max-w-[110px]">
                        {c.nomeExibicao}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-escuro-800">
              {publicacoes.length === 0 ? (
                <tr>
                  <td colSpan={contas.length + 1} className="p-8 text-center text-slate-500">
                    Nenhuma publicação encontrada para exibir na matriz.
                  </td>
                </tr>
              ) : (
                publicacoes.map((pub) => (
                  <tr key={pub.id} className="hover:bg-escuro-850/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white text-sm">{pub.tituloConteudo}</p>
                      <p className="text-[11px] text-slate-400">{pub.progresso.textoResumo}</p>
                    </td>

                    {contas.map((c) => {
                      // Verifica se este conteúdo possui destino nesta conta específica
                      const destino = pub.destinos.find((d: any) => d.contaNome === c.nomeExibicao);

                      return (
                        <td key={c.id} className="px-4 py-4 text-center">
                          {destino ? (
                            destino.status === 'PUBLISHED' ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <Check size={14} />
                              </span>
                            ) : destino.status === 'FAILED' ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <X size={14} />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                ~
                              </span>
                            )
                          ) : (
                            <span className="text-slate-600">
                              <Minus size={14} className="mx-auto" />
                            </span>
                          )}
                        </td>
                      );
                    })}
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
