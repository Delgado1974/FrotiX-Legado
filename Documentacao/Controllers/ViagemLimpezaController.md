# Documentação: ViagemLimpezaController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `ViagemLimpezaController` fornece endpoints para limpeza e normalização de dados de viagens, incluindo correção de origens e destinos.

**Principais características:**

✅ **Listagem**: Lista origens e destinos distintos  
✅ **Correção**: Corrige múltiplas origens/destinos para um valor único  
✅ **Normalização**: Integração com sistema de normalização

---

## Endpoints API

### GET `/api/ViagemLimpeza/origens`

**Descrição**: Lista todas as origens distintas

**Response**: Lista de strings

---

### GET `/api/ViagemLimpeza/destinos`

**Descrição**: Lista todos os destinos distintos

**Response**: Lista de strings

---

### POST `/api/ViagemLimpeza/corrigir-origem`

**Descrição**: Corrige múltiplas origens para um valor único

**Request Body**: `CorrecaoRequest`
```json
{
  "anteriores": ["Local A", "Local B"],
  "novoValor": "Local Unificado"
}
```

---

### POST `/api/ViagemLimpeza/corrigir-destino`

**Descrição**: Corrige múltiplos destinos para um valor único

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: Páginas de limpeza/normalização de dados
- **JavaScript**: Para correção em massa

### O Que Este Controller Chama

- **`_viagemRepo`**: `IViagemRepository` para operações de viagens

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do ViagemLimpezaController

**Arquivos Afetados**:
- `Controllers/ViagemLimpezaController.cs`

**Impacto**: Documentação de referência para limpeza de dados

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
