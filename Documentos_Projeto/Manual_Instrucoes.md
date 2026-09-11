# Gerenciador de Conteúdo Multi-Plataforma & Multi-Conta

Plataforma profissional de automação, gerenciamento, agendamento, publicação, métricas e repostagem de conteúdo para redes sociais (**YouTube, Instagram, Facebook, TikTok e Kwai**).

Construída sob a regra de ouro arquitetural:
$$\text{Plataforma} \neq \text{Conta} \quad\mid\quad \text{Conteúdo} \neq \text{Publicação} \quad\mid\quad \text{Publicação} \neq \text{Destino}$$

---

## ⚡ Diferenciais de Engenharia
1. **Multi-Conta Real:** Gerencia $N$ canais e contas independentes por plataforma com credenciais OAuth 2.0 cifradas em AES-256.
2. **Isolamento de Falhas:** A falha de um canal no YouTube ou TikTok nunca cancela nem contamina as publicações do Instagram ou Facebook.
3. **Snapshot de Destinos:** Agendamentos preservam exatamente as contas marcadas no momento da criação, impedindo postagens acidentais em contas conectadas posteriormente.
4. **Idempotência Rigorosa:** Chaves únicas `(conteudo_id + publicacao_id + social_account_id)` impedem publicações duplicadas em caso de reexecução de workers.
5. **Modo Simulado (`MOCK_MODE=true`):** Permite teste e operação de 100% da plataforma e dashboards mesmo antes de cadastrar chaves reais das plataformas.

---

## 📂 Estrutura Padronizada em Português (PT-BR)

Todas as pastas e arquivos de código do projeto seguem o padrão `Primeiro_Segundo`:

- `Aplicativos_Base/Servidor_Api`: Backend REST API em Node.js / Express
- `Aplicativos_Base/Trabalhador_Fila`: Workers assíncronos e verificação de agendamentos
- `Aplicativos_Base/Interface_Web`: Painel administrativo React + Vite + Tailwind Dark Theme
- `Aplicativos_Base/Interface_Desktop`: Janela nativa desktop em Electron
- `Pacotes_Modulos/Banco_Dados`: Schema relacional Prisma com 30 tabelas estruturadas
- `Pacotes_Modulos/Nucleo_Plataformas`: Interfaces de adaptadores, resolvedor de capacidades e registro central
- `Pacotes_Modulos/Adaptador_Youtube`: YouTube Data API v3 + Mock
- `Pacotes_Modulos/Adaptador_Instagram`: Meta Graph API (Instagram Pro) + Mock
- `Pacotes_Modulos/Adaptador_Facebook`: Meta Graph API (Páginas) + Mock
- `Pacotes_Modulos/Adaptador_Tiktok`: TikTok Content Posting API + Mock
- `Pacotes_Modulos/Adaptador_Kwai`: Kwai Open API + Fallback de capacidades
- `Pacotes_Modulos/Processador_Midia`: Abstração de armazenamento e presets de vídeo FFmpeg

---

## 🚀 Como Executar

Consulte o [Manual de Instalação](file:///d:/Gerenciador_Conteudo/Documentos_Projeto/Manual_Instalacao.md) para o guia completo passo a passo.

### Opção A: Executável de 1 Clique (Recomendado no Windows)
Dê um duplo clique no arquivo **`Iniciar_Aplicativo.exe`** na raiz da pasta. Ele iniciará a API, o worker e abrirá a janela nativa do **Electron** automaticamente.

### Opção B: Via Terminal / Linha de Comando
```bash
# 1. Instalar dependências
npm.cmd install

# 2. Configurar banco e semente com contas demonstrativas
npm.cmd run banco:gerar
npm.cmd run banco:migrar
npm.cmd run banco:semear

# 3. Executar o backend
npm.cmd run iniciar:servidor

# 4. Executar o worker
npm.cmd run iniciar:trabalhador

# 5. Executar o aplicativo Desktop (Electron)
npm.cmd run iniciar:desktop
```
