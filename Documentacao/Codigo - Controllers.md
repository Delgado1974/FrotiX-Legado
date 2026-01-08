# Catálogo de Código: Controllers

> **Última Atualização**: 08/01/2026
> **Versão Atual**: 0.1

---

## Visão Geral

Este documento cataloga os arquivos dentro de `Controllers/` e aponta classes/métodos principais quando possível.

## Arquivos

Total: **90** arquivo(s).

### `Controllers/AbastecimentoController.cs`

- **Classes**: `AbastecimentoController`
- **[Route]**: `api/[controller]`, `AbastecimentoVeiculos`, `AbastecimentoCombustivel`, `AbastecimentoUnidade`, `AbastecimentoMotorista`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/AbastecimentoController.DashboardAPI.cs`

- **Classes**: `com`, `AbastecimentoController`
- **[Route]**: `DashboardDados`, `DashboardDadosPeriodo`, `DashboardMensal`, `DashboardVeiculo`, `DashboardDadosVeiculoPeriodo`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/AbastecimentoController.Import.cs`

- **Classes**: `AbastecimentoController`, `ImportacaoRequest`, `LinhaImportacao`, `ResultadoImportacao`, `ErroImportacao`
- **[Route]**: `ImportarNovo`, `ExcluirPorData`, `ExportarPendencias`
- **HTTP Attributes**: `[HttpGet]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/AbastecimentoController.Pendencias.cs`

- **Classes**: `AbastecimentoController`, `PendenciaDTO`, `EditarPendenciaRequest`
- **[Route]**: `ListarPendencias`, `ContarPendencias`, `ObterPendencia`, `ResolverPendencia`, `SalvarPendencia`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/AbastecimentoImportController.cs`

- **Classes**: `AbastecimentoImportController`
- **[Route]**: `api/Abastecimento`, `ImportarDual`
- **HTTP Attributes**: `[HttpPost]`

### `Controllers/AdministracaoController.cs`

- **Classes**: `AdministracaoController`
- **[Route]**: `api/Administracao/ObterResumoGeralFrota`, `api/Administracao/ObterEstatisticasNormalizacao`, `api/Administracao/ObterDistribuicaoTipoUso`, `api/Administracao/ObterHeatmapViagens`, `api/Administracao/ObterTop10VeiculosPorKm`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/AgendaController.cs`

- **Classes**: `AgendaController`, `ViagemRecorrenciaDto`
- **[Route]**: `api/[controller]`
- **HTTP Attributes**: `[HttpGet("TesteView")]`, `[HttpGet("DiagnosticoAgenda")]`, `[HttpGet("TesteCarregaViagens")]`, `[HttpGet("BuscarViagensRecorrencia")]`, `[HttpGet("CarregaViagens")]`, `[HttpGet("GetDatasViagem")]`, `[HttpGet("ObterAgendamento")]`, `[HttpGet("ObterAgendamentoEdicao")]`

### `Controllers/AlertasFrotiXController.cs`

- **Classes**: `AlertasFrotiXController`, `AlertaDto`, `ExportarDetalhesDto`, `UsuarioExportDto`
- **[Route]**: `api/[controller]`, `Salvar`
- **HTTP Attributes**: `[HttpGet("GetDetalhesAlerta/{id}")]`, `[HttpGet("GetAlertasAtivos")]`, `[HttpGet("GetQuantidadeNaoLidos")]`, `[HttpGet("GetHistoricoAlertas")]`, `[HttpGet("GetAlertasFinalizados")]`, `[HttpGet("GetMeusAlertas")]`, `[HttpGet("GetAlertasInativos")]`, `[HttpGet("GetTodosAlertasAtivosGestao")]`

### `Controllers/Api/WhatsAppController.cs`

- **Classes**: `WhatsAppController`
- **[Route]**: `api/[controller]`
- **HTTP Attributes**: `[HttpGet("status")]`, `[HttpGet("qr")]`, `[HttpPost("start")]`, `[HttpPost("send-text")]`, `[HttpPost("send-media")]`

### `Controllers/AtaRegistroPrecosController.cs`

