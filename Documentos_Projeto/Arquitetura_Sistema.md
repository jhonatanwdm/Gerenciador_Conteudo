# Arquitetura do Sistema: Gerenciador de Conteúdo Multi-Plataforma

## 1. Princípio Fundamental de Separação

O sistema quebra terminantemente a premissa de que a plataforma identifica o destino.

```
                  ┌──────────────────────┐
                  │    CONTEÚDO BASE     │
                  │  (Objeto Lógico #1)  │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   PUBLICAÇÃO AÇÃO    │
                  │  (Campanha / Disparo)│
                  └──────────┬───────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ DESTINO #1      │ │ DESTINO #2      │ │ DESTINO #3      │
│ YouTube         │ │ YouTube         │ │ Instagram       │
│ Canal Militar   │ │ Canal História  │ │ @operacaonolimite│
│ Status: SUCCESS │ │ Status: SUCCESS │ │ Status: SUCCESS │
└─────────────────┘ └─────────────────┘ └─────────────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ JOB #1          │ │ JOB #2          │ │ JOB #3          │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 2. Regra de Resiliência e Isolamento de Falhas
- Cada destino de publicação (`Destino_Publicacao`) possui ciclo de vida e estado completamente desacoplados.
- Se o canal do YouTube falhar por quota ou token (`AUTH_REQUIRED`), o destino do Instagram e TikTok continuam seu fluxo normalmente até o status `PUBLISHED`.
- A publicação mãe computa o status agregado: `SUCCESS`, `PARTIAL`, `PENDING` ou `FAILED`.

## 3. Chave de Idempotência
Para garantir que falhas de rede ou reinício de processos não gerem publicações duplicadas, todo destino possui chave única:
```
chave_idempotencia = `${conteudo_id}_${publicacao_id}_${social_account_id}`
```

## 4. Estrutura em Módulos Monorepo (PT-BR)
- `Aplicativos_Base/Servidor_Api`: Backend REST API em Node.js com Express e TypeScript.
- `Aplicativos_Base/Trabalhador_Fila`: Workers em background para processamento de filas e scheduler.
- `Aplicativos_Base/Interface_Web`: Painel visual em React, Vite e Tailwind CSS.
- `Aplicativos_Base/Interface_Desktop`: Janela nativa desktop em Electron com isolamento de processos e atalhos.
- `Pacotes_Modulos/Banco_Dados`: Prisma ORM com SQLite local e PostgreSQL.
- `Pacotes_Modulos/Nucleo_Plataformas`: Interfaces de adaptadores, resolvedor de capacidades e registro central.
- `Pacotes_Modulos/Adaptador_*`: Adaptadores isolados para YouTube, Instagram, Facebook, TikTok e Kwai.
- `Pacotes_Modulos/Processador_Midia`: Gerenciador de armazenamento e presets de vídeo FFmpeg.
