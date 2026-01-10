# Diretrizes de Documentação - FrotiX Web

> **Última Atualização**: 08/01/2026  
> **Versão**: 2.0

---

# ⚠️ REGRA CRÍTICA - LEIA ANTES DE QUALQUER OPERAÇÃO ⚠️

## 🔴 ATUALIZAÇÃO OBRIGATÓRIA DE DOCUMENTAÇÃO

**TODAS AS INTELIGÊNCIAS ARTIFICIAIS DEVEM LER ESTA SEÇÃO ANTES DE COMEÇAR QUALQUER CONVERSA COM O AGENTE.**

### REGRA ABSOLUTA E INVIOLÁVEL:

**QUALQUER MUDANÇA EM QUALQUER ARQUIVO DOCUMENTADO DEVE SER ATUALIZADA E COMMITADA IMEDIATAMENTE.**

#### Arquivos que REQUEREM atualização imediata da documentação:

- ✅ **CSHTML** (Razor Pages) - Qualquer alteração em `.cshtml`
- ✅ **CSHTML.CS** (PageModel) - Qualquer alteração em `.cshtml.cs`
- ✅ **JAVASCRIPT** - Qualquer alteração em `.js` (especialmente em `wwwroot/js/`)
- ✅ **CONTROLLERS** - Qualquer alteração em `.cs` em `Controllers/`
- ✅ **HELPERS** - Qualquer alteração em `.cs` em `Helpers/`
- ✅ **REPOSITORY** - Qualquer alteração em `.cs` em `Repository/`
- ✅ **DATA** - Qualquer alteração em `.cs` em `Data/`
- ✅ **SERVICES** - Qualquer alteração em `.cs` em `Services/`
- ✅ **MIDDLEWARES** - Qualquer alteração em `.cs` em `Middlewares/`
- ✅ **MODELS** - Qualquer alteração em `.cs` em `Models/`
- ✅ **CSS** - Qualquer alteração em `.css`

#### Processo OBRIGATÓRIO após qualquer alteração:

1. **IDENTIFICAR** qual arquivo foi alterado
2. **LOCALIZAR** a documentação correspondente em `Documentacao/`
3. **ATUALIZAR** a documentação refletindo EXATAMENTE as mudanças feitas
4. **ATUALIZAR** a seção "PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES" com:
   - Data da alteração
   - Descrição do que foi alterado
   - Arquivos afetados
   - Impacto da mudança
5. **COMMITAR** imediatamente com mensagem: `docs: Atualiza documentação de [Nome do Arquivo] - [Breve descrição]`
6. **VERIFICAR** se o arquivo `0-INDICE-GERAL.md` precisa ser atualizado

#### ⚠️ CONSEQUÊNCIAS DE NÃO ATUALIZAR:

- **RISCO CRÍTICO**: Perda de sincronização entre código e documentação
- **RISCO ALTO**: Confusão em futuras manutenções
- **RISCO MÉDIO**: Retrabalho desnecessário
- **RISCO BAIXO**: Documentação desatualizada causando erros

#### 🎯 AUTOMAÇÃO RECOMENDADA:

Para evitar esquecimentos, configure:

1. **Git Hooks** (pre-commit): Script que verifica se documentação foi atualizada
2. **Scripts de Validação**: Verificar sincronização código ↔ documentação
3. **Lembretes Automáticos**: Notificações quando código muda sem atualizar docs

