# Gerenciador de Conteúdo Multi-Plataforma & Multi-Conta

<div align="center">

[![Versão](https://img.shields.io/badge/versão-1.1.0-blue.svg?style=for-the-badge)](https://github.com/jhonatanwdm/Gerenciador_Conteudo)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Electron](https://img.shields.io/badge/Electron-34.5-47848f?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2d3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Licença](https://img.shields.io/badge/Licença-MIT-green.svg?style=for-the-badge)](./LICENSE)

<br />

**[🇧🇷 Versão em Português (LEIA-ME.md)](./LEIA-ME.md)** &nbsp;|&nbsp; **[🌐 English Version (README.md)](./README.md)**

<p align="center">
  Plataforma profissional de publicação, automação e monitoramento de conteúdos para múltiplas plataformas e contas sociais independentes com tolerância a falhas, idempotência estrita e interface desktop nativa.
</p>

</div>

---

## 🚀 Visão Geral do Projeto

O **Gerenciador de Conteúdo** resolve de forma definitiva a limitação tradicional de ferramentas de automação social: **o destino da postagem não é a plataforma em si, mas a conta conectada específica**. 

Um único conteúdo lógico pode ser publicado simultaneamente em:
- Múltiplos canais de **YouTube** (ex: canal principal, canal de cortes e canal secundário);
- Múltiplas páginas ou perfis de **Instagram** e **Facebook**;
- Múltiplas contas de **TikTok** e **Kwai**.

Cada destino possui ciclo de vida, controle de retentativas, snapshots de configuração e tratamento de erro 100% isolados.

---

## 🌟 Principais Recursos

### 1. Resiliência e Isolamento de Destinos
- **Falhas Isoladas**: Se uma conta do YouTube falhar por quota ou token expirado, os envios para o Instagram, Facebook, TikTok e outras contas continuam operando normalmente até o status `PUBLISHED`.
- **Status Agregado Dinâmico**: A campanha calcula em tempo real o progresso global (`SUCCESS`, `PARTIAL`, `PROCESSING`, `FAILED`).
- **Chave de Idempotência Estrita**: Proteção contra publicações duplicadas em caso de reprocessamento ou falhas temporárias de rede:
  ```
  chave_idempotencia = `${conteudo_id}_${publicacao_id}_${social_account_id}`
  ```

### 2. Central de Notificações Avançada com Áudio Procedural
- **Notificações Flutuantes (Toasts)**: Avisos sonoros e visuais categorizados por tipo (Sucesso, Erro, Processamento, Mídias, etc.).
- **Gaveta Retrátil com Histórico**: Painel lateral dedicado com contagem de notificações não lidas, filtros por categoria (`Todas`, `Sucesso`, `Processos`, `Mídias`, `Copiados`, `Avisos/Erros`) em formato retangular responsivo e opções de limpeza instantânea.
- **Áudio Sintetizado via Web Audio API**: Sons de sistema profissionais gerados por código sem dependência de arquivos externos de áudio.

### 3. Sistema de Atualização Sincronizada com Overlay Contínuo
- **Overlay Sem Fissuras**: O processo de atualização sincroniza banco de dados e arquivos com overlay com spinner gradiente e barra de progresso.
- **Recarregamento Invisível**: O sistema persiste o estado na `sessionStorage`, recarrega os componentes e a janela nativa *por trás* do aviso da overlay sem tela branca e exibe o toast de sucesso ao concluir.

### 4. 5 Plataformas Nativas Integradas
- **YouTube**: Upload de vídeos longos e Shorts, tags, categorias e privacidade.
- **Instagram**: Postagem no Feed e Reels com verificação de proporção de mídia.
- **Facebook**: Publicação em Páginas e perfis profissionais com links e imagens.
- **TikTok**: Envio de vídeos curtos com verificação de metadados e legendas.
- **Kwai**: Distribuição em alta velocidade para vídeos verticais.

---

## 🏛️ Arquitetura Monorepo

O projeto é estruturado em monorepo modular e desacoplado:

```
d:/Gerenciador_Conteudo/
├── Aplicativos_Base/
│   ├── Interface_Desktop/        # Aplicativo Electron nativo com barra de título e IPC
│   ├── Interface_Web/            # SPA moderna em React 18, Vite, Tailwind CSS e Lucide
│   ├── Servidor_Api/             # API REST em Node.js com Express e TypeScript
│   └── Trabalhador_Fila/         # Processador de filas e agendamentos em background
├── Pacotes_Modulos/
│   ├── Adaptador_Facebook/       # Integração com Graph API Facebook
│   ├── Adaptador_Instagram/      # Integração com Instagram Graph API
│   ├── Adaptador_Kwai/           # Integração com Open API Kwai
│   ├── Adaptador_Tiktok/         # Integração com TikTok Content Posting API
│   ├── Adaptador_Youtube/        # Integração com YouTube Data API v3
│   ├── Banco_Dados/              # Esquema Prisma ORM com SQLite e PostgreSQL
│   ├── Nucleo_Plataformas/       # Interfaces, capacidades e registro de adaptadores
│   └── Processador_Midia/        # Processamento de mídia com FFmpeg e presets
├── Configuracoes_Sistema/        # Configurações de ambiente e variáveis
├── Documentos_Projeto/           # Manuais de instalação, instrução e arquitetura
├── Infraestrutura_Sistema/       # Docker Compose, DLLs nativas do WebView2 e ícones
├── Iniciar_Aplicativo.exe        # Launcher nativo de 1 clique para Windows
└── scripts/
    └── versionar_e_subir.js      # Utilitário oficial de versionamento e sincronia Git
```

---

## ⚙️ Instalação e Execução

### Pré-requisitos
- **Node.js**: Versão 20 ou superior
- **NPM**: Versão 10 ou superior
- **Git**: Configurado no ambiente

### 1. Instalação das Dependências
Na raiz do projeto:
```bash
npm.cmd install
```

### 2. Inicialização do Banco de Dados Local
Gera o cliente Prisma e popula as plataformas e contas iniciais:
```bash
npm.cmd run banco:gerar
npm.cmd run banco:migrar
npm.cmd run banco:semear
```

### 3. Execução dos Serviços

Você pode iniciar os serviços individualmente em terminais separados:

```bash
# 1. Servidor REST API (porta 3333)
npm.cmd run iniciar:servidor

# 2. Trabalhador de Filas (Background Worker)
npm.cmd run iniciar:trabalhador

# 3. Interface Desktop Nativa (Electron)
npm.cmd run iniciar:desktop
```

---

## ⚡ Inicialização Rápida com 1 Clique (`Iniciar_Aplicativo.exe`)

Para facilitar o uso no dia a dia no Windows, a raiz do projeto contém o executável:
- **`Iniciar_Aplicativo.exe`**

Ao clicar duas vezes nele:
1. O backend da API e os workers de fila são iniciados automaticamente em background.
2. A janela nativa abre com tela de carregamento integrada.
3. Ao fechar a aplicação, todos os processos são encerrados com liberação de recursos de memória.

---

## 🔄 Regra de Versionamento e Publicação no Git

O repositório segue a regra oficial estrita:
- O envio para o Git **nunca** acontece automaticamente em tarefas ordinárias.
- O envio é acionado com o comando:
  > **`Nova versão do projeto`** seguido do número da versão e da descrição.
- O versionamento atualiza todos os `package.json`, constantes de versão no código (`Principal.cjs`, `Aplicativo_Visual.tsx`, `Controlador_Geral.ts`), compila os pacotes e sobe commits e tags sempre em **PT-BR**:
```bash
npm run nova-versao -- 1.1.0 "Novas atualizações e correções críticas"
```

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**. Consulte o arquivo de licença para mais detalhes.

<div align="center">
  <sub>Desenvolvido com excelência técnica por <strong>Jhonatan</strong>.</sub>
</div>
