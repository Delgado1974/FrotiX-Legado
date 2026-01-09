# Documentação: ViewViagens.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)
3. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)
4. [Interconexões](#interconexões)
5. [Lógica de Negócio](#lógica-de-negócio)

---

## Visão Geral

O Model `ViewViagens` representa uma VIEW do banco de dados que consolida informações completas de viagens, incluindo dados da viagem, veículo, motorista, requisitante, ocorrências e custos. É uma das views mais importantes do sistema, usada extensivamente em listagens e relatórios.

**Principais características:**

✅ **View do Banco**: Representa uma VIEW SQL  
✅ **Dados Completos**: Inclui informações de múltiplas entidades  
✅ **Ocorrências**: Inclui dados de ocorrências relacionadas  
✅ **Custos**: Inclui custo calculado da viagem  
✅ **Status Consolidado**: Status da viagem e documentos

---

## Estrutura do Model

```csharp
public class ViewViagens
{
    public Guid ViagemId { get; set; }
    public string? Descricao { get; set; }
    public int? NoFichaVistoria { get; set; }
    public DateTime? DataInicial { get; set; }
    public DateTime? DataFinal { get; set; }
    public DateTime? HoraInicio { get; set; }
    public DateTime? HoraFim { get; set; }
    public int? KmInicial { get; set; }
    public int? KmFinal { get; set; }
    public string? CombustivelInicial { get; set; }
    public string? CombustivelFinal { get; set; }
    public string? ResumoOcorrencia { get; set; }
    public string? DescricaoOcorrencia { get; set; }
    public string? DescricaoSolucaoOcorrencia { get; set; }
    public string? StatusOcorrencia { get; set; }
    public string? Status { get; set; }
    public string? NomeRequisitante { get; set; }
    public string? NomeSetor { get; set; }
    public string? NomeMotorista { get; set; }
    public string? DescricaoVeiculo { get; set; }
    public string? StatusDocumento { get; set; }
    public string? StatusCartaoAbastecimento { get; set; }
    public string? Finalidade { get; set; }
    public string? Placa { get; set; }
    public string? ImagemOcorrencia { get; set; }
    public bool StatusAgendamento { get; set; }
    public double? CustoViagem { get; set; }
    public Guid? RequisitanteId { get; set; }
    public Guid? SetorSolicitanteId { get; set; }
    public Guid? VeiculoId { get; set; }
    public Guid? MotoristaId { get; set; }
    public Guid? UnidadeId { get; set; }
    public Guid? ItemManutencaoId { get; set; }
    public Guid? EventoId { get; set; }
    
    [NotMapped]
    public IFormFile FotoUpload { get; set; }
}
```

**Propriedades Principais:**

- **Viagem**: ViagemId, NoFichaVistoria, DataInicial, DataFinal, Status
- **Ocorrências**: ResumoOcorrencia, DescricaoOcorrencia, StatusOcorrencia, ImagemOcorrencia
- **Veículo**: VeiculoId, Placa, DescricaoVeiculo, StatusDocumento, StatusCartaoAbastecimento
- **Motorista**: MotoristaId, NomeMotorista
- **Requisitante**: RequisitanteId, NomeRequisitante, NomeSetor, SetorSolicitanteId
- **Custos**: CustoViagem (calculado)
- **Agendamento**: StatusAgendamento

---

## Mapeamento Model ↔ Banco de Dados

### View: `ViewViagens`

**Tipo**: VIEW (não é tabela)

**Tabelas Envolvidas**:
- `Viagem` (tabela principal)
- `Veiculo` (JOIN)
- `Motorista` (JOIN)
- `Requisitante` (JOIN)
- `SetorSolicitante` (JOIN)
- `OcorrenciaViagem` (LEFT JOIN)
- `Unidade` (LEFT JOIN)
- `Evento` (LEFT JOIN)

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **ViagemController** → Lista Viagens

**Quando**: Páginas de listagem de viagens  
**Por quê**: Retornar viagens com dados consolidados

```csharp
var viagens = _unitOfWork.ViewViagens.GetAll()
    .Where(v => v.Status == "Finalizada")
    .OrderByDescending(v => v.DataInicial)
    .ToList();
```

---

## Notas Importantes

1. **View Completa**: Uma das views mais complexas do sistema
2. **Ocorrências**: Inclui dados de ocorrências relacionadas
3. **Custo Calculado**: Campo `CustoViagem` é calculado na view
4. **FotoUpload**: Campo `[NotMapped]` para upload de fotos (não vem da view)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
