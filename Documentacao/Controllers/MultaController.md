# Documentação: MultaController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `MultaController` gerencia operações CRUD de multas de trânsito, incluindo listagem com filtros múltiplos, registro de pagamento e gestão de PDFs.

**Principais características:**

✅ **CRUD Completo**: Listagem com filtros avançados  
✅ **Filtros Múltiplos**: Por fase, veículo, órgão, motorista, infração, status  
✅ **Registro de Pagamento**: Sistema de registro de pagamento  
✅ **PDFs**: Gestão de PDFs de autuação, penalidade e comprovante

---

## Endpoints API Principais

### GET `/api/Multa/ListaMultas`

**Descrição**: Lista multas com filtros múltiplos

**Parâmetros**:
- `Fase` (string opcional)
- `Veiculo` (string GUID opcional)
- `Orgao` (string GUID opcional)
- `Motorista` (string GUID opcional)
- `Infracao` (string GUID opcional)
- `Status` (string opcional)

**Response**: Lista de multas com formatação de valores e flags de pagamento

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Multa/*.cshtml`
- **Pages**: `Pages/Veiculo/*.cshtml` - Para histórico de multas

### O Que Este Controller Chama

- **`_unitOfWork.viewMultas`**: View otimizada
- **`_unitOfWork.Multa`**: CRUD
- **`Servicos.ConvertHtml`**: Conversão de HTML

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do MultaController

**Arquivos Afetados**:
- `Controllers/MultaController.cs`
- `Controllers/MultaUploadController.cs`
- `Controllers/MultaPdfViewerController.cs`

**Impacto**: Documentação de referência para operações de multas

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
