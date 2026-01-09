# Documentação: LookupsDto.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Estrutura do Model](#estrutura-do-model)
5. [Interconexões](#interconexões)
6. [Exemplos de Uso](#exemplos-de-uso)

---

## Visão Geral

O arquivo `LookupsDto.cs` contém DTOs (Data Transfer Objects) simples usando C# Records para representar dados básicos de entidades (Motorista, Veículo) usados em lookups e dropdowns. Records são imutáveis e ideais para DTOs.

**Principais características:**

✅ **C# Records**: Usa records (imutáveis, value-based equality)  
✅ **DTOs Simples**: Apenas ID e descrição/nome  
✅ **Lookups**: Para preenchimento de dropdowns e seleções  
✅ **Leve**: Estrutura mínima para transferência de dados

### Objetivo

Os DTOs em `LookupsDto` resolvem o problema de:
- Transferir dados mínimos de entidades para dropdowns
- Reduzir payload de APIs (apenas campos necessários)
- Facilitar serialização JSON
- Usar records para imutabilidade e performance

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| C# 9.0+ | - | Records |
| ASP.NET Core | 5.0+ | Serialização JSON |

### Padrões de Design

- **DTO Pattern**: Objetos apenas para transferência
- **Record Pattern**: Imutabilidade e value-based equality

---

## Estrutura de Arquivos

### Arquivo Principal
```
Models/DTO/LookupsDto.cs
```

### Arquivos Relacionados
- Controllers que retornam listas de motoristas/veículos
- Páginas que precisam de dropdowns

---

## Estrutura do Model

```csharp
public sealed record MotoristaData(Guid MotoristaId, string Nome);

public sealed record VeiculoData(Guid VeiculoId, string Descricao);

public sealed record VeiculoReservaData(Guid VeiculoId, string Descricao);
```

**Records:**

- `MotoristaData`: DTO para motorista (ID + Nome)
- `VeiculoData`: DTO para veículo (ID + Descrição)
- `VeiculoReservaData`: DTO específico para veículos reserva

**Características de Records:**
- **Imutáveis**: Propriedades são readonly
- **Value-based equality**: Comparação por valores, não referência
- **ToString()**: Implementação automática
- **Deconstruction**: Suporta desconstrução `var (id, nome) = motorista;`

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **Controllers** → Retorna Listas para Dropdowns

**Quando**: API precisa retornar lista de motoristas/veículos  
**Por quê**: Popular dropdowns sem enviar dados completos

```csharp
[HttpGet]
[Route("GetMotoristas")]
public IActionResult GetMotoristas()
{
    var motoristas = _unitOfWork.Motorista
        .GetAll(m => m.Status == true)
        .Select(m => new MotoristaData(m.MotoristaId, m.Nome))
        .ToList();
    
    return Ok(motoristas);
}
```

### Fluxo de Dados

```
Motorista/Veiculo (tabela)
    ↓
Repository.GetAll()
    ↓
Select para LookupDto
    ↓
Serialização JSON
    ↓
Frontend (dropdowns)
```

---

## Exemplos de Uso

### Cenário 1: Popular Dropdown de Motoristas

**Situação**: Formulário precisa de lista de motoristas

**Código**:
```csharp
var motoristas = _unitOfWork.Motorista
    .GetAll(m => m.Status == true)
    .OrderBy(m => m.Nome)
    .Select(m => new MotoristaData(m.MotoristaId, m.Nome))
    .ToList();

return Ok(motoristas);
```

**Resultado JSON**:
```json
[
  { "motoristaId": "guid-1", "nome": "João Silva" },
  { "motoristaId": "guid-2", "nome": "Maria Santos" }
]
```

---

## Notas Importantes

1. **Records**: Usa C# 9.0+ records para imutabilidade
2. **Simplicidade**: Apenas campos essenciais para lookups
3. **Performance**: Menor payload que objetos completos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação do arquivo `LookupsDto`

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
