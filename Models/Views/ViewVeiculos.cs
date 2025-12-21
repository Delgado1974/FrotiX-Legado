using System;

namespace FrotiX.Models
{
    /// <summary>
    /// Modelo mapeado da ViewVeiculos
    /// Tipos verificados campo a campo com o SQL da View
    /// </summary>
    public class ViewVeiculos
    {
        // Veiculo.VeiculoId - UNIQUEIDENTIFIER NOT NULL
        public Guid VeiculoId { get; set; }

        // Veiculo.Placa - VARCHAR(10) NOT NULL
        public string? Placa { get; set; }

        // Veiculo.Economildo - BIT NULL
        public bool? Economildo { get; set; }

        // Veiculo.Quilometragem - INT NULL
        public int? Quilometragem { get; set; }

        // Placa + '(' + Marca + '/' + Modelo + ')' - VARCHAR (concatenação)
        public string? VeiculoCompleto { get; set; }

        // DescricaoMarca + '/' + DescricaoModelo - VARCHAR (concatenação)
        public string? MarcaModelo { get; set; }

        // Unidade.Sigla - VARCHAR(50) NULL
        public string? Sigla { get; set; }

        // Combustivel.Descricao - VARCHAR(50) NOT NULL
        public string? Descricao { get; set; }

        // CAST(ROUND(AVG(...), 2) AS DEC(10, 2)) - DECIMAL(10,2)
        public decimal? Consumo { get; set; }

        // CASE WHEN ... END - VARCHAR (resultado de CASE é string)
        public string? OrigemVeiculo { get; set; }

        // CONVERT(VARCHAR, DataAlteracao, 103) - VARCHAR
        public string? DataAlteracao { get; set; }

        // AspNetUsers.NomeCompleto - NVARCHAR(100) NULL
        public string? NomeCompleto { get; set; }

        // CASE WHEN Reserva = 0 THEN 'Efetivo' ELSE 'Reserva' END - VARCHAR
        public string? VeiculoReserva { get; set; }

        // Veiculo.Status - BIT NULL
        public bool? Status { get; set; }

        // Veiculo.CombustivelId - UNIQUEIDENTIFIER NULL
        public Guid? CombustivelId { get; set; }

        // ROW_NUMBER() OVER (ORDER BY Placa) - BIGINT
        public long? RowNum { get; set; }

        // ViewContratoFornecedor_Veiculos.ContratoId - UNIQUEIDENTIFIER NULL (LEFT JOIN)
        public Guid? ContratoId { get; set; }

        // ViewAtaFornecedor.AtaId - UNIQUEIDENTIFIER NULL (LEFT JOIN)
        public Guid? AtaId { get; set; }

        // ViewContratoFornecedor_Veiculos.ContratoVeiculo - VARCHAR NULL (LEFT JOIN)
        public string? ContratoVeiculo { get; set; }

        // ViewAtaFornecedor.AtaVeiculo - VARCHAR NULL (LEFT JOIN)
        public string? AtaVeiculo { get; set; }

        // Veiculo.VeiculoProprio - BIT NULL
        public bool? VeiculoProprio { get; set; }

        // Veiculo.ItemVeiculoAtaId - UNIQUEIDENTIFIER NULL
        public Guid? ItemVeiculoAtaId { get; set; }

        // Veiculo.ItemVeiculoId - UNIQUEIDENTIFIER NULL
        public Guid? ItemVeiculoId { get; set; }

        // Veiculo.ValorMensal - FLOAT NULL (FLOAT = double em C#)
        public double? ValorMensal { get; set; }

        public string? Categoria { get; set; }
    }
}
