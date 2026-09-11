import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const raizProjeto = path.resolve(__dirname, '..');

// 1. Coleta e validação de argumentos
const args = process.argv.slice(2);
let novaVersao = args[0] ? args[0].replace(/^v/i, '').trim() : '';
let mensagem = args.slice(1).join(' ').trim();

if (!novaVersao) {
  console.error('❌ Erro: informe o número da versão. Exemplo: node scripts/versionar_e_subir.js 1.0.1 "Ajustes de overlay e sincronização"');
  process.exit(1);
}

if (!mensagem) {
  mensagem = `Atualização para a versão ${novaVersao}`;
}

console.log('=====================================================');
console.log(`🚀 Iniciando Versionamento do Projeto: v${novaVersao}`);
console.log(`📝 Mensagem: ${mensagem}`);
console.log('=====================================================\n');

// 2. Atualizar todos os package.json do projeto
const caminhosPackageJson = [
  path.join(raizProjeto, 'package.json'),
  path.join(raizProjeto, 'Aplicativos_Base/Interface_Desktop/package.json'),
  path.join(raizProjeto, 'Aplicativos_Base/Interface_Web/package.json'),
  path.join(raizProjeto, 'Aplicativos_Base/Servidor_Api/package.json'),
  path.join(raizProjeto, 'Aplicativos_Base/Trabalhador_Fila/package.json'),
  path.join(raizProjeto, 'Pacotes_Modulos/Adaptador_Facebook/package.json'),
  path.join(raizProjeto, 'Pacotes_Modulos/Adaptador_Instagram/package.json'),
  path.join(raizProjeto, 'Pacotes_Modulos/Adaptador_Kwai/package.json'),
  path.join(raizProjeto, 'Pacotes_Modulos/Adaptador_Tiktok/package.json'),
  path.join(raizProjeto, 'Pacotes_Modulos/Adaptador_Youtube/package.json'),
  path.join(raizProjeto, 'Pacotes_Modulos/Banco_Dados/package.json'),
  path.join(raizProjeto, 'Pacotes_Modulos/Nucleo_Plataformas/package.json'),
  path.join(raizProjeto, 'Pacotes_Modulos/Processador_Midia/package.json'),
];

let totalArquivosAtualizados = 0;

for (const pkgPath of caminhosPackageJson) {
  if (fs.existsSync(pkgPath)) {
    try {
      const conteudo = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      conteudo.version = novaVersao;
      fs.writeFileSync(pkgPath, JSON.stringify(conteudo, null, 2) + '\n', 'utf8');
      console.log(`✓ Atualizado version: ${novaVersao} em ${path.relative(raizProjeto, pkgPath)}`);
      totalArquivosAtualizados++;
    } catch (e) {
      console.warn(`⚠️ Aviso: falha ao atualizar ${pkgPath}:`, e.message);
    }
  }
}

// 3. Atualizar constantes no código-fonte
const arquivoPrincipalDesktop = path.join(raizProjeto, 'Aplicativos_Base/Interface_Desktop/Codigo_Fonte/Principal.cjs');
if (fs.existsSync(arquivoPrincipalDesktop)) {
  let codigo = fs.readFileSync(arquivoPrincipalDesktop, 'utf8');
  codigo = codigo.replace(/const VERSAO_APP = ['"][^'"]+['"];/, `const VERSAO_APP = '${novaVersao}';`);
  fs.writeFileSync(arquivoPrincipalDesktop, codigo, 'utf8');
  console.log(`✓ Atualizado VERSAO_APP em Principal.cjs`);
}

const arquivoVisual = path.join(raizProjeto, 'Aplicativos_Base/Interface_Web/Codigo_Fonte/Aplicativo_Visual.tsx');
if (fs.existsSync(arquivoVisual)) {
  let codigo = fs.readFileSync(arquivoVisual, 'utf8');
  codigo = codigo.replace(/Gerenciador de Conteúdo - v[0-9.]+/g, `Gerenciador de Conteúdo - v${novaVersao}`);
  fs.writeFileSync(arquivoVisual, codigo, 'utf8');
  console.log(`✓ Atualizado título com v${novaVersao} em Aplicativo_Visual.tsx`);
}