- **Classes**: `AtaRegistroPrecosController`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatusAta`, `InsereAta`, `EditaAta`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/AtaRegistroPrecosController.Partial.cs`

- **Classes**: `AtaRegistroPrecosController`
- **[Route]**: `ListaAtasPorStatus`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/CombustivelController.cs`

- **Classes**: `CombustivelController`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatusCombustivel`
- **HTTP Attributes**: `[HttpGet]`, `[HttpPost]`

### `Controllers/ContratoController.cs`

- **Classes**: `ContratoController`, `MoverVeiculosViewModel`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatusContrato`, `ListaContratos`, `ListaContratosVeiculosGlosa`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/ContratoController.Partial.cs`

- **Classes**: `ContratoController`
- **[Route]**: `ListaContratosPorStatus`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/ContratoController.VerificarDependencias.cs`

- **Classes**: `ContratoController`
- **[Route]**: `VerificarDependencias`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/CustosViagemController.cs`

- **Classes**: `CustosViagemController`
- **[Route]**: `api/[controller]`, `CalculaCustoViagens`, `ViagemVeiculos`, `ViagemMotoristas`, `ViagemStatus`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/DashboardEventosController.cs`

- **Classes**: `DashboardEventosController`
- **[Route]**: `DashboardEventos`, `api/DashboardEventos/ObterEstatisticasGerais`, `api/DashboardEventos/ObterEventosPorStatus`, `api/DashboardEventos/ObterEventosPorSetor`, `api/DashboardEventos/ObterEventosPorRequisitante`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/DashboardEventosController_ExportacaoPDF.cs`

- **Classes**: `DashboardEventosController`
- **[Route]**: `ExportarParaPDF`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/DashboardLavagemController.cs`

- **Classes**: `DashboardLavagemController`
- **[Route]**: `api/DashboardLavagem/EstatisticasGerais`, `api/DashboardLavagem/LavagensPorDiaSemana`, `api/DashboardLavagem/LavagensPorHorario`, `api/DashboardLavagem/EvolucaoMensal`, `api/DashboardLavagem/TopLavadores`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/DashboardMotoristasController.cs`

- **Classes**: `DashboardMotoristasController`
- **[Route]**: `api/DashboardMotoristas/ObterAnosMesesDisponiveis`, `api/DashboardMotoristas/ObterMesesPorAno`, `api/DashboardMotoristas/ObterListaMotoristas`, `api/DashboardMotoristas/ObterEstatisticasGerais`, `api/DashboardMotoristas/ObterDadosMotorista`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/DashboardVeiculosController.cs`

- **Classes**: `DashboardVeiculosController`
- **[Route]**: `api/[controller]`, `DashboardDados`, `DashboardUso`, `DashboardCustos`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/DashboardViagensController.cs`

- **Classes**: `DashboardViagensController`
- **[Route]**: `api/DashboardViagens/ObterEstatisticasGerais`, `api/DashboardViagens/ObterViagensPorDia`, `api/DashboardViagens/ObterViagensPorStatus`, `api/DashboardViagens/ObterViagensPorMotorista`, `api/DashboardViagens/ObterViagensPorSetor`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/DashboardViagensController_ExportacaoPDF.cs`

- **Classes**: `DashboardViagensController`
- **[Route]**: `ExportarParaPDF`, `ExportarParaPDF`
- **HTTP Attributes**: `[HttpGet]`, `[HttpPost]`

### `Controllers/EditorController.cs`

- **Classes**: `EditorController`
- **[Route]**: `Editor`
- **HTTP Attributes**: `[HttpPost("DownloadImagemDocx")]`

### `Controllers/EmpenhoController.cs`

- **Classes**: `EmpenhoController`
- **[Route]**: `api/[controller]`, `Delete`, `Aporte`, `EditarAporte`, `EditarAnulacao`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/EncarregadoController.cs`

- **Classes**: `EncarregadoController`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatusEncarregado`, `PegaFoto`, `PegaFotoModal`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/FornecedorController.cs`

