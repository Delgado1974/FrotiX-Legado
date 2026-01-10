# Documentação: ErroHelper.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A classe `ErroHelper` é um utilitário estático para montar scripts JavaScript que exibem alertas SweetAlert2 no cliente, especialmente para tratamento de erros.

**Principais características:**

✅ **Geração de Scripts**: Cria scripts JavaScript dinamicamente  
✅ **Integração SweetAlert**: Scripts para SweetAlertInterop  
✅ **Sanitização**: Escapa caracteres especiais para JavaScript  
✅ **Múltiplos Tipos**: Erro, aviso, informação, confirmação

---

## Estrutura da Classe

### Classe Estática

```csharp
public static class ErroHelper
```

**Padrão**: Classe estática com métodos utilitários

---

## Métodos Principais

### `MontarScriptErro(string classe, string metodo, Exception ex)`

**Descrição**: Monta script JavaScript para exibir erro técnico com SweetAlert

**Parâmetros**:
- `classe`: Nome da classe onde ocorreu o erro
- `metodo`: Nome do método onde ocorreu o erro
- `ex`: Exceção com detalhes do erro

**Retorno**: String com script JavaScript

**Script Gerado**:
```javascript
SweetAlertInterop.ShowTratamentoErroComLinha(
    'MeuController', 
    'SalvarDados', 
    { 
        message: 'Mensagem do erro', 
        stack: 'Stack trace completo' 
    }
);
```

**Sanitização**: Escapa aspas simples (`'` → `\'`) e remove quebras de linha

**Uso**:
```csharp
try
{
    // código
}
catch (Exception ex)
{
    string script = ErroHelper.MontarScriptErro("MeuController", "Salvar", ex);
    // Executar script no cliente
}
```

---

### `MontarScriptAviso(string titulo, string mensagem)`

**Descrição**: Monta script para alerta de aviso

**Script Gerado**:
```javascript
SweetAlertInterop.ShowWarning('Título', 'Mensagem');
```

**Uso**:
```csharp
string script = ErroHelper.MontarScriptAviso("Atenção", "Esta ação não pode ser desfeita.");
```

---

### `MontarScriptInfo(string titulo, string mensagem)`

**Descrição**: Monta script para alerta de informação

**Script Gerado**:
```javascript
SweetAlertInterop.ShowInfo('Título', 'Mensagem');
```

**Uso**:
```csharp
string script = ErroHelper.MontarScriptInfo("Informação", "Operação concluída.");
```

---

### `MontarScriptConfirmacao(string titulo, string mensagem, string textoConfirmar, string textoCancelar)`

**Descrição**: Monta script para alerta de confirmação

**Script Gerado**:
```javascript
SweetAlertInterop.ShowConfirm(
    'Título', 
    'Mensagem', 
    'Confirmar', 
    'Cancelar'
);
```

**Uso**:
```csharp
string script = ErroHelper.MontarScriptConfirmacao(
    "Confirmar Exclusão", 
    "Deseja realmente excluir?", 
    "Sim", 
    "Não"
);
```

---

## Método Auxiliar Privado

### `Sanitize(string input)`

**Descrição**: Sanitiza string para uso em JavaScript

**Transformações**:
1. Substitui `'` por `\'` (escape de aspas)
2. Remove `\r` (carriage return)
3. Remove `\n` (newline)
4. Substitui `\n` por espaço

**Uso**: Chamado internamente por todos os métodos públicos

**Exemplo**:
```csharp
string input = "Erro: 'Não foi possível salvar'\nLinha 2";
string sanitized = Sanitize(input);
// Resultado: "Erro: \'Não foi possível salvar\' Linha 2"
```

---

## Interconexões

### Quem Usa Esta Classe

- **Controllers**: Para gerar scripts de erro em views Razor
- **Pages**: Para exibir alertas em páginas Razor
- **JavaScript**: Executa scripts gerados via `SweetAlertInterop`

### O Que Esta Classe Usa

- **System**: `Exception`, `String`

---

## Comparação com `Alerta.cs`

| Característica | Alerta.cs | ErroHelper.cs |
|----------------|-----------|---------------|
| **Método** | TempData | Script JavaScript |
| **Execução** | Automática (via JS) | Manual (executar script) |
| **Uso** | Controllers/API | Views Razor |
| **Flexibilidade** | Menor | Maior (controle total) |

**Uso Recomendado**:
- **Alerta.cs**: Para uso em Controllers/API (mais simples)
- **ErroHelper.cs**: Para uso em Views Razor quando precisa de controle manual

---

## Exemplos de Uso

### Exemplo 1: Erro em View Razor

```csharp
@page
@{
    try
    {
        // código
    }
    catch (Exception ex)
    {
        string script = ErroHelper.MontarScriptErro("MinhaPage", "OnGet", ex);
        <script>@Html.Raw(script)</script>
    }
}
```

### Exemplo 2: Confirmação em View

```csharp
@{
    string scriptConfirmacao = ErroHelper.MontarScriptConfirmacao(
        "Confirmar Exclusão",
        "Deseja realmente excluir este item?",
        "Sim, excluir",
        "Cancelar"
    );
}

<button onclick="@Html.Raw(scriptConfirmacao)">Excluir</button>
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do ErroHelper

**Arquivos Afetados**:
- `Helpers/ErroHelper.cs`

**Impacto**: Documentação de referência para geração de scripts de alerta

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
