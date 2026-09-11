import { ContratoAdaptador } from './Contrato_Adaptador.js';
import { ErroPlataforma } from './Erros_Padronizados.js';

export * from './Contrato_Adaptador.js';
export * from './Modelos_Normalizados.js';
export * from './Erros_Padronizados.js';
export * from './Resolvedor_Capacidades.js';

export class RegistroPlataformas {
  private static instancia: RegistroPlataformas;
  private adaptadores: Map<string, ContratoAdaptador> = new Map();

  private constructor() {}

  public static obterInstancia(): RegistroPlataformas {
    if (!RegistroPlataformas.instancia) {
      RegistroPlataformas.instancia = new RegistroPlataformas();
    }
    return RegistroPlataformas.instancia;
  }

  public registrarAdaptador(adaptador: ContratoAdaptador): void {
    const chave = adaptador.codigoPlataforma.toLowerCase();
    this.adaptadores.set(chave, adaptador);
  }

  public obterAdaptador(codigoPlataforma: string): ContratoAdaptador {
    const chave = codigoPlataforma.toLowerCase();
    const adaptador = this.adaptadores.get(chave);

    if (!adaptador) {
      throw new ErroPlataforma({
        codigo: 'UNSUPPORTED',
        mensagem: `A plataforma '${codigoPlataforma}' não possui adaptador registrado no sistema.`,
        plataforma: codigoPlataforma,
      });
    }

    return adaptador;
  }

  public listarPlataformasRegistradas(): string[] {
    return Array.from(this.adaptadores.keys());
  }

  public possuiAdaptador(codigoPlataforma: string): boolean {
    return this.adaptadores.has(codigoPlataforma.toLowerCase());
  }
}
