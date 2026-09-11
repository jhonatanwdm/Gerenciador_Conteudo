export type TipoCodigoErroPlataforma =
  | 'AUTH_REQUIRED'
  | 'AUTH_EXPIRED'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMIT'
  | 'QUOTA_EXCEEDED'
  | 'INVALID_MEDIA'
  | 'INVALID_METADATA'
  | 'NETWORK_ERROR'
  | 'PLATFORM_ERROR'
  | 'UNSUPPORTED'
  | 'REQUIRES_APPROVAL'
  | 'REQUIRES_MANUAL_ACTION'
  | 'UNKNOWN_ERROR';

export class ErroPlataforma extends Error {
  public readonly codigo: TipoCodigoErroPlataforma;
  public readonly plataforma: string;
  public readonly contaId?: string;
  public readonly statusHttp?: number;
  public readonly dadosExtras?: Record<string, unknown>;

  constructor(parametros: {
    codigo: TipoCodigoErroPlataforma;
    mensagem: string;
    plataforma: string;
    contaId?: string;
    statusHttp?: number;
    dadosExtras?: Record<string, unknown>;
  }) {
    super(parametros.mensagem);
    this.name = 'ErroPlataforma';
    this.codigo = parametros.codigo;
    this.plataforma = parametros.plataforma;
    this.contaId = parametros.contaId;
    this.statusHttp = parametros.statusHttp;
    this.dadosExtras = parametros.dadosExtras;
    Object.setPrototypeOf(this, ErroPlataforma.prototype);
  }

  public eErroPermanente(): boolean {
    return [
      'PERMISSION_DENIED',
      'INVALID_MEDIA',
      'INVALID_METADATA',
      'UNSUPPORTED',
      'REQUIRES_APPROVAL',
      'REQUIRES_MANUAL_ACTION',
    ].includes(this.codigo);
  }

  public eErroAutenticacao(): boolean {
    return ['AUTH_REQUIRED', 'AUTH_EXPIRED'].includes(this.codigo);
  }

  public eErroLimiteOuQuota(): boolean {
    return ['RATE_LIMIT', 'QUOTA_EXCEEDED'].includes(this.codigo);
  }
}
