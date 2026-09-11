# Multi-Platform & Multi-Account Content Manager

<div align="center">

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg?style=for-the-badge)](https://github.com/jhonatanwdm/Gerenciador_Conteudo)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Electron](https://img.shields.io/badge/Electron-34.5-47848f?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2d3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](./LICENSE)

<br />

**[🌐 English Version (README.md)](./README.md)** &nbsp;|&nbsp; **[🇧🇷 Versão em Português (LEIA-ME.md)](./LEIA-ME.md)**

<p align="center">
  Enterprise-grade publishing, automation, and monitoring platform for multi-platform and multi-account social media distribution with fault tolerance, strict idempotency, and native desktop app experience.
</p>

</div>

---

## 🚀 Project Overview

The **Content Manager** fundamentally resolves a standard limitation of traditional social media management suites: **the destination target is not the platform itself, but the specific authenticated social account**.

A single logical content unit can be published simultaneously to:
- Multiple **YouTube** channels (e.g., Main Channel, Clips Channel, Secondary Channel);
- Multiple **Instagram** and **Facebook** pages and profiles;
- Multiple **TikTok** and **Kwai** accounts.

Every individual destination maintains a decoupled lifecycle, retry mechanism, configuration snapshots, and isolated error reporting.

---

## 🌟 Core Features

### 1. Destination Resilience & Fault Isolation
- **Isolated Failures**: If one YouTube account fails due to API quota limits or expired OAuth tokens, destinations targeting Instagram, Facebook, TikTok, and other channels continue processing uninterrupted up to the `PUBLISHED` state.
- **Dynamic Aggregate Status**: The overarching campaign dynamically tracks real-time progress (`SUCCESS`, `PARTIAL`, `PROCESSING`, `FAILED`).
- **Strict Idempotency Keys**: Defense-in-depth protection against duplicate posts during network reconnections and reprocessing triggers:
  ```
  idempotency_key = `${content_id}_${publication_id}_${social_account_id}`
  ```

### 2. Advanced Notification Center with Procedural Audio
- **Toast Notifications**: Categorized visual and audio alerts (Success, Error, Processing, Media, etc.).
- **Retractable Notification Drawer**: Persistent slide-out tray featuring unread badge indicators, category filter chips (`All`, `Success`, `Processes`, `Media`, `Copied`, `Warnings/Errors`) in a responsive layout, and instant session clearing.
- **Web Audio API Procedural Sound**: Studio-grade system audio tones synthesized on the fly via code without external audio asset downloads.

### 3. Synchronized Updater with Seamless Overlay
- **Zero-Flicker Reload**: The application handles data synchronization and frontend rebuild updates behind a continuous dark themed overlay card with spinning indicators and progress bars.
- **Session-Persisted Continuity**: State persists in `sessionStorage` across window reloads, eliminating white flashes and ensuring all CSS, DOM, and bundle updates are cleanly mounted before revealing the interface.

### 4. 5 Native Social Integrations
- **YouTube**: Long-form videos and Shorts upload with tags, category management, and privacy controls.
- **Instagram**: Feed and Reels posting with aspect ratio and media verification.
- **Facebook**: Page and professional profile publication with links and media galleries.
- **TikTok**: Short-form video distribution with metadata and caption validation.
- **Kwai**: High-speed vertical video ingestion pipeline.

---

## 🏛️ Monorepo Architecture

The project is architected as an organized, decoupled monorepo:

```
d:/Gerenciador_Conteudo/
├── Aplicativos_Base/
│   ├── Interface_Desktop/        # Native Electron desktop app with custom window frame & IPC
│   ├── Interface_Web/            # Modern SPA built with React 18, Vite, Tailwind CSS & Lucide
│   ├── Servidor_Api/             # REST API in Node.js with Express & TypeScript
│   └── Trabalhador_Fila/         # Background queue workers and task scheduler
├── Pacotes_Modulos/
│   ├── Adaptador_Facebook/       # Facebook Graph API connector
│   ├── Adaptador_Instagram/      # Instagram Graph API connector
│   ├── Adaptador_Kwai/           # Kwai Open API connector
│   ├── Adaptador_Tiktok/         # TikTok Content Posting API connector
│   ├── Adaptador_Youtube/        # YouTube Data API v3 connector
│   ├── Banco_Dados/              # Prisma ORM schema with SQLite & PostgreSQL support
│   ├── Nucleo_Plataformas/       # Interfaces, capabilities resolver, and adapter registry
│   └── Processador_Midia/        # FFmpeg media processing engine and platform presets
├── Configuracoes_Sistema/        # Environment configurations and variables
├── Documentos_Projeto/           # Architecture, installation, and user documentation
├── Infraestrutura_Sistema/       # Docker Compose, native WebView2 binaries, and visual assets
├── Iniciar_Aplicativo.exe        # Single-click native launcher for Windows
└── scripts/
    └── versionar_e_subir.js      # Official Git versioning and release deployment script
```

---

## ⚙️ Installation & Getting Started

### Prerequisites
- **Node.js**: Version 20 or higher
- **NPM**: Version 10 or higher
- **Git**: Configured in your environment

### 1. Install Dependencies
In the root directory of the project:
```bash
npm.cmd install
```

### 2. Local Database Initialization
Generate Prisma client artifacts and seed initial platforms and social accounts:
```bash
npm.cmd run banco:gerar
npm.cmd run banco:migrar
npm.cmd run banco:semear
```

### 3. Running Services

Start each service in individual terminal instances:

```bash
# 1. REST API Server (port 3333)
npm.cmd run iniciar:servidor

# 2. Queue Background Worker
npm.cmd run iniciar:trabalhador

# 3. Native Desktop Application (Electron)
npm.cmd run iniciar:desktop
```

---

## ⚡ Quick 1-Click Launch (`Iniciar_Aplicativo.exe`)

For daily desktop use on Windows, the project root includes:
- **`Iniciar_Aplicativo.exe`**

Double-clicking this executable:
1. Spawns the REST API and Queue Workers in the background automatically.
2. Opens the native desktop window with an integrated loading screen.
3. Automatically shuts down all background processes and cleans up system resources upon exit.

---

## 🔄 Versioning and Git Publication Standards

This repository follows strict release protocols:
- Code pushes to Git **never** occur automatically during standard development.
- Release publication is triggered explicitly by the user command:
  > **`Nova versão do projeto`** followed by version number and release notes.
- The workflow updates monorepo `package.json` manifests, source code version constants (`Principal.cjs`, `Aplicativo_Visual.tsx`, `Controlador_Geral.ts`), builds static assets, and pushes commits and tags strictly formatted in Brazilian Portuguese (PT-BR):
```bash
npm run nova-versao -- 1.1.0 "Novas atualizações e correções críticas"
```

---

## 📄 License

This project is licensed under the **MIT License**. See the license documentation for details.

<div align="center">
  <sub>Engineered with technical precision by <strong>Jhonatan</strong>.</sub>
</div>
