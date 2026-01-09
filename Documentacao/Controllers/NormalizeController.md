# Documentação: NormalizeController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `NormalizeController` fornece endpoint para normalização de texto usando o serviço `NormalizationService`.

**Principais características:**

✅ **Normalização de Texto**: Normaliza texto usando serviço dedicado  
✅ **API Simples**: Endpoint único POST

---

## Endpoints API

### POST `/api/Normalize`

**Descrição**: Normaliza texto fornecido

**Request Body**: `NormalizeRequest`
```json
{
  "text": "Texto a normalizar"
}
```

**Response**: Texto normalizado (string)

**Uso**: Normalização de dados de viagens (origens, destinos, etc.)

---

## Interconexões

### Quem Chama Este Controller

- **JavaScript**: Para normalização de dados antes de salvar
- **Pages**: Formulários que precisam normalizar texto

### O Que Este Controller Chama

- **`_normalizer`**: `NormalizationService` para normalização

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do NormalizeController

**Arquivos Afetados**:
- `Controllers/NormalizeController.cs`

**Impacto**: Documentação de referência para normalização de texto

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