- **Classes**: `FornecedorController`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatusFornecedor`
- **HTTP Attributes**: `[HttpGet]`, `[HttpPost]`

### `Controllers/GlosaController.cs`

- **Classes**: `GlosaController`
- **[Route]**: `glosa`
- **HTTP Attributes**: `[HttpGet("resumo")]`, `[HttpGet("resumo/")]`, `[HttpGet("detalhes")]`, `[HttpGet("detalhes/")]`, `[HttpGet("export/resumo")]`, `[HttpGet("export/detalhes")]`, `[HttpGet("export")]`

### `Controllers/GridAtaController.cs`

- **Classes**: `GridAtaController`, `objItem`, `ItensVeiculoAta`
- **[Route]**: `api/[controller]`, `DataSourceAta`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/GridContratoController.cs`

- **Classes**: `GridContratoController`, `objItem`, `ItensVeiculo`
- **[Route]**: `api/[controller]`, `DataSource`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/HomeController.cs`

- **Classes**: `HomeController`, `Data`, `CRUDModel`, `OrdersDetails`
- **[Route]**: `api/[controller]`, `DataSource`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/ItensContratoController.cs`

- **Classes**: `ItensContratoController`
- **[Route]**: `api/[controller]`, `ListaContratos`, `ListaAtas`, `GetContratoDetalhes`, `GetAtaDetalhes`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/LavadorController.cs`

- **Classes**: `LavadorController`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatusLavador`, `PegaFoto`, `PegaFotoModal`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/LogErrosController.cs`

- **Classes**: `LogErrosController`, `LogJavaScriptRequest`
- **[Route]**: `api/[controller]`, `LogJavaScript`, `ObterLogs`, `ObterLogsPorData`, `ListarArquivos`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/LoginController.cs`

- **Classes**: `LoginController`
- **[Route]**: `api/[controller]`, `RecuperaUsuarioAtual`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/ManutencaoController.cs`

- **Classes**: `ManutencaoController`, `ItemRemovidoDTO`
- **[Route]**: `api/[controller]`, `api/[controller]`, `ApagaConexaoOcorrencia`, `ApagaConexaoPendencia`, `ApagaItens`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/MarcaVeiculoController.cs`

- **Classes**: `MarcaVeiculoController`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatusMarcaVeiculo`
- **HTTP Attributes**: `[HttpGet]`, `[HttpPost]`

### `Controllers/ModeloVeiculoController.cs`

- **Classes**: `ModeloVeiculoController`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatusModeloVeiculo`
- **HTTP Attributes**: `[HttpGet]`, `[HttpPost]`

### `Controllers/MotoristaController.cs`

- **Classes**: `MotoristaController`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatusMotorista`, `PegaFoto`, `PegaFotoModal`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/MultaController.cs`

- **Classes**: `MultaController`, `TipoMultaAjax`, `OrgaoAutuanteAjax`
- **[Route]**: `api/[controller]`, `ListaMultas`, `PegaTipoMulta`, `PegaOrgaoAutuante`, `DeleteTipoMulta`
- **HTTP Attributes**: `[HttpGet("Test")]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/MultaPdfViewerController.cs`

- **Classes**: `MultaPdfViewerController`
- **[Route]**: `api/[controller]`
- **HTTP Attributes**: `[HttpPost("Load")]`, `[HttpPost("RenderPdfPages")]`, `[HttpPost("RenderThumbnailImages")]`, `[HttpPost("Bookmarks")]`, `[HttpPost("RenderAnnotationComments")]`, `[HttpPost("Unload")]`, `[HttpPost("ExportAnnotations")]`, `[HttpPost("ImportAnnotations")]`

### `Controllers/MultaUploadController.cs`

- **Classes**: `MultaUploadController`
- **[Route]**: `api/[controller]`
- **HTTP Attributes**: `[HttpGet("GetFileList")]`, `[HttpPost("Save")]`, `[HttpPost("Remove")]`, `[HttpPost("Chunk")]`, `[HttpPost("MergeChunks")]`

### `Controllers/NavigationController.cs`

