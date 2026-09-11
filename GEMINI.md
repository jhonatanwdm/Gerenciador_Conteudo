# Padrões e Diretrizes do Projeto: Gerenciador de Conteúdo

## 1. Regra Oficial de Publicação e Versionamento no Git

### 1.1 Gatilho Estrito de Execução
O envio e publicação para o Git **NUNCA** deve ocorrer de forma automática em tarefas comuns de desenvolvimento.
O envio para o repositório Git deve acontecer **EXCLUSIVAMENTE** quando o usuário utilizar o comando:
> **"Nova versão do projeto"**

### 1.2 Parâmetros Recebidos na Sequência
Sempre que o usuário enviar o comando **"Nova versão do projeto"**, ele informará (na mesma mensagem ou na sequência):
1. **Diretório do projeto**: caminho onde o projeto está localizado (padrão: `D:\Gerenciador_Conteudo`).
2. **Número da versão**: formato semântico (ex: `1.0.1`, `1.1.0`, `2.0.0`).
3. **Texto descritivo**: texto detalhado explicando o que foi feito ou alterado nesta versão.

### 1.3 Idioma Obrigatório: PT-BR
- **SEMPRE EM PORTUGUÊS DO BRASIL (PT-BR), SEMPRE, SEMPRE, SEMPRE.**
- Todas as mensagens de commit, anotações de tags, notas de versão e respostas ao usuário devem estar estritamente em português do Brasil.

### 1.4 Fluxo Operacional Obrigatório do Git
Sempre que subir uma nova versão para o Git:
1. **Git Pull**: Executar `git pull origin main` para sincronizar e evitar divergências com o repositório remoto.
2. **Versionamento Interno no Projeto**:
   - Atualizar o campo `"version"` em **todos** os `package.json` do monorepo:
     - Raiz (`package.json`)
     - Aplicativos Base: `Aplicativos_Base/Interface_Desktop`, `Aplicativos_Base/Interface_Web`, `Aplicativos_Base/Servidor_Api`, `Aplicativos_Base/Trabalhador_Fila`
     - Módulos: `Pacotes_Modulos/Adaptador_Facebook`, `Pacotes_Modulos/Adaptador_Instagram`, `Pacotes_Modulos/Adaptador_Kwai`, `Pacotes_Modulos/Adaptador_Tiktok`, `Pacotes_Modulos/Adaptador_Youtube`, `Pacotes_Modulos/Banco_Dados`, `Pacotes_Modulos/Nucleo_Plataformas`, `Pacotes_Modulos/Processador_Midia`
   - Atualizar a constante `VERSAO_APP` em `Aplicativos_Base/Interface_Desktop/Codigo_Fonte/Principal.cjs`.
   - Atualizar a versão do título em `Aplicativos_Base/Interface_Web/Codigo_Fonte/Aplicativo_Visual.tsx`.
   - Atualizar o campo `versao` no endpoint de saúde em `Aplicativos_Base/Servidor_Api/Codigo_Fonte/Controladores_Acao/Controlador_Geral.ts`.
3. **Recompilação da Interface**:
   - Executar `npm.cmd run build` na pasta `Aplicativos_Base/Interface_Web` para compilar os novos assets com a nova versão refletida.
4. **Git Add**:
   - Executar `git add .` para incluir a versão completa e íntegra do projeto.
5. **Git Commit**:
   - Criar commit estruturado e em PT-BR:
     `git commit -m "release(v<versao>): <texto descritivo>"`
6. **Git Tag**:
   - Criar tag da versão:
     `git tag -a "v<versao>" -m "Versão <versao>: <texto descritivo>" -f`
7. **Git Push**:
   - Enviar commits e tags para o repositório remoto oficial:
     `git push origin main --tags`
     (Repositório: `https://github.com/jhonatanwdm/Gerenciador_Conteudo.git`)

---

## 2. Utilitário Automatizado de Versionamento
O projeto possui o script automatizado para executar todo o ciclo de uma só vez:
```bash
node scripts/versionar_e_subir.js <numero_versao> "<texto_descritivo>"
```
Ou via npm script:
```bash
npm run nova-versao -- <numero_versao> "<texto_descritivo>"
```