const arquivoControladorGeral = path.join(raizProjeto, 'Aplicativos_Base/Servidor_Api/Codigo_Fonte/Controladores_Acao/Controlador_Geral.ts');
if (fs.existsSync(arquivoControladorGeral)) {
  let codigo = fs.readFileSync(arquivoControladorGeral, 'utf8');
  codigo = codigo.replace(/versao:\s*['"][^'"]+['"],/, `versao: '${novaVersao}',`);
  fs.writeFileSync(arquivoControladorGeral, codigo, 'utf8');
  console.log(`✓ Atualizado versao no Controlador_Geral.ts`);
}

// Atualizar badges em README.md e LEIA-ME.md
const arquivoReadme = path.join(raizProjeto, 'README.md');
if (fs.existsSync(arquivoReadme)) {
  let doc = fs.readFileSync(arquivoReadme, 'utf8');
  doc = doc.replace(/badge\/vers[aã%0-9A-F]+-[0-9.]+-blue/gi, `badge/vers%C3%A3o-${novaVersao}-blue`);
  fs.writeFileSync(arquivoReadme, doc, 'utf8');
  console.log(`✓ Atualizado badge de versão em README.md`);
}

const arquivoLeiaMe = path.join(raizProjeto, 'LEIA-ME.md');
if (fs.existsSync(arquivoLeiaMe)) {
  let doc = fs.readFileSync(arquivoLeiaMe, 'utf8');
  doc = doc.replace(/badge\/version-[0-9.]+-blue/gi, `badge/version-${novaVersao}-blue`);
  fs.writeFileSync(arquivoLeiaMe, doc, 'utf8');
  console.log(`✓ Atualizado badge de versão em LEIA-ME.md`);
}

// 4. Recompilar Interface Web se necessário
console.log('\n📦 Recompilando pacotes estáticos da Interface Web...');
try {
  execSync('npm.cmd run build', {
    cwd: path.join(raizProjeto, 'Aplicativos_Base/Interface_Web'),
    stdio: 'inherit',
  });
  console.log('✓ Interface Web compilada com sucesso.');
} catch (e) {
  console.warn('⚠️ Aviso: falha na compilação da Interface Web (continuando processo):', e.message);
}

// 5. Execução do fluxo Git
console.log('\n🌐 Executando sincronização com Git...');
const executarComando = (cmd) => {
  try {
    console.log(`> ${cmd}`);
    return execSync(cmd, { cwd: raizProjeto, stdio: 'inherit' });
  } catch (err) {
    console.warn(`Aviso no comando "${cmd}":`, err.message);
  }
};

// 5.1 Git Pull (se branch já existir remotamente)
try {
  execSync('git rev-parse --verify HEAD', { cwd: raizProjeto, stdio: 'ignore' });
  executarComando('git pull origin main --rebase || true');
} catch {
  console.log('ℹ️ Repositório inicial local sem commits prévios.');
}

// 5.2 Git Add
executarComando('git add .');

// 5.3 Git Commit
const mensagemCommit = `release(v${novaVersao}): ${mensagem}`;
executarComando(`git commit -m "${mensagemCommit}"`);

// 5.4 Git Tag
executarComando(`git tag -a "v${novaVersao}" -m "Versão ${novaVersao}: ${mensagem}" -f`);

// 5.5 Git Push
console.log('\n🚀 Enviando para o repositório remoto (origin main)...');
executarComando('git push -u origin main --tags');

console.log('\n=====================================================');
console.log(`✅ Projeto versionado para v${novaVersao} e enviado com sucesso ao Git!`);
console.log('=====================================================\n');