**EXEMPLO DE GIT HOOK (pre-commit)**:
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Verifica se arquivo foi alterado e se documentação existe
# Se existe, verifica se foi atualizada recentemente
# Se não foi atualizada, bloqueia commit com aviso
```

**EXEMPLO DE SCRIPT DE VALIDAÇÃO**:
```powershell
# Scripts/ValidarDocumentacao.ps1
# Compara data de modificação do código com data de modificação da documentação
# Alerta se documentação está desatualizada
```

#### 📌 LEMBRETE PARA IAs:

**ANTES DE FAZER QUALQUER ALTERAÇÃO:**
1. ✅ Ler esta seção completamente
2. ✅ Identificar arquivos que serão alterados
3. ✅ Verificar se existe documentação para esses arquivos
4. ✅ Planejar atualização da documentação junto com a alteração do código
5. ✅ Executar atualização da documentação IMEDIATAMENTE após alteração
6. ✅ Commitar código + documentação juntos

**NUNCA:**
- ❌ Alterar código sem atualizar documentação
- ❌ Commitar código sem atualizar documentação
- ❌ Deixar documentação desatualizada "para depois"
- ❌ Assumir que documentação está sincronizada sem verificar

---

## 📋 Princípios Fundamentais

### 1. Cobertura Universal
**TODOS os arquivos do projeto precisam de documentação individual:**

- ✅ **CSHTML** (Razor Pages) - Cada arquivo `.cshtml`
- ✅ **CSHTML.CS** (PageModel) - Cada arquivo `.cshtml.cs`
- ✅ **JAVASCRIPT** - Cada arquivo `.js` (especialmente em `wwwroot/js/`)
- ✅ **CONTROLLERS** - Cada arquivo `.cs` em `Controllers/`
- ✅ **HELPERS** - Cada arquivo `.cs` em `Helpers/`
- ✅ **REPOSITORY/IREPOSITORY** - Documentação conjunta por entidade (ex: `VeiculoRepository/IVeiculoRepository.md`)
- ✅ **DATA** - Cada arquivo `.cs` em `Data/`
- ✅ **SERVICES** - Cada arquivo `.cs` em `Services/`
- ✅ **MIDDLEWARES** - Cada arquivo `.cs` em `Middlewares/`
- ✅ **MODELS** - Cada arquivo `.cs` em `Models/` (quando relevante)
  - **IMPORTANTE**: Para Models que representam tabelas/views do banco, incluir:
    - Estrutura SQL completa da tabela/view (CREATE TABLE/VIEW)
    - Tabela comparativa campo a campo (Model ↔ Banco)
    - Tipo de dados de cada campo
    - Indicação se é tabela ou view
    - Chaves primárias, estrangeiras e índices
    - Constraints e validações do banco
    - **Triggers associados**: Listar todos os triggers da tabela e explicar sua função
    - **Stored Procedures relacionadas**: Referenciar procedures que operam nesta tabela (documentação separada em `Documentacao/Banco de Dados/Stored Procedures.md`)

### 🗄️ Diretrizes para Trabalho com Banco de Dados

#### ANTES de Criar/Alterar Funcionalidade que se Comunica com BD:

1. **Verificar se o campo existe no Model**:
   - Consultar o arquivo `.cs` do Model correspondente
   - Verificar se a propriedade existe e está mapeada corretamente

2. **Verificar se o Model está atualizado com a Tabela/View no Banco**:
   - Comparar estrutura do Model com a estrutura real da tabela/view no banco
   - Verificar tipos de dados, nullable, tamanhos, etc.
   - **Se não estiver atualizado**: 
     - ⚠️ **AVISAR ao usuário** que é necessária criação/alteração de campo/índice/trigger na tabela
     - Fornecer SQL completo para ser executado no banco
     - Atualizar o Model após a alteração no banco

#### ANTES de Implementar Função de Gravação (INSERT/UPDATE):

1. **Verificar se a tabela tem Triggers**:
   - Consultar triggers associados à tabela
   - Identificar triggers que podem causar erros no Entity Framework durante `Save()`
   - **Se houver triggers problemáticos**:
     - Implementar **bypass no código de acesso ao banco** sem alterar os triggers
     - Usar `ExecuteSqlRaw` ou `ExecuteSqlInterpolated` quando necessário
     - Documentar o motivo do bypass na documentação

#### Estrutura de Documentação de Banco de Dados

```
Documentacao/
└── Banco de Dados/
    ├── Stored Procedures.md          # Todas as Stored Procedures
    ├── Triggers.md                   # Todos os Triggers (opcional, pode estar junto com tabelas)
    └── Views.md                      # Todas as Views (opcional)
```

**Para cada Model de Tabela/View**, incluir seção:

```markdown
## Estrutura do Banco de Dados

### Tabela: `[NomeDaTabela]`

**Tipo**: Tabela / View

**SQL de Criação**:
```sql
CREATE TABLE dbo.[NomeDaTabela] (
  -- estrutura completa
)
```

**Mapeamento Model ↔ Banco**:

