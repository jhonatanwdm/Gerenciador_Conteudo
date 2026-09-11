export interface CapacidadesPlataforma {
  video: boolean;
  videoCurto: boolean;
  imagem: boolean;
  carrossel: boolean;
  reel: boolean;
  story: boolean;
  agendamento: boolean;
  metricas: boolean;
  comentarios: boolean;
  respostaComentario: boolean;
  recursosPersonalizados?: Record<string, boolean>;
}

export interface ContaNormalizada {
  idExterno: string;
  nome: string;
  nomeUsuario: string;
  nomeExibicao: string;
  urlAvatar?: string;
  tipoConta: 'STANDARD' | 'BUSINESS' | 'CREATOR' | 'CHANNEL' | 'PAGE';
  status:
    | 'CONNECTED'
    | 'DISCONNECTED'
    | 'EXPIRED'
    | 'REAUTH_REQUIRED'
    | 'ERROR'
    | 'SUSPENDED'
    | 'LIMITED'
    | 'PENDING'
    | 'UNKNOWN';
  capacidades: CapacidadesPlataforma;
}

export interface ParametrosPublicacao {
  destinoId: string;
  contaId: string;
  idExternoConta: string;
  titulo: string;
  descricao?: string;
  legenda?: string;
  hashtags?: string[];
  cta?: string;
  caminhoMidia?: string;
  tipoMidia: 'VIDEO' | 'SHORT_VIDEO' | 'IMAGE' | 'CAROUSEL' | 'REEL' | 'STORY' | 'TEXT';
  caminhoThumbnail?: string;
  privacidade?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  agendadoPara?: Date;
  tokenAcesso: string;
  tokenAtualizacao?: string;
}

export interface PublicacaoNormalizada {
  sucesso: boolean;
  idExterno?: string;
  urlExterna?: string;
  statusRemoto: 'PROCESSING' | 'PUBLISHED' | 'SCHEDULED' | 'DRAFT' | 'FAILED';
  mensagem?: string;
  dadosBrutos?: Record<string, unknown>;
}

export interface MetricasNormalizadas {
  visualizacoes: number;
  curtidas: number;
  comentarios: number;
  compartilhamentos: number;
  salvamentos?: number;
  seguidores?: number;
  alcance?: number;
  impressoes?: number;
  tempoAssistidoSegundos?: number;
  taxaEngajamento?: number;
  dadosBrutos?: Record<string, unknown>;
}

export interface ComentarioNormalizado {
  idExterno: string;
  autorNome: string;
  autorAvatar?: string;
  autorIdExterno?: string;
  texto: string;
  curtidas: number;
  respondido: boolean;
  dataCriacao: Date;
}
