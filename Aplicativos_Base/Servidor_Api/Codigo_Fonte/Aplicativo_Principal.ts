import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Carrega variáveis de ambiente procurando tanto no diretório local quanto na raiz do projeto
const caminhosEnv = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(__dirname, '../../../.env'),
  'D:/Gerenciador_Conteudo/.env',
];
for (const caminho of caminhosEnv) {
  if (fs.existsSync(caminho)) {
    dotenv.config({ path: caminho });
    break;
  }
}

import express from 'express';
import cors from 'cors';
import { RegistroPlataformas } from '@gerenciador/nucleo-plataformas';
import { AdaptadorYoutube } from '@gerenciador/adaptador-youtube';
import { AdaptadorInstagram } from '@gerenciador/adaptador-instagram';
import { AdaptadorFacebook } from '@gerenciador/adaptador-facebook';
import { AdaptadorTiktok } from '@gerenciador/adaptador-tiktok';
import { AdaptadorKwai } from '@gerenciador/adaptador-kwai';
import { rotaPrincipal } from './Rotas_Sistema/Rota_Principal.js';

// 1. Inicializa e registra os 5 adaptadores no registro central
const registro = RegistroPlataformas.obterInstancia();
registro.registrarAdaptador(new AdaptadorYoutube());
registro.registrarAdaptador(new AdaptadorInstagram());
registro.registrarAdaptador(new AdaptadorFacebook());
registro.registrarAdaptador(new AdaptadorTiktok());
registro.registrarAdaptador(new AdaptadorKwai());

console.log(
  `✓ Adaptadores registrados: ${registro.listarPlataformasRegistradas().join(', ')}`
);

// 2. Configura a aplicação Express
const app = express();
const porta = process.env.PORTA_API || 3333;

app.use(cors());
app.use(express.json());

// 3. Monta rotas da API
app.use('/api', rotaPrincipal);

// 4. Servir interface web compilada (se existir a pasta dist)
const caminhosPossiveis = [
  path.resolve(process.cwd(), 'Aplicativos_Base/Interface_Web/dist'),
  path.resolve(process.cwd(), '../Interface_Web/dist'),
  path.resolve(__dirname, '../../Interface_Web/dist'),
  'D:/Gerenciador_Conteudo/Aplicativos_Base/Interface_Web/dist',
];
const caminhoDist = caminhosPossiveis.find((c) => fs.existsSync(c));

if (caminhoDist && fs.existsSync(caminhoDist)) {
  app.use(
    express.static(caminhoDist, {
      setHeaders: (res, caminhoArquivo) => {
        if (caminhoArquivo.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    })
  );
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(caminhoDist, 'index.html'));
    }
  });
  console.log(`✓ Interface Web servida estaticamente a partir de ${caminhoDist}`);
}

// 5. Inicia o servidor HTTP
app.listen(porta, () => {
  console.log(`🚀 Servidor API rodando em http://localhost:${porta}`);
  console.log(`🛡️ Modo: ${process.env.MOCK_MODE === 'true' ? 'MOCK_MODE (Simulado)' : 'PRODUÇÃO'}`);
});

export default app;
