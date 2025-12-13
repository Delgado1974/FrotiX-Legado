const fg = require("fast-glob");
const fs = require("fs");
const path = require("path");

const bootstrap4Regexes = [
    { pattern: /bootstrap@4/i, label: "bootstrap@4" },
    {
        pattern: /bootstrap\.min\.css.*4\.\d+\.\d+/i,
        label: "bootstrap.min.css com versão 4.x.x",
    },
    {
        pattern: /bootstrap\.css.*4\.\d+\.\d+/i,
        label: "bootstrap.css com versão 4.x.x",
    },
    {
        pattern: /\/bootstrap\/4\./i,
        label: "Caminho de pasta com /bootstrap/4.x",
    },
    { pattern: /form-group/, label: "Classe form-group (Bootstrap 4)" },
    {
        pattern: /custom-(control|switch|checkbox|radio)/,
        label: "Custom controls (Bootstrap 4)",
    },
    {
        pattern: /input-group-(prepend|append)/,
        label: "input-group-prepend ou append",
    },
    {
        pattern: /col-(xs|sm|md|lg|xl)-\d+/,
        label: "Grid system (col-xs, col-sm, etc)",
    },
    { pattern: /invalid-feedback/, label: "Classe invalid-feedback" },
    { pattern: /was-validated/, label: "Classe was-validated" },
    {
        pattern:
            /btn-(outline-)?(primary|secondary|success|danger|warning|info|light|dark)/,
        label: "Botões com classe btn-*",
    },
];

const scanForBootstrap4 = async (baseDir = process.cwd()) => {
    console.log(`🔍 Escaneando diretório: ${baseDir}\n`);

    const entries = await fg(
        ["**/*.{html,htm,js,ts,jsx,tsx,css,scss,sass,ejs}"],
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
            console.warn(`⚠️ Erro ao ler o arquivo: ${file}`);
        }
    }

    generateHtmlReport(matches);
};

const generateHtmlReport = (matches) => {
    const now = new Date();
    const dateStr = now.toLocaleString();

    const reportContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório - Bootstrap 4 Detecção</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 2rem;
      background-color: #f4f4f4;
    }
    h1 {
      color: #333;
    }
    .file {
      margin-bottom: 1rem;
      padding: 1rem;
      background: #fff;
      border-left: 4px solid #e74c3c;
      box-shadow: 0 0 3px rgba(0,0,0,0.1);
    }
    .reasons {
      margin-top: 0.5rem;
      padding-left: 1.2rem;
    }
    .reasons li {
      color: #555;
    }
    .footer {
      margin-top: 2rem;
      font-size: 0.85rem;
      color: #888;
    }
  </style>
</head>
<body>
  <h1>📋 Relatório de Detecção de Bootstrap 4</h1>
  <p>Gerado em: ${dateStr}</p>
  <hr/>
  ${
      matches.length === 0
          ? "<p>✅ Nenhuma referência ao Bootstrap 4 foi encontrada.</p>"
          : matches
                .map(
                    (match) => `
      <div class="file">
        <strong>${match.file}</strong>
        <ul class="reasons">
          ${match.reasons.map((reason) => `<li>${reason}</li>`).join("")}
        </ul>
      </div>
    `
                )
                .join("")
  }
  <div class="footer">Node.js Copilot - Widenex 🔨🤖🔧</div>
</body>
</html>
`;

    const reportPath = path.join(process.cwd(), "bootstrap4-report.html");
    fs.writeFileSync(reportPath, reportContent);
    console.log(`📄 Relatório salvo em: ${reportPath}`);
};

scanForBootstrap4();
