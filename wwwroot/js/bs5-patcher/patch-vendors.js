#!/usr/bin/env node
/**
 * patch-vendors.js
 * Atualiza o vendors.bundle.js in-place: remove Bootstrap v4 e injeta Bootstrap 5 + shims jQuery→BS5.
 * Caminho FIXO (padrío) de entrada/saída:
 *   IN : D:\_Projeto FrotiXCompleto 2025\FrotiXSite.New\wwwroot\js\vendors.bundle.js
 *   OUT: D:\_Projeto FrotiXCompleto 2025\FrotiXSite.New\wwwroot\js\vendors.bundle.bs5.js
 *
 * Você pode sobrescrever via CLI:
 *   node patch-vendors.js "C:\\caminho\\entrada.js" "C:\\caminho\\saida.js"
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_IN = "D:\\_Projeto FrotiXCompleto 2025\\FrotiXSite.New\\wwwroot\\js\\vendors.bundle.js";
const DEFAULT_OUT = "D:\\_Projeto FrotiXCompleto 2025\\FrotiXSite.New\\wwwroot\\js\\vendors.bundle.bs5.js";

const inPath = (process.argv[2] && process.argv[2].trim()) || DEFAULT_IN;
const outPath = (process.argv[3] && process.argv[3].trim()) || DEFAULT_OUT;

function readUtf8(p) { return fs.readFileSync(p, 'utf8'); }
function writeUtf8(p, s) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s, 'utf8');
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function backupOriginal(srcPath) {
  const bk = srcPath.replace(/\.js$/i, `.backup-bs4-${timestamp()}.js`);
  fs.copyFileSync(srcPath, bk);
  return bk;
}

function loadBootstrap5Code() {
  const bs5Path = require.resolve('bootstrap/dist/js/bootstrap.bundle.min.js');
  return readUtf8(bs5Path);
}

// --- Shims jQuery -> BS5 (preserva $.fn.modal/tooltip/popover/collapse e fornece VERSION) ---
function getShimsCode() {
  return `
/*!
 * jQuery shims for Bootstrap 5 – mantém API $(el).modal(...), $(el).tooltip(...), etc.
 * Também define $.fn.modal.Constructor.VERSION = '5.3.8' para libs legadas (ex.: Bootbox).
 */
