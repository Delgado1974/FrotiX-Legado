# Documentação: Viagem.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O arquivo `Viagem.cs` contém múltiplas classes relacionadas a viagens: `AgendamentoViagem` (agendamento com recorrência), `AjusteViagem` (ajustes em viagens existentes) e `FinalizacaoViagem` (finalização de viagens). É um dos modelos mais complexos do sistema.

**Principais características:**

✅ **Agendamento com Recorrência**: Suporta recorrência diária, semanal, mensal e datas específicas  
✅ **Múltiplos DTOs**: Diferentes DTOs para diferentes operações  
✅ **Eventos**: Vinculação com eventos  
✅ **Status**: Controle completo de status da viagem

## Estrutura do Model

### Classe: `AgendamentoViagem`

```csharp
public class AgendamentoViagem
{
    public Guid ViagemId { get; set; }
    public int? NoFichaVistoria { get; set; }
    
    // Datas e horários
    public DateTime? DataInicial { get; set; }
    public DateTime? DataFinal { get; set; }
    public DateTime? DataFinalRecorrencia { get; set; }
    public DateTime? HoraInicio { get; set; }
    public DateTime? HoraFim { get; set; }
    
    // Recorrência
    public string? Recorrente { get; set; }
    public bool? Monday { get; set; }
    public bool? Tuesday { get; set; }
    public bool? Wednesday { get; set; }
    public bool? Thursday { get; set; }
    public bool? Friday { get; set; }
    public bool? Saturday { get; set; }
    public bool? Sunday { get; set; }
    public int? DiaMesRecorrencia { get; set; }
    public List<DateTime>? DatasSelecionadas { get; set; }
    
    // Dados da viagem
    public string? Origem { get; set; }
    public string? Destino { get; set; }
    public string? Finalidade { get; set; }
    public string? Descricao { get; set; }
    
    // Quilometragem
    public int? KmInicial { get; set; }
    public int? KmFinal { get; set; }
    public int? KmAtual { get; set; }
    
    // Combustível
    public string? CombustivelInicial { get; set; }
    public string? CombustivelFinal { get; set; }
    
    // Relacionamentos
    public Guid? VeiculoId { get; set; }
    public Guid? MotoristaId { get; set; }
    public Guid? RequisitanteId { get; set; }
    public Guid? SetorSolicitanteId { get; set; }
    public Guid? EventoId { get; set; }
    public Guid? RecorrenciaViagemId { get; set; }
    
    // Status e controle
    public string? Status { get; set; }
    public bool StatusAgendamento { get; set; }
    public bool FoiAgendamento { get; set; }
    public DateTime? DataAgendamento { get; set; }
    public DateTime? DataCancelamento { get; set; }
    public DateTime? DataCriacao { get; set; }
    public DateTime? DataFinalizacao { get; set; }
    
    // Usuários
    public string? UsuarioIdCriacao { get; set; }
    public string? UsuarioIdAgendamento { get; set; }
    public string? UsuarioIdCancelamento { get; set; }
    public string? UsuarioIdFinalizacao { get; set; }
    
    // Campos auxiliares
    [NotMapped]
    public bool CriarViagemFechada { get; set; }
    [NotMapped]
    public bool editarTodosRecorrentes { get; set; }
    [NotMapped]
    public DateTime? EditarAPartirData { get; set; }
    [NotMapped]
    public bool OperacaoBemSucedida { get; set; }
}
```

### Classe: `AjusteViagem`

```csharp
public class AjusteViagem
{
    public Guid ViagemId { get; set; }
    public int? NoFichaVistoria { get; set; }
    public DateTime? DataInicial { get; set; }
    public DateTime? DataFinal { get; set; }
    public DateTime? HoraInicial { get; set; }
    public DateTime? HoraFim { get; set; }
    public int? KmInicial { get; set; }
    public int? KmFinal { get; set; }
    public string? Finalidade { get; set; }
    public Guid? VeiculoId { get; set; }
    public Guid? MotoristaId { get; set; }
    public Guid? SetorSolicitanteId { get; set; }
    public Guid? EventoId { get; set; }
    
    [NotMapped]
    public IFormFile? ArquivoFoto { get; set; }
}
```

### Classe: `FinalizacaoViagem`

DTO para finalização de viagens (campos específicos para finalização).

## Interconexões

Controllers de viagem (`ViagemController`, `AgendaController`) usam extensivamente estas classes.

## Lógica de Negócio

### Recorrência

Sistema suporta múltiplos tipos de recorrência:
- **Diária**: Todos os dias
- **Semanal**: Dias da semana específicos (Monday-Sunday)
- **Mensal**: Dia específico do mês (DiaMesRecorrencia)
- **Datas Específicas**: Lista de datas (DatasSelecionadas)

### Status da Viagem

Valores comuns:
- "Agendada": Viagem agendada mas não iniciada
- "Em Andamento": Viagem em execução
- "Finalizada": Viagem concluída
- "Cancelada": Viagem cancelada

## Notas Importantes

1. **Recorrência Complexa**: Suporta múltiplos padrões de recorrência
2. **Múltiplos DTOs**: Diferentes DTOs para diferentes operações
3. **Ocorrências**: Ocorrências são tratadas em tabela separada (`OcorrenciaViagem`)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
