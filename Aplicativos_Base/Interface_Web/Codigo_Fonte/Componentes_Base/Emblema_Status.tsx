import React from 'react';

interface PropsEmblema {
  status: string;
}

export const EmblemaStatus: React.FC<PropsEmblema> = ({ status }) => {
  const normalizado = status?.toUpperCase() || 'UNKNOWN';

  switch (normalizado) {
    case 'PUBLISHED':
    case 'SUCCESS':
    case 'CONNECTED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
          {normalizado === 'CONNECTED' ? 'Conectado' : 'Publicado'}
        </span>
      );

    case 'PARTIAL':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
          Parcial (Falhas)
        </span>
      );

    case 'PROCESSING':
    case 'UPLOADING':
    case 'PUBLISHING':
    case 'QUEUED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 animate-spin"></span>
          Processando
        </span>
      );

    case 'SCHEDULED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5"></span>
          Agendado
        </span>
      );

    case 'FAILED':
    case 'ERROR':
    case 'EXPIRED':
    case 'REAUTH_REQUIRED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>
          {normalizado === 'FAILED'
            ? 'Falhou'
            : normalizado === 'EXPIRED'
            ? 'Expirado'
            : 'Reautenticar'}
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
          {normalizado}
        </span>
      );
  }
};
