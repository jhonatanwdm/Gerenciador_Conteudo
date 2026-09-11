import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface PropsCriador {
  contas: any[];
  modelos: any[];
  hashtags: any[];
  onPublicarSucesso: (resultado: any) => void;
  onCancelar: () => void;
}

export const CriadorPublicacao: React.FC<PropsCriador> = ({
  contas,
  modelos,
  hashtags,
  onPublicarSucesso,
  onCancelar,
}) => {
  // 1. Dados base do conteúdo
  const [titulo, setTitulo] = useState('Como Aconteceu a Operação Especial');
  const [descricao, setDescricao] = useState(
    'Análise completa dos bastidores, táticas e desfecho desta operação marcante.'
  );
  const [hashtagsTexto, setHashtagsTexto] = useState('#historia #militar #estrategia');
  const [ctaTexto, setCtaTexto] = useState('Comente sua opinião e compartilhe com seus amigos!');

  // 2. Destinos selecionados (IDs de conta_social)
  const [destinosSelecionados, setDestinosSelecionados] = useState<string[]>(
    contas.map((c) => c.id) // Seleciona todas por padrão para demonstrar poder multi-conta
  );

  // 3. Overrides por conta
  const [customizacoesPorConta, setCustomizacoesPorConta] = useState<Record<string, { titulo?: string; descricao?: string }>>({});
  const [abaContaEditando, setAbaContaEditando] = useState<string | null>(null);

  // 4. Modo de Envio (Agora vs Agendar)
  const [modoAgendamento, setModoAgendamento] = useState<'AGORA' | 'AGENDAR'>('AGORA');
  const [dataHoraAgendada, setDataHoraAgendada] = useState('');

  // 5. Estado de envio e validação prévia
  const [enviando, setEnviando] = useState(false);
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);

  // Agrupa contas por plataforma
  const plataformasAgrupadas = contas.reduce((acc: Record<string, any[]>, conta) => {
    const plat = conta.plataformaCodigo;
    if (!acc[plat]) acc[plat] = [];
    acc[plat].push(conta);
    return acc;
  }, {});

  const alternarConta = (idConta: string) => {
    setDestinosSelecionados((prev) =>
      prev.includes(idConta) ? prev.filter((id) => id !== idConta) : [...prev, idConta]
    );
  };

  const alternarPlataforma = (codigoPlat: string) => {
    const contasPlat = plataformasAgrupadas[codigoPlat] || [];
    const idsPlat = contasPlat.map((c) => c.id);
    const todasMarcadas = idsPlat.every((id) => destinosSelecionados.includes(id));

    if (todasMarcadas) {
      setDestinosSelecionados((prev) => prev.filter((id) => !idsPlat.includes(id)));
    } else {
      setDestinosSelecionados((prev) => Array.from(new Set([...prev, ...idsPlat])));
    }
  };

  const selecionarTodas = () => {
    setDestinosSelecionados(contas.map((c) => c.id));
  };

  const desmarcarTodas = () => {
    setDestinosSelecionados([]);
  };

  const aplicarModelo = (modelo: any) => {
    setTitulo(modelo.titulo_modelo || titulo);
    setDescricao(modelo.descricao_modelo || descricao);
    if (modelo.hashtags_modelo) setHashtagsTexto(modelo.hashtags_modelo);
    if (modelo.cta_modelo) setCtaTexto(modelo.cta_modelo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroValidacao(null);

    if (!titulo.trim()) {
      setErroValidacao('Informe o título da publicação.');
      return;
    }

    if (destinosSelecionados.length === 0) {
      setErroValidacao('Selecione pelo menos uma conta de destino.');
      return;
    }

    if (modoAgendamento === 'AGENDAR' && !dataHoraAgendada) {
      setErroValidacao('Defina a data e horário para o agendamento.');
      return;
    }

    setEnviando(true);

    try {
      // 1. Cria o conteúdo lógico primeiro
      const respConteudo = await fetch('/api/conteudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          descricao,
          tipoConteudo: 'SHORT_VIDEO',
        }),
      });

      if (!respConteudo.ok) throw new Error('Falha ao salvar conteúdo lógico base.');
      const conteudoCriado = await respConteudo.json();

      // 2. Monta os destinos desdobrados com seus overrides específicos
      const destinosPayload = destinosSelecionados.map((contaId) => {
        const custom = customizacoesPorConta[contaId] || {};
        return {
          contaSocialId: contaId,
          tituloPersonalizado: custom.titulo || titulo,
          descricaoPersonalizada: custom.descricao || descricao,
          hashtagsPersonalizadas: hashtagsTexto,
          ctaPersonalizado: ctaTexto,
          agendadoPara: modoAgendamento === 'AGENDAR' ? dataHoraAgendada : undefined,
        };
      });

      // 3. Cria a publicação e dispara jobs independentes
      const respPub = await fetch('/api/publicacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conteudoId: conteudoCriado.id,
          destinos: destinosPayload,
        }),
      });

      if (!respPub.ok) {
        const erroJson = await respPub.json();
        throw new Error(erroJson.erro || 'Falha ao processar publicação.');
      }

      const resultadoPub = await respPub.json();
      onPublicarSucesso(resultadoPub);
    } catch (err: any) {
      setErroValidacao(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Topo do Formulário */}
      <div className="flex items-center justify-between border-b border-escuro-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Criar Nova Publicação Multi-Destino</h2>
          <p className="text-xs text-slate-400 mt-1">
            Defina o conteúdo base e selecione exatamente as contas que receberão o envio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 rounded-xl bg-escuro-850 hover:bg-escuro-800 text-slate-300 font-semibold text-xs border border-escuro-700 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-95 disabled:opacity-50"
          >
            <Send size={15} />
            <span>{enviando ? 'Processando Fila...' : modoAgendamento === 'AGORA' ? 'Publicar Agora' : 'Confirmar Agendamento'}</span>
          </button>
        </div>
      </div>

      {erroValidacao && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{erroValidacao}</span>
        </div>
      )}

      {/* Grid de 2 Colunas: Conteúdo (Esquerda) e Seleção de Destinos (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna 1: Conteúdo Base & Modelos (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-escuro-900 border border-escuro-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">1. Conteúdo Base</h3>
              {modelos.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-400" />
                  <select
                    onChange={(e) => {
                      const mod = modelos.find((m) => m.id === e.target.value);
                      if (mod) aplicarModelo(mod);
                    }}
                    className="bg-escuro-850 border border-escuro-700 rounded-lg text-xs text-slate-300 px-2 py-1 outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled>Carregar Modelo...</option>
                    {modelos.map((m) => (
                      <option key={m.id} value={m.id}>{m.nome_modelo}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Título / Assunto</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Como aconteceu a Operação Tempestade no Deserto"
                className="w-full px-4 py-2.5 rounded-xl bg-escuro-850 border border-escuro-700 text-white placeholder-slate-500 text-sm focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Descrição / Texto Principal</label>
              <textarea
                rows={4}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Escreva a descrição do conteúdo..."
                className="w-full px-4 py-2.5 rounded-xl bg-escuro-850 border border-escuro-700 text-white placeholder-slate-500 text-sm focus:border-blue-500 outline-none transition resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hashtags</label>
                <input
                  type="text"
                  value={hashtagsTexto}
                  onChange={(e) => setHashtagsTexto(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-escuro-850 border border-escuro-700 text-white text-xs focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Chamada para Ação (CTA)</label>
                <input
                  type="text"
                  value={ctaTexto}
                  onChange={(e) => setCtaTexto(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-escuro-850 border border-escuro-700 text-white text-xs focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Agendamento vs Envio Imediato */}
          <div className="bg-escuro-900 border border-escuro-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">2. Horário de Publicação</h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setModoAgendamento('AGORA')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  modoAgendamento === 'AGORA'
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                    : 'bg-escuro-850 border-escuro-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Send size={16} />
                <span>Publicar Agora</span>
              </button>

              <button
                type="button"
                onClick={() => setModoAgendamento('AGENDAR')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  modoAgendamento === 'AGENDAR'
                    ? 'bg-purple-600/10 border-purple-500 text-purple-400'
                    : 'bg-escuro-850 border-escuro-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar size={16} />
                <span>Agendar Horário</span>
              </button>
            </div>

            {modoAgendamento === 'AGENDAR' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Data e Horário</label>
                <input
                  type="datetime-local"
                  value={dataHoraAgendada}
                  onChange={(e) => setDataHoraAgendada(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-escuro-850 border border-escuro-700 text-white text-sm focus:border-purple-500 outline-none transition"
                />
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2: Seletor Granular de Destinos Multi-Conta (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-escuro-900 border border-escuro-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-escuro-800">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">3. Destinos de Publicação</h3>
                <p className="text-xs text-blue-400 font-semibold mt-0.5">
                  {destinosSelecionados.length} conta(s) selecionada(s)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selecionarTodas}
                  className="text-[11px] font-semibold text-slate-300 hover:text-white px-2 py-1 bg-escuro-850 rounded border border-escuro-700 transition"
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={desmarcarTodas}
                  className="text-[11px] font-semibold text-slate-400 hover:text-white px-2 py-1 bg-escuro-850 rounded border border-escuro-700 transition"
                >
                  Nenhuma
                </button>
              </div>
            </div>

            {/* Listagem de Plataformas e Contas Independentes */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {Object.entries(plataformasAgrupadas).map(([codigoPlat, contasPlat]) => {
                const todasDaPlat = contasPlat.every((c) => destinosSelecionados.includes(c.id));
                const nomePlat = contasPlat[0]?.plataformaNome || codigoPlat;

                return (
                  <div key={codigoPlat} className="p-3.5 rounded-xl bg-escuro-850 border border-escuro-800">
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-escuro-800/80">
                      <button
                        type="button"
                        onClick={() => alternarPlataforma(codigoPlat)}
                        className="flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white transition"
                      >
                        {todasDaPlat ? (
                          <CheckSquare size={16} className="text-blue-400" />
                        ) : (
                          <Square size={16} className="text-slate-500" />
                        )}
                        <span className="uppercase tracking-wider">{nomePlat}</span>
                      </button>
                      <span className="text-[10px] text-slate-400">{contasPlat.length} conta(s)</span>
                    </div>

                    <div className="space-y-1.5 pl-5">
                      {contasPlat.map((c) => {
                        const selecionada = destinosSelecionados.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-escuro-800 cursor-pointer transition text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={selecionada}
                                onChange={() => alternarConta(c.id)}
                                className="rounded bg-escuro-800 border-escuro-700 text-blue-600 focus:ring-0"
                              />
                              <span className={selecionada ? 'text-white font-medium' : 'text-slate-400'}>
                                {c.nomeExibicao}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">@{c.nomeUsuario}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumo Final de Validação Prévia */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={15} />
                Snapshot Protegido
              </p>
              <p className="text-[11px] text-blue-300/80 leading-relaxed">
                Ao disparar, exatamente estes <strong>{destinosSelecionados.length} destinos</strong> serão fixados
                em jobs isolados. Contas conectadas futuramente não sofrerão postagens acidentais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
