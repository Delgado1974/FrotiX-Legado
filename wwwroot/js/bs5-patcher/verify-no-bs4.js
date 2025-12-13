#!/usr/bin/env node
/**
 * verify-no-bs4.js
 * Verifica se o arquivo de saída contém qualquer traço do Bootstrap 4.
 * Uso:
 *   node verify-no-bs4.js [<arquivo>]
 * Default:
 *   D:\_Projeto FrotiXCompleto 2025\FrotiXSite.New\wwwroot\js\vendors.bundle.bs5.js
 */
const fs = require('fs');
const path = require('path');

const DEFAULT =
    'D:\\_Projeto FrotiXCompleto 2025\\FrotiXSite.New\\wwwroot\\js\\vendors.bundle.bs5.js';
const file = (process.argv[2] && process.argv[2].trim()) || DEFAULT;

if (!fs.existsSync(file)) {
    console.error(`[ERRO] Arquivo não encontrado:\n  ${file}`);
    process.exit(2);
}

const txt = fs.readFileSync(file, 'utf8');

// Assinaturas fortes de BS4
const hard = [
    /Bootstrap v4\.[\d.]+/i,
    /version["']?\s*[:=]\s*["']4\./i,
    /bootstrap@4(\.|-)/i,
    /bs\.tooltip[^]*?VERSION[^]*?4\./i,
    /bs\.popover[^]*?VERSION[^]*?4\./i,
    /bs\.modal[^]*?VERSION[^]*?4\./i,
];
// Assinaturas neutras (apenas aviso): atributos HTML antigos podem estar no seu HTML
const soft = [/data-toggle=/i, /data-target=/i];

let fails = [];
let warns = [];

hard.forEach((re) => {
    if (re.test(txt)) fails.push(`Encontrado padrío BS4: ${re}`);
});
soft.forEach((re) => {
    if (re.test(txt))
        warns.push(
            `Possível markup legado em algum lugar: ${re} (sugestão: migre para data-bs-*)`
        );
});

if (warns.length) {
    console.warn('[verify] Avisos (não bloqueiam):');
    warns.forEach((w) => console.warn('  - ' + w));
}

if (fails.length) {
    console.error(
        '[verify] FALHA: foram encontrados traços de Bootstrap 4 no arquivo.'
    );
    fails.forEach((f) => console.error('  - ' + f));
    process.exit(1);
}

console.log('[verify] OK: sem traços de Bootstrap 4 detectados.');
