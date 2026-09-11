"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoCriptografia = void 0;
const crypto_1 = __importDefault(require("crypto"));
class ServicoCriptografia {
    static algoritmo = 'aes-256-cbc';
    static chave = crypto_1.default
        .createHash('sha256')
        .update(process.env.CHAVE_CRIPTOGRAFIA_TOKENS || 'chave_padrao_segura_32_caracteres_min')
        .digest();
    static cifrar(textoPuro) {
        if (!textoPuro)
            return '';
        const iv = crypto_1.default.randomBytes(16);
        const cifrador = crypto_1.default.createCipheriv(this.algoritmo, this.chave, iv);
        let cifrado = cifrador.update(textoPuro, 'utf8', 'hex');
        cifrado += cifrador.final('hex');
        return `${iv.toString('hex')}:${cifrado}`;
    }
    static decifrar(textoCifrado) {
        if (!textoCifrado || !textoCifrado.includes(':'))
            return '';
        const [ivHex, conteudoHex] = textoCifrado.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decifrador = crypto_1.default.createDecipheriv(this.algoritmo, this.chave, iv);
        let decifrado = decifrador.update(conteudoHex, 'hex', 'utf8');
        decifrado += decifrador.final('utf8');
        return decifrado;
    }
}
exports.ServicoCriptografia = ServicoCriptografia;
//# sourceMappingURL=Servico_Criptografia.js.map