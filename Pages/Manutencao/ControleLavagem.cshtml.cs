using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Manutencao
{
    public class ControleLavagemModel : PageModel
    {
        public static IUnitOfWork _unitOfWork;

        public static byte[] FotoMotorista;

        public static IFormFile FichaVIstoria;

        public static Guid ViagemId;

        [BindProperty]
        public Models.ViagemViewModel ViagemObj { get; set; }

        public static void Initialize(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "Initialize", error);
                return; // padronizado
            }
        }

        public ControleLavagemModel(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ControleLavagem.cshtml.cs",
                    "ControleLavagemModel",
                    error
                );
            }
        }

        public void OnGet()
        {
            try { }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "OnGet", error);
                return; // padronizado
            }
        }

        class CombustivelData
        {
            public string Nivel { get; set; }
            public string Descricao { get; set; }
            public string Imagem { get; set; }
        }

        public void PreencheListaCombustivel()
        {
            try
            {
                List<CombustivelData> CombustivelDataSource = new List<CombustivelData>();

                CombustivelDataSource.Add(
                    new CombustivelData
                    {
                        Nivel = "tanquevazio",
                        Descricao = "Vazio",
                        Imagem = "../images/tanquevazio.png",
                    }
                );

                CombustivelDataSource.Add(
                    new CombustivelData
                    {
                        Nivel = "tanqueumquarto",
                        Descricao = "1/4",
                        Imagem = "../images/tanqueumquarto.png",
                    }
                );

                CombustivelDataSource.Add(
                    new CombustivelData
                    {
                        Nivel = "tanquemeiotanque",
                        Descricao = "1/2",
                        Imagem = "../images/tanquemeiotanque.png",
                    }
                );

                CombustivelDataSource.Add(
                    new CombustivelData
                    {
                        Nivel = "tanquetresquartos",
                        Descricao = "3/4",
                        Imagem = "../images/tanquetresquartos.png",
                    }
                );

                CombustivelDataSource.Add(
                    new CombustivelData
                    {
                        Nivel = "tanquecheio",
                        Descricao = "Cheio",
                        Imagem = "../images/tanquecheio.png",
                    }
                );

                ViewData["dataCombustivel"] = CombustivelDataSource;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ControleLavagem.cshtml.cs",
                    "PreencheListaCombustivel",
                    error
                );
                return; // padronizado
            }
        }
    }

    public class ListaNivelCombustivel
    {
        public string Nivel { get; set; }
        public string Descricao { get; set; }
        public string Imagem { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaNivelCombustivel()
        {
            try { }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ControleLavagem.cshtml.cs",
                    "ListaNivelCombustivel",
                    error
                );
            }
        }

        public ListaNivelCombustivel(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ControleLavagem.cshtml.cs",
                    "ListaNivelCombustivel",
                    error
                );
            }
        }

        public List<ListaNivelCombustivel> NivelCombustivelList()
        {
            try
            {
                List<ListaNivelCombustivel> niveis = new List<ListaNivelCombustivel>();

                niveis.Add(
                    new ListaNivelCombustivel
                    {
                        Nivel = "tanquevazio",
                        Descricao = "Vazio",
                        Imagem = "../images/tanquevazio.png",
                    }
                );

                niveis.Add(
                    new ListaNivelCombustivel
                    {
                        Nivel = "tanqueumquarto",
                        Descricao = "1/4",
                        Imagem = "../images/tanqueumquarto.png",
                    }
                );

                niveis.Add(
                    new ListaNivelCombustivel
                    {
                        Nivel = "tanquemeiotanque",
                        Descricao = "1/2",
                        Imagem = "../images/tanquemeiotanque.png",
                    }
                );

                niveis.Add(
                    new ListaNivelCombustivel
                    {
                        Nivel = "tanquetresquartos",
                        Descricao = "3/4",
                        Imagem = "../images/tanquetresquartos.png",
                    }
                );

                niveis.Add(
                    new ListaNivelCombustivel
                    {
                        Nivel = "tanquecheio",
                        Descricao = "Cheio",
                        Imagem = "../images/tanquecheio.png",
                    }
                );

                return niveis;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ControleLavagem.cshtml.cs",
                    "NivelCombustivelList",
                    error
                );
                return default(List<ListaNivelCombustivel>); // padronizado
            }
        }
    }

    public class ListaVeiculos
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaVeiculos()
        {
            try { }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "ListaVeiculos", error);
            }
        }

        public ListaVeiculos(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "ListaVeiculos", error);
            }
        }

        public List<ListaVeiculos> VeiculosList()
        {
            try
            {
                List<ListaVeiculos> veiculos = new List<ListaVeiculos>();

                var result = (
                    from v in _unitOfWork.Veiculo.GetAll()
                    join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                    join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                    orderby v.Placa
                    select new
                    {
                        Id = v.VeiculoId,

                        Descricao = v.PlacaVinculada == null
                            ? v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo
                            : v.Placa
                                + " ("
                                + v.PlacaVinculada
                                + ") - "
                                + ma.DescricaoMarca
                                + "/"
                                + m.DescricaoModelo,
                    }
                ).OrderBy(v => v.Descricao);

                foreach (var veiculo in result)
                {
                    veiculos.Add(
                        new ListaVeiculos { Descricao = veiculo.Descricao, Id = veiculo.Id }
                    );
                }

                return veiculos;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "VeiculosList", error);
                return default(List<ListaVeiculos>); // padronizado
            }
        }
    }

    public class ListaMotorista
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaMotorista()
        {
            try { }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "ListaMotorista", error);
            }
        }

        public ListaMotorista(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "ListaMotorista", error);
            }
        }

        public List<ListaMotorista> MotoristaList()
        {
            try
            {
                List<ListaMotorista> motoristas = new List<ListaMotorista>();

                var result = _unitOfWork.ViewMotoristas.GetAll().OrderBy(n => n.Nome);

                foreach (var motorista in result)
                {
                    motoristas.Add(
                        new ListaMotorista
                        {
                            Descricao = motorista.MotoristaCondutor,
                            Id = motorista.MotoristaId,
                        }
                    );
                }

                return motoristas;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "MotoristaList", error);
                return default(List<ListaMotorista>); // padronizado
            }
        }
    }

    public class ListaLavador
    {
        public string Nome { get; set; }
        public Guid LavadorId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaLavador()
        {
            try { }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "ListaLavador", error);
            }
        }

        public ListaLavador(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "ListaLavador", error);
            }
        }

        public List<ListaLavador> LavadorList()
        {
            try
            {
                List<ListaLavador> lavadores = new List<ListaLavador>();

                var result = _unitOfWork.Lavador.GetAll().OrderBy(n => n.Nome);

                foreach (var lavador in result)
                {
                    lavadores.Add(
                        new ListaLavador { Nome = (lavador.Nome), LavadorId = lavador.LavadorId }
                    );
                }

                return lavadores;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "LavadorList", error);
                return default(List<ListaLavador>); // padronizado
            }
        }
    }

    public class ListaStatus
    {
        public string Status { get; set; }
        public string StatusId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaStatus()
        {
            try { }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "ListaStatus", error);
            }
        }

        public ListaStatus(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "ListaStatus", error);
            }
        }

        public List<ListaStatus> StatusList()
        {
            try
            {
                List<ListaStatus> status = new List<ListaStatus>();

                status.Add(new ListaStatus { Status = "Todas", StatusId = "Todas" });
                status.Add(new ListaStatus { Status = "Abertas", StatusId = "Aberta" });
                status.Add(new ListaStatus { Status = "Realizadas", StatusId = "Realizada" });
                status.Add(new ListaStatus { Status = "Canceladas", StatusId = "Cancelada" });

                return status;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "StatusList", error);
                return default(List<ListaStatus>); // padronizado
            }
        }
    }

    public class ListaSetores
    {
        public Guid SetorSolicitanteId { get; set; }
        public Guid SetorPaiId { get; set; }
        public bool HasChild { get; set; }
        public string Sigla { get; set; }
        public bool Expanded { get; set; }
        public bool IsSelected { get; set; }
        public string Nome { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaSetores()
        {
            try { }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "ListaSetores", error);
            }
        }

        public ListaSetores(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "ListaSetores", error);
            }
        }

        public List<ListaSetores> SetoresList()
        {
            try
            {
                //    Preenche Treeview de Setores
                //================================
                var objSetores = _unitOfWork.ViewSetores.GetAll();
                Guid setorPai = Guid.Empty;
                bool temFilho;
                List<ListaSetores> TreeDataSource = new List<ListaSetores>();

                //string setorid = "2fd11a87-69e6-4f36-04c7-08d97d2150db";

                //TreeDataSource.Add(new ListaSetores
                //{
                //    SetorSolicitanteId = Guid.Parse(setorid),
                //    Nome = "Seção Administrativa",
                //    //Sigla = setor.Sigla
                //});

                foreach (var setor in objSetores)
                {
                    temFilho = false;
                    var objFromDb = _unitOfWork.ViewSetores.GetFirstOrDefault(u =>
                        u.SetorPaiId == setor.SetorSolicitanteId
                    );

                    if (objFromDb != null)
                    {
                        temFilho = true;
                    }
                    if (setor.SetorPaiId != Guid.Empty)
                    {
                        if (temFilho)
                        {
                            if (setor.SetorPaiId != Guid.Empty)
                            {
                                TreeDataSource.Add(
                                    new ListaSetores
                                    {
                                        SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                        SetorPaiId = setor.SetorPaiId ?? Guid.Empty,
                                        Nome = setor.Nome,
                                        HasChild = true,
                                        //Sigla = setor.Sigla
                                    }
                                );
                            }
                            else
                            {
                                TreeDataSource.Add(
                                    new ListaSetores
                                    {
                                        SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                        Nome = setor.Nome,
                                        HasChild = true,
                                        //Sigla = setor.Sigla
                                    }
                                );
                            }
                        }
                        else
                        {
                            TreeDataSource.Add(
                                new ListaSetores
                                {
                                    SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                    SetorPaiId = setor.SetorPaiId ?? Guid.Empty,
                                    Nome = setor.Nome,
                                    //Sigla = setor.Sigla
                                }
                            );
                        }
                    }
                    else
                    {
                        if (temFilho)
                        {
                            TreeDataSource.Add(
                                new ListaSetores
                                {
                                    SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                    Nome = setor.Nome,
                                    HasChild = true,
                                    //Sigla = setor.Sigla
                                }
                            );
                        }
                    }
                }

                return TreeDataSource;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ControleLavagem.cshtml.cs", "SetoresList", error);
                return default(List<ListaSetores>); // padronizado
            }
        }
    }
}
