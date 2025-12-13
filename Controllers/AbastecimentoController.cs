using FrotiX.Hubs;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Transactions;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public partial class AbastecimentoController :ControllerBase
    {
        private readonly ILogger<AbastecimentoController> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHubContext<ImportacaoHub> _hubContext;

        public AbastecimentoController(
            ILogger<AbastecimentoController> logger ,
            IWebHostEnvironment hostingEnvironment ,
            IUnitOfWork unitOfWork ,
            IHubContext<ImportacaoHub> hubContext
        )
        {
            try
            {
                _logger = logger;
                _hostingEnvironment = hostingEnvironment;
                _unitOfWork = unitOfWork;
                _hubContext = hubContext;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AbastecimentoController.cs" ,
                    "AbastecimentoController" ,
                    error
                );
            }
        }

        [BindProperty]
        public Models.Abastecimento AbastecimentoObj
        {
            get; set;
        }

        public IActionResult Index()
        {
            try
            {
                return StatusCode(200);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs" , "Index" , error);
                return StatusCode(500);
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var dados = _unitOfWork
                    .ViewAbastecimentos.GetAll()
                    .OrderByDescending(va => va.DataHora)
                    .ToList();

                return Ok(new
                {
                    data = dados
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs" , "Get" , error);
                return StatusCode(500);
            }
        }

        [Route("AbastecimentoVeiculos")]
        [HttpGet]
        public IActionResult AbastecimentoVeiculos(Guid Id)
        {
            try
            {
                var dados = _unitOfWork
                    .ViewAbastecimentos.GetAll()
                    .Where(va => va.VeiculoId == Id)
                    .OrderByDescending(va => va.DataHora)
                    .ToList();

                return Ok(new
                {
                    data = dados
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AbastecimentoController.cs" ,
                    "AbastecimentoVeiculos" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("AbastecimentoCombustivel")]
        [HttpGet]
        public IActionResult AbastecimentoCombustivel(Guid Id)
        {
            try
            {
                var dados = _unitOfWork
                    .ViewAbastecimentos.GetAll()
                    .Where(va => va.CombustivelId == Id)
                    .OrderByDescending(va => va.DataHora)
                    .ToList();

                return Ok(new
                {
                    data = dados
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AbastecimentoController.cs" ,
                    "AbastecimentoCombustivel" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("AbastecimentoUnidade")]
        [HttpGet]
        public IActionResult AbastecimentoUnidade(Guid Id)
        {
            try
            {
                var dados = _unitOfWork
                    .ViewAbastecimentos.GetAll()
                    .Where(va => va.UnidadeId == Id)
                    .OrderByDescending(va => va.DataHora)
                    .ToList();

                return Ok(new
                {
                    data = dados
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AbastecimentoController.cs" ,
                    "AbastecimentoUnidade" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("AbastecimentoMotorista")]
        [HttpGet]
        public IActionResult AbastecimentoMotorista(Guid Id)
        {
            try
            {
                var dados = _unitOfWork
                    .ViewAbastecimentos.GetAll()
                    .Where(va => va.MotoristaId == Id)
                    .OrderByDescending(va => va.DataHora)
                    .ToList();

                return Ok(new
                {
                    data = dados
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AbastecimentoController.cs" ,
                    "AbastecimentoMotorista" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("AbastecimentoData")]
        [HttpGet]
        public IActionResult AbastecimentoData(string dataAbastecimento)
        {
            try
            {
                var dados = _unitOfWork
                    .ViewAbastecimentos.GetAll()
                    .Where(va => va.Data == dataAbastecimento)
                    .OrderByDescending(va => va.DataHora)
                    .ToList();

                return Ok(new
                {
                    data = dados
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AbastecimentoController.cs" ,
                    "AbastecimentoData" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("Import")]
        [HttpPost]
        public ActionResult Import()
        {
            try
            {
                IFormFile file = Request.Form.Files[0];
                string folderName = "DadosEditaveis/UploadExcel";
                string webRootPath = _hostingEnvironment.WebRootPath;
                string newPath = Path.Combine(webRootPath , folderName);
                StringBuilder sb = new StringBuilder();

                if (!Directory.Exists(newPath))
                {
                    Directory.CreateDirectory(newPath);
                }

                if (file.Length > 0)
                {
                    string sFileExtension = Path.GetExtension(file.FileName).ToLower();
                    ISheet sheet;
                    string fullPath = Path.Combine(newPath , file.FileName);

                    using (var stream = new FileStream(fullPath , FileMode.Create))
                    {
                        file.CopyTo(stream);
                        stream.Position = 0;

                        if (sFileExtension == ".xls")
                        {
                            HSSFWorkbook hssfwb = new HSSFWorkbook(stream);
                            sheet = hssfwb.GetSheetAt(0);
                        }
                        else
                        {
                            XSSFWorkbook hssfwb = new XSSFWorkbook(stream);
                            sheet = hssfwb.GetSheetAt(0);
                        }

                        IRow headerRow = sheet.GetRow(0);
                        int cellCount = headerRow.LastCellNum;
                        sb.Append(
                            "<table id='tblImportacao' class='display' style='width: 100%'><thead><tr>"
                        );

                        for (int j = 0; j < cellCount; j++)
                        {
                            NPOI.SS.UserModel.ICell cell = headerRow.GetCell(j);
                            if (
                                j == 5
                                || j == 7
                                || j == 10
                                || j == 11
                                || j == 12
                                || j == 13
                                || j == 14
                                || j == 15
                            )
                            {
                                sb.Append("<th>" + cell.ToString() + "</th>");
                            }
                        }

                        sb.Append("<th>" + "Consumo" + "</th>");
                        sb.Append("<th>" + "Média" + "</th>");
                        sb.Append("</tr></thead>");

                        try
                        {
                            using (
                                TransactionScope scope = new TransactionScope(
                                    TransactionScopeOption.RequiresNew ,
                                    new TimeSpan(0 , 30 , 30)
                                )
                            )
                            {
                                sb.AppendLine("<tbody><tr>");

                                for (int i = (sheet.FirstRowNum + 1); i <= sheet.LastRowNum; i++)
                                {
                                    IRow row = sheet.GetRow(i);
                                    if (row == null)
                                        continue;
                                    if (row.Cells.All(d => d.CellType == CellType.Blank))
                                        continue;

                                    AbastecimentoObj = new Abastecimento();

                                    for (int j = row.FirstCellNum; j < cellCount; j++)
                                    {
                                        if (row.GetCell(j) != null)
                                        {
                                            if (i == 1)
                                            {
                                                if (j == 0)
                                                {
                                                    var objFromDb =
                                                        _unitOfWork.Abastecimento.GetFirstOrDefault(
                                                            u =>
                                                                u.DataHora
                                                                == Convert.ToDateTime(
                                                                    row.GetCell(j).ToString()
                                                                )
                                                        );
                                                    if (objFromDb != null)
                                                    {
                                                        return Ok(
                                                            new
                                                            {
                                                                success = false ,
                                                                message = "Os registros para o dia "
                                                                    + Convert.ToDateTime(
                                                                        row.GetCell(j).ToString()
                                                                    )
                                                                    + " já foram importados!" ,
                                                            }
                                                        );
                                                    }
                                                }
                                            }

                                            if (j == 7)
                                            {
                                                AbastecimentoObj.DataHora = Convert.ToDateTime(
                                                    row.GetCell(j).ToString()
                                                );
                                                sb.Append(
                                                    "<td>" + row.GetCell(j).ToString() + "</td>"
                                                );
                                            }

                                            if (j == 5)
                                            {
                                                string placaVeiculo = row.GetCell(j).ToString();

                                                var veiculoObj =
                                                    _unitOfWork.Veiculo.GetFirstOrDefault(m =>
                                                        m.Placa == placaVeiculo
                                                    );
                                                if (veiculoObj != null)
                                                {
                                                    AbastecimentoObj.VeiculoId =
                                                        veiculoObj.VeiculoId;
                                                    sb.Append(
                                                        "<td>" + row.GetCell(j).ToString() + "</td>"
                                                    );
                                                }
                                                else
                                                {
                                                    return Ok(
                                                        new
                                                        {
                                                            success = false ,
                                                            message =
                                                                "Não foi encontrado o veículo de placa: "
                                                                + placaVeiculo ,
                                                        }
                                                    );
                                                }
                                            }

                                            if (j == 10)
                                            {
                                                string motorista = row.GetCell(j).ToString();
                                                motorista = motorista.Replace("." , "");

                                                var motoristaObj =
                                                    _unitOfWork.Motorista.GetFirstOrDefault(m =>
                                                        m.Nome == motorista
                                                    );
                                                if (motoristaObj != null)
                                                {
                                                    AbastecimentoObj.MotoristaId =
                                                        motoristaObj.MotoristaId;
                                                    sb.Append(
                                                        "<td>" + row.GetCell(j).ToString() + "</td>"
                                                    );
                                                }
                                                else
                                                {
                                                    return Ok(
                                                        new
                                                        {
                                                            success = false ,
                                                            message =
                                                                "Não foi encontrado o(a) motorista: "
                                                                + motorista ,
                                                        }
                                                    );
                                                }
                                            }

                                            if (j == 12)
                                            {
                                                AbastecimentoObj.Hodometro = Convert.ToInt32(
                                                    row.GetCell(j).ToString()
                                                );
                                                sb.Append(
                                                    "<td>" + row.GetCell(j).ToString() + "</td>"
                                                );
                                            }

                                            if (j == 11)
                                            {
                                                AbastecimentoObj.KmRodado =
                                                    Convert.ToInt32(row.GetCell(12).ToString())
                                                    - Convert.ToInt32(row.GetCell(11).ToString());
                                                sb.Append(
                                                    "<td>" + row.GetCell(j).ToString() + "</td>"
                                                );
                                            }

                                            if (j == 13)
                                            {
                                                if (row.GetCell(j).ToString() == "GASOLINA")
                                                {
                                                    AbastecimentoObj.CombustivelId = Guid.Parse(
                                                        "F668F660-8380-4DF3-90CD-787DB06FE734"
                                                    );
                                                }
                                                else
                                                {
                                                    AbastecimentoObj.CombustivelId = Guid.Parse(
                                                        "A69AA86A-9162-4242-AB9A-8B184E04C4DA"
                                                    );
                                                }
                                                sb.Append(
                                                    "<td>" + row.GetCell(j).ToString() + "</td>"
                                                );
                                            }

                                            if (j == 14)
                                            {
                                                AbastecimentoObj.ValorUnitario = Convert.ToDouble(
                                                    row.GetCell(j).ToString()
                                                );
                                                sb.Append(
                                                    "<td>"
                                                        + Math.Round(
                                                                (double)
                                                                    AbastecimentoObj.ValorUnitario ,
                                                                2
                                                            )
                                                            .ToString("0.00")
                                                        + "</td>"
                                                );
                                            }

                                            if (j == 15)
                                            {
                                                AbastecimentoObj.Litros = Convert.ToDouble(
                                                    row.GetCell(j).ToString()
                                                );
                                                sb.Append(
                                                    "<td>"
                                                        + Math.Round(
                                                                (double)AbastecimentoObj.Litros ,
                                                                2
                                                            )
                                                            .ToString("0.00")
                                                        + "</td>"
                                                );
                                            }
                                        }
                                    }

                                    sb.Append(
                                        "<td>"
                                            + Math.Round(
                                                    (
                                                        (double)AbastecimentoObj.KmRodado
                                                        / (double)AbastecimentoObj.Litros
                                                    ) ,
                                                    2
                                                )
                                                .ToString("0.00")
                                            + "</td>"
                                    );

                                    var mediaveiculo =
                                        _unitOfWork.ViewMediaConsumo.GetFirstOrDefault(v =>
                                            v.VeiculoId == AbastecimentoObj.VeiculoId
                                        );
                                    if (mediaveiculo != null)
                                    {
                                        sb.Append("<td>" + mediaveiculo.ConsumoGeral + "</td>");
                                    }
                                    else
                                    {
                                        sb.Append(
                                            "<td>"
                                                + Math.Round(
                                                        (
                                                            (double)AbastecimentoObj.KmRodado
                                                            / (double)AbastecimentoObj.Litros
                                                        ) ,
                                                        2
                                                    )
                                                    .ToString("0.00")
                                                + "</td>"
                                        );
                                    }

                                    sb.AppendLine("</tr>");
                                    _unitOfWork.Abastecimento.Add(AbastecimentoObj);
                                    _unitOfWork.Save();
                                }

                                sb.Append("</tbody></table>");
                                scope.Complete();
                            }
                        }
                        catch (Exception error)
                        {
                            Alerta.TratamentoErroComLinha(
                                "AbastecimentoController.cs" ,
                                "Import.TransactionScope" ,
                                error
                            );
                            throw;
                        }
                    }
                }

                return Ok(
                    new
                    {
                        success = true ,
                        message = "Planilha Importada com Sucesso" ,
                        response = sb.ToString() ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs" , "Import" , error);
                return StatusCode(500);
            }
        }

        [Route("MotoristaList")]
        [HttpGet]
        public IActionResult MotoristaList()
        {
            try
            {
                var result = _unitOfWork.ViewMotoristas.GetAll().OrderBy(vm => vm.Nome).ToList();

                return Ok(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs" , "MotoristaList" , error);
                return StatusCode(500);
            }
        }

        [Route("UnidadeList")]
        [HttpGet]
        public IActionResult UnidadeList()
        {
            try
            {
                var result = _unitOfWork.Unidade.GetAll().OrderBy(u => u.Descricao).ToList();

                return Ok(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs" , "UnidadeList" , error);
                return StatusCode(500);
            }
        }

        [Route("CombustivelList")]
        [HttpGet]
        public IActionResult CombustivelList()
        {
            try
            {
                var result = _unitOfWork.Combustivel.GetAll().OrderBy(u => u.Descricao).ToList();

                return Ok(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AbastecimentoController.cs" ,
                    "CombustivelList" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("VeiculoList")]
        [HttpGet]
        public IActionResult VeiculoList()
        {
            try
            {
                var result = (
                    from v in _unitOfWork.Veiculo.GetAll()
                    join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                    join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                    orderby v.Placa
                    select new
                    {
                        v.VeiculoId ,
                        PlacaMarcaModelo = v.Placa
                            + " - "
                            + ma.DescricaoMarca
                            + "/"
                            + m.DescricaoModelo ,
                    }
                )
                    .OrderBy(v => v.PlacaMarcaModelo)
                    .ToList();

                return Ok(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs" , "VeiculoList" , error);
                return StatusCode(500);
            }
        }

        [Route("EditaKm")]
        [HttpPost]
        [Consumes("application/json")]
        public IActionResult EditaKm([FromBody] Abastecimento abastecimento)
        {
            try
            {
                var objAbastecimento = _unitOfWork.Abastecimento.GetFirstOrDefault(a =>
                    a.AbastecimentoId == abastecimento.AbastecimentoId
                );
                objAbastecimento.KmRodado = abastecimento.KmRodado;

                _unitOfWork.Abastecimento.Update(objAbastecimento);
                _unitOfWork.Save();

                return Ok(
                    new
                    {
                        success = true ,
                        message = "Abastecimento atualizado com sucesso" ,
                        type = 0 ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs" , "EditaKm" , error);
                return StatusCode(500);
            }
        }

        [Route("ListaRegistroCupons")]
        [HttpGet]
        public IActionResult ListaRegistroCupons(string IDapi)
        {
            try
            {
                var result = (
                    from rc in _unitOfWork.RegistroCupomAbastecimento.GetAll()
                    orderby rc.DataRegistro descending
                    select new
                    {
                        DataRegistro = rc.DataRegistro?.ToShortDateString() ,
                        rc.RegistroCupomId ,
                    }
                ).ToList();

                return Ok(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AbastecimentoController.cs" ,
                    "ListaRegistroCupons" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("PegaRegistroCupons")]
        [HttpGet]
        public IActionResult PegaRegistroCupons(string IDapi)
        {
            try
            {
                var objRegistro = _unitOfWork.RegistroCupomAbastecimento.GetFirstOrDefault(rc =>
                    rc.RegistroCupomId == Guid.Parse(IDapi)
                );

                return Ok(new
                {
                    RegistroPDF = objRegistro.RegistroPDF
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AbastecimentoController.cs" ,
                    "PegaRegistroCupons" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("PegaRegistroCuponsData")]
        [HttpGet]
        public IActionResult PegaRegistroCuponsData(string id)
        {
            try
            {
                var result = (
                    from rc in _unitOfWork.RegistroCupomAbastecimento.GetAll()
                    where rc.DataRegistro == DateTime.Parse(id)
                    orderby rc.DataRegistro descending
                    select new
                    {
                        DataRegistro = rc.DataRegistro?.ToShortDateString() ,
                        rc.RegistroCupomId ,
                    }
                ).ToList();

                return Ok(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AbastecimentoController.cs" ,
                    "PegaRegistroCuponsData" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("DeleteRegistro")]
        [HttpGet]
        public IActionResult DeleteRegistro(string IDapi)
        {
            try
            {
                var objRegistro = _unitOfWork.RegistroCupomAbastecimento.GetFirstOrDefault(rc =>
                    rc.RegistroCupomId == Guid.Parse(IDapi)
                );

                _unitOfWork.RegistroCupomAbastecimento.Remove(objRegistro);
                _unitOfWork.Save();

                return Ok(new
                {
                    success = true ,
                    message = "Registro excluído com sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AbastecimentoController.cs" ,
                    "DeleteRegistro" ,
                    error
                );
                return StatusCode(500);
            }
        }
    }
}
