import React from 'react';

interface PropsOverlayAtualizacao {
  ativo: boolean;
  titulo?: string;
  subtitulo?: string;
}

export const OverlayAtualizacao: React.FC<PropsOverlayAtualizacao> = ({
  ativo,
  titulo = 'Recebendo atualização...',
  subtitulo = 'Sincronizando arquivos e dados do projeto',
}) => {
  return (
    <div
      className={`overlay-atualizacao ${ativo ? 'ativo' : ''}`}
      id="overlay-atualizacao"
      aria-live="assertive"
    >
      <div className="card-atualizacao">

        <div className="spinner-atualizacao">
          <div className="anel-1"></div>
          <div className="anel-2"></div>
          <div className="centro-icone-gerenciador" aria-label="Gerenciador de Conteúdo">
            <svg
              viewBox="0 0 24 24"
              width="38"
              height="38"
              fill="none"
              stroke="url(#gradiente-icone-gerenciador)"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="gradiente-icone-gerenciador" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              {/* Ícone estilizado exclusivo de camadas e distribuição de conteúdo */}
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
        </div>
        <h3 className="titulo-atualizacao" id="overlay-atualizacao-titulo">
          {titulo}
        </h3>
        <p className="subtitulo-atualizacao" id="overlay-atualizacao-subtitulo">
          {subtitulo}
        </p>
        <div className="barra-progresso-atualizacao">
          <div className="progresso-linha"></div>
        </div>
      </div>
    </div>
  );
};
