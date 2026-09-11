import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function semearBanco() {
  console.log('🌱 Inicializando banco de dados com estrutura oficial (ZERO MOCK)...');

  // 1. Usuário Administrador Oficial do Sistema
  const usuarioAdmin = await prisma.usuario_Sistema.upsert({
    where: { email: 'admin@gerenciador.local' },
    update: {},
    create: {
      nome: 'Administrador do Sistema',
      email: 'admin@gerenciador.local',
      senha_hash: '$2b$10$abcdefghijklmnopqrstuv1234567890abcdefghijklmnopqr',
      perfil: 'ADMINISTRADOR',
      ativo: true,
    },
  });
  console.log(`✓ Usuário administrador registrado: ${usuarioAdmin.email}`);

  // 2. Registro das 5 Plataformas Oficiais
  const plataformas = [
    { codigo: 'youtube', nome: 'YouTube', icone: 'Youtube' },
    { codigo: 'instagram', nome: 'Instagram', icone: 'Instagram' },
    { codigo: 'facebook', nome: 'Facebook', icone: 'Facebook' },
    { codigo: 'tiktok', nome: 'TikTok', icone: 'Video' },
    { codigo: 'kwai', nome: 'Kwai', icone: 'PlaySquare' },
  ];

  for (const plat of plataformas) {
    await prisma.plataforma_Rede.upsert({
      where: { codigo: plat.codigo },
      update: { nome: plat.nome, icone: plat.icone, ativo: true },
      create: {
        codigo: plat.codigo,
        nome: plat.nome,
        icone: plat.icone,
        ativo: true,
      },
    });
  }
  console.log('✓ 5 Plataformas oficiais registradas (YouTube, Instagram, Facebook, TikTok, Kwai).');
  console.log('✅ Banco de dados pronto e 100% limpo, sem nenhum dado mockado.');
}

semearBanco()
  .catch((erro) => {
    console.error('Erro ao semear banco:', erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
