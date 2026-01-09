# Documentação: ItensContrato.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 📋 Índice

1. [Objetivos](#objetivos)
2. [Arquivos Envolvidos](#arquivos-envolvidos)
3. [Estrutura do Model](#estrutura-do-model)
4. [Quem Chama e Por Quê](#quem-chama-e-por-quê)
5. [Problema → Solução → Código](#problema--solução--código)
6. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Objetivos

O arquivo `ItensContrato.cs` contém múltiplos ViewModels usados na página de gestão de itens de contratos e atas (`Pages/Contrato/ItensContrato.cshtml`). Esses ViewModels padronizam a estrutura de dados para inclusão e remoção de veículos, encarregados, operadores, motoristas e lavadores em contratos e atas.

**Principais objetivos:**

✅ Padronizar ViewModels para operações de inclusão/remoção de itens  
✅ Separar ViewModels por tipo de operação (Incluir vs Remover)  
✅ Suportar tanto Contratos quanto Atas  
✅ Usar prefixo "IC" para evitar conflitos com classes existentes

---

## 📁 Arquivos Envolvidos

### Arquivo Principal
- **`Models/ItensContrato.cs`** - Contém todos os ViewModels

### Arquivos que Utilizam
- **`Pages/Contrato/ItensContrato.cshtml`** - View principal
- **`Pages/Contrato/ItensContrato.cshtml.cs`** - PageModel que usa `ICPageViewModel`
- **`Controllers/ItensContratoController.cs`** - Endpoints que recebem os ViewModels
- **`wwwroot/js/cadastros/itenscontrato.js`** - JavaScript que envia dados usando os ViewModels

---

## 🏗️ Estrutura do Model

### ViewModel Principal: ICPageViewModel

```csharp
public class ICPageViewModel
{
    public Guid ContratoId { get; set; }
    public Guid AtaId { get; set; }
    public ICPlaceholder ItensContrato { get; set; }
    
    // Listas para Dropdowns
    public IEnumerable<SelectListItem> ContratoList { get; set; }
    public IEnumerable<SelectListItem> AtaList { get; set; }
}
```

### Placeholder: ICPlaceholder

```csharp
public class ICPlaceholder
{
    [NotMapped]
    public Guid ContratoId { get; set; }
    
    [NotMapped]
    public Guid AtaId { get; set; }
}
```

### ViewModels de Inclusão

```csharp
// ✅ Veículo em Contrato
public class ICIncluirVeiculoContratoVM
{
    public Guid VeiculoId { get; set; }
    public Guid ContratoId { get; set; }
    public Guid? ItemVeiculoId { get; set; }
}

// ✅ Veículo em Ata
public class ICIncluirVeiculoAtaVM
{
    public Guid VeiculoId { get; set; }
    public Guid AtaId { get; set; }
    public Guid? ItemVeiculoAtaId { get; set; }
}

// ✅ Encarregado em Contrato
public class ICIncluirEncarregadoContratoVM
{
    public Guid EncarregadoId { get; set; }
    public Guid ContratoId { get; set; }
}

// ✅ Operador em Contrato
public class ICIncluirOperadorContratoVM
{
    public Guid OperadorId { get; set; }
    public Guid ContratoId { get; set; }
}

// ✅ Motorista em Contrato
public class ICIncluirMotoristaContratoVM
{
    public Guid MotoristaId { get; set; }
    public Guid ContratoId { get; set; }
}

// ✅ Lavador em Contrato
public class ICIncluirLavadorContratoVM
{
    public Guid LavadorId { get; set; }
    public Guid ContratoId { get; set; }
}
```

### ViewModels de Remoção

```csharp
// ✅ Remover Veículo de Contrato
public class ICRemoverVeiculoContratoVM
{
    public Guid VeiculoId { get; set; }
    public Guid ContratoId { get; set; }
}

// ✅ Remover Veículo de Ata
public class ICRemoverVeiculoAtaVM
{
    public Guid VeiculoId { get; set; }
    public Guid AtaId { get; set; }
}

// ✅ Remover Encarregado de Contrato
public class ICRemoverEncarregadoContratoVM
{
    public Guid EncarregadoId { get; set; }
    public Guid ContratoId { get; set; }
}

// ✅ Remover Operador de Contrato
public class ICRemoverOperadorContratoVM
{
    public Guid OperadorId { get; set; }
    public Guid ContratoId { get; set; }
}

// ✅ Remover Motorista de Contrato
public class ICRemoverMotoristaContratoVM
{
    public Guid MotoristaId { get; set; }
    public Guid ContratoId { get; set; }
}

// ✅ Remover Lavador de Contrato
public class ICRemoverLavadorContratoVM
{
    public Guid LavadorId { get; set; }
    public Guid ContratoId { get; set; }
}
```

---

## 🔗 Quem Chama e Por Quê

### 1. **ItensContratoController.cs** → Incluir Veículo em Contrato

**Quando:** Usuário seleciona veículo no modal e clica em "Incluir"  
**Por quê:** Vincular veículo a um contrato específico

```csharp
[HttpPost("IncluirVeiculoContrato")]
public IActionResult IncluirVeiculoContrato([FromBody] ICIncluirVeiculoContratoVM vm)
{
    // ✅ Verifica se veículo já está vinculado
    var existe = _unitOfWork.VeiculoContrato
        .GetFirstOrDefault(vc => 
            vc.VeiculoId == vm.VeiculoId && 
            vc.ContratoId == vm.ContratoId);
    
    if (existe != null)
        return Json(new { success = false, message = "Veículo já vinculado" });
    
    // ✅ Cria novo vínculo
    var veiculoContrato = new VeiculoContrato
    {
        VeiculoId = vm.VeiculoId,
        ContratoId = vm.ContratoId
    };
    
    _unitOfWork.VeiculoContrato.Add(veiculoContrato);
    _unitOfWork.Save();
    
    return Json(new { success = true });
}
```

### 2. **ItensContratoController.cs** → Remover Encarregado de Contrato

**Quando:** Usuário clica em "Remover" ao lado de um encarregado  
**Por quê:** Desvincular encarregado de um contrato

```csharp
[HttpPost("RemoverEncarregadoContrato")]
public IActionResult RemoverEncarregadoContrato([FromBody] ICRemoverEncarregadoContratoVM vm)
{
    // ✅ Busca vínculo
    var encarregadoContrato = _unitOfWork.EncarregadoContrato
        .GetFirstOrDefault(ec => 
            ec.EncarregadoId == vm.EncarregadoId && 
            ec.ContratoId == vm.ContratoId);
    
    if (encarregadoContrato == null)
        return Json(new { success = false, message = "Vínculo não encontrado" });
    
    // ✅ Remove vínculo
    _unitOfWork.EncarregadoContrato.Remove(encarregadoContrato);
    _unitOfWork.Save();
    
    return Json(new { success = true });
}
```

### 3. **Pages/Contrato/ItensContrato.cshtml.cs** → Carrega ViewModel Principal

**Quando:** Página carrega  
**Por quê:** Preparar dados para a view

```csharp
[BindProperty]
public ICPageViewModel ItensContratoObj { get; set; }

public void OnGet()
{
    ItensContratoObj = new ICPageViewModel
    {
        ItensContrato = new ICPlaceholder(),
        ContratoList = _unitOfWork.Contrato.GetDropDown().ToList(),
        AtaList = _unitOfWork.AtaRegistroPrecos.GetDropDown().ToList()
    };
}
```

---

## 🛠️ Problema → Solução → Código

### Problema: Múltiplos ViewModels com Estrutura Similar

**Problema:** Criar ViewModels separados para cada tipo de inclusão/remoção (Veículo, Encarregado, Operador, etc.) resultaria em muita duplicação de código.

**Solução:** Criar ViewModels padronizados com prefixo "IC" (ItensContrato) e sufixos descritivos (`IncluirVeiculoContratoVM`, `RemoverEncarregadoContratoVM`, etc.).

**Código:**

```csharp
// ✅ Padrão consistente para todos os ViewModels
public class ICIncluir[Tipo][Entidade]VM
{
    public Guid [Tipo]Id { get; set; }      // Ex: VeiculoId, EncarregadoId
    public Guid ContratoId { get; set; }    // Sempre presente
    public Guid? ItemVeiculoId { get; set; } // Apenas para veículos
}

public class ICRemover[Tipo][Entidade]VM
{
    public Guid [Tipo]Id { get; set; }
    public Guid ContratoId { get; set; }    // Ou AtaId para atas
}
```

### Problema: Placeholder Necessário para PageModel

**Problema:** PageModel precisa de um objeto para binding, mas não precisa de todas as propriedades do ViewModel completo.

**Solução:** Criar `ICPlaceholder` com apenas os IDs necessários, marcados como `[NotMapped]` para não serem validados pelo Entity Framework.

**Código:**

```csharp
public class ICPlaceholder
{
    [NotMapped] // ✅ Não é mapeado para banco
    public Guid ContratoId { get; set; }
    
    [NotMapped]
    public Guid AtaId { get; set; }
}

// ✅ Uso no PageModel
public ICPageViewModel ItensContratoObj { get; set; } = new ICPageViewModel
{
    ItensContrato = new ICPlaceholder() // ✅ Placeholder simples
};
```

---

## 🔄 Fluxo de Funcionamento

### Fluxo: Incluir Veículo em Contrato

```
1. Usuário seleciona contrato no dropdown
   ↓
2. JavaScript carrega lista de veículos disponíveis
   ↓
3. Usuário seleciona veículo no modal
   ↓
4. JavaScript monta ICIncluirVeiculoContratoVM:
   {
     VeiculoId: guid,
     ContratoId: guid,
     ItemVeiculoId: null
   }
   ↓
5. AJAX POST para /api/itenscontrato/incluirveiculocontrato
   ↓
6. Controller valida se veículo já está vinculado
   ↓
7. Se não está vinculado:
   ├─ Cria VeiculoContrato
   ├─ Salva no banco
   └─ Retorna sucesso
   ↓
8. JavaScript recarrega tabela de veículos do contrato
```

### Fluxo: Remover Encarregado de Contrato

```
1. Usuário clica em "Remover" ao lado de encarregado
   ↓
2. JavaScript confirma ação via SweetAlert
   ↓
3. Se confirmado, monta ICRemoverEncarregadoContratoVM:
   {
     EncarregadoId: guid,
     ContratoId: guid
   }
   ↓
4. AJAX POST para /api/itenscontrato/removerencarregadocontrato
   ↓
5. Controller busca EncarregadoContrato pelo par de IDs
   ↓
6. Se encontrado:
   ├─ Remove do banco
   ├─ Salva alterações
   └─ Retorna sucesso
   ↓
7. JavaScript recarrega tabela de encarregados do contrato
```

---

## 🔍 Troubleshooting

### Erro: Veículo já vinculado mas aparece como disponível

**Causa:** Query de verificação não está funcionando corretamente.

**Solução:**
```csharp
// ✅ Verificar se query está correta
var existe = _unitOfWork.VeiculoContrato
    .GetFirstOrDefault(vc => 
        vc.VeiculoId == vm.VeiculoId && 
        vc.ContratoId == vm.ContratoId);
        
if (existe != null)
{
    // Já existe vínculo
}
```

### Erro: ViewModel não está sendo recebido no Controller

**Causa:** JavaScript não está enviando JSON corretamente ou Content-Type está incorreto.

**Solução:**
```javascript
// ✅ Garantir Content-Type correto
$.ajax({
    url: '/api/itenscontrato/incluirveiculocontrato',
    type: 'POST',
    contentType: 'application/json', // ✅ Importante
    data: JSON.stringify({
        VeiculoId: veiculoId,
        ContratoId: contratoId
    }),
    success: function(response) { ... }
});
```

---

## 📊 Endpoints API Resumidos

| Método | Rota | ViewModel Usado |
|--------|------|-----------------|
| `POST` | `/api/itenscontrato/incluirveiculocontrato` | `ICIncluirVeiculoContratoVM` |
| `POST` | `/api/itenscontrato/incluirveiculoata` | `ICIncluirVeiculoAtaVM` |
| `POST` | `/api/itenscontrato/incluirencarregadocontrato` | `ICIncluirEncarregadoContratoVM` |
| `POST` | `/api/itenscontrato/incluiroperadorcontrato` | `ICIncluirOperadorContratoVM` |
| `POST` | `/api/itenscontrato/incluirmotoristacontrato` | `ICIncluirMotoristaContratoVM` |
| `POST` | `/api/itenscontrato/incluirlavadorcontrato` | `ICIncluirLavadorContratoVM` |
| `POST` | `/api/itenscontrato/removerveiculocontrato` | `ICRemoverVeiculoContratoVM` |
| `POST` | `/api/itenscontrato/removerveiculoata` | `ICRemoverVeiculoAtaVM` |
| `POST` | `/api/itenscontrato/removerencarregadocontrato` | `ICRemoverEncarregadoContratoVM` |
| `POST` | `/api/itenscontrato/removeroperadorcontrato` | `ICRemoverOperadorContratoVM` |
| `POST` | `/api/itenscontrato/removermotoristacontrato` | `ICRemoverMotoristaContratoVM` |
| `POST` | `/api/itenscontrato/removerlavadorcontrato` | `ICRemoverLavadorContratoVM` |

---

## 📝 Notas Importantes

1. **Prefix "IC"** - Usado para evitar conflitos com classes existentes como `ItensContrato` em `Models/Cadastros/`.

2. **ViewModels separados** - Cada operação tem seu próprio ViewModel para clareza e validação específica.

3. **Suporte a Atas** - ViewModels de Veículo suportam tanto Contratos quanto Atas.

4. **ItemVeiculoId opcional** - Usado apenas para veículos quando há necessidade de referenciar item específico.

---

**📅 Documentação criada em:** 08/01/2026  
**🔄 Última atualização:** 08/01/2026
