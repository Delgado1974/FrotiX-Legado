# Documentação: AdministracaoController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `AdministracaoController` fornece endpoints administrativos para resumo geral da frota e estatísticas de normalização de dados.

**Principais características:**

✅ **Resumo da Frota**: Estatísticas gerais (veículos, motoristas, viagens, KM)  
✅ **Estatísticas de Normalização**: Análise de normalização de dados de viagens  
✅ **Filtros de Período**: Análises por período configurável

---

## Endpoints API Principais

### GET `/api/Administracao/ObterResumoGeralFrota`

**Descrição**: Obtém resumo geral da frota

**Parâmetros**:
- `dataInicio` (DateTime opcional) - Padrão: 30 dias atrás
- `dataFim` (DateTime opcional) - Padrão: hoje

**Response**:
```json
{
  "sucesso": true,
  "dados": {
    "veiculosAtivos": 50,
    "motoristasAtivos": 100,
    "viagensRealizadas": 500,
    "totalKm": 50000
  }
}
```

---

### GET `/api/Administracao/ObterEstatisticasNormalizacao`

**Descrição**: Obtém estatísticas de normalização de dados

**Parâmetros**:
- `dataInicio` (DateTime opcional) - Padrão: 6 meses atrás
- `dataFim` (DateTime opcional) - Padrão: hoje

**Response**: Estatísticas de normalização incluindo percentuais e distribuição por tipo

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: Páginas administrativas
- **Dashboards**: Dashboards administrativos

### O Que Este Controller Chama

- **`_context`**: DbContext para consultas diretas
- **`_unitOfWork`**: Acesso a dados

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do AdministracaoController

**Arquivos Afetados**:
- `Controllers/AdministracaoController.cs`

**Impacto**: Documentação de referência para funcionalidades administrativas

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
