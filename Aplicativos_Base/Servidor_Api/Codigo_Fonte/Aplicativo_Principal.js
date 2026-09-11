"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const nucleo_plataformas_1 = require("@gerenciador/nucleo-plataformas");
const adaptador_youtube_1 = require("@gerenciador/adaptador-youtube");
const adaptador_instagram_1 = require("@gerenciador/adaptador-instagram");
const adaptador_facebook_1 = require("@gerenciador/adaptador-facebook");
const adaptador_tiktok_1 = require("@gerenciador/adaptador-tiktok");
const adaptador_kwai_1 = require("@gerenciador/adaptador-kwai");
const Rota_Principal_js_1 = require("./Rotas_Sistema/Rota_Principal.js");
// 1. Inicializa e registra os 5 adaptadores no registro central
const registro = nucleo_plataformas_1.RegistroPlataformas.obterInstancia();
registro.registrarAdaptador(new adaptador_youtube_1.AdaptadorYoutube());
registro.registrarAdaptador(new adaptador_instagram_1.AdaptadorInstagram());
registro.registrarAdaptador(new adaptador_facebook_1.AdaptadorFacebook());
registro.registrarAdaptador(new adaptador_tiktok_1.AdaptadorTiktok());
registro.registrarAdaptador(new adaptador_kwai_1.AdaptadorKwai());
console.log(`✓ Adaptadores registrados: ${registro.listarPlataformasRegistradas().join(', ')}`);
// 2. Configura a aplicação Express
const app = (0, express_1.default)();
const porta = process.env.PORTA_API || 3333;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 3. Monta rotas da API
app.use('/api', Rota_Principal_js_1.rotaPrincipal);
// 4. Servir interface web compilada (se existir a pasta dist)
const caminhosPossiveis = [
    path_1.default.resolve(process.cwd(), 'Aplicativos_Base/Interface_Web/dist'),
    path_1.default.resolve(process.cwd(), '../Interface_Web/dist'),
    path_1.default.resolve(__dirname, '../../Interface_Web/dist'),
    'D:/Gerenciador_Conteudo/Aplicativos_Base/Interface_Web/dist',
];
const caminhoDist = caminhosPossiveis.find((c) => fs_1.default.existsSync(c));
if (caminhoDist && fs_1.default.existsSync(caminhoDist)) {
    app.use(express_1.default.static(caminhoDist));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path_1.default.join(caminhoDist, 'index.html'));
        }
    });
    console.log(`✓ Interface Web servida estaticamente a partir de ${caminhoDist}`);
}
// 5. Inicia o servidor HTTP
app.listen(porta, () => {
    console.log(`🚀 Servidor API rodando em http://localhost:${porta}`);
    console.log(`🛡️ Modo: ${process.env.MOCK_MODE === 'true' ? 'MOCK_MODE (Simulado)' : 'PRODUÇÃO'}`);
});
exports.default = app;
//# sourceMappingURL=Aplicativo_Principal.js.map