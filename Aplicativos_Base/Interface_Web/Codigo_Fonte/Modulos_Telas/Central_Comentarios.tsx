import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, User } from 'lucide-react';

interface PropsComentarios {
  comentarios: any[];
  onResponderComentario: (comentarioId: string, texto: string) => Promise<void>;
}

export const CentralComentarios: React.FC<PropsComentarios> = ({
  comentarios,
  onResponderComentario,
}) => {
  const [respostasTexto, setRespostasTexto] = useState<Record<string, string>>({});
  const [enviandoId, setEnviandoId] = useState<string | null>(null);

  const handleResponder = async (comentarioId: string) => {
    const texto = respostasTexto[comentarioId];
    if (!texto?.trim()) return;

    setEnviandoId(comentarioId);
    await onResponderComentario(comentarioId, texto);
    setRespostasTexto((prev) => ({ ...prev, [comentarioId]: '' }));
    setEnviandoId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Caixa de Entrada Unificada (Inbox)</h2>
        <p className="text-xs text-slate-400 mt-1">
          Acompanhe e responda comentários recebidos pelas contas oficiais que suportam interação.
        </p>
      </div>

      <div className="space-y-4">
        {comentarios.length === 0 ? (
          <div className="bg-escuro-900 border border-escuro-800 rounded-2xl p-12 text-center text-slate-500">
            Nenhum comentário pendente no momento.
          </div>
        ) : (
          comentarios.map((c) => (
            <div
              key={c.id}
              className="bg-escuro-900 border border-escuro-800 rounded-2xl p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-escuro-800 border border-escuro-700 flex items-center justify-center text-slate-400">
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{c.autor_nome}</h4>
                    <p className="text-xs text-slate-400">
                      Conta: <strong className="text-slate-300">{c.conta_social?.nome_exibicao}</strong> ({c.conta_social?.plataforma?.nome})
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    c.respondido
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {c.respondido ? 'Respondido' : 'Pendente'}
                </span>
              </div>

              <p className="text-sm text-slate-200 bg-escuro-850 p-3.5 rounded-xl border border-escuro-800">
                "{c.texto_conteudo}"
              </p>

              {/* Respostas já enviadas */}
              {c.respostas?.length > 0 && (
                <div className="pl-6 border-l-2 border-blue-500/40 space-y-2">
                  {c.respostas.map((r: any) => (
                    <div key={r.id} className="p-3 bg-escuro-850/60 rounded-xl border border-escuro-800 text-xs">
                      <span className="font-bold text-blue-400">Sua resposta oficial: </span>
                      <span className="text-slate-200">{r.texto_resposta}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Caixa de Resposta */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={respostasTexto[c.id] || ''}
                  onChange={(e) =>
                    setRespostasTexto((prev) => ({ ...prev, [c.id]: e.target.value }))
                  }
                  placeholder="Escreva uma resposta oficial..."
                  className="flex-1 px-4 py-2 rounded-xl bg-escuro-850 border border-escuro-700 text-white text-xs outline-none focus:border-blue-500 transition"
                />
                <button
                  onClick={() => handleResponder(c.id)}
                  disabled={enviandoId === c.id}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <Send size={13} />
                  <span>{enviandoId === c.id ? 'Enviando...' : 'Responder'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
