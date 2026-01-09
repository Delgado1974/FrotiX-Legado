# Documentação: ViagemEventoDto.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 🎯 Objetivos

O DTO `ViagemEventoDto` transfere dados de viagens vinculadas a eventos, incluindo informações do evento, viagem, veículo, motorista e custos, usado principalmente em listagens e dashboards.

**Principais objetivos:**

✅ Transferir dados agregados de viagem + evento  
✅ Incluir informações formatadas para exibição  
✅ Otimizar queries evitando múltiplos JOINs repetidos

---

## 🏗️ Estrutura do Model

```csharp
public class ViagemEventoDto
{
    public Guid EventoId { get; set; }
    public Guid ViagemId { get; set; }
    public int NoFichaVistoria { get; set; }
    public string NomeRequisitante { get; set; }
    public string NomeSetor { get; set; }
    public string NomeMotorista { get; set; }
    public string DescricaoVeiculo { get; set; }
    public decimal CustoViagem { get; set; }
    public DateTime DataInicial { get; set; }
    public DateTime? HoraInicio { get; set; } // ✅ DateTime? (não TimeSpan?)
    public string Placa { get; set; }
}
```

---

## 🔗 Quem Chama e Por Quê

### ViagemEventoController.cs → Listar Viagens de Evento

```csharp
[HttpGet("ListarViagensEvento/{eventoId}")]
public IActionResult ListarViagensEvento(Guid eventoId)
{
    var viagens = _context.Viagem
        .Where(v => v.EventoId == eventoId)
        .Select(v => new ViagemEventoDto
        {
            EventoId = eventoId,
            ViagemId = v.ViagemId,
            NoFichaVistoria = v.NoFichaVistoria ?? 0,
            NomeRequisitante = v.Requisitante.Nome,
            NomeSetor = v.SetorSolicitante.Nome,
            NomeMotorista = v.Motorista.Nome,
            DescricaoVeiculo = $"{v.Veiculo.Placa} - {v.Veiculo.ModeloVeiculo.DescricaoModelo}",
            CustoViagem = v.CustoTotal ?? 0,
            DataInicial = v.DataInicial ?? DateTime.MinValue,
            HoraInicio = v.HoraInicio,
            Placa = v.Veiculo.Placa
        })
        .ToList();
    
    return Json(new { data = viagens });
}
```

---

## 📝 Notas Importantes

1. **HoraInicio como DateTime?** - Comentário no código indica que deve ser `DateTime?` e não `TimeSpan?`.

2. **Dados agregados** - Inclui informações de múltiplas entidades relacionadas.

---

**📅 Documentação criada em:** 08/01/2026
