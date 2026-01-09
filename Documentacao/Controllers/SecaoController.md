# Documentação: SecaoController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `SecaoController` gerencia operações CRUD de seções patrimoniais, incluindo relacionamento com setores.

**Principais características:**

✅ **CRUD Completo**: Listagem e atualização de status  
✅ **Filtro por Setor**: Lista seções de um setor específico  
✅ **Relacionamento**: Join com setores para exibir nome

---

## Endpoints API

### GET `/api/Secao/ListaSecoes`

**Descrição**: Retorna lista de seções com informações de setor

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "secaoId": "guid",
      "nomeSecao": "Seção A",
      "setorId": "guid",
      "status": true,
      "nomeSetor": "TI"
    }
  ]
}
```

---

### GET `/api/Secao/ListaSecoesCombo`

**Descrição**: Retorna lista simplificada filtrada por setor

**Parâmetros**: `setorSelecionado` (Guid opcional)

**Response**: Lista de seções do setor especificado (ou vazia se não informado)

---

### GET `/api/Secao/UpdateStatusSecao`

**Descrição**: Alterna status ativo/inativo

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: Páginas de gestão patrimonial
- **Pages**: Para dropdowns dependentes de setor

### O Que Este Controller Chama

- **`_unitOfWork.SecaoPatrimonial`**: CRUD
- **`_unitOfWork.SetorPatrimonial`**: Join para nome do setor

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do SecaoController

**Arquivos Afetados**:
- `Controllers/SecaoController.cs`

**Impacto**: Documentação de referência para operações de seções patrimoniais

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
