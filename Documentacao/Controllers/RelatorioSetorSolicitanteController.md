# Documentação: RelatorioSetorSolicitanteController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `RelatorioSetorSolicitanteController` fornece endpoints para geração de relatórios Stimulsoft de setores solicitantes.

**Principais características:**

✅ **Stimulsoft Reports**: Integração com Stimulsoft Reporting  
✅ **Relatórios**: Geração de relatórios de setores solicitantes

---

## Endpoints API

### GET `/SetorSolicitante/RelatorioSetorSolicitante`

**Descrição**: Página principal do relatório

---

### GET `/SetorSolicitante/RelatorioSetorSolicitante/GetReport`

**Descrição**: Carrega relatório Stimulsoft

**Lógica**: Carrega arquivo `.mrt` de `Reports/SetoresSolicitantes.mrt`

---

### GET `/SetorSolicitante/RelatorioSetorSolicitante/ViewerEvent`

**Descrição**: Eventos do viewer Stimulsoft

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: Páginas de relatórios
- **Stimulsoft Viewer**: Componente de visualização

### O Que Este Controller Chama

- **Stimulsoft Reporting**: Framework de relatórios

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do RelatorioSetorSolicitanteController

**Arquivos Afetados**:
- `Controllers/RelatorioSetorSolicitanteController.cs`

**Impacto**: Documentação de referência para relatórios Stimulsoft

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
