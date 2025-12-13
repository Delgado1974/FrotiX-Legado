const fg = require("fast-glob");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const bootstrap4Regexes = [
    { pattern: /bootstrap@4/i, label: "bootstrap@4" },
    {
        pattern: /bootstrap(\.min)?\.css.*4\.\d+\.\d+/i,
        label: "CSS Bootstrap 4.x.x",
    },
    {
        pattern: /bootstrap(\.min)?\.js.*4\.\d+\.\d+/i,
        label: "JS Bootstrap 4.x.x",
    },
    { pattern: /\/bootstrap\/4\./i, label: "Caminho contendo /bootstrap/4." },
    { pattern: /form-group/, label: "Classe form-group (BS4)" },
    {
        pattern: /custom-(control|switch|checkbox|radio)/,
        label: "Custom controls (BS4)",
    },
    {
        pattern: /input-group-(prepend|append)/,
        label: "input-group-prepend/append",
    },
    { pattern: /col-(xs|sm|md|lg|xl)-\d+/, label: "Grid system col-* (BS4)" },
    { pattern: /invalid-feedback/, label: "Classe invalid-feedback" },
    { pattern: /was-validated/, label: "Classe was-validated" },
    {
        pattern:
            /btn-(outline-)?(primary|secondary|success|danger|warning|info|light|dark)/,
        label: "Classe btn-* do BS4",
    },
];

async function scanFiles(baseDir = process.cwd()) {
    const entries = await fg(
        ["**/*.{html,htm,js,ts,jsx,tsx,css,scss,sass,ejs,pug,php,cshtml,json}"],
        {
            cwd: baseDir,
            ignore: ["node_modules/**", ".git/**", "dist/**", "build/**"],
            absolute: true,
        }
    );

    const matches = [];

    for (const file of entries) {
        try {
            const content = fs.readFileSync(file, "utf-8");
            const fileMatches = [];

            bootstrap4Regexes.forEach(({ pattern, label }) => {
                if (pattern.test(content)) {
                    fileMatches.push(label);
                }
            });

            if (fileMatches.length > 0) {
                matches.push({
                    file,
                    reasons: fileMatches,
                });
            }
        } catch (err) {
            console.warn(`⚠️ Erro ao ler: ${file}`);
        }
    }

    return matches;
}

async function scanBrowser(
    url = "https://localhost:44340/intel/analyticsdashboard"
) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--ignore-certificate-errors"],
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const bsVersion = await page.evaluate(() => {
        return window.bootstrap?.Modal?.VERSION || "NÃO DETECTADO";
    });

    const scripts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("script[src]")).map(
            (s) => s.src
        );
    });

    const styles = await page.evaluate(() => {
        return Array.from(
            document.querySelectorAll('link[rel="stylesheet"]')
        ).map((l) => l.href);
    });

    await browser.close();

    return {
        version: bsVersion,
        scripts,
        styles,
    };
}

function generateReport(matches, browserInfo) {
    const now = new Date();
    const dateStr = now.toLocaleString();

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório Bootstrap 4</title>
  <style>
    body { font-family: Arial; padding: 2rem; background: #f8f8f8; }
    .box { background: #fff; margin: 1rem 0; padding: 1rem; border-left: 4px solid #e74c3c; }
    ul { margin-top: 0.5rem; }
    h2, h3 { color: #333; }
    code { background: #eee; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>📋 Relatório de Detecção do Bootstrap 4</h1>
  <p>Gerado em: ${dateStr}</p>
  <hr/>

  <h2>🧠 Versão detectada no navegador</h2>
  <p><strong>Bootstrap version:</strong> <code>${browserInfo.version}</code></p>

  <h3>📁 Scripts detectados:</h3>
  <ul>${browserInfo.scripts
      .map((src) => `<li><code>${src}</code></li>`)
      .join("")}</ul>

  <h3>🎨 Estilos detectados:</h3>
  <ul>${browserInfo.styles
      .map((href) => `<li><code>${href}</code></li>`)
      .join("")}</ul>

  <hr/>

  <h2>📄 Arquivos com possíveis referências</h2>
  ${
      matches.length === 0
          ? "<p>✅ Nenhuma referência textual direta encontrada.</p>"
          : matches
                .map(
                    (m) => `
      <div class="box">
        <strong>${m.file}</strong>
        <ul>${m.reasons.map((r) => `<li>${r}</li>`).join("")}</ul>
      </div>
    `
                )
                .join("")
  }

  <footer style="margin-top: 3rem; color: #aaa;">
    Node.js Copilot 🔨🤖🔧 – Widenex
  </footer>
</body>
</html>
`;

    fs.writeFileSync(path.join(process.cwd(), "bootstrap4-report.html"), html);
    console.log("📄 Relatório gerado com sucesso: bootstrap4-report.html");
}

(async () => {
    console.log("🔍 Iniciando escaneamento profundo...\n");

    const fileMatches = await scanFiles();
    const browserInfo = await scanBrowser(); // Usando a URL HTTPS correta

    generateReport(fileMatches, browserInfo);
})();