- **Classes**: `NavigationController`, `RecursoUpdate`, `HabilitarAcessoRequest`
- **[Route]**: `api/[controller]`, `GetTree`, `SaveTree`, `AddItem`, `UpdateItem`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/NormalizeController.cs`

- **Classes**: `NormalizeController`
- **[Route]**: `api/[controller]`
- **HTTP Attributes**: `[HttpPost]`

### `Controllers/NotaFiscalController.cs`

- **Classes**: `NotaFiscalController`, `GlosaNota`
- **[Route]**: `api/[controller]`, `Delete`, `GetGlosa`, `Glosa`, `EmpenhoList`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/NotaFiscalController.Partial.cs`

- **Classes**: `NotaFiscalController`
- **[Route]**: `Insere`, `Edita`
- **HTTP Attributes**: `[HttpPost]`, `[HttpPost]`

### `Controllers/OcorrenciaController.cs`

- **Classes**: `OcorrenciaController`
- **[Route]**: `api/[controller]`, `Ocorrencias`, `OcorrenciasVeiculos`, `OcorrenciasMotoristas`, `OcorrenciasStatus`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/OcorrenciaViagemController.cs`

- **Classes**: `OcorrenciaViagemController`, `OcorrenciaViagemDTO`
- **[Route]**: `api/[controller]`, `ListarPorViagem`, `ListarAbertasPorVeiculo`, `ContarAbertasPorVeiculo`, `Criar`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/OcorrenciaViagemController.Debug.cs`

- **Classes**: `OcorrenciaViagemController`
- **[Route]**: `DebugListar`, `DebugAbertas`, `DebugListarTodos`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/OcorrenciaViagemController.Gestao.cs`

- **Classes**: `OcorrenciaViagemController`, `EditarOcorrenciaDTO`, `BaixarOcorrenciaDTO`, `BaixarComSolucaoDTO`
- **[Route]**: `ListarGestao`, `EditarOcorrencia`, `BaixarOcorrenciaGestao`, `BaixarOcorrenciaComSolucao`, `ContarOcorrencias`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/OcorrenciaViagemController.Listar.cs`

- **Classes**: `OcorrenciaViagemController`, `ExcluirOcorrenciaDTO`
- **[Route]**: `ListarOcorrenciasModal`, `ListarOcorrenciasVeiculo`, `VerificarOcorrenciasVeiculo`, `ExcluirOcorrencia`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`

### `Controllers/OcorrenciaViagemController.Upsert.cs`

- **Classes**: `para`, `OcorrenciaViagemController`, `BaixarOcorrenciaUpsertDTO`
- **[Route]**: `BaixarOcorrenciaUpsert`
- **HTTP Attributes**: `[HttpPost]`

### `Controllers/OperadorController.cs`

- **Classes**: `OperadorController`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatusOperador`, `PegaFoto`, `PegaFotoModal`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/PatrimonioController.cs`

- **Classes**: `PatrimonioController`, `MovimentacaoPatrimonioDto`, `DeleteMovimentacaoDto`
- **[Route]**: `api/[controller]`, `GetMovimentacao`, `CreateMovimentacao`, `UpdateMovimentacao`, `DeleteMovimentacaoPatrimonio`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/PdfViewerCNHController.cs`

- **Classes**: `PdfViewerCNHController`
- **[Route]**: `api/[controller]`, `Load`, `RenderPdfPages`, `RenderAnnotationComments`, `Unload`
- **HTTP Attributes**: `[HttpPost]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/PdfViewerController.cs`

- **Classes**: `PdfViewerController`
- **[Route]**: `api/[controller]`
- **HTTP Attributes**: `[HttpPost("Load")]`, `[HttpPost("Bookmarks")]`, `[HttpPost("RenderPdfPages")]`, `[HttpPost("RenderPdfTexts")]`, `[HttpPost("RenderThumbnailImages")]`, `[HttpPost("RenderAnnotationComments")]`, `[HttpPost("ExportAnnotations")]`, `[HttpPost("ImportAnnotations")]`

### `Controllers/PlacaBronzeController.cs`

