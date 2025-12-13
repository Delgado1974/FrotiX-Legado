// scripts/verify-no-bs4.js
// Falha o build se houver qualquer "assinatura" clássica de Bootstrap 4 no bundle final.

const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) {
    console.error('Uso: node scripts/verify-no-bs4.js dist/vendors.bundle.js');
    process.exit(2);
}

const txt = fs.readFileSync(path.resolve(file), 'utf8');

// Padrões que caracterizam BS4 (sem exagerar para evitar falso positivo)
const patterns = [
    /Bootstrap v4\.[\d.]+/i, // cabeçalho minificado/comentado
    /version["']?\s*[:=]\s*["']4\./i, // VERSION = '4.x' ou "version":"4.x"
    /bootstrap@4(\.|-)/i, // referências a pacote 4.x
    /data-toggle=/i, // sinaliza HTML legado; aqui só avisa
    /bs\.tooltip.*VERSION.*4\./i, // assinaturas raras dentro de bundles
    /bs\.popover.*VERSION.*4\./i,
    /bs\.modal.*VERSION.*4\./i,
];

const hardFail = [];
const softWarn = [];

for (const re of patterns) {
    const found = re.exec(txt);
    if (found) {
        // "data-toggle=" não é fatal (pode vir do seu HTML, não do JS da lib)
        if (re.source === /data-toggle=/i.source) {
            softWarn.push(`Possível markup legado detectado: "${found[0]}"`);
        } else {
            hardFail.push(
                `Assinatura BS4 detectada: /${re.source}/ → "${found[0].slice(
                    0,
                    80
                )}"`
            );
        }
    }
}

if (softWarn.length) {
    console.warn('[verify-no-bs4] Avisos (não bloqueiam build):');
    softWarn.forEach((w) => console.warn('  - ' + w));
}

if (hardFail.length) {
    console.error(
        '[verify-no-bs4] FALHOU: foram encontradas referências de Bootstrap 4:'
    );
    hardFail.forEach((e) => console.error('  - ' + e));
    process.exit(1);
}

console.log('[verify-no-bs4] OK: nenhum traço de Bootstrap 4 encontrado.');
