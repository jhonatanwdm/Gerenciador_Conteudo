---
description: Padrão obrigatório para versionar e subir novas versões do projeto para o repositório Git
globs: ["**/*"]
always_on: true
---

# Padrão Obrigatório de Publicação no Git

## 1. Gatilho de Execução
- O assistente **SOMENTE** deve subir o projeto para o Git sob o comando explícito:
  **"Nova versão do projeto"**
- Nunca subir commits ou push para o Git sem esse comando.

## 2. Entradas do Usuário
- **Diretório**: Diretório onde o projeto está localizado (padrão: `D:\Gerenciador_Conteudo`).
- **Número da versão**: Número da nova versão (ex: `1.0.1`, `1.1.0`).
- **Texto descritivo**: Texto explicativo em PT-BR que acompanhará a versão e o commit.

## 3. Idioma Obrigatório
- **SEMPRE EM PORTUGUÊS DO BRASIL (PT-BR), SEMPRE, SEMPRE, SEMPRE.**
- Mensagens de commit, tags, notas e respostas 100% em português brasileiro.

## 4. Fluxo Operacional
1. Executar `git pull origin main`.
2. Atualizar a versão do projeto em si:
   - `package.json` raiz e de todos os pacotes em `Aplicativos_Base/*` e `Pacotes_Modulos/*`.
   - Constantes de versão em `Principal.cjs`, `Aplicativo_Visual.tsx` e `Controlador_Geral.ts`.
3. Recompilar a interface web: `npm.cmd run build` em `Aplicativos_Base/Interface_Web`.
4. Executar `git add .`.
5. Executar `git commit -m "release(v<versao>): <texto descritivo>"`.
6. Executar `git tag -a "v<versao>" -m "Versão <versao>: <texto descritivo>" -f`.
7. Executar `git push origin main --tags` no repositório `https://github.com/jhonatanwdm/Gerenciador_Conteudo.git`.

## 5. Documentação Obrigatória
- Manter e subir sempre os dois arquivos:
  - `README.md`: **SEMPRE em Inglês (EN)**, documento padrão renderizado no GitHub em inglês.
  - `LEIA-ME.md`: **SEMPRE em Português do Brasil (PT-BR)**, documento em português brasileiro.
  - Ambos com links rápidos de alternância de idioma no topo.