- **Classes**: `PlacaBronzeController`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatusPlacaBronze`, `Desvincula`
- **HTTP Attributes**: `[HttpGet]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/RecursoController.cs`

- **Classes**: `RecursoController`
- **[Route]**: `api/[controller]`, `Delete`
- **HTTP Attributes**: `[HttpGet]`, `[HttpPost]`

### `Controllers/RelatoriosController.cs`

- **Classes**: `RelatoriosController`
- **[Route]**: `api/[controller]`, `ExportarEconomildo`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/RelatorioSetorSolicitanteController.cs`

- **Classes**: `RelatorioSetorSolicitanteController`
- **[Route]**: `SetorSolicitante/RelatorioSetorSolicitante`, `GetReport`, `ViewerEvent`

### `Controllers/ReportsController.cs`

- **Classes**: `ReportsController`
- **[Route]**: `api/reports`

### `Controllers/RequisitanteController.cs`

- **Classes**: `RequisitanteController`, `AtualizarRequisitanteDto`, `RequisitanteUpsertModel`
- **[Route]**: `api/[controller]`, `GetAll`, `GetById`, `Upsert`, `GetSetores`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/SecaoController.cs`

- **Classes**: `SecaoController`
- **[Route]**: `api/[controller]`, `ListaSecoes`, `ListaSecoesCombo`, `UpdateStatusSecao`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`

### `Controllers/SetorController.cs`

- **Classes**: `SetorController`
- **[Route]**: `api/[controller]`, `ListaSetores`, `UpdateStatusSetor`, `Delete`, `ListaSetoresCombo`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpPost]`

### `Controllers/SetorSolicitanteController.cs`

- **Classes**: `SetorSolicitanteController`
- **[Route]**: `api/[controller]`, `Delete`
- **HTTP Attributes**: `[HttpPost]`

### `Controllers/SetorSolicitanteController.GetAll.cs`

- **Classes**: `SetorSolicitanteController`, `SetorSolicitanteUpsertModel`
- **[Route]**: `GetAll`, `GetById`, `Upsert`, `GetSetoresPai`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`

### `Controllers/SetorSolicitanteController.UpdateStatus.cs`

- **Classes**: `SetorSolicitanteController`
- **[Route]**: `UpdateStatus`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/TaxiLegController.cs`

- **Classes**: `TaxiLegController`
- **[Route]**: `api/[controller]`, `Import`, `ImportCanceladas`
- **HTTP Attributes**: `[HttpGet]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/TestePdfController.cs`

- **Classes**: `TestePdfController`
- **[Route]**: `api/[controller]`
- **HTTP Attributes**: `[HttpGet("Ping")]`

### `Controllers/UnidadeController.cs`

- **Classes**: `UnidadeController`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatus`, `ListaLotacao`, `LotaMotorista`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/UploadCNHController.cs`

- **Classes**: `UploadCNHController`
- **[Route]**: `api/[controller]`, `Save`, `Remove`, `UploadFeatures`
- **HTTP Attributes**: `[HttpPost]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/UploadCRLVController.cs`

- **Classes**: `UploadCRLVController`
- **[Route]**: `api/[controller]`, `Save`, `Remove`, `UploadFeatures`
- **HTTP Attributes**: `[HttpPost]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/UsuarioController.cs`

- **Classes**: `UsuarioController`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatusUsuario`, `UpdateCargaPatrimonial`, `UpdateStatusAcesso`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/UsuarioController.Usuarios.cs`

- **Classes**: `UsuarioController`
- **[Route]**: `GetAll`, `GetFoto`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`

### `Controllers/VeiculoController.cs`

