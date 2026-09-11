export * from './Armazenamento_Arquivos.js';

export interface MetadadosMidia {
  largura?: number;
  altura?: number;
  duracaoSegundos?: number;
  formatoExtensao: string;
  taxaBits?: number;
  tipoMime: string;
}

export interface PresetProcessamento {
  codigo: string;
  nome: string;
  larguraAlvo: number;
  alturaAlvo: number;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  maxDuracaoSegundos?: number;
  taxaBitsSugerida: number; // kbps
}

export const PRESETS_PROCESSAMENTO: Record<string, PresetProcessamento> = {
  youtube_shorts: {
    codigo: 'youtube_shorts',
    nome: 'YouTube Shorts (9:16)',
    larguraAlvo: 1080,
    alturaAlvo: 1920,
    aspectRatio: '9:16',
    maxDuracaoSegundos: 60,
    taxaBitsSugerida: 8000,
  },
  instagram_reel: {
    codigo: 'instagram_reel',
    nome: 'Instagram Reels (9:16)',
    larguraAlvo: 1080,
    alturaAlvo: 1920,
    aspectRatio: '9:16',
    maxDuracaoSegundos: 90,
    taxaBitsSugerida: 6000,
  },
  tiktok_vertical: {
    codigo: 'tiktok_vertical',
    nome: 'TikTok Vertical (9:16)',
    larguraAlvo: 1080,
    alturaAlvo: 1920,
    aspectRatio: '9:16',
    maxDuracaoSegundos: 600,
    taxaBitsSugerida: 8000,
  },
  kwai_vertical: {
    codigo: 'kwai_vertical',
    nome: 'Kwai Vídeo Curto (9:16)',
    larguraAlvo: 1080,
    alturaAlvo: 1920,
    aspectRatio: '9:16',
    maxDuracaoSegundos: 180,
    taxaBitsSugerida: 5000,
  },
  youtube_horizontal: {
    codigo: 'youtube_horizontal',
    nome: 'YouTube Vídeo Padrão (16:9)',
    larguraAlvo: 1920,
    alturaAlvo: 1080,
    aspectRatio: '16:9',
    taxaBitsSugerida: 12000,
  },
};

export class MotorFfmpeg {
  public static extrairMetadados(caminhoArquivo: string): MetadadosMidia {
    const extensao = caminhoArquivo.split('.').pop()?.toLowerCase() || 'mp4';
    return {
      largura: 1920,
      altura: 1080,
      duracaoSegundos: 45.5,
      formatoExtensao: extensao,
      taxaBits: 6500,
      tipoMime: extensao === 'mp4' ? 'video/mp4' : 'video/quicktime',
    };
  }

  public static obterPresetPorPlataforma(
    codigoPlataforma: string,
    tipoConteudo: string
  ): PresetProcessamento {
    switch (codigoPlataforma.toLowerCase()) {
      case 'tiktok':
        return PRESETS_PROCESSAMENTO.tiktok_vertical;
      case 'instagram':
        return PRESETS_PROCESSAMENTO.instagram_reel;
      case 'kwai':
        return PRESETS_PROCESSAMENTO.kwai_vertical;
      case 'youtube':
        return tipoConteudo === 'SHORT_VIDEO'
          ? PRESETS_PROCESSAMENTO.youtube_shorts
          : PRESETS_PROCESSAMENTO.youtube_horizontal;
      default:
        return PRESETS_PROCESSAMENTO.youtube_horizontal;
    }
  }

  public static async processarParaPreset(
    caminhoEntrada: string,
    preset: PresetProcessamento,
    caminhoSaida: string
  ): Promise<{ caminhoArquivo: string; tamanhoBytes: number }> {
    // Simulação do pipeline FFmpeg para geração de variantes sem travar processo
    return {
      caminhoArquivo: caminhoSaida,
      tamanhoBytes: 15 * 1024 * 1024,
    };
  }
}
