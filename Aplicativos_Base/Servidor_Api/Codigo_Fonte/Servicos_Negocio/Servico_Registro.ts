import clienteBanco from '@gerenciador/banco-dados';

export class ServicoRegistro {
  public static async registrarAuditoria(parametros: {
    usuarioId?: string;
    acaoExecutada: string;
    entidadeTipo: string;
    entidadeId?: string;
    detalhes?: Record<string, unknown>;
    ip?: string;
  }) {
    try {
      await clienteBanco.registro_Auditoria.create({
        data: {
          usuario_id: parametros.usuarioId,
          acao_executada: parametros.acaoExecutada,
          entidade_tipo: parametros.entidadeTipo,
          entidade_id: parametros.entidadeId,
          detalhes_json: parametros.detalhes ? JSON.stringify(parametros.detalhes) : null,
          endereco_ip: parametros.ip,
        },
      });
    } catch (erro) {
      console.error('Erro ao registrar log de auditoria:', erro);
    }
  }

  public static async registrarSistema(parametros: {
    nivel: 'INFO' | 'WARN' | 'ERROR';
    modulo: string;
    mensagem: string;
    contexto?: Record<string, unknown>;
  }) {
    const dataHora = new Date().toISOString();
    console.log(`[${dataHora}] [${parametros.nivel}] [${parametros.modulo}] ${parametros.mensagem}`);

    try {
      await clienteBanco.registro_Sistema.create({
        data: {
          nivel_log: parametros.nivel,
          modulo_origem: parametros.modulo,
          mensagem: parametros.mensagem,
          contexto_json: parametros.contexto ? JSON.stringify(parametros.contexto) : null,
        },
      });
    } catch (erro) {
      console.error('Erro ao persistir log de sistema:', erro);
    }
  }
}
