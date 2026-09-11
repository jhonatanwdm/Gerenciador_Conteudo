import React, { useState, useEffect } from 'react';
import './Estilos_Notificacoes.css';
import './Estilos_Overlay.css';
import { BarraLateral } from './Componentes_Base/Barra_Lateral.js';
import { BarraSuperior } from './Componentes_Base/Barra_Superior.js';
import { OverlayAtualizacao } from './Componentes_Base/Overlay_Atualizacao.js';
import { inicializarSistemaNotificacoes } from './Servicos_Sistema/Sistema_Notificacoes.js';
import { GerenciadorAtualizacao, EstadoAtualizacao } from './Servicos_Sistema/Gerenciador_Atualizacao.js';
import { PainelPrincipal } from './Modulos_Telas/Painel_Principal.js';
import { GestaoContas } from './Modulos_Telas/Gestao_Contas.js';
import { CriadorPublicacao } from './Modulos_Telas/Criador_Publicacao.js';
import { HistoricoEnvios } from './Modulos_Telas/Historico_Envios.js';
import { MatrizPublicacao } from './Modulos_Telas/Matriz_Publicacao.js';
import { CentralComentarios } from './Modulos_Telas/Central_Comentarios.js';

export const AplicativoVisual: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState('painel');
  const [carregando, setCarregando] = useState(false);

  // Estados de dados da API
  const [resumoMetricas, setResumoMetricas] = useState<any>(null);
  const [contas, setContas] = useState<any[]>([]);
  const [publicacoes, setPublicacoes] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [comentarios, setComentarios] = useState<any[]>([]);

  const [estadoAtualizacao, setEstadoAtualizacao] = useState<EstadoAtualizacao>(() =>
    GerenciadorAtualizacao.obterInstancia().obterEstado()
  );

  const carregarTodosDados = async (silencioso = false) => {
    if (!silencioso) setCarregando(true);
    try {
      const [respMetricas, respContas, respPubs, respModelos, respHash, respComent] =
        await Promise.all([
          fetch('/api/metricas/resumo').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/contas').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/publicacoes').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/modelos').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/hashtags').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/comentarios').then((r) => (r.ok ? r.json() : [])),
        ]);

      if (respMetricas) setResumoMetricas(respMetricas);
      if (respContas) setContas(respContas);
      if (respPubs) setPublicacoes(respPubs);
      if (respModelos) setModelos(respModelos);
      if (respHash) setHashtags(respHash);
      if (respComent) setComentarios(respComent);
    } catch (erro) {
      console.error('Erro ao buscar dados do backend:', erro);
    } finally {
      if (!silencioso) setCarregando(false);
    }
  };

  useEffect(() => {
    inicializarSistemaNotificacoes();
    const gerenciador = GerenciadorAtualizacao.obterInstancia();

    gerenciador.registrarCallbackRecarga(async () => {
      await carregarTodosDados(true);
    });

    const desinscrever = gerenciador.assinar((novoEstado) => {
      setEstadoAtualizacao({ ...novoEstado });
    });

    void carregarTodosDados();
    gerenciador.iniciarCicloAuto();

    return () => {
      desinscrever();
      gerenciador.pararCicloAuto();
    };
  }, []);

  // Atualização em tempo real do título da aplicação seguindo o padrão da Central de Redes Sociais
  useEffect(() => {
    const inicioMs = Date.now();
    const atualizarTitulo = () => {
      const agora = new Date();
      const dd = String(agora.getDate()).padStart(2, '0');
      const mm = String(agora.getMonth() + 1).padStart(2, '0');
      const yyyy = agora.getFullYear();
      const hh = String(agora.getHours()).padStart(2, '0');
      const mi = String(agora.getMinutes()).padStart(2, '0');
      const ss = String(agora.getSeconds()).padStart(2, '0');
      const dataHora = `${dd}-${mm}-${yyyy} | ${hh}:${mi}:${ss}`;

      const total = Math.max(0, Math.floor((Date.now() - inicioMs) / 1000));
      const horas = Math.floor(total / 3600);
      const minutos = Math.floor((total % 3600) / 60);
      const segundos = total % 60;
      const tempoOnline = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

      document.title = `|| Gerenciador de Conteúdo - v1.1.0 || Tempo Online : ${tempoOnline} || Data e Horario : ${dataHora} ||`;
    };

    atualizarTitulo();
    const timer = setInterval(atualizarTitulo, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAtualizarManual = () => {
    void GerenciadorAtualizacao.obterInstancia().executarAtualizacao('manual', true);
  };

  const handleAlternarAuto = () => {
    GerenciadorAtualizacao.obterInstancia().alternarAutoAtualizar();
  };

  const handleTestarConta = async (id: string) => {
    await fetch(`/api/contas/${id}/testar`, { method: 'POST' });
    await carregarTodosDados();
  };

  const handleDesconectarConta = async (id: string) => {
    await fetch(`/api/contas/${id}/desconectar`, { method: 'POST' });
    await carregarTodosDados();
  };

  const handleConectarNovaConta = async (codigoPlataforma: string) => {
    await fetch('/api/contas/conectar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoPlataforma }),
    });
    await carregarTodosDados();
  };

  const handleTentarNovamenteDestino = async (destinoId: string) => {
    await fetch(`/api/destinos/${destinoId}/reprocessar`, { method: 'POST' });
    // Aguarda 1 segundo e recarrega dados para ver o status atualizado
    setTimeout(() => carregarTodosDados(), 1000);
  };

  const handleResponderComentario = async (comentarioId: string, textoResposta: string) => {
    await fetch(`/api/comentarios/${comentarioId}/responder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textoResposta }),
    });
    await carregarTodosDados();
  };

  const getTituloPagina = () => {
    switch (abaAtiva) {
      case 'painel':
        return { titulo: 'Painel Geral de Redes Sociais', subtitulo: 'Visão consolidada de todas as plataformas e contas conectadas' };
      case 'criar':
        return { titulo: 'Criador de Publicação', subtitulo: 'Crie e configure distribuições granulares por conta' };
      case 'publicacoes':
        return { titulo: 'Publicações & Histórico', subtitulo: 'Acompanhamento detalhado do ciclo de vida de cada destino' };
      case 'matriz':
        return { titulo: 'Matriz de Publicação', subtitulo: 'Cruzamento de conteúdos versus contas de destino' };
      case 'contas':
        return { titulo: 'Gestão de Contas', subtitulo: 'Canais e perfis conectados com tokens criptografados' };
      case 'comentarios':
        return { titulo: 'Caixa de Entrada (Inbox)', subtitulo: 'Interações e respostas oficiais unificadas' };
      default:
        return { titulo: 'Social Flow', subtitulo: 'Gerenciador Multi-Plataforma' };
    }
  };

  const infoCabecalho = getTituloPagina();

  return (
    <div className="flex min-h-screen bg-escuro-950 text-slate-100">
      {/* 1. Barra Lateral Fixa */}
      <BarraLateral
        abaAtiva={abaAtiva}
        definirAbaAtiva={setAbaAtiva}
        onAbrirNovaPublicacao={() => setAbaAtiva('criar')}
      />

      {/* 2. Área Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <BarraSuperior
          titulo={infoCabecalho.titulo}
          subtitulo={infoCabecalho.subtitulo}
          onAtualizar={handleAtualizarManual}
          carregando={estadoAtualizacao.atualizando}
          autoAtivo={estadoAtualizacao.autoAtivo}
          segundosRestantes={estadoAtualizacao.segundosRestantes}
          onAlternarAuto={handleAlternarAuto}
        />

        <main className="flex-1 p-8 overflow-y-auto">
          {abaAtiva === 'painel' && (
            <PainelPrincipal
              dadosResumo={resumoMetricas}
              publicacoes={publicacoes}
              onCriarPublicacao={() => setAbaAtiva('criar')}
              onVerPublicacao={() => setAbaAtiva('publicacoes')}
            />
          )}

          {abaAtiva === 'criar' && (
            <CriadorPublicacao
              contas={contas}
              modelos={modelos}
              hashtags={hashtags}
              onPublicarSucesso={() => {
                setAbaAtiva('publicacoes');
                carregarTodosDados();
              }}
              onCancelar={() => setAbaAtiva('painel')}
            />
          )}

          {abaAtiva === 'contas' && (
            <GestaoContas
              contas={contas}
              onTestarConta={handleTestarConta}
              onDesconectarConta={handleDesconectarConta}
              onConectarNovaConta={handleConectarNovaConta}
            />
          )}

          {abaAtiva === 'publicacoes' && (
            <HistoricoEnvios
              publicacoes={publicacoes}
              onTentarNovamenteDestino={handleTentarNovamenteDestino}
              onIniciarRepost={() => setAbaAtiva('criar')}
            />
          )}

          {abaAtiva === 'matriz' && (
            <MatrizPublicacao contas={contas} publicacoes={publicacoes} />
          )}

          {abaAtiva === 'comentarios' && (
            <CentralComentarios
              comentarios={comentarios}
              onResponderComentario={handleResponderComentario}
            />
          )}

          {abaAtiva === 'midias' && (
            <div className="bg-escuro-900 border border-escuro-800 rounded-2xl p-8 text-center text-slate-400">
              <h3 className="text-base font-bold text-white mb-2">Biblioteca de Mídia Local</h3>
              <p className="text-xs max-w-md mx-auto">
                Armazenamento de vídeos e thumbnails com extração automática de metadados FFmpeg e variantes por plataforma (Shorts, Reels, TikTok).
              </p>
            </div>
          )}

          {abaAtiva === 'auditoria' && (
            <div className="bg-escuro-900 border border-escuro-800 rounded-2xl p-8 text-center text-slate-400">
              <h3 className="text-base font-bold text-white mb-2">Registros de Auditoria & Segurança</h3>
              <p className="text-xs max-w-md mx-auto">
                Todos os eventos de criação, agendamento, retentativas e renovação de credenciais OAuth são salvos em formato auditável e rastreável.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* 3. Overlay de Atualização e Sincronização em Tela Cheia */}
      <OverlayAtualizacao
        ativo={estadoAtualizacao.overlayAtivo}
        titulo={estadoAtualizacao.titulo}
        subtitulo={estadoAtualizacao.subtitulo}
      />
    </div>
  );
};
