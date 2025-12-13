using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Pages.Multa
{
    public class PreencheListasModel :PageModel
    {
        public static IUnitOfWork _unitOfWork;
        public static byte[] PDFAutuacao;
        public static byte[] PDFNotificacao;
        public static Guid MultaId;

        [BindProperty]
        public Models.MultaViewModel MultaObj
        {
            get; set;
        }

        public PreencheListasModel(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "PreencheListas.cshtml.cs" ,
                    "PreencheListasModel" ,
                    error
                );
            }
        }

        public void OnGet()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "OnGet" , error);
            }
        }
    }

    public class ListaVeiculos
    {
        public string Descricao
        {
            get; set;
        }
        public Guid Id
        {
            get; set;
        }

        private readonly IUnitOfWork _unitOfWork;

        public ListaVeiculos()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "ListaVeiculos" , error);
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
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "ListaVeiculos" , error);
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
                        Id = v.VeiculoId ,
                        Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo ,
                    }
                ).OrderBy(v => v.Descricao);

                foreach (var veiculo in result)
                {
                    veiculos.Add(
                        new ListaVeiculos { Descricao = veiculo.Descricao , Id = veiculo.Id }
                    );
                }

                return veiculos;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "VeiculosList" , error);
                return new List<ListaVeiculos>();
            }
        }
    }

    public class ListaMotorista
    {
        public string Descricao
        {
            get; set;
        }
        public Guid Id
        {
            get; set;
        }

        private readonly IUnitOfWork _unitOfWork;

        public ListaMotorista()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "ListaMotorista" , error);
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
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "ListaMotorista" , error);
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
                            Descricao = motorista.MotoristaCondutor ,
                            Id = motorista.MotoristaId ,
                        }
                    );
                }

                return motoristas;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "MotoristaList" , error);
                return new List<ListaMotorista>();
            }
        }
    }

    public class ListaOrgaoAutuanteMulta
    {
        public string Descricao
        {
            get; set;
        }
        public Guid Id
        {
            get; set;
        }

        private readonly IUnitOfWork _unitOfWork;

        public ListaOrgaoAutuanteMulta()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "PreencheListas.cshtml.cs" ,
                    "ListaOrgaoAutuanteMulta" ,
                    error
                );
            }
        }

        public ListaOrgaoAutuanteMulta(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "PreencheListas.cshtml.cs" ,
                    "ListaOrgaoAutuanteMulta" ,
                    error
                );
            }
        }

        public List<ListaOrgaoAutuanteMulta> OrgaoAutuanteList()
        {
            try
            {
                List<ListaOrgaoAutuanteMulta> orgaos = new List<ListaOrgaoAutuanteMulta>();

                var result = _unitOfWork.OrgaoAutuante.GetAll().OrderBy(o => o.Nome);

                foreach (var orgao in result)
                {
                    orgaos.Add(
                        new ListaOrgaoAutuanteMulta
                        {
                            Descricao = (orgao.Nome + " (" + orgao.Sigla + ")") ,
                            Id = orgao.OrgaoAutuanteId ,
                        }
                    );
                }

                return orgaos;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "PreencheListas.cshtml.cs" ,
                    "OrgaoAutuanteList" ,
                    error
                );
                return new List<ListaOrgaoAutuanteMulta>();
            }
        }
    }

    public class ListaTipoMulta
    {
        public string Descricao
        {
            get; set;
        }
        public Guid Id
        {
            get; set;
        }

        private readonly IUnitOfWork _unitOfWork;

        public ListaTipoMulta()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "ListaTipoMulta" , error);
            }
        }

        public ListaTipoMulta(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "ListaTipoMulta" , error);
            }
        }

        public List<ListaTipoMulta> TipoMultaList()
        {
            try
            {
                List<ListaTipoMulta> tiposmulta = new List<ListaTipoMulta>();

                var result = _unitOfWork.TipoMulta.GetAll().OrderBy(tm => tm.Artigo);

                foreach (var tipomulta in result)
                {
                    tiposmulta.Add(
                        new ListaTipoMulta
                        {
                            Descricao = (
                                "("
                                + tipomulta.Artigo
                                + ")"
                                + "-("
                                + tipomulta.CodigoDenatran
                                + "/"
                                + tipomulta.Desdobramento
                                + ")"
                                + " - "
                                + Servicos.ConvertHtml(tipomulta.Descricao)
                            ) ,
                            Id = tipomulta.TipoMultaId ,
                        }
                    );
                }

                return tiposmulta;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "TipoMultaList" , error);
                return new List<ListaTipoMulta>();
            }
        }
    }

    public class ListaStatusAutuacao
    {
        public string Status
        {
            get; set;
        }
        public string StatusId
        {
            get; set;
        }

        private readonly IUnitOfWork _unitOfWork;

        public ListaStatusAutuacao()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "PreencheListas.cshtml.cs" ,
                    "ListaStatusAutuacao" ,
                    error
                );
            }
        }

        public ListaStatusAutuacao(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "PreencheListas.cshtml.cs" ,
                    "ListaStatusAutuacao" ,
                    error
                );
            }
        }

        public List<ListaStatusAutuacao> StatusList()
        {
            try
            {
                List<ListaStatusAutuacao> status = new List<ListaStatusAutuacao>();

                status.Add(new ListaStatusAutuacao { Status = "Todas" , StatusId = "Todas" });
                status.Add(new ListaStatusAutuacao { Status = "Pendente" , StatusId = "Pendente" });
                status.Add(
                    new ListaStatusAutuacao { Status = "Notificado" , StatusId = "Notificado" }
                );
                status.Add(
                    new ListaStatusAutuacao { Status = "Reconhecido" , StatusId = "Reconhecido" }
                );

                return status;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "StatusList" , error);
                return new List<ListaStatusAutuacao>();
            }
        }
    }

    public class ListaStatusAutuacaoAlteracao
    {
        public string Status
        {
            get; set;
        }
        public string StatusId
        {
            get; set;
        }

        private readonly IUnitOfWork _unitOfWork;

        public ListaStatusAutuacaoAlteracao()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "PreencheListas.cshtml.cs" ,
                    "ListaStatusAutuacaoAlteracao" ,
                    error
                );
            }
        }

        public ListaStatusAutuacaoAlteracao(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "PreencheListas.cshtml.cs" ,
                    "ListaStatusAutuacaoAlteracao" ,
                    error
                );
            }
        }

        public List<ListaStatusAutuacaoAlteracao> StatusList()
        {
            try
            {
                List<ListaStatusAutuacaoAlteracao> status =
                    new List<ListaStatusAutuacaoAlteracao>();

                status.Add(
                    new ListaStatusAutuacaoAlteracao { Status = "Pendente" , StatusId = "Pendente" }
                );
                status.Add(
                    new ListaStatusAutuacaoAlteracao
                    {
                        Status = "Notificado" ,
                        StatusId = "Notificado" ,
                    }
                );
                status.Add(
                    new ListaStatusAutuacaoAlteracao
                    {
                        Status = "Reconhecido" ,
                        StatusId = "Reconhecido" ,
                    }
                );

                return status;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "StatusList" , error);
                return new List<ListaStatusAutuacaoAlteracao>();
            }
        }
    }

    public class ListaStatusPenalidade
    {
        public string Status
        {
            get; set;
        }
        public string StatusId
        {
            get; set;
        }

        private readonly IUnitOfWork _unitOfWork;

        public ListaStatusPenalidade()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "PreencheListas.cshtml.cs" ,
                    "ListaStatusPenalidade" ,
                    error
                );
            }
        }

        public ListaStatusPenalidade(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "PreencheListas.cshtml.cs" ,
                    "ListaStatusPenalidade" ,
                    error
                );
            }
        }

        public List<ListaStatusPenalidade> StatusList()
        {
            try
            {
                List<ListaStatusPenalidade> status = new List<ListaStatusPenalidade>();

                status.Add(new ListaStatusPenalidade { Status = "Todas" , StatusId = "Todas" });
                status.Add(new ListaStatusPenalidade { Status = "À Pagar" , StatusId = "À Pagar" });
                status.Add(
                    new ListaStatusPenalidade
                    {
                        Status = "Paga (Defin)" ,
                        StatusId = "Enviada Defin" ,
                    }
                );
                status.Add(
                    new ListaStatusPenalidade
                    {
                        Status = "Paga (Infrator)" ,
                        StatusId = "Paga (Infrator)" ,
                    }
                );
                status.Add(
                    new ListaStatusPenalidade
                    {
                        Status = "À Enviar Secle" ,
                        StatusId = "À Enviar Secle" ,
                    }
                );
                status.Add(
                    new ListaStatusPenalidade
                    {
                        Status = "Enviada Secle" ,
                        StatusId = "Enviada Secle" ,
                    }
                );
                status.Add(
                    new ListaStatusPenalidade
                    {
                        Status = "Arquivada (Finalizada)" ,
                        StatusId = "Arquivada (Finalizada)" ,
                    }
                );

                return status;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "StatusList" , error);
                return new List<ListaStatusPenalidade>();
            }
        }
    }

    public class ListaStatusPenalidadeAlteracao
    {
        public string Status
        {
            get; set;
        }
        public string StatusId
        {
            get; set;
        }

        private readonly IUnitOfWork _unitOfWork;

        public ListaStatusPenalidadeAlteracao()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "PreencheListas.cshtml.cs" ,
                    "ListaStatusPenalidadeAlteracao" ,
                    error
                );
            }
        }

        public ListaStatusPenalidadeAlteracao(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "PreencheListas.cshtml.cs" ,
                    "ListaStatusPenalidadeAlteracao" ,
                    error
                );
            }
        }

        public List<ListaStatusPenalidadeAlteracao> StatusList()
        {
            try
            {
                List<ListaStatusPenalidadeAlteracao> status =
                    new List<ListaStatusPenalidadeAlteracao>();

                status.Add(
                    new ListaStatusPenalidadeAlteracao { Status = "Todas" , StatusId = "Todas" }
                );
                status.Add(
                    new ListaStatusPenalidadeAlteracao { Status = "À Pagar" , StatusId = "À Pagar" }
                );
                status.Add(
                    new ListaStatusPenalidadeAlteracao
                    {
                        Status = "Paga (Defin)" ,
                        StatusId = "Enviada Defin" ,
                    }
                );
                status.Add(
                    new ListaStatusPenalidadeAlteracao
                    {
                        Status = "Paga (Infrator)" ,
                        StatusId = "Paga (Infrator)" ,
                    }
                );
                status.Add(
                    new ListaStatusPenalidadeAlteracao
                    {
                        Status = "À Enviar Secle" ,
                        StatusId = "À Enviar Secle" ,
                    }
                );
                status.Add(
                    new ListaStatusPenalidadeAlteracao
                    {
                        Status = "Enviada Secle" ,
                        StatusId = "Enviada Secle" ,
                    }
                );

                return status;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PreencheListas.cshtml.cs" , "StatusList" , error);
                return new List<ListaStatusPenalidadeAlteracao>();
            }
        }
    }
}
