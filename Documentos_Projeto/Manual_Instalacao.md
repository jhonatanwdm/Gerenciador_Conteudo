# Manual de Instalação e Execução

O sistema foi preparado para rodar imediatamente tanto em desenvolvimento local ágil (usando SQLite embutido e Node.js) quanto em infraestrutura completa de contêineres Docker (PostgreSQL, Redis e MinIO).

---

## 1. Pré-requisitos
- **Node.js**: Versão 20+ ou 26+
- **NPM**: Versão 10+
- *(Opcional)*: Docker e Docker Compose para ambiente PostgreSQL/Redis

---

## 2. Passo a Passo de Instalação Rápida

### Passo 1: Instalação das Dependências
Na pasta raiz do projeto:
```bash
npm.cmd install
```

### Passo 2: Inicialização e Semente do Banco de Dados
Gera os clientes Prisma e semeia as 5 plataformas e contas de teste:
```bash
npm.cmd run banco:gerar
npm.cmd run banco:migrar
npm.cmd run banco:semear
```

### Passo 3: Iniciar o Servidor API (Backend)
```bash
npm.cmd run iniciar:servidor
```
O servidor estará acessível em `http://localhost:3333/api/sistema/saude`.

### Passo 4: Iniciar o Processador de Filas (Worker)
Em outro terminal:
```bash
npm.cmd run iniciar:trabalhador
```

### Passo 5: Iniciar o Aplicativo Desktop (Electron)
Em outro terminal:
```bash
npm.cmd run iniciar:desktop
```
A janela nativa desktop do Electron abrirá imediatamente conectada ao servidor local.

---

## 3. Inicialização Rápida com 1 Clique (Executável)

Na raiz do projeto, dê um duplo clique no executável:
- **`Iniciar_Aplicativo.exe`**

Ele iniciará automaticamente o Servidor API e o Trabalhador de Filas em segundo plano com tela de carregamento integrada e abrirá a aplicação em janela nativa dedicada no **Electron**. Ao fechar a janela, todos os processos em segundo plano são encerrados de forma limpa.

