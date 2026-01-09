# Documentação: VeiculosUnidadeController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `VeiculosUnidadeController` gerencia a relação entre veículos e unidades, permitindo listar veículos de uma unidade específica e remover associação.

**Principais características:**

✅ **Listagem Filtrada**: Lista veículos de uma unidade específica  
✅ **Remoção de Associação**: Remove veículo de unidade (não exclui veículo)

---

## Endpoints API

### GET `/api/VeiculosUnidade`

**Descrição**: Retorna lista de veículos de uma unidade específica

**Parâmetros**: `id` (Guid) - ID da unidade

**Response**: Lista de veículos com informações completas (marca, modelo, combustível, contrato, etc.)

**Quando é chamado**: Para exibir veículos de uma unidade específica

---

### POST `/api/VeiculosUnidade/Delete`

**Descrição**: Remove associação de veículo com unidade

**Request Body**: `VeiculoViewModel` com `VeiculoId`

**Lógica**: Define `Veiculo.UnidadeId = Guid.Empty` (não exclui o veículo)

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: Páginas de gestão de unidades
- **Pages**: Relatórios por unidade

### O Que Este Controller Chama

- **`_unitOfWork.Veiculo`**: CRUD
- **`_unitOfWork.ModeloVeiculo`**: Join para marca/modelo
- **`_unitOfWork.MarcaVeiculo`**: Join para marca
- **`_unitOfWork.Unidade`**: Join para informações de unidade
- **`_unitOfWork.Combustivel`**: Join para tipo de combustível
- **`_unitOfWork.Contrato`**: Join para informações de contrato
- **`_unitOfWork.Fornecedor`**: Join para fornecedor
- **`_unitOfWork.AspNetUsers`**: Join para usuário de alteração

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do VeiculosUnidadeController

**Arquivos Afetados**:
- `Controllers/VeiculosUnidadeController.cs`

**Impacto**: Documentação de referência para relação veículos-unidades

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
