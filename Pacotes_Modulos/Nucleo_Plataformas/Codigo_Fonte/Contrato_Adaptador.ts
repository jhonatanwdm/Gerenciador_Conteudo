import {
  CapacidadesPlataforma,
  ContaNormalizada,
  ParametrosPublicacao,
  PublicacaoNormalizada,
  MetricasNormalizadas,
  ComentarioNormalizado,
} from './Modelos_Normalizados.js';

export interface ContratoAdaptador {
  readonly codigoPlataforma: string;
  readonly nomePlataforma: string;

  obterCapacidades(): CapacidadesPlataforma;

  conectar(codigoAutorizacao: string, urlRetorno: string): Promise<{
    contas: ContaNormalizada[];
    tokenAcesso: string;
    tokenAtualizacao?: string;
    expiraEm?: Date;
  }>;

  desconectar(idExternoConta: string, tokenAcesso: string): Promise<boolean>;

  renovarToken(tokenAtualizacao: string): Promise<{
    novoTokenAcesso: string;
    novoTokenAtualizacao?: string;
    expiraEm?: Date;
  }>;

  validarConexao(tokenAcesso: string, idExternoConta: string): Promise<boolean>;

  obterDadosConta(tokenAcesso: string, idExternoConta: string): Promise<ContaNormalizada>;

  publicar(parametros: ParametrosPublicacao): Promise<PublicacaoNormalizada>;

  agendar(parametros: ParametrosPublicacao): Promise<PublicacaoNormalizada>;

  obterStatusPublicacao(
    idExternoPublicacao: string,
    tokenAcesso: string
  ): Promise<PublicacaoNormalizada>;

  obterMetricas(
    idExternoPublicacao: string,
    tokenAcesso: string
  ): Promise<MetricasNormalizadas>;

  obterComentarios(
    idExternoPublicacao: string,
    tokenAcesso: string
  ): Promise<ComentarioNormalizado[]>;

  responderComentario(
    idExternoComentario: string,
    textoResposta: string,
    tokenAcesso: string
  ): Promise<{ sucesso: boolean; idExternoResposta?: string }>;

  excluirPublicacao(
    idExternoPublicacao: string,
    tokenAcesso: string
  ): Promise<boolean>;

  atualizarPublicacao(
    idExternoPublicacao: string,
    dadosAtualizados: Partial<ParametrosPublicacao>,
    tokenAcesso: string
  ): Promise<boolean>;
}
