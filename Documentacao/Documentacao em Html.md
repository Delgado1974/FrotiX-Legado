# PROMPT REFORMULADO: Conversão MD→HTML + Manual Técnico FrotiX

## 🎯 OBJETIVO GERAL
Converter todos os arquivos `*.md` em `*.html` (preservando os originais) no diretório `\Documentacao` e subdiretórios, e criar um Manual Técnico completo do FrotiX.

---

## 📋 FASE 1 - PESQUISA E APRENDIZADO (BASE DE CONHECIMENTO)

### **Antes de iniciar qualquer conversão, realize uma pesquisa completa:**

1. **Leia TODOS os arquivos `*.md` em `\Documentacao` e subdiretórios:**
   - Use `codebase_search` extensivamente para mapear padrões
   - Identifique estrutura de banco de dados: tabelas, views, triggers, stored procedures
   - Documente padrões de nomenclatura (ex: `ViagemId` sempre como `<NomeTabela>Id`)
   - Mapeie padrões Razor Pages: estrutura HTML/CS, binding, uso de Controllers
   - Identifique uso de controles Syncfusion vs Telerik
   - Documente padrão de arquivos JS separados das páginas CSHTML
   - Mapeie interação JS→Controllers via Ajax
   - Documente padrões específicos de controles Syncfusion (inicialização/execução)
   - Analise Controllers/API Endpoints: rotas, GET/PUT, tipos de retorno (JSON, etc.)
   - Documente padrão `TratamentoErroComLinha` (Try-Catch em C# e JS)
   - Analise sistema de Alertas (alerta.js, sweetalert_interop.js)
   - Documente sistema global Syncfusion de Tooltips e Toasts (global-toast.js, syncfusion_tooltips.js)
   - Analise sistema de Agenda (porta principal, FullCalendar, agendamentos normais/recorrentes, viagens)
   - Documente sistema de Alertas com "sino" (SignalR, modal popup, recorrência)
   - Identifique todos os padrões técnicos utilizados

2. **Analise padrões visuais e estruturais:**
   - Leia `wwwroot/css/frotix.css` para extrair cores padrão (botões, modais, tooltips)
   - Analise exemplos existentes: `Documentacao/EndPoints/UsersEndpoint.html` e `RolesEndpoint.html`
   - Documente estrutura de Header HTML (botão laranja padrão FrotiX)
   - Identifique cor de fundo de code snippets (azul petróleo escurecido ~20%)
   - Mapeie uso de ícones FontAwesome Duotone
   - Documente padrões de Cards, estilos de botões, modais, tela de espera com spinning
   - Analise `wwwroot/js/frotix.js` para funções globais

3. **Crie arquivo de referência:**
   - Salve resumo/insights no arquivo `\Manual\manual-mockup.md` no diretório raiz
   - Este arquivo servirá como base de conhecimento durante todo o processo

**IMPORTANTE:** Não inicie conversões até completar esta fase de aprendizado global.

---

## 📋 FASE 2 - CONVERSÃO MD → HTML (REFATORAMENTO VISUAL)

### **Após concluir a Fase 1, inicie a conversão sistemática:**

1. **Ordem alfabética por diretório:**
   - Percorra `\Documentacao` e subdiretórios em ordem alfabética
   - Para cada arquivo `*.md`, crie versão `*.html` correspondente
   - **NUNCA apague os arquivos `*.md` originais**

2. **Padrão de nomenclatura:**
   - Formato: `(<Diretorio>) <NomeArquivo>A4XX.html`
   - Exemplo: `(Controllers) HomeControllerA401.html`, `HomeControllerA402.html`
   - Se um item técnico não couber em uma página A4, crie múltiplos arquivos com sufixo `A4.01`, `A4.02`, `A4.03`, etc.

3. **Requisitos de formatação HTML:**
   - **Layout A4:** Largura e altura devem caber em folha A4 para impressão
   - **Header:** Usar padrão encontrado em `EndPoints/*.html` (botão laranja #b66a3d)
   - **Code snippets:** Fundo `#33465c` (azul petróleo ~20% mais escuro que padrão)
   - **Cards:** Uso extensivo de Cards com padrão FrotiX
   - **Cores:** Extrair de `frotix.css` (vinho #722F37, azul #325d88, terracota #A97B6E, verde #557570)
   - **Ícones:** FontAwesome Duotone (caminho: `../../Fontawesome/duotone/`)
   - **Estilos:** Botões, modais, tela de espera conforme `frotix.css`

4. **Qualidade do conteúdo:**
   - **Tom:** Prosa leve, como se estivesse escrevendo um conto (não texto técnico pesado)
   - **Termos técnicos:** Usar normalmente, mas explicar de forma acessível
   - **Melhorias:** Aproveitar conhecimento da Fase 1 para melhorar qualidade textual
   - **Facilidade de leitura:** Priorizar clareza e fluidez sobre formalismo técnico

5. **Estrutura HTML base:**
   ```html
   <!doctype html>
   <html lang="pt-BR">
   <head>
     <meta charset="utf-8" />
     <title>[Título] | FrotiX</title>
     <style>
       /* Variáveis CSS do padrão FrotiX */
       /* Estilos base dos exemplos EndPoints */
     </style>
   </head>
   <body>
     <header class="hero">
       <!-- Header com ícone e título -->
     </header>
     <main class="grid">
       <!-- Cards com conteúdo -->
     </main>
   </body>
   </html>
   ```

---

## 📋 FASE 3 - CRIAÇÃO DO MANUAL TÉCNICO DO FROTIX

### **Após conversão completa (Fase 2), criar manual organizado:**

1. **Estrutura do Manual:**
   - Organização por seções temáticas (não apenas alfabética)
   - Texto explicativo extenso para entendimento até de leigos
   - Termos técnicos, jargões e code-snippets incluídos naturalmente
   - Referências cruzadas aos arquivos HTML criados

2. **Conteúdo a incluir (baseado na Fase 1):**
   - **Banco de Dados:**
     - Estrutura: tabelas, views, triggers, stored procedures
     - Padrões de nomenclatura (`<NomeTabela>Id`)
     - Tipos de dados utilizados
   
   - **Razor Pages:**
     - Padrão de construção HTML e componente CS
     - Binding: quando usar e quando não usar
     - Uso de Controllers vs binding direto
   
   - **Controles:**
     - Syncfusion (maioria dos casos)
     - Telerik (relatórios e campos de edição de texto)
     - Padrões de inicialização e gerenciamento
   
   - **JavaScript:**
     - Arquivo JS separado da página CSHTML (preferência)
     - Interação JS→Controllers via Ajax
     - Particularidades de controles Syncfusion no JS
   
   - **Controllers/API Endpoints:**
     - Configuração de rotas
     - Métodos HTTP (GET, PUT, POST, DELETE)
     - Tipos de retorno (JSON, etc.)
   
   - **Padrões de Código:**
     - `TratamentoErroComLinha` (Try-Catch C# e JS)
     - Sistema de Alertas (alerta.js, sweetalert_interop.js)
   
   - **Sistemas Globais:**
     - Tooltips e Toasts Syncfusion (global-toast.js, syncfusion_tooltips.js)
     - Sistema de Agenda (FullCalendar, agendamentos, viagens)
     - Sistema de Alertas com sino (SignalR, modal popup, recorrência)
   
   - **Design System:**
     - Cores padrão FrotiX (extraídas de `frotix.css`)
     - Estilos de botões, modais, cards
     - Tela de espera com spinning
     - Funções globais (`frotix.js`)

3. **Formato do Manual:**
   - Arquivo(s) HTML no diretório `\Manual\`
   - Mesmo padrão visual dos arquivos convertidos
   - Estrutura navegável (índice, seções, referências)

---

## 🎯 DIRETRIZES GERAIS

- **Atualizações periódicas:** Informar progresso a cada 10-15 arquivos convertidos
- **Qualidade sobre velocidade:** Priorizar qualidade visual e textual sobre velocidade
- **Preservação:** Nunca deletar arquivos `*.md` originais
- **Consistência:** Manter padrão visual e estrutural em todos os arquivos
- **Documentação viva:** O manual será base para Portfólio da Solução FrotiX (próxima etapa)

---

## 🚀 COMO PROCEDER

1. **Confirmar entendimento** deste prompt reformulado
2. **Iniciar Fase 1** (pesquisa e aprendizado)
3. **Salvar insights** em `\Manual\manual-mockup.md`
4. **Iniciar Fase 2** (conversão MD→HTML em ordem alfabética)
5. **Atualizar periodicamente** sobre progresso
6. **Finalizar com Fase 3** (criação do Manual Técnico completo)

---

**Status:** ✅ Pronto para execução  
**Prioridade:** Pesquisa completa antes de iniciar conversões  
**Meta:** Documentação visual e manual técnico de alta qualidade
