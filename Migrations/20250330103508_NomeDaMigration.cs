using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FrotiX.Migrations
    {
    /// <inheritdoc />
    public partial class NomeDaMigration : Migration
        {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
            {
            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                    {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeCompleto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Ponto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ramal = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    Foto = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    Criacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UltimoLogin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DetentorCargaPatrimonial = table.Column<bool>(type: "bit", nullable: false),
                    UsuarioIdAlteracao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Discriminator = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Combustivel",
                columns: table => new
                    {
                    CombustivelId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Combustivel", x => x.CombustivelId);
                });

            migrationBuilder.CreateTable(
                name: "ControleAcesso",
                columns: table => new
                    {
                    UsuarioId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RecursoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Acesso = table.Column<bool>(type: "bit", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ControleAcesso", x => new { x.UsuarioId, x.RecursoId });
                });

            migrationBuilder.CreateTable(
                name: "CorridasCanceladasTaxiLeg",
                columns: table => new
                    {
                    CorridaCanceladaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Origem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Setor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SetorExtra = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Unidade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UnidadeExtra = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QtdPassageiros = table.Column<int>(type: "int", nullable: true),
                    MotivoUso = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataAgenda = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HoraAgenda = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataHoraCancelamento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HoraCancelamento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TipoCancelamento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MotivoCancelamento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TempoEspera = table.Column<int>(type: "int", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CorridasCanceladasTaxiLeg", x => x.CorridaCanceladaId);
                });

            migrationBuilder.CreateTable(
                name: "CorridasTaxiLeg",
                columns: table => new
                    {
                    CorridaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Origem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Setor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescSetor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Unidade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescUnidade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QtdPassageiros = table.Column<int>(type: "int", nullable: true),
                    MotivoUso = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataAgenda = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HoraAgenda = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraAceite = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraLocal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraInicio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraFinal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KmReal = table.Column<double>(type: "float", nullable: true),
                    QtdEstrelas = table.Column<int>(type: "int", nullable: true),
                    Avaliacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Duracao = table.Column<int>(type: "int", nullable: true),
                    Espera = table.Column<int>(type: "int", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CorridasTaxiLeg", x => x.CorridaId);
                });

            migrationBuilder.CreateTable(
                name: "CustoMensalItensContrato",
                columns: table => new
                    {
                    NotaFiscalId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Ano = table.Column<int>(type: "int", nullable: false),
                    Mes = table.Column<int>(type: "int", nullable: false),
                    CustoMensalOperador = table.Column<double>(type: "float", nullable: true),
                    CustoMensalMotorista = table.Column<double>(type: "float", nullable: true),
                    CustoMensalLavador = table.Column<double>(type: "float", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustoMensalItensContrato", x => new { x.NotaFiscalId, x.Ano, x.Mes });
                });

            migrationBuilder.CreateTable(
                name: "Fornecedor",
                columns: table => new
                    {
                    FornecedorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DescricaoFornecedor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CNPJ = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Endereco = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Contato01 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Telefone01 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Contato02 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Telefone02 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fornecedor", x => x.FornecedorId);
                });

            migrationBuilder.CreateTable(
                name: "LavadorContrato",
                columns: table => new
                    {
                    LavadorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LavadorContrato", x => new { x.LavadorId, x.ContratoId });
                });

            migrationBuilder.CreateTable(
                name: "LotacaoMotorista",
                columns: table => new
                    {
                    LotacaoMotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaCoberturaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UnidadeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DataInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataFim = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Lotado = table.Column<bool>(type: "bit", nullable: true),
                    Motivo = table.Column<string>(type: "nvarchar(max)", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LotacaoMotorista", x => x.LotacaoMotoristaId);
                });

            migrationBuilder.CreateTable(
                name: "MarcaVeiculo",
                columns: table => new
                    {
                    MarcaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DescricaoMarca = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarcaVeiculo", x => x.MarcaId);
                });

            migrationBuilder.CreateTable(
                name: "MediaCombustivel",
                columns: table => new
                    {
                    NotaFiscalId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CombustivelId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Ano = table.Column<int>(type: "int", nullable: false),
                    Mes = table.Column<int>(type: "int", nullable: false),
                    PrecoMedio = table.Column<double>(type: "float", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaCombustivel", x => new { x.NotaFiscalId, x.CombustivelId, x.Ano, x.Mes });
                });

            migrationBuilder.CreateTable(
                name: "MotoristaContrato",
                columns: table => new
                    {
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MotoristaContrato", x => new { x.MotoristaId, x.ContratoId });
                });

            migrationBuilder.CreateTable(
                name: "MovimentacaoPatrimonio",
                columns: table => new
                    {
                    MovimentacaoPatrimonioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataMovimentacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResponsavelMovimentacao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SetorOrigemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SetorDestinoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SecaoOrigemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SecaoDestinoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatrimonioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimentacaoPatrimonio", x => x.MovimentacaoPatrimonioId);
                });

            migrationBuilder.CreateTable(
                name: "OperadorContrato",
                columns: table => new
                    {
                    OperadorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperadorContrato", x => new { x.OperadorId, x.ContratoId });
                });

            migrationBuilder.CreateTable(
                name: "OrgaoAutuante",
                columns: table => new
                    {
                    OrgaoAutuanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Sigla = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrgaoAutuante", x => x.OrgaoAutuanteId);
                });

            migrationBuilder.CreateTable(
                name: "PlacaBronze",
                columns: table => new
                    {
                    PlacaBronzeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DescricaoPlaca = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlacaBronze", x => x.PlacaBronzeId);
                });

            migrationBuilder.CreateTable(
                name: "Recurso",
                columns: table => new
                    {
                    RecursoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeMenu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Ordem = table.Column<double>(type: "float", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recurso", x => x.RecursoId);
                });

            migrationBuilder.CreateTable(
                name: "RegistroCupomAbastecimento",
                columns: table => new
                    {
                    RegistroCupomId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataRegistro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Observacoes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RegistroPDF = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistroCupomAbastecimento", x => x.RegistroCupomId);
                });

            migrationBuilder.CreateTable(
                name: "SetorPatrimonial",
                columns: table => new
                    {
                    SetorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NomeSetor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DetentorId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SetorPatrimonial", x => x.SetorId);
                });

            migrationBuilder.CreateTable(
                name: "SetorSolicitante",
                columns: table => new
                    {
                    SetorSolicitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Sigla = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SetorPaiId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Ramal = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    DataAlteracao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsuarioIdAlteracao = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SetorSolicitante", x => x.SetorSolicitanteId);
                });

            migrationBuilder.CreateTable(
                name: "TipoMulta",
                columns: table => new
                    {
                    TipoMultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Artigo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Infracao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CodigoDenatran = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Desdobramento = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoMulta", x => x.TipoMultaId);
                });

            migrationBuilder.CreateTable(
                name: "Unidade",
                columns: table => new
                    {
                    UnidadeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Sigla = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PontoPrimeiroContato = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PrimeiroContato = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PrimeiroRamal = table.Column<long>(type: "bigint", nullable: false),
                    PontoSegundoContato = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SegundoContato = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SegundoRamal = table.Column<long>(type: "bigint", nullable: true),
                    PontoTerceiroContato = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TerceiroContato = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TerceiroRamal = table.Column<long>(type: "bigint", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    Categoria = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QtdMotoristas = table.Column<int>(type: "int", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Unidade", x => x.UnidadeId);
                });

            migrationBuilder.CreateTable(
                name: "VeiculoAta",
                columns: table => new
                    {
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AtaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VeiculoAta", x => new { x.VeiculoId, x.AtaId });
                });

            migrationBuilder.CreateTable(
                name: "VeiculoContrato",
                columns: table => new
                    {
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VeiculoContrato", x => new { x.VeiculoId, x.ContratoId });
                });

            migrationBuilder.CreateTable(
                name: "ViewAbastecimentos",
                columns: table => new
                    {
                    AbastecimentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DataHora = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Data = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Hora = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Placa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TipoVeiculo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MotoristaCondutor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TipoCombustivel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Sigla = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Litros = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValorUnitario = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValorTotal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Consumo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConsumoGeral = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    KmRodado = table.Column<int>(type: "int", nullable: false),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CombustivelId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UnidadeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewAtaFornecedor",
                columns: table => new
                    {
                    AtaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AtaVeiculo = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewContratoFornecedor",
                columns: table => new
                    {
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TipoContrato = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewControleAcesso",
                columns: table => new
                    {
                    UsuarioId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RecursoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Acesso = table.Column<bool>(type: "bit", nullable: true),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Ordem = table.Column<double>(type: "float", nullable: true),
                    NomeCompleto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IDS = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewCustosViagem",
                columns: table => new
                    {
                    ViagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SetorSolicitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NoFichaVistoria = table.Column<int>(type: "int", nullable: true),
                    DataInicial = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataFinal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraInicio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraFim = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Finalidade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KmInicial = table.Column<int>(type: "int", nullable: true),
                    KmFinal = table.Column<int>(type: "int", nullable: true),
                    Quilometragem = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoVeiculo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeMotorista = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustoMotorista = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustoVeiculo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustoCombustivel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusAgendamento = table.Column<bool>(type: "bit", nullable: true),
                    RowNum = table.Column<long>(type: "bigint", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewEmpenhoMulta",
                columns: table => new
                    {
                    EmpenhoMultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrgaoAutuanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NotaEmpenho = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AnoVigencia = table.Column<int>(type: "int", nullable: true),
                    SaldoInicial = table.Column<double>(type: "float", nullable: true),
                    SaldoAtual = table.Column<double>(type: "float", nullable: true),
                    SaldoMovimentacao = table.Column<double>(type: "float", nullable: true),
                    SaldoMultas = table.Column<double>(type: "float", nullable: true),
                    Movimentacoes = table.Column<int>(type: "int", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewEmpenhos",
                columns: table => new
                    {
                    EmpenhoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NotaEmpenho = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataEmissao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AnoVigencia = table.Column<int>(type: "int", nullable: true),
                    VigenciaInicial = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VigenciaFinal = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SaldoInicial = table.Column<double>(type: "float", nullable: true),
                    SaldoFinal = table.Column<double>(type: "float", nullable: true),
                    SaldoMovimentacao = table.Column<double>(type: "float", nullable: true),
                    SaldoNotas = table.Column<double>(type: "float", nullable: true),
                    Movimentacoes = table.Column<int>(type: "int", nullable: true),
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AtaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewEventos",
                columns: table => new
                    {
                    EventoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QtdParticipantes = table.Column<int>(type: "int", nullable: true),
                    DataInicial = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataFinal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeRequisitante = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeSetor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustoViagem = table.Column<double>(type: "float", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewExisteItemContrato",
                columns: table => new
                    {
                    ItemVeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ExisteVeiculo = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RepactuacaoContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NumItem = table.Column<int>(type: "int", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantidade = table.Column<int>(type: "int", nullable: true),
                    ValUnitario = table.Column<double>(type: "float", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewFluxoEconomildo",
                columns: table => new
                    {
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ViagemEconomildoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TipoCondutor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MOB = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraInicio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraFim = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QtdPassageiros = table.Column<int>(type: "int", nullable: true),
                    NomeMotorista = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoVeiculo = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewFluxoEconomildoData",
                columns: table => new
                    {
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ViagemEconomildoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TipoCondutor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MOB = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraInicio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraFim = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QtdPassageiros = table.Column<int>(type: "int", nullable: true),
                    NomeMotorista = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoVeiculo = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewItensManutencao",
                columns: table => new
                    {
                    ItemManutencaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ManutencaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoItem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NumFicha = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataItem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Resumo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImagemOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeMotorista = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ViagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewLavagem",
                columns: table => new
                    {
                    LavagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LavadoresId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Data = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Horario = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Lavadores = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoVeiculo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewLotacaoMotorista",
                columns: table => new
                    {
                    UnidadeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LotacaoMotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Lotado = table.Column<bool>(type: "bit", nullable: true),
                    Motivo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Unidade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataInicial = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataFim = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MotoristaCobertura = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewLotacoes",
                columns: table => new
                    {
                    LotacaoMotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UnidadeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NomeCategoria = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Unidade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Motorista = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataInicio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Lotado = table.Column<bool>(type: "bit", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewManutencao",
                columns: table => new
                    {
                    ManutencaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NumOS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataSolicitacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataEntrega = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataRecolhimento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataDevolucao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataRecebimentoReserva = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataDevolucaoReserva = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResumoOS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusOS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoVeiculo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Reserva = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewMediaConsumo",
                columns: table => new
                    {
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConsumoGeral = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewMotoristaFluxo",
                columns: table => new
                    {
                    MotoristaId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeMotorista = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewMotoristas",
                columns: table => new
                    {
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MotoristaCondutor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Ponto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CNH = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CategoriaCNH = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Celular01 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    Sigla = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AnoContrato = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NumeroContrato = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoFornecedor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeCompleto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TipoCondutor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EfetivoFerista = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Foto = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    DataAlteracao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "viewMultas",
                columns: table => new
                    {
                    MultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrgaoAutuanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TipoMultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NumInfracao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Data = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Hora = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Placa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Telefone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Sigla = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Localizacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Artigo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Vencimento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValorAteVencimento = table.Column<double>(type: "float", nullable: true),
                    ValorPosVencimento = table.Column<double>(type: "float", nullable: true),
                    ProcessoEDoc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Fase = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Observacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Paga = table.Column<bool>(type: "bit", nullable: true),
                    DataPagamento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValorPago = table.Column<double>(type: "float", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewNoFichaVistoria",
                columns: table => new
                    {
                    NoFichaVistoria = table.Column<int>(type: "int", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewOcorrencia",
                columns: table => new
                    {
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ViagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NoFichaVistoria = table.Column<int>(type: "int", nullable: true),
                    DataInicial = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeMotorista = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoVeiculo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResumoOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ImagemOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ItemManutencaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DescricaoOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoSolucaoOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewPendenciasManutencao",
                columns: table => new
                    {
                    ItemManutencaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ManutencaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ViagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TipoItem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NumFicha = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataItem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Resumo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImagemOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewProcuraFicha",
                columns: table => new
                    {
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DataInicial = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataFinal = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HoraInicio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraFim = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoFichaVistoria = table.Column<int>(type: "int", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewRequisitantes",
                columns: table => new
                    {
                    RequisitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Requisitante = table.Column<string>(type: "nvarchar(max)", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewSetores",
                columns: table => new
                    {
                    SetorSolicitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SetorPaiId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewVeiculos",
                columns: table => new
                    {
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Placa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MarcaModelo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Sigla = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Consumo = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Quilometragem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrigemVeiculo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataAlteracao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeCompleto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VeiculoReserva = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true),
                    CombustivelId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewViagens",
                columns: table => new
                    {
                    ViagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoFichaVistoria = table.Column<int>(type: "int", nullable: true),
                    DataInicial = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataFinal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraInicio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraFim = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KmInicial = table.Column<int>(type: "int", nullable: true),
                    KmFinal = table.Column<int>(type: "int", nullable: true),
                    CombustivelInicial = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CombustivelFinal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResumoOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoSolucaoOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeRequisitante = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeSetor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeMotorista = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoVeiculo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusDocumento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusCartaoAbastecimento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Finalidade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Placa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImagemOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusAgendamento = table.Column<bool>(type: "bit", nullable: true),
                    CustoViagem = table.Column<double>(type: "float", nullable: true),
                    RequisitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SetorSolicitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UnidadeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ItemManutencaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EventoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewViagensAgenda",
                columns: table => new
                    {
                    ViagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataInicial = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HoraInicio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusAgendamento = table.Column<bool>(type: "bit", nullable: true),
                    FoiAgendamento = table.Column<bool>(type: "bit", nullable: true),
                    Finalidade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeEvento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EventoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ViewViagensAgendaTodosMeses",
                columns: table => new
                    {
                    ViagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataInicial = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HoraInicio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusAgendamento = table.Column<bool>(type: "bit", nullable: true),
                    Finalidade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeEvento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "AtaRegistroPrecos",
                columns: table => new
                    {
                    AtaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumeroAta = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AnoAta = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AnoProcesso = table.Column<int>(type: "int", nullable: false),
                    NumeroProcesso = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Objeto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataFim = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Valor = table.Column<double>(type: "float", nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    FornecedorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AtaRegistroPrecos", x => x.AtaId);
                    table.ForeignKey(
                        name: "FK_AtaRegistroPrecos_Fornecedor_FornecedorId",
                        column: x => x.FornecedorId,
                        principalTable: "Fornecedor",
                        principalColumn: "FornecedorId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Contrato",
                columns: table => new
                    {
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumeroContrato = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AnoContrato = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Vigencia = table.Column<int>(type: "int", nullable: false),
                    Prorrogacao = table.Column<int>(type: "int", nullable: true),
                    AnoProcesso = table.Column<int>(type: "int", nullable: false),
                    NumeroProcesso = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Objeto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TipoContrato = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataRepactuacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataFim = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Valor = table.Column<double>(type: "float", nullable: false),
                    ContratoEncarregados = table.Column<bool>(type: "bit", nullable: false),
                    ContratoOperadores = table.Column<bool>(type: "bit", nullable: false),
                    ContratoMotoristas = table.Column<bool>(type: "bit", nullable: false),
                    ContratoLavadores = table.Column<bool>(type: "bit", nullable: false),
                    CustoMensalEncarregado = table.Column<double>(type: "float", nullable: true),
                    CustoMensalOperador = table.Column<double>(type: "float", nullable: true),
                    CustoMensalMotorista = table.Column<double>(type: "float", nullable: true),
                    CustoMensalLavador = table.Column<double>(type: "float", nullable: true),
                    QuantidadeEncarregado = table.Column<int>(type: "int", nullable: true),
                    QuantidadeMotorista = table.Column<int>(type: "int", nullable: true),
                    QuantidadeOperador = table.Column<int>(type: "int", nullable: true),
                    QuantidadeLavador = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    FornecedorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contrato", x => x.ContratoId);
                    table.ForeignKey(
                        name: "FK_Contrato_Fornecedor_FornecedorId",
                        column: x => x.FornecedorId,
                        principalTable: "Fornecedor",
                        principalColumn: "FornecedorId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModeloVeiculo",
                columns: table => new
                    {
                    ModeloId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DescricaoModelo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    MarcaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModeloVeiculo", x => x.ModeloId);
                    table.ForeignKey(
                        name: "FK_ModeloVeiculo_MarcaVeiculo_MarcaId",
                        column: x => x.MarcaId,
                        principalTable: "MarcaVeiculo",
                        principalColumn: "MarcaId");
                });

            migrationBuilder.CreateTable(
                name: "EmpenhoMulta",
                columns: table => new
                    {
                    EmpenhoMultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NotaEmpenho = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    AnoVigencia = table.Column<int>(type: "int", nullable: false),
                    SaldoInicial = table.Column<double>(type: "float", nullable: false),
                    SaldoAtual = table.Column<double>(type: "float", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    OrgaoAutuanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmpenhoMulta", x => x.EmpenhoMultaId);
                    table.ForeignKey(
                        name: "FK_EmpenhoMulta_OrgaoAutuante_OrgaoAutuanteId",
                        column: x => x.OrgaoAutuanteId,
                        principalTable: "OrgaoAutuante",
                        principalColumn: "OrgaoAutuanteId");
                });

            migrationBuilder.CreateTable(
                name: "SecaoPatrimonial",
                columns: table => new
                    {
                    SecaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NomeSecao = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SetorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecaoPatrimonial", x => x.SecaoId);
                    table.ForeignKey(
                        name: "FK_SecaoPatrimonial_SetorPatrimonial_SetorId",
                        column: x => x.SetorId,
                        principalTable: "SetorPatrimonial",
                        principalColumn: "SetorId");
                });

            migrationBuilder.CreateTable(
                name: "Requisitante",
                columns: table => new
                    {
                    RequisitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ponto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ramal = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    DataAlteracao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsuarioIdAlteracao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SetorSolicitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Requisitante", x => x.RequisitanteId);
                    table.ForeignKey(
                        name: "FK_Requisitante_SetorSolicitante_SetorSolicitanteId",
                        column: x => x.SetorSolicitanteId,
                        principalTable: "SetorSolicitante",
                        principalColumn: "SetorSolicitanteId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RepactuacaoAta",
                columns: table => new
                    {
                    RepactuacaoAtaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataRepactuacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AtaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepactuacaoAta", x => x.RepactuacaoAtaId);
                    table.ForeignKey(
                        name: "FK_RepactuacaoAta_AtaRegistroPrecos_AtaId",
                        column: x => x.AtaId,
                        principalTable: "AtaRegistroPrecos",
                        principalColumn: "AtaId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Empenho",
                columns: table => new
                    {
                    EmpenhoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NotaEmpenho = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    DataEmissao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    VigenciaInicial = table.Column<DateTime>(type: "datetime2", nullable: false),
                    VigenciaFinal = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AnoVigencia = table.Column<int>(type: "int", nullable: false),
                    SaldoInicial = table.Column<double>(type: "float", nullable: false),
                    SaldoFinal = table.Column<double>(type: "float", nullable: true),
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AtaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empenho", x => x.EmpenhoId);
                    table.ForeignKey(
                        name: "FK_Empenho_AtaRegistroPrecos_AtaId",
                        column: x => x.AtaId,
                        principalTable: "AtaRegistroPrecos",
                        principalColumn: "AtaId");
                    table.ForeignKey(
                        name: "FK_Empenho_Contrato_ContratoId",
                        column: x => x.ContratoId,
                        principalTable: "Contrato",
                        principalColumn: "ContratoId");
                });

            migrationBuilder.CreateTable(
                name: "Lavador",
                columns: table => new
                    {
                    LavadorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Ponto = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DataNascimento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CPF = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Celular01 = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Celular02 = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DataIngresso = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Foto = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    DataAlteracao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsuarioIdAlteracao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lavador", x => x.LavadorId);
                    table.ForeignKey(
                        name: "FK_Lavador_Contrato_ContratoId",
                        column: x => x.ContratoId,
                        principalTable: "Contrato",
                        principalColumn: "ContratoId");
                });

            migrationBuilder.CreateTable(
                name: "Motorista",
                columns: table => new
                    {
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Ponto = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DataNascimento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CPF = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CNH = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CategoriaCNH = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DataVencimentoCNH = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Celular01 = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Celular02 = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DataIngresso = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OrigemIndicacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TipoCondutor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Foto = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    CNHDigital = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    DataAlteracao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsuarioIdAlteracao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UnidadeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EfetivoFerista = table.Column<string>(type: "nvarchar(max)", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Motorista", x => x.MotoristaId);
                    table.ForeignKey(
                        name: "FK_Motorista_Contrato_ContratoId",
                        column: x => x.ContratoId,
                        principalTable: "Contrato",
                        principalColumn: "ContratoId");
                    table.ForeignKey(
                        name: "FK_Motorista_Unidade_UnidadeId",
                        column: x => x.UnidadeId,
                        principalTable: "Unidade",
                        principalColumn: "UnidadeId");
                });

            migrationBuilder.CreateTable(
                name: "Operador",
                columns: table => new
                    {
                    OperadorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Ponto = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DataNascimento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CPF = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Celular01 = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Celular02 = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DataIngresso = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Foto = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    DataAlteracao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsuarioIdAlteracao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Operador", x => x.OperadorId);
                    table.ForeignKey(
                        name: "FK_Operador_Contrato_ContratoId",
                        column: x => x.ContratoId,
                        principalTable: "Contrato",
                        principalColumn: "ContratoId");
                });

            migrationBuilder.CreateTable(
                name: "RepactuacaoContrato",
                columns: table => new
                    {
                    RepactuacaoContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataRepactuacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Valor = table.Column<double>(type: "float", nullable: true),
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Vigencia = table.Column<int>(type: "int", nullable: true),
                    Prorrogacao = table.Column<int>(type: "int", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepactuacaoContrato", x => x.RepactuacaoContratoId);
                    table.ForeignKey(
                        name: "FK_RepactuacaoContrato_Contrato_ContratoId",
                        column: x => x.ContratoId,
                        principalTable: "Contrato",
                        principalColumn: "ContratoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Patrimonio",
                columns: table => new
                    {
                    PatrimonioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NPR = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Marca = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Modelo = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    NumeroSerie = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    LocalizacaoAtual = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Situacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SetorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SecaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patrimonio", x => x.PatrimonioId);
                    table.ForeignKey(
                        name: "FK_Patrimonio_SecaoPatrimonial_SecaoId",
                        column: x => x.SecaoId,
                        principalTable: "SecaoPatrimonial",
                        principalColumn: "SecaoId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Patrimonio_SetorPatrimonial_SetorId",
                        column: x => x.SetorId,
                        principalTable: "SetorPatrimonial",
                        principalColumn: "SetorId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Evento",
                columns: table => new
                    {
                    EventoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    QtdParticipantes = table.Column<int>(type: "int", nullable: false),
                    DataInicial = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataFinal = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SetorSolicitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequisitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evento", x => x.EventoId);
                    table.ForeignKey(
                        name: "FK_Evento_Requisitante_RequisitanteId",
                        column: x => x.RequisitanteId,
                        principalTable: "Requisitante",
                        principalColumn: "RequisitanteId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Evento_SetorSolicitante_SetorSolicitanteId",
                        column: x => x.SetorSolicitanteId,
                        principalTable: "SetorSolicitante",
                        principalColumn: "SetorSolicitanteId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ItemVeiculoAta",
                columns: table => new
                    {
                    ItemVeiculoAtaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumItem = table.Column<int>(type: "int", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantidade = table.Column<int>(type: "int", nullable: true),
                    ValorUnitario = table.Column<double>(type: "float", nullable: true),
                    RepactuacaoAtaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemVeiculoAta", x => x.ItemVeiculoAtaId);
                    table.ForeignKey(
                        name: "FK_ItemVeiculoAta_RepactuacaoAta_RepactuacaoAtaId",
                        column: x => x.RepactuacaoAtaId,
                        principalTable: "RepactuacaoAta",
                        principalColumn: "RepactuacaoAtaId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MovimentacaoEmpenho",
                columns: table => new
                    {
                    MovimentacaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TipoMovimentacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Valor = table.Column<double>(type: "float", nullable: true),
                    DataMovimentacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EmpenhoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimentacaoEmpenho", x => x.MovimentacaoId);
                    table.ForeignKey(
                        name: "FK_MovimentacaoEmpenho_Empenho_EmpenhoId",
                        column: x => x.EmpenhoId,
                        principalTable: "Empenho",
                        principalColumn: "EmpenhoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ItemVeiculoContrato",
                columns: table => new
                    {
                    ItemVeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumItem = table.Column<int>(type: "int", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantidade = table.Column<int>(type: "int", nullable: true),
                    ValorUnitario = table.Column<double>(type: "float", nullable: true),
                    RepactuacaoContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemVeiculoContrato", x => x.ItemVeiculoId);
                    table.ForeignKey(
                        name: "FK_ItemVeiculoContrato_RepactuacaoContrato_RepactuacaoContratoId",
                        column: x => x.RepactuacaoContratoId,
                        principalTable: "RepactuacaoContrato",
                        principalColumn: "RepactuacaoContratoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RepactuacaoServicos",
                columns: table => new
                    {
                    RepactuacaoServicoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataRepactuacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Valor = table.Column<double>(type: "float", nullable: true),
                    RepactuacaoContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepactuacaoServicos", x => x.RepactuacaoServicoId);
                    table.ForeignKey(
                        name: "FK_RepactuacaoServicos_RepactuacaoContrato_RepactuacaoContratoId",
                        column: x => x.RepactuacaoContratoId,
                        principalTable: "RepactuacaoContrato",
                        principalColumn: "RepactuacaoContratoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RepactuacaoTerceirizacao",
                columns: table => new
                    {
                    RepactuacaoTerceirizacaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataRepactuacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ValorEncarregado = table.Column<double>(type: "float", nullable: true),
                    ValorOperador = table.Column<double>(type: "float", nullable: true),
                    ValorMotorista = table.Column<double>(type: "float", nullable: true),
                    ValorLavador = table.Column<double>(type: "float", nullable: true),
                    QtdEncarregados = table.Column<int>(type: "int", nullable: true),
                    QtdOperadores = table.Column<int>(type: "int", nullable: true),
                    QtdMotoristas = table.Column<int>(type: "int", nullable: true),
                    QtdLavadores = table.Column<int>(type: "int", nullable: true),
                    RepactuacaoContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepactuacaoTerceirizacao", x => x.RepactuacaoTerceirizacaoId);
                    table.ForeignKey(
                        name: "FK_RepactuacaoTerceirizacao_RepactuacaoContrato_RepactuacaoContratoId",
                        column: x => x.RepactuacaoContratoId,
                        principalTable: "RepactuacaoContrato",
                        principalColumn: "RepactuacaoContratoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Veiculo",
                columns: table => new
                    {
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Placa = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Quilometragem = table.Column<int>(type: "int", nullable: true),
                    Renavam = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PlacaVinculada = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    AnoFabricacao = table.Column<int>(type: "int", nullable: true),
                    AnoModelo = table.Column<int>(type: "int", nullable: true),
                    Reserva = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    VeiculoProprio = table.Column<bool>(type: "bit", nullable: false),
                    Patrimonio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Categoria = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CRLV = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    DataAlteracao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsuarioIdAlteracao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PlacaBronzeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MarcaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ModeloId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UnidadeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CombustivelId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AtaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ItemVeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ItemVeiculoAtaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DataIngresso = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Economildo = table.Column<bool>(type: "bit", nullable: false),
                    ValorMensal = table.Column<double>(type: "float", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Veiculo", x => x.VeiculoId);
                    table.ForeignKey(
                        name: "FK_Veiculo_AtaRegistroPrecos_AtaId",
                        column: x => x.AtaId,
                        principalTable: "AtaRegistroPrecos",
                        principalColumn: "AtaId");
                    table.ForeignKey(
                        name: "FK_Veiculo_Combustivel_CombustivelId",
                        column: x => x.CombustivelId,
                        principalTable: "Combustivel",
                        principalColumn: "CombustivelId");
                    table.ForeignKey(
                        name: "FK_Veiculo_ItemVeiculoAta_ItemVeiculoAtaId",
                        column: x => x.ItemVeiculoAtaId,
                        principalTable: "ItemVeiculoAta",
                        principalColumn: "ItemVeiculoAtaId");
                    table.ForeignKey(
                        name: "FK_Veiculo_ItemVeiculoContrato_ItemVeiculoId",
                        column: x => x.ItemVeiculoId,
                        principalTable: "ItemVeiculoContrato",
                        principalColumn: "ItemVeiculoId");
                    table.ForeignKey(
                        name: "FK_Veiculo_MarcaVeiculo_MarcaId",
                        column: x => x.MarcaId,
                        principalTable: "MarcaVeiculo",
                        principalColumn: "MarcaId");
                    table.ForeignKey(
                        name: "FK_Veiculo_ModeloVeiculo_ModeloId",
                        column: x => x.ModeloId,
                        principalTable: "ModeloVeiculo",
                        principalColumn: "ModeloId");
                    table.ForeignKey(
                        name: "FK_Veiculo_PlacaBronze_PlacaBronzeId",
                        column: x => x.PlacaBronzeId,
                        principalTable: "PlacaBronze",
                        principalColumn: "PlacaBronzeId");
                    table.ForeignKey(
                        name: "FK_Veiculo_Unidade_UnidadeId",
                        column: x => x.UnidadeId,
                        principalTable: "Unidade",
                        principalColumn: "UnidadeId");
                });

            migrationBuilder.CreateTable(
                name: "Abastecimento",
                columns: table => new
                    {
                    AbastecimentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Litros = table.Column<double>(type: "float", nullable: true),
                    ValorUnitario = table.Column<double>(type: "float", nullable: true),
                    DataHora = table.Column<DateTime>(type: "datetime2", nullable: true),
                    KmRodado = table.Column<int>(type: "int", nullable: true),
                    Hodometro = table.Column<int>(type: "int", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CombustivelId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Abastecimento", x => x.AbastecimentoId);
                    table.ForeignKey(
                        name: "FK_Abastecimento_Combustivel_CombustivelId",
                        column: x => x.CombustivelId,
                        principalTable: "Combustivel",
                        principalColumn: "CombustivelId");
                    table.ForeignKey(
                        name: "FK_Abastecimento_Motorista_MotoristaId",
                        column: x => x.MotoristaId,
                        principalTable: "Motorista",
                        principalColumn: "MotoristaId");
                    table.ForeignKey(
                        name: "FK_Abastecimento_Veiculo_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculo",
                        principalColumn: "VeiculoId");
                });

            migrationBuilder.CreateTable(
                name: "Lavagem",
                columns: table => new
                    {
                    LavagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Horario = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lavagem", x => x.LavagemId);
                    table.ForeignKey(
                        name: "FK_Lavagem_Motorista_MotoristaId",
                        column: x => x.MotoristaId,
                        principalTable: "Motorista",
                        principalColumn: "MotoristaId");
                    table.ForeignKey(
                        name: "FK_Lavagem_Veiculo_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculo",
                        principalColumn: "VeiculoId");
                });

            migrationBuilder.CreateTable(
                name: "Manutencao",
                columns: table => new
                    {
                    ManutencaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumOS = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DataSolicitacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataRecolhimento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataEntrega = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataDevolucao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataRecebimentoReserva = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataDevolucaoReserva = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReservaEnviado = table.Column<bool>(type: "bit", nullable: true),
                    ManutencaoPreventiva = table.Column<bool>(type: "bit", nullable: true),
                    QuilometragemManutencao = table.Column<int>(type: "int", nullable: true),
                    ResumoOS = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    StatusOS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdUsuarioAlteracao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VeiculoReservaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Manutencao", x => x.ManutencaoId);
                    table.ForeignKey(
                        name: "FK_Manutencao_Veiculo_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculo",
                        principalColumn: "VeiculoId");
                    table.ForeignKey(
                        name: "FK_Manutencao_Veiculo_VeiculoReservaId",
                        column: x => x.VeiculoReservaId,
                        principalTable: "Veiculo",
                        principalColumn: "VeiculoId");
                });

            migrationBuilder.CreateTable(
                name: "Multa",
                columns: table => new
                    {
                    MultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumInfracao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Hora = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Localizacao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Vencimento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ValorAteVencimento = table.Column<double>(type: "float", nullable: true),
                    ValorPosVencimento = table.Column<double>(type: "float", nullable: false),
                    Observacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AutuacaoPDF = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PenalidadePDF = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ComprovantePDF = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProcessoEdocPDF = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OutrosDocumentosPDF = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Paga = table.Column<bool>(type: "bit", nullable: true),
                    EnviadaSecle = table.Column<bool>(type: "bit", nullable: true),
                    Fase = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProcessoEDoc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoFichaVistoria = table.Column<int>(type: "int", nullable: true),
                    DataNotificacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataLimite = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ValorPago = table.Column<double>(type: "float", nullable: true),
                    DataPagamento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FormaPagamento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContratoVeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ContratoMotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrgaoAutuanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TipoMultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EmpenhoMultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AtaVeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Multa", x => x.MultaId);
                    table.ForeignKey(
                        name: "FK_Multa_EmpenhoMulta_EmpenhoMultaId",
                        column: x => x.EmpenhoMultaId,
                        principalTable: "EmpenhoMulta",
                        principalColumn: "EmpenhoMultaId");
                    table.ForeignKey(
                        name: "FK_Multa_Motorista_MotoristaId",
                        column: x => x.MotoristaId,
                        principalTable: "Motorista",
                        principalColumn: "MotoristaId");
                    table.ForeignKey(
                        name: "FK_Multa_OrgaoAutuante_OrgaoAutuanteId",
                        column: x => x.OrgaoAutuanteId,
                        principalTable: "OrgaoAutuante",
                        principalColumn: "OrgaoAutuanteId");
                    table.ForeignKey(
                        name: "FK_Multa_TipoMulta_TipoMultaId",
                        column: x => x.TipoMultaId,
                        principalTable: "TipoMulta",
                        principalColumn: "TipoMultaId");
                    table.ForeignKey(
                        name: "FK_Multa_Veiculo_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculo",
                        principalColumn: "VeiculoId");
                });

            migrationBuilder.CreateTable(
                name: "NotaFiscal",
                columns: table => new
                    {
                    NotaFiscalId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumeroNF = table.Column<int>(type: "int", nullable: false),
                    DataEmissao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ValorNF = table.Column<double>(type: "float", nullable: false),
                    TipoNF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Objeto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValorGlosa = table.Column<double>(type: "float", nullable: true),
                    MotivoGlosa = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    AnoReferencia = table.Column<int>(type: "int", nullable: false),
                    MesReferencia = table.Column<int>(type: "int", nullable: false),
                    ContratoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AtaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EmpenhoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotaFiscal", x => x.NotaFiscalId);
                    table.ForeignKey(
                        name: "FK_NotaFiscal_AtaRegistroPrecos_ContratoId",
                        column: x => x.ContratoId,
                        principalTable: "AtaRegistroPrecos",
                        principalColumn: "AtaId");
                    table.ForeignKey(
                        name: "FK_NotaFiscal_Contrato_ContratoId",
                        column: x => x.ContratoId,
                        principalTable: "Contrato",
                        principalColumn: "ContratoId");
                    table.ForeignKey(
                        name: "FK_NotaFiscal_Empenho_EmpenhoId",
                        column: x => x.EmpenhoId,
                        principalTable: "Empenho",
                        principalColumn: "EmpenhoId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NotaFiscal_Veiculo_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculo",
                        principalColumn: "VeiculoId");
                });

            migrationBuilder.CreateTable(
                name: "ViagensEconomildo",
                columns: table => new
                    {
                    ViagemEconomildoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MOB = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Responsavel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdaVolta = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraInicio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoraFim = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QtdPassageiros = table.Column<int>(type: "int", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ViagensEconomildo", x => x.ViagemEconomildoId);
                    table.ForeignKey(
                        name: "FK_ViagensEconomildo_Motorista_MotoristaId",
                        column: x => x.MotoristaId,
                        principalTable: "Motorista",
                        principalColumn: "MotoristaId");
                    table.ForeignKey(
                        name: "FK_ViagensEconomildo_Veiculo_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculo",
                        principalColumn: "VeiculoId");
                });

            migrationBuilder.CreateTable(
                name: "LavadoresLavagem",
                columns: table => new
                    {
                    LavagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LavadorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LavadoresLavagem", x => new { x.LavagemId, x.LavadorId });
                    table.ForeignKey(
                        name: "FK_LavadoresLavagem_Lavador_LavadorId",
                        column: x => x.LavadorId,
                        principalTable: "Lavador",
                        principalColumn: "LavadorId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LavadoresLavagem_Lavagem_LavagemId",
                        column: x => x.LavagemId,
                        principalTable: "Lavagem",
                        principalColumn: "LavagemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MovimentacaoEmpenhoMulta",
                columns: table => new
                    {
                    MovimentacaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TipoMovimentacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Valor = table.Column<double>(type: "float", nullable: true),
                    DataMovimentacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmpenhoMultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimentacaoEmpenhoMulta", x => x.MovimentacaoId);
                    table.ForeignKey(
                        name: "FK_MovimentacaoEmpenhoMulta_EmpenhoMulta_EmpenhoMultaId",
                        column: x => x.EmpenhoMultaId,
                        principalTable: "EmpenhoMulta",
                        principalColumn: "EmpenhoMultaId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovimentacaoEmpenhoMulta_Multa_MultaId",
                        column: x => x.MultaId,
                        principalTable: "Multa",
                        principalColumn: "MultaId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ItensManutencao",
                columns: table => new
                    {
                    ItemManutencaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoItem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NumFicha = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataItem = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Resumo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImagemOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ManutencaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ViagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItensManutencao", x => x.ItemManutencaoId);
                    table.ForeignKey(
                        name: "FK_ItensManutencao_Manutencao_ManutencaoId",
                        column: x => x.ManutencaoId,
                        principalTable: "Manutencao",
                        principalColumn: "ManutencaoId");
                    table.ForeignKey(
                        name: "FK_ItensManutencao_Motorista_MotoristaId",
                        column: x => x.MotoristaId,
                        principalTable: "Motorista",
                        principalColumn: "MotoristaId");
                });

            migrationBuilder.CreateTable(
                name: "Viagem",
                columns: table => new
                    {
                    ViagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataInicial = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataFinal = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HoraInicio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HoraFim = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CombustivelInicial = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CombustivelFinal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RamalRequisitante = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KmInicial = table.Column<int>(type: "int", nullable: true),
                    KmFinal = table.Column<int>(type: "int", nullable: true),
                    KmAtual = table.Column<int>(type: "int", nullable: true),
                    NoFichaVistoria = table.Column<int>(type: "int", nullable: true),
                    Finalidade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NomeEvento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResumoOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoSolucaoOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusDocumento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusCartaoAbastecimento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusAgendamento = table.Column<bool>(type: "bit", nullable: true),
                    FoiAgendamento = table.Column<bool>(type: "bit", nullable: true),
                    Origem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Destino = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoSemFormato = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequisitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SetorSolicitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MotoristaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VeiculoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ItemManutencaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UsuarioIdCriacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataFinalizacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UsuarioIdFinalizacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FichaVistoria = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    Recorrente = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RecorrenciaViagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Intervalo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataFinalRecorrencia = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Monday = table.Column<bool>(type: "bit", nullable: true),
                    Tuesday = table.Column<bool>(type: "bit", nullable: true),
                    Wednesday = table.Column<bool>(type: "bit", nullable: true),
                    Thursday = table.Column<bool>(type: "bit", nullable: true),
                    Friday = table.Column<bool>(type: "bit", nullable: true),
                    Saturday = table.Column<bool>(type: "bit", nullable: true),
                    Sunday = table.Column<bool>(type: "bit", nullable: true),
                    CustoCombustivel = table.Column<double>(type: "float", nullable: true),
                    CustoMotorista = table.Column<double>(type: "float", nullable: true),
                    CustoVeiculo = table.Column<double>(type: "float", nullable: true),
                    CustoOperador = table.Column<double>(type: "float", nullable: true),
                    CustoLavador = table.Column<double>(type: "float", nullable: true),
                    Minutos = table.Column<int>(type: "int", nullable: true),
                    ImagemOcorrencia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EventoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DiaMesRecorrencia = table.Column<int>(type: "int", nullable: true),
                    UsuarioIdAgendamento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataAgendamento = table.Column<DateTime>(type: "datetime2", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Viagem", x => x.ViagemId);
                    table.ForeignKey(
                        name: "FK_Viagem_Evento_EventoId",
                        column: x => x.EventoId,
                        principalTable: "Evento",
                        principalColumn: "EventoId");
                    table.ForeignKey(
                        name: "FK_Viagem_ItensManutencao_ItemManutencaoId",
                        column: x => x.ItemManutencaoId,
                        principalTable: "ItensManutencao",
                        principalColumn: "ItemManutencaoId");
                    table.ForeignKey(
                        name: "FK_Viagem_Motorista_MotoristaId",
                        column: x => x.MotoristaId,
                        principalTable: "Motorista",
                        principalColumn: "MotoristaId");
                    table.ForeignKey(
                        name: "FK_Viagem_Requisitante_RequisitanteId",
                        column: x => x.RequisitanteId,
                        principalTable: "Requisitante",
                        principalColumn: "RequisitanteId");
                    table.ForeignKey(
                        name: "FK_Viagem_SetorSolicitante_SetorSolicitanteId",
                        column: x => x.SetorSolicitanteId,
                        principalTable: "SetorSolicitante",
                        principalColumn: "SetorSolicitanteId");
                    table.ForeignKey(
                        name: "FK_Viagem_Veiculo_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculo",
                        principalColumn: "VeiculoId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Abastecimento_CombustivelId",
                table: "Abastecimento",
                column: "CombustivelId");

            migrationBuilder.CreateIndex(
                name: "IX_Abastecimento_MotoristaId",
                table: "Abastecimento",
                column: "MotoristaId");

            migrationBuilder.CreateIndex(
                name: "IX_Abastecimento_VeiculoId",
                table: "Abastecimento",
                column: "VeiculoId");

            migrationBuilder.CreateIndex(
                name: "IX_AtaRegistroPrecos_FornecedorId",
                table: "AtaRegistroPrecos",
                column: "FornecedorId");

            migrationBuilder.CreateIndex(
                name: "IX_Contrato_FornecedorId",
                table: "Contrato",
                column: "FornecedorId");

            migrationBuilder.CreateIndex(
                name: "IX_Empenho_AtaId",
                table: "Empenho",
                column: "AtaId");

            migrationBuilder.CreateIndex(
                name: "IX_Empenho_ContratoId",
                table: "Empenho",
                column: "ContratoId");

            migrationBuilder.CreateIndex(
                name: "IX_EmpenhoMulta_OrgaoAutuanteId",
                table: "EmpenhoMulta",
                column: "OrgaoAutuanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Evento_RequisitanteId",
                table: "Evento",
                column: "RequisitanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Evento_SetorSolicitanteId",
                table: "Evento",
                column: "SetorSolicitanteId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemVeiculoAta_RepactuacaoAtaId",
                table: "ItemVeiculoAta",
                column: "RepactuacaoAtaId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemVeiculoContrato_RepactuacaoContratoId",
                table: "ItemVeiculoContrato",
                column: "RepactuacaoContratoId");

            migrationBuilder.CreateIndex(
                name: "IX_ItensManutencao_ManutencaoId",
                table: "ItensManutencao",
                column: "ManutencaoId");

            migrationBuilder.CreateIndex(
                name: "IX_ItensManutencao_MotoristaId",
                table: "ItensManutencao",
                column: "MotoristaId");

            migrationBuilder.CreateIndex(
                name: "IX_ItensManutencao_ViagemId",
                table: "ItensManutencao",
                column: "ViagemId");

            migrationBuilder.CreateIndex(
                name: "IX_Lavador_ContratoId",
                table: "Lavador",
                column: "ContratoId");

            migrationBuilder.CreateIndex(
                name: "IX_LavadoresLavagem_LavadorId",
                table: "LavadoresLavagem",
                column: "LavadorId");

            migrationBuilder.CreateIndex(
                name: "IX_Lavagem_MotoristaId",
                table: "Lavagem",
                column: "MotoristaId");

            migrationBuilder.CreateIndex(
                name: "IX_Lavagem_VeiculoId",
                table: "Lavagem",
                column: "VeiculoId");

            migrationBuilder.CreateIndex(
                name: "IX_Manutencao_VeiculoId",
                table: "Manutencao",
                column: "VeiculoId");

            migrationBuilder.CreateIndex(
                name: "IX_Manutencao_VeiculoReservaId",
                table: "Manutencao",
                column: "VeiculoReservaId");

            migrationBuilder.CreateIndex(
                name: "IX_ModeloVeiculo_MarcaId",
                table: "ModeloVeiculo",
                column: "MarcaId");

            migrationBuilder.CreateIndex(
                name: "IX_Motorista_ContratoId",
                table: "Motorista",
                column: "ContratoId");

            migrationBuilder.CreateIndex(
                name: "IX_Motorista_UnidadeId",
                table: "Motorista",
                column: "UnidadeId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacaoEmpenho_EmpenhoId",
                table: "MovimentacaoEmpenho",
                column: "EmpenhoId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacaoEmpenhoMulta_EmpenhoMultaId",
                table: "MovimentacaoEmpenhoMulta",
                column: "EmpenhoMultaId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacaoEmpenhoMulta_MultaId",
                table: "MovimentacaoEmpenhoMulta",
                column: "MultaId");

            migrationBuilder.CreateIndex(
                name: "IX_Multa_EmpenhoMultaId",
                table: "Multa",
                column: "EmpenhoMultaId");

            migrationBuilder.CreateIndex(
                name: "IX_Multa_MotoristaId",
                table: "Multa",
                column: "MotoristaId");

            migrationBuilder.CreateIndex(
                name: "IX_Multa_OrgaoAutuanteId",
                table: "Multa",
                column: "OrgaoAutuanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Multa_TipoMultaId",
                table: "Multa",
                column: "TipoMultaId");

            migrationBuilder.CreateIndex(
                name: "IX_Multa_VeiculoId",
                table: "Multa",
                column: "VeiculoId");

            migrationBuilder.CreateIndex(
                name: "IX_NotaFiscal_ContratoId",
                table: "NotaFiscal",
                column: "ContratoId");

            migrationBuilder.CreateIndex(
                name: "IX_NotaFiscal_EmpenhoId",
                table: "NotaFiscal",
                column: "EmpenhoId");

            migrationBuilder.CreateIndex(
                name: "IX_NotaFiscal_VeiculoId",
                table: "NotaFiscal",
                column: "VeiculoId");

            migrationBuilder.CreateIndex(
                name: "IX_Operador_ContratoId",
                table: "Operador",
                column: "ContratoId");

            migrationBuilder.CreateIndex(
                name: "IX_Patrimonio_SecaoId",
                table: "Patrimonio",
                column: "SecaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Patrimonio_SetorId",
                table: "Patrimonio",
                column: "SetorId");

            migrationBuilder.CreateIndex(
                name: "IX_RepactuacaoAta_AtaId",
                table: "RepactuacaoAta",
                column: "AtaId");

            migrationBuilder.CreateIndex(
                name: "IX_RepactuacaoContrato_ContratoId",
                table: "RepactuacaoContrato",
                column: "ContratoId");

            migrationBuilder.CreateIndex(
                name: "IX_RepactuacaoServicos_RepactuacaoContratoId",
                table: "RepactuacaoServicos",
                column: "RepactuacaoContratoId");

            migrationBuilder.CreateIndex(
                name: "IX_RepactuacaoTerceirizacao_RepactuacaoContratoId",
                table: "RepactuacaoTerceirizacao",
                column: "RepactuacaoContratoId");

            migrationBuilder.CreateIndex(
                name: "IX_Requisitante_SetorSolicitanteId",
                table: "Requisitante",
                column: "SetorSolicitanteId");

            migrationBuilder.CreateIndex(
                name: "IX_SecaoPatrimonial_SetorId",
                table: "SecaoPatrimonial",
                column: "SetorId");

            migrationBuilder.CreateIndex(
                name: "IX_Veiculo_AtaId",
                table: "Veiculo",
                column: "AtaId");

            migrationBuilder.CreateIndex(
                name: "IX_Veiculo_CombustivelId",
                table: "Veiculo",
                column: "CombustivelId");

            migrationBuilder.CreateIndex(
                name: "IX_Veiculo_ItemVeiculoAtaId",
                table: "Veiculo",
                column: "ItemVeiculoAtaId");

            migrationBuilder.CreateIndex(
                name: "IX_Veiculo_ItemVeiculoId",
                table: "Veiculo",
                column: "ItemVeiculoId");

            migrationBuilder.CreateIndex(
                name: "IX_Veiculo_MarcaId",
                table: "Veiculo",
                column: "MarcaId");

            migrationBuilder.CreateIndex(
                name: "IX_Veiculo_ModeloId",
                table: "Veiculo",
                column: "ModeloId");

            migrationBuilder.CreateIndex(
                name: "IX_Veiculo_PlacaBronzeId",
                table: "Veiculo",
                column: "PlacaBronzeId");

            migrationBuilder.CreateIndex(
                name: "IX_Veiculo_UnidadeId",
                table: "Veiculo",
                column: "UnidadeId");

            migrationBuilder.CreateIndex(
                name: "IX_Viagem_EventoId",
                table: "Viagem",
                column: "EventoId");

            migrationBuilder.CreateIndex(
                name: "IX_Viagem_ItemManutencaoId",
                table: "Viagem",
                column: "ItemManutencaoId",
                unique: true,
                filter: "[ItemManutencaoId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Viagem_MotoristaId",
                table: "Viagem",
                column: "MotoristaId");

            migrationBuilder.CreateIndex(
                name: "IX_Viagem_RequisitanteId",
                table: "Viagem",
                column: "RequisitanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Viagem_SetorSolicitanteId",
                table: "Viagem",
                column: "SetorSolicitanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Viagem_VeiculoId",
                table: "Viagem",
                column: "VeiculoId");

            migrationBuilder.CreateIndex(
                name: "IX_ViagensEconomildo_MotoristaId",
                table: "ViagensEconomildo",
                column: "MotoristaId");

            migrationBuilder.CreateIndex(
                name: "IX_ViagensEconomildo_VeiculoId",
                table: "ViagensEconomildo",
                column: "VeiculoId");

            migrationBuilder.AddForeignKey(
                name: "FK_ItensManutencao_Viagem_ViagemId",
                table: "ItensManutencao",
                column: "ViagemId",
                principalTable: "Viagem",
                principalColumn: "ViagemId");
            }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
            {
            migrationBuilder.DropForeignKey(
                name: "FK_Veiculo_Combustivel_CombustivelId",
                table: "Veiculo");

            migrationBuilder.DropForeignKey(
                name: "FK_ItensManutencao_Motorista_MotoristaId",
                table: "ItensManutencao");

            migrationBuilder.DropForeignKey(
                name: "FK_Viagem_Motorista_MotoristaId",
                table: "Viagem");

            migrationBuilder.DropForeignKey(
                name: "FK_Manutencao_Veiculo_VeiculoId",
                table: "Manutencao");

            migrationBuilder.DropForeignKey(
                name: "FK_Manutencao_Veiculo_VeiculoReservaId",
                table: "Manutencao");

            migrationBuilder.DropForeignKey(
                name: "FK_Viagem_Veiculo_VeiculoId",
                table: "Viagem");

            migrationBuilder.DropForeignKey(
                name: "FK_Evento_Requisitante_RequisitanteId",
                table: "Evento");

            migrationBuilder.DropForeignKey(
                name: "FK_Viagem_Requisitante_RequisitanteId",
                table: "Viagem");

            migrationBuilder.DropForeignKey(
                name: "FK_Evento_SetorSolicitante_SetorSolicitanteId",
                table: "Evento");

            migrationBuilder.DropForeignKey(
                name: "FK_Viagem_SetorSolicitante_SetorSolicitanteId",
                table: "Viagem");

            migrationBuilder.DropForeignKey(
                name: "FK_ItensManutencao_Manutencao_ManutencaoId",
                table: "ItensManutencao");

            migrationBuilder.DropForeignKey(
                name: "FK_ItensManutencao_Viagem_ViagemId",
                table: "ItensManutencao");

            migrationBuilder.DropTable(
                name: "Abastecimento");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "ControleAcesso");

            migrationBuilder.DropTable(
                name: "CorridasCanceladasTaxiLeg");

            migrationBuilder.DropTable(
                name: "CorridasTaxiLeg");

            migrationBuilder.DropTable(
                name: "CustoMensalItensContrato");

            migrationBuilder.DropTable(
                name: "LavadorContrato");

            migrationBuilder.DropTable(
                name: "LavadoresLavagem");

            migrationBuilder.DropTable(
                name: "LotacaoMotorista");

            migrationBuilder.DropTable(
                name: "MediaCombustivel");

            migrationBuilder.DropTable(
                name: "MotoristaContrato");

            migrationBuilder.DropTable(
                name: "MovimentacaoEmpenho");

            migrationBuilder.DropTable(
                name: "MovimentacaoEmpenhoMulta");

            migrationBuilder.DropTable(
                name: "MovimentacaoPatrimonio");

            migrationBuilder.DropTable(
                name: "NotaFiscal");

            migrationBuilder.DropTable(
                name: "Operador");

            migrationBuilder.DropTable(
                name: "OperadorContrato");

            migrationBuilder.DropTable(
                name: "Patrimonio");

            migrationBuilder.DropTable(
                name: "Recurso");

            migrationBuilder.DropTable(
                name: "RegistroCupomAbastecimento");

            migrationBuilder.DropTable(
                name: "RepactuacaoServicos");

            migrationBuilder.DropTable(
                name: "RepactuacaoTerceirizacao");

            migrationBuilder.DropTable(
                name: "VeiculoAta");

            migrationBuilder.DropTable(
                name: "VeiculoContrato");

            migrationBuilder.DropTable(
                name: "ViagensEconomildo");

            migrationBuilder.DropTable(
                name: "ViewAbastecimentos");

            migrationBuilder.DropTable(
                name: "ViewAtaFornecedor");

            migrationBuilder.DropTable(
                name: "ViewContratoFornecedor");

            migrationBuilder.DropTable(
                name: "ViewControleAcesso");

            migrationBuilder.DropTable(
                name: "ViewCustosViagem");

            migrationBuilder.DropTable(
                name: "ViewEmpenhoMulta");

            migrationBuilder.DropTable(
                name: "ViewEmpenhos");

            migrationBuilder.DropTable(
                name: "ViewEventos");

            migrationBuilder.DropTable(
                name: "ViewExisteItemContrato");

            migrationBuilder.DropTable(
                name: "ViewFluxoEconomildo");

            migrationBuilder.DropTable(
                name: "ViewFluxoEconomildoData");

            migrationBuilder.DropTable(
                name: "ViewItensManutencao");

            migrationBuilder.DropTable(
                name: "ViewLavagem");

            migrationBuilder.DropTable(
                name: "ViewLotacaoMotorista");

            migrationBuilder.DropTable(
                name: "ViewLotacoes");

            migrationBuilder.DropTable(
                name: "ViewManutencao");

            migrationBuilder.DropTable(
                name: "ViewMediaConsumo");

            migrationBuilder.DropTable(
                name: "ViewMotoristaFluxo");

            migrationBuilder.DropTable(
                name: "ViewMotoristas");

            migrationBuilder.DropTable(
                name: "viewMultas");

            migrationBuilder.DropTable(
                name: "ViewNoFichaVistoria");

            migrationBuilder.DropTable(
                name: "ViewOcorrencia");

            migrationBuilder.DropTable(
                name: "ViewPendenciasManutencao");

            migrationBuilder.DropTable(
                name: "ViewProcuraFicha");

            migrationBuilder.DropTable(
                name: "ViewRequisitantes");

            migrationBuilder.DropTable(
                name: "ViewSetores");

            migrationBuilder.DropTable(
                name: "ViewVeiculos");

            migrationBuilder.DropTable(
                name: "ViewViagens");

            migrationBuilder.DropTable(
                name: "ViewViagensAgenda");

            migrationBuilder.DropTable(
                name: "ViewViagensAgendaTodosMeses");

            migrationBuilder.DropTable(
                name: "Lavador");

            migrationBuilder.DropTable(
                name: "Lavagem");

            migrationBuilder.DropTable(
                name: "Multa");

            migrationBuilder.DropTable(
                name: "Empenho");

            migrationBuilder.DropTable(
                name: "SecaoPatrimonial");

            migrationBuilder.DropTable(
                name: "EmpenhoMulta");

            migrationBuilder.DropTable(
                name: "TipoMulta");

            migrationBuilder.DropTable(
                name: "SetorPatrimonial");

            migrationBuilder.DropTable(
                name: "OrgaoAutuante");

            migrationBuilder.DropTable(
                name: "Combustivel");

            migrationBuilder.DropTable(
                name: "Motorista");

            migrationBuilder.DropTable(
                name: "Veiculo");

            migrationBuilder.DropTable(
                name: "ItemVeiculoAta");

            migrationBuilder.DropTable(
                name: "ItemVeiculoContrato");

            migrationBuilder.DropTable(
                name: "ModeloVeiculo");

            migrationBuilder.DropTable(
                name: "PlacaBronze");

            migrationBuilder.DropTable(
                name: "Unidade");

            migrationBuilder.DropTable(
                name: "RepactuacaoAta");

            migrationBuilder.DropTable(
                name: "RepactuacaoContrato");

            migrationBuilder.DropTable(
                name: "MarcaVeiculo");

            migrationBuilder.DropTable(
                name: "AtaRegistroPrecos");

            migrationBuilder.DropTable(
                name: "Contrato");

            migrationBuilder.DropTable(
                name: "Fornecedor");

            migrationBuilder.DropTable(
                name: "Requisitante");

            migrationBuilder.DropTable(
                name: "SetorSolicitante");

            migrationBuilder.DropTable(
                name: "Manutencao");

            migrationBuilder.DropTable(
                name: "Viagem");

            migrationBuilder.DropTable(
                name: "Evento");

            migrationBuilder.DropTable(
                name: "ItensManutencao");
            }
        }
    }


