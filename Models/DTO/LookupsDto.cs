using System;

namespace FrotiX.Models.DTO // <-- ajuste para o namespace do seu projeto
    {
    public sealed record MotoristaData(Guid MotoristaId, string Nome);

    public sealed record VeiculoData(Guid VeiculoId, string Descricao);

    public sealed record VeiculoReservaData(Guid VeiculoId, string Descricao);
    }


