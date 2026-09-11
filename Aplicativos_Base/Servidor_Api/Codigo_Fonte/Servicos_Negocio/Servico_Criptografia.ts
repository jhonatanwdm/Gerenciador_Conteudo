import crypto from 'crypto';

export class ServicoCriptografia {
  private static algoritmo = 'aes-256-cbc';
  private static chave = crypto
    .createHash('sha256')
    .update(process.env.CHAVE_CRIPTOGRAFIA_TOKENS || 'chave_padrao_segura_32_caracteres_min')
    .digest();

  public static cifrar(textoPuro: string): string {
    if (!textoPuro) return '';
    const iv = crypto.randomBytes(16);
    const cifrador = crypto.createCipheriv(this.algoritmo, this.chave, iv);
    let cifrado = cifrador.update(textoPuro, 'utf8', 'hex');
    cifrado += cifrador.final('hex');
    return `${iv.toString('hex')}:${cifrado}`;
  }

  public static decifrar(textoCifrado: string): string {
    if (!textoCifrado || !textoCifrado.includes(':')) return '';
    const [ivHex, conteudoHex] = textoCifrado.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decifrador = crypto.createDecipheriv(this.algoritmo, this.chave, iv);
    let decifrado = decifrador.update(conteudoHex, 'hex', 'utf8');
    decifrado += decifrador.final('utf8');
    return decifrado;
  }
}
