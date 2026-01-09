# Documentação: EventoListDto.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 🎯 Objetivos

O DTO `EventoListDto` é usado para transferir dados de eventos em formato otimizado para listagens, incluindo informações agregadas como custos e quantidade de participantes.

**Principais objetivos:**

✅ Otimizar queries de listagem evitando carregar entidade completa  
✅ Incluir dados calculados (custo total, participantes)  
✅ Formatar dados para exibição (HTML, moeda)

---

## 🏗️ Estrutura do Model

```csharp
public class EventoListDto
{
    public Guid EventoId { get; set; }
    public string Nome { get; set; }
    public string Descricao { get; set; }
    public DateTime? DataInicial { get; set; }
    public DateTime? DataFinal { get; set; }
    public string QtdParticipantes { get; set; } // ✅ Formatado como string
    public string Status { get; set; }
    public string NomeRequisitante { get; set; }
    public string NomeRequisitanteHTML { get; set; } // ✅ Com tags HTML
    public string NomeSetor { get; set; }
    public string CustoViagem { get; set; } // ✅ Formatado como moeda
    public decimal CustoViagemNaoFormatado { get; set; } // ✅ Para ordenação
}
```

---

## 🔗 Quem Chama e Por Quê

### EventoRepository.cs → Listagem Paginada

```csharp
public async Task<(List<EventoListDto> eventos, int totalItems)> GetEventosPaginadoAsync(...)
{
    var eventos = await query
        .Select(e => new EventoListDto
        {
            EventoId = e.EventoId,
            Nome = e.Nome,
            CustoViagem = "R$ 0,00", // ✅ Será calculado depois
            CustoViagemNaoFormatado = 0m
        })
        .ToListAsync();
    
    // ✅ Calcula custos em batch
    var custosPorEvento = await _db.Viagem
        .Where(v => eventoIds.Contains(v.EventoId.Value))
        .GroupBy(v => v.EventoId)
        .Select(g => new { EventoId = g.Key, Custo = g.Sum(v => v.CustoTotal) })
        .ToDictionaryAsync(x => x.EventoId, x => x.Custo);
    
    // ✅ Atualiza DTOs com custos calculados
    foreach (var evento in eventos)
    {
        if (custosPorEvento.TryGetValue(evento.EventoId, out var custo))
        {
            evento.CustoViagemNaoFormatado = (decimal)custo;
            evento.CustoViagem = custo.ToString("C2", new CultureInfo("pt-BR"));
        }
    }
    
    return (eventos, totalItems);
}
```

---

## 📝 Notas Importantes

1. **Campos formatados** - `CustoViagem` como string formatada, `CustoViagemNaoFormatado` para ordenação.

2. **HTML** - `NomeRequisitanteHTML` inclui tags HTML para formatação visual.

3. **Performance** - DTO evita carregar relacionamentos desnecessários.

---

**📅 Documentação criada em:** 08/01/2026
