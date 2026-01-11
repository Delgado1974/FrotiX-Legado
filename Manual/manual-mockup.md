# 📚 MANUAL MOCKUP - Base de Conhecimento FrotiX

> **Criado em**: 2026-01-09  
> **Atualizado**: 2026-01-10  
> **Fase**: FASE 1 - Pesquisa e Aprendizado  
> **Status**: Em construção

---

## 🎯 OBJETIVO

Este documento serve como base de conhecimento para a conversão MD→HTML e criação do Manual Técnico completo do FrotiX. Ele mapeia todos os padrões técnicos, estruturais e visuais identificados no sistema.

---

## 📋 ÍNDICE

1. [Banco de Dados](#banco-de-dados)
2. [Padrões de Código C#](#padrões-de-código-c)
3. [Razor Pages](#razor-pages)
4. [JavaScript](#javascript)
5. [Controllers/API](#controllersapi)
6. [Design System](#design-system)
7. [Controles e Bibliotecas](#controles-e-bibliotecas)
8. [Sistemas Globais](#sistemas-globais)
9. [Diretrizes Visuais e Conversão HTML](#diretrizes-visuais-e-conversão-html)

---

## 🗄️ BANCO DE DADOS

### Padrão de Nomenclatura de Chaves Primárias

**Padrão**: `<NomeTabela>Id`

**Exemplos**:
- `AlertasFrotiXId` (tabela `AlertasFrotiX`)
- `ViagemId` (tabela `Viagem`)
- `MotoristaId` (tabela `Motorista`)
- `VeiculoId` (tabela `Veiculo`)
- `AbastecimentoId` (tabela `Abastecimento`)

**Tipo**: `Guid` (UNIQUEIDENTIFIER no SQL Server)

**Exceções**:
- `AspNetUsers` usa `Id` (string, padrão Identity)

### Tipos de Dados Principais

| Tipo C# | Tipo SQL | Uso |
|---------|----------|-----|
| `Guid` | `UNIQUEIDENTIFIER` | Chaves primárias |
| `string?` | `NVARCHAR(MAX)` ou `NVARCHAR(n)` | Textos |
| `DateTime?` | `DATETIME2` | Datas (nullable) |
| `TimeSpan?` | `TIME` | Horários |
| `bool?` | `BIT` | Booleanos (nullable) |
| `int?` | `INT` | Números inteiros (nullable) |
| `decimal?` | `DECIMAL` | Valores monetários |

### Chaves Compostas

Tabelas com chaves compostas identificadas:

- `VeiculoContrato`: `(VeiculoId, ContratoId)`
- `MotoristaContrato`: `(MotoristaId, ContratoId)`
- `VeiculoAta`: `(VeiculoId, AtaRegistroPrecosId)`
- `MediaCombustivel`: `(NotaFiscalId, CombustivelId, Ano, Mes)`
- `EncarregadoContrato`: `(EncarregadoId, ContratoId)`
- `LavadorContrato`: `(LavadorId, ContratoId)`
- `LavadoresLavagem`: `(LavadorId, LavagemId)`

### Views

Mais de 30 views configuradas como `HasNoKey()` no Entity Framework:

- `ViewAbastecimentos`
- `ViewViagens`
- `ViewManutencao`
- `ViewVeiculos`
- `ViewCustosViagem`
- `ViewViagensAgenda`
- E muitas outras...

**Uso**: Views são apenas para leitura, otimizadas para consultas complexas e dashboards.

### Stored Procedures

Principais SPs identificadas:

- Pipeline de viagens (job em etapas): `sp_NormalizarAbastecimentos` → `sp_CalcularConsumoVeiculos` → `sp_AtualizarPadroesVeiculos` → `sp_NormalizarViagens` → `sp_RecalcularCustosTodasViagens` (usa `sp_CalculaCustosViagem`) → `sp_AtualizarTodasEstatisticasViagem`/`sp_AtualizarEstatisticasViagem`.
- Estatísticas de abastecimento: `sp_AtualizarEstatisticasAbastecimentosMesAtual`, `sp_RecalcularEstatisticasAbastecimentos`, `sp_RecalcularEstatisticasAbastecimentosAnuais`, `sp_RecalcularTodasEstatisticasAbastecimentos`.
- Estatísticas de motoristas: `sp_AtualizarEstatisticasMesAtual`, `sp_RecalcularEstatisticasMotoristas`, `sp_RecalcularEstatisticasMotoristaUnico`, `sp_RecalcularTodasEstatisticasMotoristas`.
- Estatísticas de veículos: `sp_AtualizarEstatisticasVeiculosMesAtual`, `sp_RecalcularEstatisticasVeiculo*` (Geral/Categoria/Status/Modelo/Combustivel/Unidade/AnoFabricacao/UsoMensal/Rankings/Todas).
- Saneamento: `sp_Requisitante_TratarNulos`, `sp_TratarNulosTabela`, `sp_TratarNulosTodasTabelas`, `usp_PreencheNulos_Motorista`.
- Suporte: `sp_tr_SetString`, `sp_tr_GetString`, utilitários de lock (`sp_tr_AcquireLock`, `sp_tr_SetObject`, etc.).

---

## 💻 PADRÕES DE CÓDIGO C#

### Tratamento de Erros: `TratamentoErroComLinha`

**Padrão**: Uso extensivo de `Alerta.TratamentoErroComLinha()` em todos os try-catch.

**Assinatura**:
```csharp
Alerta.TratamentoErroComLinha(string arquivo, string metodo, Exception error)
```

**Exemplo**:
```csharp
try
{
    // código
}
catch (Exception error)
{
    Alerta.TratamentoErroComLinha("LoginController.cs", "Index", error);
    return View(); // padrão retornar View mesmo em erro
}
```

**Localização**: `Helpers/Alerta.cs`

### Binding em Razor Pages

**Padrão**: Uso de `[BindProperty]` para propriedades de formulário.

**Exemplo**:
```csharp
[BindProperty]
public Guid AlertasFrotiXId { get; set; }

[BindProperty]
public string Titulo { get; set; }
```

**Uso**: Propriedades marcadas com `[BindProperty]` são automaticamente populadas no `OnPost()`.

### UnitOfWork Pattern

**Padrão**: Acesso a dados via `IUnitOfWork` em vez de `DbContext` direto.

**Exemplo**:
```csharp
private readonly IUnitOfWork _unitOfWork;

public MyPageModel(IUnitOfWork unitOfWork)
{
    _unitOfWork = unitOfWork;
}

// Uso
var viagem = await _unitOfWork.Viagem.GetFirstOrDefaultAsync(v => v.ViagemId == id);
await _unitOfWork.Viagem.AddAsync(novaViagem);
await _unitOfWork.SaveAsync();
```

**Localização**: `Repository/UnitOfWork.cs`

---

## 🎨 RAZOR PAGES

### Estrutura Padrão

1. **Arquivo `.cshtml`**: View HTML/Razor
2. **Arquivo `.cshtml.cs`**: PageModel (classe code-behind)

**Exemplo**:
- `Pages/AlertasFrotiX/Upsert.cshtml` (View)
- `Pages/AlertasFrotiX/Upsert.cshtml.cs` (PageModel)

### Padrão de Métodos

**OnGet()**: Carrega dados iniciais, popula ViewData/ViewBag
**OnPost()**: Processa formulários, salva dados

**Exemplo**:
```csharp
public void OnGet(Guid? id)
{
    if (id.HasValue)
    {
        // Carrega dados existentes
    }
}

public async Task<IActionResult> OnPostAsync()
{
    // Processa POST
    if (ModelState.IsValid)
    {
        // Salva
        return RedirectToPage("./Index");
    }
    return Page();
}
```

### Uso de Controllers vs Binding Direto

**Padrão**:
- **Forms simples**: Binding direto via `[BindProperty]` + `OnPost()`
- **Operações complexas**: Via JavaScript → Ajax → Controllers
- **DataTables**: Via JavaScript → Ajax → Controllers (retorna JSON)

---

## 🚀 JAVASCRIPT

### Arquivos Separados

**Padrão**: JavaScript separado das páginas CSHTML (não inline).

**Estrutura**:
```
wwwroot/js/
├── cadastros/
│   ├── viagem.js
│   ├── motorista.js
│   └── veiculo.js
├── dashboards/
│   └── dashboard-*.js
└── alertasfrotix/
    └── alertas_*.js
```

**Inclusão**:
```cshtml
@section ScriptsBlock {
    <script src="~/js/cadastros/viagem.js" asp-append-version="true"></script>
}
```

### Interação JS → Controllers via Ajax

**Padrão**: Uso de jQuery `.ajax()` ou `.get()` / `.post()`.

**Exemplo**:
```javascript
$.ajax({
    url: '/api/AlertasFrotiX/ObterAlertasUsuario',
    type: 'GET',
    success: function(response) {
        // processa resposta
    },
    error: function(xhr, status, error) {
        Alerta.TratamentoErroComLinha('arquivo.js', 'funcao', error);
    }
});
```

**Retorno JSON padrão**:
```json
{
    "success": true,
    "data": [...],
    "message": "..."
}
```

### Tratamento de Erros em JavaScript

**Padrão**: `Alerta.TratamentoErroComLinha()` (espelha padrão C#).

**Exemplo**:
```javascript
try {
    // código
} catch (error) {
    Alerta.TratamentoErroComLinha('arquivo.js', 'funcao', error);
}
```

**Localização**: `wwwroot/js/alerta.js` ou `wwwroot/js/frotix-error-logger.js`

### Controles Syncfusion no JavaScript

**Acesso a instâncias**:
```javascript
const elemento = document.getElementById('lstMotorista');
if (elemento && elemento.ej2_instances && elemento.ej2_instances[0]) {
    const componente = elemento.ej2_instances[0];
    componente.value = 'valor';
}
```

**Função utilitária**:
```javascript
window.getSyncfusionInstance = function(id) {
    const el = document.getElementById(id);
    if (el && Array.isArray(el.ej2_instances) && el.ej2_instances.length > 0) {
        return el.ej2_instances[0];
    }
    return null;
};
```

**Localização**: `wwwroot/js/agendamento/utils/syncfusion.utils.js`

---

## 🎮 CONTROLLERS/API

### Estrutura de Controllers

**Padrão**: `[Route("api/[controller]")]` e `[ApiController]`

**Exemplo**:
```csharp
[Route("api/[controller]")]
[ApiController]
public class AlertasFrotiXController : ControllerBase
{
    // endpoints
}
```

### Métodos HTTP

**GET**: Consultas, listagens
**POST**: Criação
**PUT**: Atualização
**DELETE**: Exclusão

### Retorno JSON Padrão

**Sucesso**:
```json
{
    "success": true,
    "data": {...},
    "message": "..."
}
```

**Erro**:
```json
{
    "success": false,
    "error": "..."
}
```

### Envelope DataTables

Para listagens com paginação:

```json
{
    "data": [...],
    "recordsTotal": 100,
    "recordsFiltered": 50
}
```

---

## 🎨 DESIGN SYSTEM

### Cores Padrão FrotiX

**Extraídas de `wwwroot/css/frotix.css`**:

| Cor | Hex | Variável CSS | Uso |
|-----|-----|--------------|-----|
| Vinho | `#722F37` | `--vinho` | Botões, modais |
| Azul | `#325d88` | `--azul` | Headers, links |
| Terracota | `#A97B6E` | `--terracota` | Botões secundários |
| Verde | `#557570` | `--verde` | Status ativo |
| Laranja (Header) | `#b66a3d` | `--header-bg` | Headers HTML |
| Azul Petróleo (Code) | `#33465c` | `--code-bg` | Code snippets |

**Cores light**:
- `--vinho-light: #8B3A44`
- `--azul-light: #3d6f9e`
- `--terracota-light: #C08B7E`
- `--verde-light: #6A8A85`

### Estrutura HTML Base (Exemplo EndPoints)

**Header**:
```html
<header class="hero">
    <img src="../../Fontawesome/duotone/users.svg" alt="Users" />
    <div>
        <h1>Título</h1>
        <p class="subtitle">Subtítulo</p>
    </div>
</header>
```

**CSS Header**:
```css
.hero {
    background: var(--header-bg); /* #b66a3d */
    color: #fff;
    padding: 26px 28px;
    border-radius: var(--radius);
    box-shadow: 0 0 0 1px #000, 0 0 0 4px #fff, var(--shadow);
}
```

**Cards**:
```html
<section class="card">
    <div class="section-title">
        <img class="icon" src="../../Fontawesome/duotone/info.svg" alt="Info" />
        Título da Seção
    </div>
    <!-- conteúdo -->
</section>
```

**Code Snippets**:
```css
code {
    background: var(--code-bg); /* #33465c */
    color: #e9edf5;
    padding: 12px 14px;
    border-radius: 12px;
    display: block;
    white-space: pre-wrap;
}
```

### Ícones FontAwesome Duotone

**Caminho**: `../../Fontawesome/duotone/`

**Uso**:
```html
<img class="icon" src="../../Fontawesome/duotone/users.svg" alt="Users" />
```

**Tamanho padrão**: `18px` (ícones inline), `50px` (header)

### Botões Padrão

**Classes**:
- `.btn-fundo-laranja` - Botão principal laranja
- `.btn-header-orange` - Botão do header
- `.btn-azul` - Botão azul
- `.btn-vinho` - Botão vinho
- `.btn-verde` - Botão verde

**Efeito Ripple**: Automático em todos os botões (via `frotix.js`)

### Spinner/Loading

**Sistema global**: `window.FtxSpin`

**Uso**:
```javascript
FtxSpin.show('Carregando...');
FtxSpin.hide();
```

**Visual**: Logo FrotiX pulsando + barra de progresso

---

## 📦 CONTROLES E BIBLIOTECAS

### Syncfusion EJ2

**Uso principal**: Controles de UI (ComboBox, DatePicker, RichTextEditor, etc.)

**CDN**:
```html
<script src="https://cdn.syncfusion.com/ej2/31.1.22/dist/ej2.min.js"></script>
```

**Inicialização**:
```javascript
var combo = new ej.dropdowns.ComboBox({
    dataSource: data,
    fields: { value: 'id', text: 'nome' }
});
combo.appendTo('#elemento');
```

**Acesso a instâncias**: Via `elemento.ej2_instances[0]`

### Telerik (Kendo UI)

**Uso principal**: Relatórios e campos de edição de texto (RichTextEditor)

**CDN**:
```html
<script src="https://kendo.cdn.telerik.com/2025.2.520/js/kendo.all.min.js"></script>
```

### FullCalendar

**Uso**: Sistema de Agenda (`Pages/Agenda/Index.cshtml`)

**Versão**: FullCalendar 6

**Integração**: Via endpoint `/api/Agenda/CarregaViagens`

### DataTables

**Uso**: Listagens com paginação, busca, ordenação

**Padrão**: Ajax via Controllers, retorna envelope `{ data, recordsTotal, recordsFiltered }`

---

## 🌐 SISTEMAS GLOBAIS

### Sistema de Agenda

**Localização**: `Pages/Agenda/Index.cshtml` + `Controllers/AgendaController.cs`

**Funcionalidades**:
- Visualização em calendário (FullCalendar)
- Agendamentos normais e recorrentes
- Transformação de agendamentos em viagens
- Validações complexas (conflitos, datas)

**Endpoints principais**:
- `GET /api/Agenda/CarregaViagens` - Carrega eventos para calendário
- `POST /api/Agenda/Agendamento` - Cria/atualiza agendamento

**Recorrência suportada**:
- Diária (D)
- Semanal (S)
- Quinzenal (Q)
- Mensal (M)

### Sistema de Alertas com Sino (SignalR)

**Localização**: 
- `Pages/AlertasFrotiX/` (páginas)
- `Controllers/AlertasFrotiXController.cs`
- `Hubs/AlertasHub.cs`
- `wwwroot/js/alertasfrotix/`

**Funcionalidades**:
- Alertas únicos e recorrentes
- Notificações em tempo real via SignalR
- Modal popup com alertas não lidos
- Badge no navbar com contador
- Recorrência: Diária, Semanal, Quinzenal, Mensal, Dias Variados

**Tipos de Exibição**:
- `Ao abrir o sistema` (único)
- `Recorrente - Diário` (seg-sex)
- `Recorrente - Semanal`
- `Recorrente - Quinzenal`
- `Recorrente - Mensal`
- `Recorrente - Dias Variados`

**SignalR Events**:
- `NovoAlerta` - Novo alerta criado
- `AtualizarBadgeAlertas` - Atualiza contador
- `ExibirAlertasIniciais` - Carrega alertas ao abrir sistema

### Sistema de Tooltips e Toasts

**Tooltips Syncfusion**: `wwwroot/js/syncfusion_tooltips.js`

**Toasts**: Via `AppToast.show()` ou biblioteca Notyf

**Global Toast Service**: `Services/ToastService.cs`

---

## 🖼️ DIRETRIZES VISUAIS E CONVERSÃO HTML

### Layout e nomenclatura
- Páginas pensadas para A4 (impressão/PDF). Se exceder, dividir em `A4.01`, `A4.02`, etc.
- Nome do arquivo: `(<Diretorio>) <NomeArquivo>A4XX.html` (ex.: `(Controllers) HomeControllerA401.html`).
- Nunca remover os `.md`; gerar `.html` correspondentes em ordem alfabética por diretório/arquivo.

### Header/hero padrão
- Fundo laranja telha `#b66a3d`, texto branco, borda dupla (preto fino + branco mais espesso).
- Ícone FontAwesome duotone grande (SVG em `Fontawesome/duotone/`), fonte bold tipo Outfit/Optimum.
- Fundo da página cinza-claro para destacar o contorno branco.

### Paleta e superfícies
- Paleta base: Vinho `#722F37`, Azul `#325d88`, Terracota `#A97B6E`, Verde `#557570`; variantes claras `#8B3A44`, `#3d6f9e`, `#C08B7E`, `#6A8A85`; header `#b66a3d`; code-bg petróleo `#33465c`.
- Cards brancos com sombra suave (`0 20px 45px -18px rgba(0,0,0,.35)`), radius ~14px; grid responsivo `minmax(320px, 1fr)` adequando-se ao A4.
- Snippets: fundo `#33465c`, texto claro, `pre-wrap`, padding 12–14px; evitar fundo preto.

### Botões e interações
- Botão laranja (`.btn-header-orange`/`.btn-fundo-laranja`): fundo marrom/laranja, borda preta + outline branco 2px, hover mais escuro.
- Respeitar automações do `frotix.js`: ripple, spinner (`data-ftx-spin`), loading (`data-ftx-loading`), altura padrão 38px de inputs.

### Ícones e cards
- Uso generoso de duotones em headers e cards sem poluir; cada card com ícone temático.
- Narrativa em prosa leve, com trechos de código explicando fluxos técnicos.

### Placeholders e referências
- Inserir marcadores para screenshots futuras (portfólio PDF).
- Referência visual: `Documentacao/EndPoints/UsersEndpoint.html` e `RolesEndpoint.html` (header, cards, cores inline).
- Assets base: `wwwroot/css/frotix.css` (cores, botões, modais, spinner, tooltips), `wwwroot/js/frotix.js`, `alerta.js`/`sweetalert_interop.js`, `global-toast.js`, `syncfusion_tooltips.js`.

---

## 📝 OBSERVAÇÕES ADICIONAIS

### Padrões de Arquivos JS

- Arquivos separados por funcionalidade
- Nomes em camelCase: `alertas_gestao.js`, `viagem_upsert.js`
- Funções globais quando necessário, mas preferência por módulos IIFE

### Validações

- Validação HTML5 (`required`, `type`, etc.)
- Validação jQuery Validate (quando presente)
- Validação server-side via Data Annotations (`[Required]`, `[StringLength]`, etc.)

### Segurança

- `[Authorize]` em Controllers e Pages
- Anti-forgery token via `[ValidateAntiForgeryToken]` ou header `X-CSRF-TOKEN`
- Claims do Identity para identificação de usuário

---

## 📊 REPOSITORY PATTERN

### Padrão de Repositories Específicos

**Estrutura Padrão**:
```csharp
public class {Entidade}Repository : Repository<{Entidade}>, I{Entidade}Repository
{
    private new readonly FrotiXDbContext _db;

    public {Entidade}Repository(FrotiXDbContext db) : base(db)
    {
        _db = db;
    }

    // Métodos específicos opcionais
}
```

**Categorias**:
1. **Cadastros Básicos**: Apenas herdam de `Repository<T>` (ex: `CombustivelRepository`)
2. **Com Métodos Específicos**: Adicionam métodos customizados (ex: `Get{Entidade}ListForDropDown()`)
3. **Views (Read-Only)**: Apenas leitura, consultas otimizadas (ex: `ViewAbastecimentosRepository`)
4. **Relacionamentos**: Tabelas de junção com chaves compostas (ex: `VeiculoContratoRepository`)

**Total**: ~207 arquivos (implementações + interfaces)

**Localização**: `Repository/` e `Repository/IRepository/`

---

## 🔧 SERVICES

### Serviços Principais

**Categorias**:
1. **Cálculos Financeiros**: `Servicos.cs`, `ServicosAsync.cs`, `GlosaService.cs`
2. **Estatísticas e Relatórios**: `VeiculoEstatisticaService.cs`, `ViagemEstatisticaService.cs`
3. **Notificações**: `ToastService.cs`, `MailService.cs`, `AlertasBackgroundService.cs`
4. **Utilitários**: `Validations.cs`, `LogService.cs`, `MotoristaFotoService.cs`

**Total**: 22 arquivos (100% documentados)

**Padrão**: Injeção de Dependência via `IOptions<T>`, métodos assíncronos para I/O

**Localização**: `Services/` e subdiretórios (`Pdf/`, `WhatsApp/`)

---

## 🛠️ HELPERS

### Helpers Principais

1. **Alerta.cs**: Tratamento de erros e alertas visuais (SweetAlert2)
2. **AlertaBackend.cs**: Logging estruturado backend-only
3. **ErroHelper.cs**: Geração de scripts JavaScript para alertas
4. **ImageHelper.cs**: Validação e redimensionamento de imagens
5. **ListasCompartilhadas.cs**: Classes helper para listas compartilhadas
6. **SfdtHelper.cs**: Conversão de documentos DOCX para PNG

**Total**: 6 arquivos (100% documentados)

**Localização**: `Helpers/`

---

## 🔄 MIDDLEWARES

### Middlewares Principais

1. **UiExceptionMiddleware.cs**: Captura exceções e decide JSON vs HTML
2. **ErrorLoggingMiddleware.cs**: Logging centralizado de erros

**Total**: 2 arquivos

**Padrão**: Middleware ASP.NET Core padrão, detecta tipo de requisição (AJAX vs HTML)

**Localização**: `Middlewares/`

---

## 📝 PADRÃO DE DOCUMENTAÇÃO MD

### Estrutura Padrão de Documentação

Todos os arquivos `.md` seguem este padrão:

```markdown
# Documentação: [Nome do Arquivo]

> **Última Atualização**: [Data]  
> **Versão Atual**: [Versão]

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
...

## Visão Geral

[Descrição geral da funcionalidade]

**Principais características:**
✅ [Característica 1]
✅ [Característica 2]
...

---

## Arquitetura
...

## Estrutura da Classe/Arquivo
...

## Métodos/Funcionalidades
...

## Interconexões
...

## Exemplos de Uso
...

## Troubleshooting
...

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

## [Data] - [Título]
...
```

### Padrão "FrotiX Simplificado"

Documentações seguem formato didático com:
- Objetivos claros no início
- Arquivos listados com Problema/Solução/Código
- Fluxos explicados passo a passo
- Troubleshooting simplificado

---

## 📚 ESTRUTURA DE DOCUMENTAÇÃO

### Estatísticas Gerais

| Categoria | Total | Documentados | Progresso |
|-----------|-------|--------------|-----------|
| **Pages** | ~290 | ~10 | 3.4% |
| **Controllers** | ~90 | ~90 | 100% |
| **Services** | ~30 | 22 | 73% |
| **Helpers** | 6 | 6 | 100% |
| **Middlewares** | 2 | 2 | 100% |
| **Models** | ~130 | 135 | 100% |
| **Repository** | ~207 | ~10 | 4.8% |
| **Data** | 5 | 5 | 100% |
| **JavaScript** | ~60 | 6 | 10% |
| **CSS** | 1 | 1 | 100% |
| **Banco de Dados** | ~40 | ~40 | 100% |
| **TOTAL** | **~861** | **~327** | **~38%** |

### Índices por Categoria

- `0-INDICE-GERAL.md` - Índice geral completo
- `Controllers/0-INDICE-CONTROLLERS.md` - Índice de controllers
- `Repository/0-INDICE-REPOSITORY.md` - Índice de repositories
- `Services/0-INDICE-SERVICES.md` - Índice de services
- `Helpers/0-INDICE-HELPERS.md` - Índice de helpers
- `Models/0-INDICE-MODELS.md` - Índice de models

---

## 🔄 PRÓXIMOS PASSOS

1. ✅ **FASE 1: Pesquisa e aprendizado** - **CONCLUÍDA**
   - ✅ Mapeamento de padrões técnicos completado
   - ✅ Estrutura de documentação identificada
   - ✅ Padrões visuais extraídos
   - ✅ Base de conhecimento consolidada
   
2. ⏳ **FASE 2: Conversão MD→HTML** - **PRONTA PARA INICIAR**
   - Converter todos os arquivos `.md` para `.html`
   - Manter padrão visual dos exemplos (`EndPoints/*.html`)
   - Preservar arquivos `.md` originais
   
3. ⏳ **FASE 3: Criação do Manual Técnico** - **AGUARDANDO FASE 2**
   - Criar manual técnico completo e organizado
   - Estrutura temática (não apenas alfabética)
   - Referências cruzadas aos HTMLs criados

---

## 📋 RESUMO DA FASE 1

### Padrões Mapeados

✅ **Banco de Dados**: Nomenclatura, tipos, chaves compostas, views, SPs  
✅ **C#**: Tratamento de erros, binding, UnitOfWork  
✅ **Razor Pages**: Estrutura padrão, métodos, Controllers vs binding  
✅ **JavaScript**: Arquivos separados, Ajax, tratamento de erros, Syncfusion  
✅ **Controllers/API**: Estrutura, métodos HTTP, retorno JSON  
✅ **Design System**: Cores, HTML base, ícones, botões, spinner  
✅ **Controles**: Syncfusion EJ2, Telerik, FullCalendar, DataTables  
✅ **Sistemas Globais**: Agenda, Alertas (SignalR), Tooltips/Toasts  
✅ **Repository**: Padrão de implementação, categorias  
✅ **Services**: Categorias, injeção de dependência  
✅ **Helpers**: Lista completa e funcionalidades  
✅ **Middlewares**: Funcionalidades e padrões  
✅ **Documentação**: Estrutura padrão MD, formato "FrotiX Simplificado"

### Base de Conhecimento

✅ Arquivo de referência criado: `Manual/manual-mockup.md`  
✅ Estrutura completa identificada  
✅ Padrões técnicos documentados  
✅ Estatísticas de documentação mapeadas  
✅ Pronto para iniciar FASE 2

---

**Última atualização**: 2026-01-10  
**Status**: ✅ **FASE 1 CONCLUÍDA (refinada)** - Base de conhecimento atualizada para conversão HTML
