# Documentação: ViagemController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `ViagemController` é um dos controllers mais complexos e críticos do sistema FrotiX. Gerencia todas as operações relacionadas a viagens, incluindo CRUD, upload de fichas de vistoria, cálculos de custos, estatísticas, unificação de dados e integração com múltiplos serviços.

**Principais características:**

✅ **CRUD Completo**: Criação, leitura, atualização e exclusão de viagens  
✅ **Upload de Fichas**: Upload e recuperação de fichas de vistoria em Base64  
✅ **Cálculos de Custo**: Sistema complexo de cálculo de custos (combustível, motorista, operador, lavador, veículo)  
✅ **Estatísticas**: Integração com `ViagemEstatisticaService` e `VeiculoEstatisticaService`  
✅ **Unificação**: Sistema de unificação de origens/destinos  
✅ **Filtros Avançados**: Por veículo, motorista, data, status, evento  
✅ **Cache**: Usa `IMemoryCache` para otimização  
✅ **Batch Processing**: Cálculo de custos em lote com progresso

**⚠️ CRÍTICO**: Qualquer alteração afeta o core do sistema de gestão de viagens.

**Nota**: Controller implementado como partial class dividido em múltiplos arquivos:
- `ViagemController.cs` - Métodos principais
- `ViagemController.AtualizarDados.cs` - Atualização de dados
- `ViagemController.CalculoCustoBatch.cs` - Cálculo de custos em lote
- `ViagemController.CustosViagem.cs` - Gestão de custos
- `ViagemController.DashboardEconomildo.cs` - Dashboard Economildo
- `ViagemController.HeatmapEconomildo.cs` - Heatmap Economildo
- E outros arquivos parciais

---

## Endpoints API Principais

### POST `/api/Viagem/UploadFichaVistoria`

**Descrição**: Upload de ficha de vistoria (imagem) para uma viagem

**Request**: `multipart/form-data` com arquivo e `viagemId`

**Response**: Base64 da imagem salva

---

### GET `/api/Viagem/ObterFichaVistoria`

**Descrição**: Obtém ficha de vistoria de uma viagem

**Parâmetros**: `viagemId` (string GUID)

**Response**: Base64 da imagem ou `temImagem: false`

---

### GET `/api/Viagem/FotoMotorista`

**Descrição**: Obtém foto do motorista com cache HTTP (ETag)

**Parâmetros**: `id` (Guid) - ID do motorista

**Otimizações**:
- Usa ETag para cache HTTP
- Retorna `304 Not Modified` se não houver mudanças
- Cache-Control: `public,max-age=86400`

---

### GET `/api/Viagem/PegarStatusViagem`

**Descrição**: Verifica se viagem está aberta

**Parâmetros**: `viagemId` (Guid)

**Response**: `true` se status == "Aberta", senão `false`

---

### GET `/api/Viagem/ListaDistintos`

**Descrição**: Lista origens e destinos distintos de todas as viagens

**Response**:
```json
{
  "origens": ["Local A", "Local B"],
  "destinos": ["Local C", "Local D"]
}
```

---

### POST `/api/Viagem/Unificar`

**Descrição**: Unifica múltiplas origens/destinos em um único valor

**Request Body**: `UnificacaoRequest`
```json
{
  "novoValor": "Local Unificado",
  "origensSelecionadas": ["Local A", "Local B"],
  "destinosSelecionados": ["Local C"]
}
```

**Uso**: Normalização de dados de viagens

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Viagem/*.cshtml` - Todas as páginas de viagens
- **Pages**: `Pages/Dashboard/*.cshtml` - Dashboards
- **JavaScript**: Múltiplos arquivos JS para operações de viagens

### O Que Este Controller Chama

- **`_unitOfWork.Viagem`**: CRUD de viagens
- **`_unitOfWork.ViewViagens`**: View otimizada
- **`_viagemEstatisticaService`**: Estatísticas de viagens
- **`_veiculoEstatisticaService`**: Estatísticas de veículos
- **`_fotoService`**: Serviço de fotos de motoristas
- **`_cache`**: Cache de memória
- **`_context`**: DbContext para operações complexas

---

## Notas Importantes

1. **Partial Class**: Controller dividido em múltiplos arquivos para organização
2. **Cálculos de Custo**: Sistema complexo com múltiplos serviços
3. **Estatísticas**: Atualização automática após mudanças
4. **Cache**: Usa cache HTTP e memória para otimização
5. **Batch Processing**: Suporta processamento em lote com progresso

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do ViagemController

**Arquivos Afetados**:
- `Controllers/ViagemController.cs`
- `Controllers/ViagemController.*.cs` (múltiplos arquivos parciais)

**Impacto**: Documentação de referência para operações de viagens

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
