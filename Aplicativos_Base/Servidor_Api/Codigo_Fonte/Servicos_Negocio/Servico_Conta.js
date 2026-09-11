"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoConta = void 0;
const banco_dados_1 = __importDefault(require("@gerenciador/banco-dados"));
const nucleo_plataformas_1 = require("@gerenciador/nucleo-plataformas");
const Servico_Criptografia_js_1 = require("./Servico_Criptografia.js");
const Servico_Registro_js_1 = require("./Servico_Registro.js");
class ServicoConta {
    static async listarTodas() {
        const contas = await banco_dados_1.default.conta_Social.findMany({
            include: {
                plataforma: true,
                capacidade_conta: true,
                _count: {
                    select: { destinos_publicacao: true },
                },
            },
            orderBy: { criado_em: 'desc' },
        });
        // Remove referências a credenciais sensíveis e expõe modelo seguro para frontend
        return contas.map((conta) => ({
            id: conta.id,
            plataformaId: conta.plataforma_id,
            plataformaCodigo: conta.plataforma.codigo,
            plataformaNome: conta.plataforma.nome,
            idExternoConta: conta.id_externo_conta,
            nome: conta.nome,
            nomeUsuario: conta.nome_usuario,
            nomeExibicao: conta.nome_exibicao,
            urlAvatar: conta.url_avatar,
            tipoConta: conta.tipo_conta,
            status: conta.status,
            fusoHorario: conta.fuso_horario,
            ultimaSincronizacao: conta.ultima_sincronizacao,
            totalPublicacoes: conta._count.destinos_publicacao,
            capacidades: conta.capacidade_conta
                ? {
                    video: conta.capacidade_conta.suporta_video,
                    videoCurto: conta.capacidade_conta.suporta_video_curto,
                    imagem: conta.capacidade_conta.suporta_imagem,
                    carrossel: conta.capacidade_conta.suporta_carrossel,
                    reel: conta.capacidade_conta.suporta_reel,
                    story: conta.capacidade_conta.suporta_story,
                    agendamento: conta.capacidade_conta.suporta_agendamento,
                    metricas: conta.capacidade_conta.suporta_metricas,
                    comentarios: conta.capacidade_conta.suporta_comentarios,
                    respostaComentario: conta.capacidade_conta.suporta_resposta,
                }
                : null,
        }));
    }
    static async obterPorId(id) {
        return banco_dados_1.default.conta_Social.findUnique({
            where: { id },
            include: {
                plataforma: true,
                capacidade_conta: true,
            },
        });
    }
    static async conectarConta(dados) {
        const registro = nucleo_plataformas_1.RegistroPlataformas.obterInstancia();
        const adaptador = registro.obterAdaptador(dados.codigoPlataforma);
        const resultadoOAuth = await adaptador.conectar(dados.codigoAutorizacao, dados.urlRetorno);
        const plataforma = await banco_dados_1.default.plataforma_Rede.findUnique({
            where: { codigo: dados.codigoPlataforma },
        });
        if (!plataforma) {
            throw new Error(`Plataforma ${dados.codigoPlataforma} não encontrada no banco de dados.`);
        }
        const contasCriadas = [];
        for (const contaNorm of resultadoOAuth.contas) {
            const contaSalva = await banco_dados_1.default.conta_Social.upsert({
                where: {
                    plataforma_id_id_externo_conta: {
                        plataforma_id: plataforma.id,
                        id_externo_conta: contaNorm.idExterno,
                    },
                },
                update: {
                    nome: contaNorm.nome,
                    nome_usuario: contaNorm.nomeUsuario,
                    nome_exibicao: contaNorm.nomeExibicao,
                    url_avatar: contaNorm.urlAvatar,
                    status: 'CONNECTED',
                    ultima_sincronizacao: new Date(),
                },
                create: {
                    plataforma_id: plataforma.id,
                    id_externo_conta: contaNorm.idExterno,
                    nome: contaNorm.nome,
                    nome_usuario: contaNorm.nomeUsuario,
                    nome_exibicao: contaNorm.nomeExibicao,
                    url_avatar: contaNorm.urlAvatar,
                    tipo_conta: contaNorm.tipoConta,
                    status: 'CONNECTED',
                    capacidade_conta: {
                        create: {
                            suporta_video: contaNorm.capacidades.video,
                            suporta_video_curto: contaNorm.capacidades.videoCurto,
                            suporta_imagem: contaNorm.capacidades.imagem,
                            suporta_carrossel: contaNorm.capacidades.carrossel,
                            suporta_reel: contaNorm.capacidades.reel,
                            suporta_story: contaNorm.capacidades.story,
                            suporta_agendamento: contaNorm.capacidades.agendamento,
                            suporta_metricas: contaNorm.capacidades.metricas,
                            suporta_comentarios: contaNorm.capacidades.comentarios,
                            suporta_resposta: contaNorm.capacidades.respostaComentario,
                        },
                    },
                    credencial_oauth: {
                        create: {
                            token_acesso_cifrado: Servico_Criptografia_js_1.ServicoCriptografia.cifrar(resultadoOAuth.tokenAcesso),
                            token_atualizacao_cifrado: resultadoOAuth.tokenAtualizacao
                                ? Servico_Criptografia_js_1.ServicoCriptografia.cifrar(resultadoOAuth.tokenAtualizacao)
                                : null,
                            expira_em: resultadoOAuth.expiraEm,
                        },
                    },
                },
            });
            await Servico_Registro_js_1.ServicoRegistro.registrarAuditoria({
                acaoExecutada: 'CONECTAR_CONTA',
                entidadeTipo: 'Conta_Social',
                entidadeId: contaSalva.id,
                detalhes: { plataforma: dados.codigoPlataforma, conta: contaSalva.nome },
            });
            contasCriadas.push(contaSalva);
        }
        return contasCriadas;
    }
    static async testarConexao(id) {
        const conta = await banco_dados_1.default.conta_Social.findUnique({
            where: { id },
            include: { plataforma: true, credencial_oauth: true },
        });
        if (!conta || !conta.credencial_oauth) {
            throw new Error('Conta ou credenciais não localizadas.');
        }
        const tokenAcesso = Servico_Criptografia_js_1.ServicoCriptografia.decifrar(conta.credencial_oauth.token_acesso_cifrado);
        const adaptador = nucleo_plataformas_1.RegistroPlataformas.obterInstancia().obterAdaptador(conta.plataforma.codigo);
        const valida = await adaptador.validarConexao(tokenAcesso, conta.id_externo_conta);
        await banco_dados_1.default.conta_Social.update({
            where: { id },
            data: {
                status: valida ? 'CONNECTED' : 'ERROR',
                ultima_sincronizacao: new Date(),
            },
        });
        return { valida, status: valida ? 'CONNECTED' : 'ERROR' };
    }
    static async desconectar(id) {
        const conta = await banco_dados_1.default.conta_Social.findUnique({
            where: { id },
            include: { credencial_oauth: true, plataforma: true },
        });
        if (conta && conta.credencial_oauth) {
            const token = Servico_Criptografia_js_1.ServicoCriptografia.decifrar(conta.credencial_oauth.token_acesso_cifrado);
            try {
                const adaptador = nucleo_plataformas_1.RegistroPlataformas.obterInstancia().obterAdaptador(conta.plataforma.codigo);
                await adaptador.desconectar(conta.id_externo_conta, token);
            }
            catch {
                // Ignora erro externo para garantir limpeza local
            }
        }
        await banco_dados_1.default.conta_Social.update({
            where: { id },
            data: { status: 'DISCONNECTED' },
        });
        await Servico_Registro_js_1.ServicoRegistro.registrarAuditoria({
            acaoExecutada: 'DESCONECTAR_CONTA',
            entidadeTipo: 'Conta_Social',
            entidadeId: id,
        });
        return { sucesso: true };
    }
}
exports.ServicoConta = ServicoConta;
//# sourceMappingURL=Servico_Conta.js.map