(function (win) {
  try {
    var $ = win.jQuery || win.$;
    // Em Bootstrap 5 bundle UMD, "bootstrap" fica disponível como global
    var bootstrapNS = win.bootstrap;
    if (!$ || !bootstrapNS) return;

    var map = {
      modal: bootstrapNS.Modal,
      tooltip: bootstrapNS.Tooltip,
      popover: bootstrapNS.Popover,
      collapse: bootstrapNS.Collapse
    };

    function ensureInstance(ClassRef, el, optsMaybe) {
      var inst = ClassRef.getInstance(el);
      if (!inst) {
        var opts = (optsMaybe && typeof optsMaybe === 'object') ? optsMaybe : {};
        inst = new ClassRef(el, opts);
      }
      return inst;
    }

    Object.keys(map).forEach(function (name) {
      var ClassRef = map[name];
      if (!ClassRef) return;

      if (!$.fn[name]) {
        var fn = function (arg) {
          var args = Array.prototype.slice.call(arguments, 1);
          this.each(function () {
            var inst = ensureInstance(ClassRef, this, (typeof arg === 'object' ? arg : undefined));
            if (typeof arg === 'string') {
              if (typeof inst[arg] === 'function') inst[arg].apply(inst, args);
              else {
                switch (arg) {
                  case 'show': inst.show(); break;
                  case 'hide': inst.hide(); break;
                  case 'toggle': if (name === 'collapse') inst.toggle(); else inst.show(); break;
                  case 'dispose': inst.dispose(); break;
                  // Chamadas comuns do BS4 que ainda existem no BS5:
                  case 'handleUpdate': if (typeof inst.handleUpdate === 'function') inst.handleUpdate(); break;
                }
              }
            }
          });
          return this;
        };
        $.fn[name] = fn;
        // Expor um "Constructor.VERSION" para código legado
        $.fn[name].Constructor = { VERSION: '5.3.8' };
      }
    });
  } catch (e) { /* silencioso */ }
})(window);
`;
}

// ---------- Localização e remoção do bloco Bootstrap 4 no vendors -------------
/**
 * Estratégia:
 *  A) Localiza o banner "/*! Bootstrap v4.x" e, logo depois, a IIFE UMD.
 *     Faz contagem de chaves { } ignorando strings/comentários/regex até fechar a função.
 *     Remove do início do banner até o sufixo "));" da IIFE.
 *  B) Se A falhar, tenta heurística por padrões de versão "VERSION='4." e remove um bloco amplo ao redor.
 */
function stripBootstrap4Block(txt) {
  const resultA = tryStrategyA(txt);
  if (resultA) return { code: resultA, strategy: 'A' };

  const resultB = tryStrategyB(txt);
  if (resultB) return { code: resultB, strategy: 'B' };

  return null;
}

function tryStrategyA(txt) {
  const bannerRe = /\/\*!?\s*Bootstrap v4\.[\d.]+[\s\S]*?\*\//g;
  const m = bannerRe.exec(txt);
  if (!m) return null;
  const start = m.index;
  const afterBanner = m.index + m[0].length;

  // Tenta localizar a função interna da UMD do Bootstrap 4
  // Ex.: "(function (exports, $, Popper) { 'use strict'; ..."
  let iifeIdx = txt.indexOf('function (exports', afterBanner);
  if (iifeIdx === -1) {
    // fallback: padrío alternativo
    iifeIdx = txt.indexOf('(function (exports, $, Popper)', afterBanner);
    if (iifeIdx === -1) return null;
  }
  const braceOpen = txt.indexOf('{', iifeIdx);
  if (braceOpen === -1) return null;

  const bodyEnd = matchClosingBrace(txt, braceOpen);
  if (bodyEnd === -1) return null;

  // procura "));" após o fechamento
  let tail = txt.indexOf('));', bodyEnd);
  if (tail === -1) tail = bodyEnd;

  const end = tail + 3; // inclui "));"

  const before = txt.slice(0, start);
  const after = txt.slice(end);
  return before + after;
}

// Scanner seguro para chaves, respeitando strings/comentários/regex
function matchClosingBrace(s, openIdx) {
  let i = openIdx;
  let depth = 0;
  let inStr = null; // ' " `
  let inRegex = false;
  let inBlockComment = false;
  let inLineComment = false;
  for (; i < s.length; i++) {
    const c = s[i];
    const c2 = s[i] + s[i + 1];

    if (inBlockComment) {
      if (c2 === '*/') { inBlockComment = false; i++; }
      continue;
    }
    if (inLineComment) {
      if (c === '\n' || c === '\r') inLineComment = false;
      continue;
    }
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (inRegex) {
      if (c === '\\') { i++; continue; }
      if (c === '/') inRegex = false;
      continue;
    }

    if (c2 === '/*') { inBlockComment = true; i++; continue; }
    if (c2 === '//') { inLineComment = true; i++; continue; }

    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }

    // detectar início de regex: após certos caracteres
    if (c === '/') {
      const prev = s[i - 1];
      if (!prev || /[\s;:{(,=+\-!&|?]/.test(prev)) { inRegex = true; continue; }
    }

    if (c === '{') {
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function tryStrategyB(txt) {
  // remove blocos que contenham assinaturas fortes de BS4
  const patterns = [
    /\/\*!?\s*Bootstrap v4\.[\d.]+[\s\S]*?\*\//g,
    /VERSION\s*=\s*['"]4\.[^'"]+['"]/g,
    /bs\.tooltip/g,
    /bs\.popover/g,
    /bs\.modal/g
  ];
  let idxs = [];
  patterns.forEach((re) => {
    let m;
    while ((m = re.exec(txt))) idxs.push([m.index, m.index + m[0].length]);
  });
  if (!idxs.length) return null;
  idxs.sort((a, b) => a[0] - b[0]);
  const first = idxs[0][0];
  const last = idxs[idxs.length - 1][1];

  // Corta de um pouco antes do primeiro até um pouco depois do último (janela ampla)
  const start = Math.max(0, first - 5000);
  const end = Math.min(txt.length, last + 5000);
  const before = txt.slice(0, start);
  const after = txt.slice(end);
  return before + after;
}

// ------------------------- Execução do patch -------------------------
(function main() {
  if (!fs.existsSync(inPath)) {
    console.error(`[ERRO] Arquivo de entrada não encontrado:\n  ${inPath}`);
    process.exit(2);
  }

  console.log('[patch] Lendo vendors.bundle.js…');
  const original = readUtf8(inPath);

  console.log('[patch] Fazendo backup do arquivo original…');
  const bk = backupOriginal(inPath);
  console.log(`        Backup criado: ${bk}`);

  console.log('[patch] Removendo bloco do Bootstrap 4…');
  const stripped = stripBootstrap4Block(original);
  if (!stripped) {
    console.error('[ERRO] Não foi possível localizar/remover o Bootstrap 4 automaticamente.');
    console.error('       O arquivo de backup foi mantido. Nenhuma alteração final aplicada.');
    process.exit(1);
  }

  console.log(`[patch] Estratégia usada: ${stripped.strategy}`);

  console.log('[patch] Carregando Bootstrap 5 (bundle) do node_modules…');
  const bs5Code = loadBootstrap5Code();

  console.log('[patch] Gerando arquivo final (vendors.bundle.bs5.js)…')
