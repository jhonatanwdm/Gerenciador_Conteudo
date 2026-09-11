import 'dotenv/config';
import { RegistroPlataformas } from '@gerenciador/nucleo-plataformas';
import { AdaptadorYoutube } from '@gerenciador/adaptador-youtube';
import { AdaptadorInstagram } from '@gerenciador/adaptador-instagram';
import { AdaptadorFacebook } from '@gerenciador/adaptador-facebook';
import { AdaptadorTiktok } from '@gerenciador/adaptador-tiktok';
import { AdaptadorKwai } from '@gerenciador/adaptador-kwai';
import clienteBanco from '@gerenciador/banco-dados';
import { TrabalhadorPublicacao } from './Trabalhador_Publicacao.js';
import { TrabalhadorSincronia } from './Trabalhador_Sincronia.js';

// 1. Registra os 5 adaptadores no processo worker
const registro = RegistroPlataformas.obterInstancia();
registro.registrarAdaptador(new AdaptadorYoutube());
registro.registrarAdaptador(new AdaptadorInstagram());
registro.registrarAdaptador(new AdaptadorFacebook());
registro.registrarAdaptador(new AdaptadorTiktok());
registro.registrarAdaptador(new AdaptadorKwai());

console.log('🤖 Processador de Filas e Trabalhador de Sincronia em Tempo Real (5s) iniciado.');

// 2. Loop de sincronização em tempo real e processamento a cada 5 segundos
setInterval(() => {
  TrabalhadorSincronia.executarSincronizacaoEmTempoReal();
}, 5000);

// Dispara o primeiro ciclo imediatamente
TrabalhadorSincronia.executarSincronizacaoEmTempoReal();