- **Classes**: `VeiculoController`
- **[Route]**: `api/[controller]`, `Delete`, `UpdateStatusVeiculo`, `VeiculoContratos`, `VeiculoContratosGlosa`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/VeiculosUnidadeController.cs`

- **Classes**: `VeiculosUnidadeController`
- **[Route]**: `api/[controller]`, `Delete`
- **HTTP Attributes**: `[HttpGet]`, `[HttpPost]`

### `Controllers/ViagemController.AtualizarDados.cs`

- **Classes**: `ViagemController`, `AtualizarDadosViagemRequest`
- **[Route]**: `GetViagem/{id}`, `AtualizarDadosViagem`
- **HTTP Attributes**: `[HttpGet]`, `[HttpPost]`

### `Controllers/ViagemController.AtualizarDadosViagem.cs`

- **Classes**: `ViagemController`, `AtualizarViagemDashboardDTO`
- **[Route]**: `AtualizarDadosViagemDashboard`
- **HTTP Attributes**: `[HttpPost]`

### `Controllers/ViagemController.CalculoCustoBatch.cs`

- **Classes**: `ViagemController`, `DadosCalculoCache`, `MotoristaInfo`
- **[Route]**: `ExecutarCalculoCustoBatch`, `ObterProgressoCalculoCustoBatch`, `LimparProgressoCalculoCustoBatch`
- **HTTP Attributes**: `[HttpGet]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/ViagemController.cs`

- **Classes**: `ViagemController`, `ProgressoCalculoCusto`, `UnificacaoRequest`, `CorrecaoOrigemDto`, `CorrecaoDestinoDto`
- **[Route]**: `api/[controller]`, `UploadFichaVistoria`, `ExisteFichaParaData`, `VerificaFichaExiste`, `ObterFichaVistoria`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet("PegarStatusViagem")]`, `[HttpGet("ListaDistintos")]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/ViagemController.CustosViagem.cs`

- **Classes**: `ViagemController`
- **[Route]**: `ObterCustosViagem`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/ViagemController.DashboardEconomildo.cs`

- **Classes**: `ViagemController`
- **[Route]**: `DashboardEconomildo`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/ViagemController.DesassociarEvento.cs`

- **Classes**: `ViagemController`, `DesassociarViagemRequest`
- **[Route]**: `DesassociarViagemEvento`
- **HTTP Attributes**: `[HttpPost]`

### `Controllers/ViagemController.HeatmapEconomildo.cs`

- **Classes**: `ViagemController`
- **[Route]**: `HeatmapEconomildo`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/ViagemController.HeatmapEconomildoPassageiros.cs`

- **Classes**: `ViagemController`
- **[Route]**: `HeatmapEconomildoPassageiros`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/ViagemController.ListaEventos.cs`

- **Classes**: `para`, `ViagemController`
- **[Route]**: `ListaEventos`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/ViagemController.MetodosEstatisticas.cs`

- **Classes**: `ViagemController`, `ProgressoEstatisticas`
- **[Route]**: `GerarEstatisticasViagens`, `ObterProgressoEstatisticas`, `LimparProgressoEstatisticas`
- **HTTP Attributes**: `[HttpGet]`, `[HttpPost]`, `[HttpPost]`

### `Controllers/ViagemEventoController.cs`

- **Classes**: `ViagemEventoController`, `RequestSizeLimitAttribute`, `Objfile`
- **[Route]**: `api/[controller]`, `ViagemEventos`, `Fluxo`, `FluxoVeiculos`, `FluxoMotoristas`
- **HTTP Attributes**: `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`, `[HttpGet]`

### `Controllers/ViagemEventoController.UpdateStatus.cs`

- **Classes**: `ViagemEventoController`
- **[Route]**: `UpdateStatusEvento`
- **HTTP Attributes**: `[HttpGet]`

### `Controllers/ViagemLimpezaController.cs`

- **Classes**: `ViagemLimpezaController`, `CorrecaoRequest`
- **[Route]**: `api/[controller]`
- **HTTP Attributes**: `[HttpGet("origens")]`, `[HttpGet("destinos")]`, `[HttpPost("corrigir-origem")]`, `[HttpPost("corrigir-destino")]`

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026 18:24] - Criação automática do catálogo (stub)

**Descrição**:
- Gerado automaticamente listando arquivos e metadados básicos (classes/rotas/atributos HTTP quando detectados).
- **TODO**: Detalhar arquivos críticos conforme necessidade (com trechos reais de código).

**Status**: ✅ **Gerado (pendente detalhamento)**
