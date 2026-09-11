import React from 'react';

interface PropsCartao {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icone: React.ReactNode;
  variacao?: string;
  positivo?: boolean;
}

export const CartaoMetrica: React.FC<PropsCartao> = ({
  titulo,
  valor,
  subtitulo,
  icone,
  variacao,
  positivo = true,
}) => {
  return (
    <div className="bg-escuro-900 border border-escuro-800 rounded-2xl p-5 shadow-sm hover:border-escuro-700 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{titulo}</span>
        <div className="p-2.5 bg-escuro-850 rounded-xl text-slate-300 border border-escuro-800">
          {icone}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-white">{valor}</span>
        {variacao && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              positivo
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {variacao}
          </span>
        )}
      </div>
      {subtitulo && <p className="mt-1 text-xs text-slate-500">{subtitulo}</p>}
    </div>
  );
};