| Campo no Model | Campo no Banco | Tipo SQL | Tipo C# | Nullable | Descrição |
|----------------|----------------|----------|---------|----------|-----------|
| `ViagemId` | `ViagemId` | `uniqueidentifier` | `Guid` | ❌ | Chave primária |
| `DataInicial` | `DataInicial` | `datetime2` | `DateTime?` | ✅ | Data inicial da viagem |

**Chaves e Índices**:
- **PK**: `ViagemId` (CLUSTERED)
- **FK**: `VeiculoId` → `Veiculo(VeiculoId)`
- **IX**: `IX_Viagem_DataInicial` (DataInicial)

**Triggers Associados**:
- `tr_Viagem_AfterInsert`: Atualiza estatísticas após inserção
- `tr_Viagem_AfterUpdate`: Recalcula custos após atualização

**Stored Procedures Relacionadas**:
- `sp_CalcularCustoViagem`: Calcula custo total de uma viagem
- Ver `Documentacao/Banco de Dados/Stored Procedures.md` para detalhes
```

### 2. Arquivos JavaScript Específicos

Os seguintes arquivos JavaScript na raiz de `wwwroot/js/` devem ser documentados individualmente:
- `alerta.js`
- `frotix.js`
- `higienizarviagens_054.js`
- `sweetalert_interop.js`
- `syncfusion_tooltips.js`
- `global-toast.js`

**Arquivos em `wwwroot/js/cadastros/*.js`**: Todos devem ser documentados individualmente.

**Arquivos CSS**: `wwwroot/css/frotix.css` deve ser documentado.

### 3. Estrutura de Diretórios da Documentação

A pasta `Documentacao/` deve ser organizada em subdiretórios:

```
Documentacao/
├── 0-INDICE-GERAL.md                    # Índice principal (sempre atualizado)
├── Pages/                                # Documentação de Razor Pages
│   ├── Abastecimento/
│   ├── Viagens/
│   └── ...
├── Controllers/                          # Documentação de Controllers
│   ├── AbastecimentoController.md
│   ├── ViagemController.md
│   └── ...
├── Services/                             # Documentação de Services
│   ├── GlosaService.md
│   └── ...
├── Helpers/                              # Documentação de Helpers
│   ├── Alerta.md
│   └── ...
├── Middlewares/                          # Documentação de Middlewares
│   └── ...
├── Models/                               # Documentação de Models (quando relevante)
│   └── ...
├── Repository/                           # Documentação de Repositories
│   ├── VeiculoRepository-IVeiculoRepository.md
│   └── ...
├── Data/                                 # Documentação de Data/Context
│   └── ...
└── JavaScript/                           # Documentação de JavaScript
    ├── cadastros/
    │   ├── ViagemIndex.md
    │   └── ...
    ├── alerta.js.md
    ├── frotix.js.md
    └── ...
```

---

## 📝 Padrão de Documentação

### Estrutura Mínima (500+ linhas)

Cada arquivo de documentação deve seguir esta estrutura:

```markdown
# Documentação: [Nome do Arquivo/Funcionalidade]

> **Última Atualização**: DD/MM/AAAA
> **Versão Atual**: X.X

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Lógica de Negócio](#lógica-de-negócio)
5. [Interconexões](#interconexões)
6. [Endpoints API](#endpoints-api) (se aplicável)
7. [Frontend](#frontend) (se aplicável)
8. [Validações](#validações)
9. [Exemplos de Uso](#exemplos-de-uso)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral

**Descrição clara e objetiva** do que o arquivo/funcionalidade faz, escrita para leigos em TI.

### Características Principais
- ✅ **Funcionalidade 1**: Descrição
- ✅ **Funcionalidade 2**: Descrição
- ✅ **Funcionalidade 3**: Descrição

### Objetivo
Explicar em linguagem simples qual problema resolve e como ajuda o usuário final.

---

## Arquitetura

### Tecnologias Utilizadas
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| ASP.NET Core | 3.1+ | Backend |
| jQuery | 3.x | Manipulação DOM |
| Syncfusion EJ2 | - | Componentes UI |

### Padrões de Design
- Repository Pattern
- Dependency Injection
- SignalR para comunicação em tempo real

---

## Estrutura de Arquivos

### Arquivo Principal
```
Caminho/Completo/Do/Arquivo.cs
```

### Arquivos Relacionados
- `ArquivoRelacionado1.cs` - Descrição da relação
- `ArquivoRelacionado2.js` - Descrição da relação

---

## Lógica de Negócio

### Funções/Métodos Principais

#### Método: `NomeDoMetodo()`
**Localização**: Linha X do arquivo `Arquivo.cs`

**Propósito**: Explicação clara do que faz

**Parâmetros**:
- `parametro1` (tipo): Descrição
- `parametro2` (tipo): Descrição

**Retorno**: Tipo - Descrição

**Exemplo de Código**:
```csharp
public async Task<IActionResult> NomeDoMetodo(int id)
{
    // Explicação linha por linha do que acontece
    var dados = await _repository.ObterDados(id);
    
    // Por que essa validação existe
    if (dados == null)
        return NotFound();
    
    // O que acontece aqui e por quê
    return Ok(dados);
}
```

**Fluxo de Execução**:
1. Passo 1: O que acontece
2. Passo 2: O que acontece
3. Passo 3: O que acontece

**Casos Especiais**:
- **Caso A**: Quando X acontece, Y é executado porque...
- **Caso B**: Quando Z acontece, W é executado porque...

---

## Interconexões

### Quem Chama Este Arquivo
- `ControllerX.cs` → Chama `MetodoY()` quando o usuário faz ação Z
- `ServiceY.cs` → Usa este arquivo para processar dados de tipo W

### O Que Este Arquivo Chama
- `RepositoryZ.GetAll()` → Busca dados do banco
- `ServiceW.Processar()` → Processa lógica de negócio

### Fluxo de Dados
```
Usuário → Controller → Service → Repository → Banco de Dados
         ←           ←         ←            ←
```

**Diagrama de Sequência** (quando aplicável):
```
Usuario → Controller → Service → Repository
   |         |           |          |
   |         |           |          |---> Busca Dados
   |         |           |          |
   |         |           |<---------|
   |         |<----------|
   |<--------|
```

---

## Endpoints API

### GET `/api/Recurso/Metodo`
**Descrição**: O que este endpoint faz

**Parâmetros de Query**:
- `param1` (tipo): Descrição

**Request Body** (se aplicável):
```json
{
  "campo1": "valor",
  "campo2": 123
}
```

**Response**:
```json
{
  "sucesso": true,
  "dados": { ... }
}
```

**Exemplo de Uso**:
```javascript
fetch('/api/Recurso/Metodo?param1=valor')
  .then(response => response.json())
  .then(data => console.log(data));
```

**Código Fonte**:
```csharp
[HttpGet("Metodo")]
public async Task<IActionResult> Metodo(string param1)
{
    // Explicação detalhada
}
```

---

## Frontend

### Estrutura HTML
```html
<div class="container">
    <!-- Explicação do que cada elemento faz -->
</div>
```

### JavaScript Principal
```javascript
// Explicação do que esta função faz e por quê
function nomeDaFuncao() {
    // Explicação linha por linha
}
```

### Eventos
- `click` em `#botao`: Executa função X porque...
- `change` em `#select`: Atualiza Y porque...

---

## Validações

### Frontend
- **Validação 1**: Campo obrigatório - Por que é necessário
- **Validação 2**: Formato específico - O que valida e por quê

### Backend
- **Validação 1**: Regra de negócio - Por que existe
- **Validação 2**: Segurança - O que protege

**Código de Validação**:
```csharp
if (string.IsNullOrEmpty(campo))
{
    // Por que essa validação existe
    ModelState.AddModelError("campo", "Mensagem");
}
```

---

## Exemplos de Uso

### Cenário 1: Uso Básico
**Situação**: Usuário quer fazer X

**Passos**:
1. Passo 1
2. Passo 2
3. Passo 3

**Resultado Esperado**: O que acontece

### Cenário 2: Uso Avançado
**Situação**: Usuário quer fazer Y com condições especiais

**Passos**:
1. Passo 1
2. Passo 2

**Resultado Esperado**: O que acontece

---

## Troubleshooting

### Problema: [Título do Problema]
**Sintoma**: O que o usuário vê/experimenta

**Causa**: Por que isso acontece

**Diagnóstico**: Como identificar o problema

**Solução**: Passo a passo para resolver

**Código Relacionado**: Linha X do arquivo Y

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [DD/MM/AAAA] - [Título da Modificação]

**Descrição**: O que foi alterado e por quê

**Arquivos Afetados**:
- `Arquivo1.cs` (linhas X-Y)
- `Arquivo2.js` (linha Z)

**Impacto**: O que isso afeta no sistema

**Status**: ✅ **Concluído** / 🔄 **Em Progresso** / ⚠️ **Requer Testes**

**Responsável**: Nome

**Versão**: X.X

---

## [DD/MM/AAAA] - [Título da Modificação Anterior]

**Descrição**: ...

**Status**: ✅ **Concluído**

---

## Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | DD/MM/AAAA | Versão inicial |
| 1.1 | DD/MM/AAAA | Adicionada funcionalidade X |

---

## Referências

- [Link para documentação relacionada](./ArquivoRelacionado.md)
- [Link externo](https://exemplo.com)

---

**Última atualização**: DD/MM/AAAA  
**Autor**: Sistema FrotiX  
**Versão**: X.X
```

---

## 📏 Requisitos de Tamanho

### Mínimo
- **Arquivos Simples**: **500+ linhas**
- **Arquivos Complexos** (como Agenda): **1000+ linhas**

### Critérios de Complexidade
- **Simples**: CRUD básico, poucas validações, sem integrações complexas
- **Complexo**: Múltiplos arquivos JS, lógica de negócio complexa, integrações, SignalR, etc.

---

## 🎨 Comentários nos Arquivos Fonte

**TODOS os arquivos fonte** (`.cs`, `.js`, `.cshtml`) devem ter um comentário visual no topo indicando onde está a documentação:

```csharp
/*
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                          ║
 * ║  📚 DOCUMENTAÇÃO DISPONÍVEL                                              ║
 * ║                                                                          ║
 * ║  Este arquivo está completamente documentado em:                         ║
 * ║  📄 Documentacao/Controllers/AbastecimentoController.md                 ║
 * ║                                                                          ║
 * ║  A documentação inclui:                                                   ║
 * ║  • Visão geral da funcionalidade                                        ║
 * ║  • Explicação detalhada de cada método                                   ║
 * ║  • Interconexões com outros arquivos                                     ║
 * ║  • Exemplos de uso                                                       ║
 * ║  • Troubleshooting                                                       ║
 * ║                                                                          ║
 * ║  Última atualização: DD/MM/AAAA                                          ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

using System;
// ... resto do código
```

**Para JavaScript**:
```javascript
/*
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                          ║
 * ║  📚 DOCUMENTAÇÃO DISPONÍVEL                                              ║
 * ║                                                                          ║
 * ║  Este arquivo está completamente documentado em:                         ║
 * ║  📄 Documentacao/JavaScript/cadastros/ViagemIndex.md                      ║
 * ║                                                                          ║
 * ║  Última atualização: DD/MM/AAAA                                          ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
```

---

## 📅 Controle de Alterações

### Quando Alterar Documentação

**SEMPRE que houver alteração no código**, adicionar comentário inline:

```csharp
// Alterado em: 08/01/2026 - Adicionada validação de data futura
if (dataFinal > DateTime.Now)
{
    // ...
}
```

**E atualizar a PARTE 2** (Log de Modificações) do arquivo de documentação.

---

## 🎯 Linguagem e Tom

### Para Leigos em TI
- Use linguagem simples e direta
- Evite jargões técnicos sem explicação
- Use analogias quando apropriado
- Explique o "porquê", não apenas o "o quê"

### Para Desenvolvedores
- Seja generoso com exemplos de código
- Explique decisões de design
- Documente edge cases
- Inclua diagramas quando útil

### Exemplo de Boa Explicação

❌ **Ruim**:
> O método valida os dados.

✅ **Bom**:
> O método `ValidarDados()` verifica se os dados fornecidos pelo usuário estão corretos antes de salvá-los no banco de dados. Ele verifica três coisas: (1) se todos os campos obrigatórios foram preenchidos, (2) se os formatos estão corretos (por exemplo, email deve ter @), e (3) se não há duplicatas. Se alguma validação falhar, o método retorna uma lista de erros que são exibidos ao usuário, evitando que dados incorretos sejam salvos.

---

## 🔗 Interconexões

### Documentar Relações
Para cada arquivo, documentar:
- **Quem chama**: Quais arquivos/métodos chamam este código
- **O que chama**: Quais outros arquivos/métodos este código chama
- **Quando**: Em que situações essas chamadas acontecem
- **Por quê**: Motivo da relação

### Exemplo

```markdown
## Interconexões

### Quem Chama Este Método
- `ViagemController.FinalizarViagem()` → Chama `CalcularCustos()` quando o usuário finaliza uma viagem
- `AgendaController.CriarAgendamento()` → Chama `CalcularCustos()` para pré-calcular custos estimados

### O Que Este Método Chama
- `VeiculoRepository.ObterMediaConsumo()` → Busca a média de consumo do veículo para calcular combustível
- `MotoristaRepository.ObterSalario()` → Busca o salário do motorista para calcular custo de mão de obra

### Fluxo Completo
```
Usuário clica "Finalizar Viagem"
    ↓
ViagemController.FinalizarViagem()
    ↓
CalcularCustos() ← ESTE MÉTODO
    ↓
VeiculoRepository.ObterMediaConsumo()
    ↓
MotoristaRepository.ObterSalario()
    ↓
Retorna custos calculados
    ↓
ViagemController salva no banco
```
```

---

## 📊 Índice Geral

O arquivo `0-INDICE-GERAL.md` deve:
- Listar TODOS os arquivos documentados
- Estar sempre atualizado
- Ser atualizado automaticamente quando nova documentação é criada
- Ter links diretos para cada documentação
- Estar organizado por categoria (Pages, Controllers, Services, etc.)

---

## ✅ Checklist de Qualidade

Antes de considerar uma documentação completa, verificar:

- [ ] Tem pelo menos 500 linhas (ou 1000+ para complexos)
- [ ] Visão geral clara para leigos
- [ ] Explicação detalhada de funções/métodos principais
- [ ] Interconexões documentadas
- [ ] Exemplos de código com explicações
- [ ] Troubleshooting com problemas comuns
- [ ] Log de modificações atualizado
- [ ] Comentário visual no arquivo fonte
- [ ] Links para documentação relacionada
- [ ] Diagramas quando necessário
- [ ] Exemplos de uso práticos

---

## 🚀 Processo de Documentação

### Para Arquivos Novos
1. Criar arquivo de documentação no diretório apropriado
2. Seguir estrutura padrão
3. Adicionar comentário visual no arquivo fonte
4. Atualizar `0-INDICE-GERAL.md`
5. Commit com mensagem: `docs: Adiciona documentação de [Nome do Arquivo]`

### Para Arquivos Existentes
1. Ler código fonte completamente
2. Identificar todas as funções/métodos principais
3. Mapear interconexões
4. Expandir documentação até atingir mínimo de linhas
5. Adicionar exemplos e troubleshooting
6. Atualizar comentário no arquivo fonte
7. Commit com mensagem: `docs: Melhora documentação de [Nome do Arquivo]`

---

## 💡 Sugestões de Melhoria (IA)

### Incrementos Sugeridos
1. **Diagramas Visuais**: Usar Mermaid para diagramas de fluxo, sequência e arquitetura
2. **Vídeos Tutoriais**: Links para vídeos explicativos (quando disponíveis)
3. **Testes Automatizados**: Documentar como testar cada funcionalidade
4. **Performance**: Documentar considerações de performance quando relevante
5. **Segurança**: Documentar aspectos de segurança (validações, sanitização, etc.)
6. **Acessibilidade**: Documentar recursos de acessibilidade quando aplicável
7. **Internacionalização**: Documentar suporte a múltiplos idiomas quando aplicável

### Ferramentas Recomendadas
- **Mermaid**: Para diagramas (suportado pelo GitHub)
- **PlantUML**: Alternativa para diagramas mais complexos
- **Draw.io**: Para diagramas de arquitetura

---

## 📌 Notas Importantes

1. **Sempre atualizar a data** quando modificar documentação
2. **Sempre atualizar o índice** quando criar nova documentação
3. **Sempre adicionar comentário** no arquivo fonte quando documentar
4. **Priorizar clareza** sobre brevidade
5. **Documentar decisões** de design, não apenas código
6. **Incluir contexto** histórico quando relevante

---

**Última atualização deste documento**: 08/01/2026  
**Versão**: 2.0  
**Mantido por**: Sistema de Documentação FrotiX
