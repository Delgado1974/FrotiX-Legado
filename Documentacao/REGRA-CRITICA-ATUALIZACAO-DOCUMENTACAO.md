# 🔴 REGRA CRÍTICA - ATUALIZAÇÃO OBRIGATÓRIA DE DOCUMENTAÇÃO

> **⚠️ LEIA ANTES DE QUALQUER OPERAÇÃO ⚠️**  
> **TODAS AS INTELIGÊNCIAS ARTIFICIAIS DEVEM LER ESTA SEÇÃO ANTES DE COMEÇAR QUALQUER CONVERSA COM O AGENTE**

---

## 🚨 REGRA ABSOLUTA E INVIOLÁVEL

**QUALQUER MUDANÇA EM QUALQUER ARQUIVO DOCUMENTADO DEVE SER ATUALIZADA E COMMITADA IMEDIATAMENTE.**

---

## 📋 Arquivos que REQUEREM Atualização Imediata

Quando você alterar QUALQUER um destes arquivos, a documentação DEVE ser atualizada no mesmo commit:

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

---

## ✅ Processo OBRIGATÓRIO Após Qualquer Alteração

### Passo a Passo:

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

---

## ⚠️ CONSEQUÊNCIAS DE NÃO ATUALIZAR

- **RISCO CRÍTICO**: Perda de sincronização entre código e documentação
- **RISCO ALTO**: Confusão em futuras manutenções
- **RISCO MÉDIO**: Retrabalho desnecessário
- **RISCO BAIXO**: Documentação desatualizada causando erros

---

## 🤖 AUTOMAÇÃO IMPLEMENTADA

### 1. Git Hook Pre-Commit

**Localização**: `.git/hooks/pre-commit`

**O que faz**:
- ✅ Executa automaticamente antes de cada commit
- ✅ Verifica se arquivos alterados têm documentação atualizada
- ✅ **BLOQUEIA** o commit se documentação estiver desatualizada
- ✅ Força atualização da documentação antes de permitir commit

**Como funciona**:
```bash
git add Arquivo.cs
git commit -m "feat: Nova funcionalidade"
# ⚠️ Hook executa automaticamente
# ❌ Se documentação desatualizada: COMMIT BLOQUEADO
# ✅ Se documentação atualizada: COMMIT PERMITIDO
```

### 2. Script de Validação Manual

**Localização**: `Scripts/ValidarDocumentacao.ps1`

**Uso**:
```powershell
# Validar arquivos modificados
.\Scripts\ValidarDocumentacao.ps1

# Modo verbose
.\Scripts\ValidarDocumentacao.ps1 -Verbose
```

**O que faz**:
- ✅ Identifica arquivos alterados
- ✅ Verifica se existe documentação correspondente
- ✅ Compara datas de modificação (arquivo vs documentação)
- ✅ Alerta se documentação está desatualizada
- ✅ Lista arquivos que precisam de atualização

### 3. Documentação da Automação

**Localização**: `Scripts/README-VALIDACAO-DOCUMENTACAO.md`

Contém instruções completas sobre como usar e configurar os scripts.

---

## 📌 LEMBRETE PARA INTELIGÊNCIAS ARTIFICIAIS

### ANTES DE FAZER QUALQUER ALTERAÇÃO:

1. ✅ Ler esta seção completamente
2. ✅ Identificar arquivos que serão alterados
3. ✅ Verificar se existe documentação para esses arquivos
4. ✅ Planejar atualização da documentação junto com a alteração do código
5. ✅ Executar atualização da documentação IMEDIATAMENTE após alteração
6. ✅ Commitar código + documentação juntos

### NUNCA:

- ❌ Alterar código sem atualizar documentação
- ❌ Commitar código sem atualizar documentação
- ❌ Deixar documentação desatualizada "para depois"
- ❌ Assumir que documentação está sincronizada sem verificar
- ❌ Tentar burlar o hook pre-commit (ele existe para proteger o projeto)

---

## 🎯 Exemplo Prático

### Cenário: Alterar método em Controller

```csharp
// ANTES: Controllers/VeiculoController.cs
public IActionResult Index() { ... }

// DEPOIS: Adicionar filtro
public IActionResult Index(string filtro) { ... }
```

### Ações OBRIGATÓRIAS:

1. **Atualizar código** ✅
2. **Atualizar documentação** (`Documentacao/Controllers/VeiculoController.md`):
   ```markdown
   ## [08/01/2026] - Adicionado filtro no método Index
   
   **Descrição**: Adicionado parâmetro `filtro` ao método `Index()` para permitir filtragem de veículos.
   
   **Arquivos Afetados**:
   - `Controllers/VeiculoController.cs` (linha 25)
   
   **Impacto**: Método agora aceita filtro opcional para buscar veículos específicos.
   
   **Status**: ✅ **Concluído**
   ```
3. **Atualizar data** na documentação: `> **Última Atualização**: 08/01/2026`
4. **Commitar juntos**:
   ```bash
   git add Controllers/VeiculoController.cs Documentacao/Controllers/VeiculoController.md
   git commit -m "feat: Adiciona filtro no Index de VeiculoController
   
   docs: Atualiza documentação de VeiculoController.md"
   ```

---

## 🔍 Verificação Automática

O sistema verifica automaticamente:

1. ✅ Se arquivo foi modificado
2. ✅ Se documentação existe
3. ✅ Se documentação foi atualizada recentemente (margem de 5 minutos)
4. ✅ Se commit inclui código + documentação

**Se alguma verificação falhar**: Commit é bloqueado até correção.

---

## 📚 Referências

- [Diretrizes Completas de Documentação](../.claude/Claude.md)
- [Índice Geral de Documentações](./0-INDICE-GERAL.md)
- [Índice de Models](./Models/0-INDICE-MODELS.md)
- [Scripts de Validação](../Scripts/README-VALIDACAO-DOCUMENTACAO.md)

---

## ✅ Checklist Rápido

Antes de commitar, verificar:

- [ ] Código foi alterado?
- [ ] Documentação correspondente existe?
- [ ] Documentação foi atualizada?
- [ ] Seção "PARTE 2: LOG DE MODIFICAÇÕES" foi atualizada?
- [ ] Data de "Última Atualização" foi atualizada?
- [ ] Commit inclui código + documentação?

**Se todas as respostas forem SIM**: ✅ Pode commitar  
**Se alguma for NÃO**: ❌ Atualize antes de commitar

---

**⚠️ LEMBRE-SE**: Esta regra existe para proteger a integridade do projeto. Documentação desatualizada é pior que falta de documentação, pois causa confusão e erros.

**📅 Última atualização desta regra**: 08/01/2026  
**🔄 Versão**: 1.0  
**📌 Status**: ATIVA E OBRIGATÓRIA
