
$(document).ready(function () {

    var viagemId = document.getElementById("txtViagemId").value;

    console.log("viagemId: " + viagemId);

    if (viagemId != null && viagemId != '00000000-0000-0000-0000-000000000000')
    {
        $.ajax({
            type: "GET",
            url: '/api/Agenda/RecuperaViagem',
            data: { id: viagemId },
            contentType: "application/json",
            dataType: "json",
            success: function (response) {

                ExibeViagem(response.data);

            }
        });

    }
});

function ExibeViagem(viagem) {


    //     var lstEvento = document.getElementById("lstEventos").ej2_instances[0];
    //     lstEvento.enabled = false; // To disable
    //     document.getElementById("btnEvento").style.display = "none";
    //     $(".esconde-diveventos").hide(); /* Use the .hide() method to make the div invisible */

    // $("#txtViagemId").val(viagem.viagemId);
    // $("#txtStatusAgendamento").val(viagem.statusAgendamento);
    // $("#txtUsuarioIdCriacao").val(viagem.usuarioIdCriacao);
    // $("#txtDataCriacao").val(viagem.dataCriacao);

    //Exibe dados comuns ao Agendamento e Viagem
    //============================================
    // $('#txtDataInicial').removeAttr("type");
    // var dataInicial = viagem.dataInicial;
    // dataInicial = dataInicial.substring(0, 10);
    // dArr = dataInicial.split("-");  // ex input "2010-01-18"
    // dataInicial = dArr[0].substring(0, 4) + "-" + dArr[1] + "-" + dArr[2]; //ex out: "18/01/10"
    // document.getElementById("txtDataInicial").value = dataInicial;
    // $('#txtDataInicial').attr('type', 'date');

    // $('#txtHoraInicial').removeAttr("type");
    // var horaInicio = viagem.horaInicio;
    // horaInicio = horaInicio.substring(11, 16);
    // document.getElementById("txtHoraInicial").value = horaInicio;

    // $('#txtHoraInicial').attr('type', 'time');

    // //debugger;

    document.getElementById("ddtFinalidade").ej2_instances[0].value = viagem.finalidade;
    document.getElementById("ddtFinalidade").ej2_instances[0].text = viagem.finalidade;
    // $("#txtOrigem").val(viagem.origem);
    // $("#txtDestino").val(viagem.destino);

    if (viagem.eventoId != null) {
        var ddtEventos = document.getElementById("ddtEventos").ej2_instances[0];
        ddtEventos.enabled = true; // To disables
        ddtEventos.value = [viagem.eventoId];
        document.getElementById("btnEvento").style.display = "block";
        $(".esconde-diveventos").show(); /* Use the .hide() method to make the div invisible */
    }
    else {
        var ddtEventos = document.getElementById("ddtEventos").ej2_instances[0];
        ddtEventos.enabled = false; // To disable
        document.getElementById("btnEvento").style.display = "none";
        $(".esconde-diveventos").hide(); /* Use the .hide() method to make the div invisible */
    }

    // var ddtMotorista = document.getElementById("ddtMotorista").ej2_instances[0];
    // ddtMotorista.value = [viagem.motoristaId];

    // cmbVeiculo.value = [viagem.veiculoId];

    // lstRequisitante.value = [viagem.requisitanteId];

    // document.getElementById("txtRamalRequisitante").value = viagem.ramalRequisitante;

    document.getElementById("ddtSetor").ej2_instances[0].value = [viagem.setorSolicitanteId];


    // rte.value = viagem.descricao;
    // document.getElementById("rteDescricao").ej2_instances[0].value = viagem.descricao

    // const DataCriacao = moment(viagem.dataCriacao).format("DD/MM/YYYY");
    // const HoraCriacao = moment(viagem.dataCriacao).format("HH:mm");

    // var usuarioCriacao;

    // $.ajax({
    //     url: '/api/Agenda/RecuperaUsuario',
    //     type: "Get",
    //     data: { id: viagem.usuarioIdCriacao },
    //     contentType: "application/json; charset=utf-8",
    //     dataType: "json",
    //     success: function (data) {
    //         $.each(data, function (key, val) {
    //             usuarioCriacao = val;
    //         });
    //         document.getElementById("lblUsuarioCriacao").innerHTML = "Incluída/Alterada por " + usuarioCriacao + " em " + DataCriacao + " às " + HoraCriacao;
    //         console.log("Usuário: " + usuarioCriacao)

    //     },
    //     error: function (err) {
    //         console.log(err)
    //         alert('something went wrong')
    //     }
    // });

    //     $("#txtNoFichaVistoria").val(viagem.noFichaVistoria);

    //     if (viagem.status === "Realizada") {
    //         $('#txtDataFinal').removeAttr("type");
    //         var dataFinal = viagem.dataFinal;
    //         dataFinal = dataFinal.substring(0, 10);
    //         dArr = dataFinal.split("-");  // ex input "2010-01-18"
    //         dataFinal = dArr[2] + "/" + dArr[1] + "/" + dArr[0].substring(0, 4); //ex out: "18/01/10"
    //         document.getElementById("txtDataFinal").value = dataFinal;

    //         $('#txtHoraFinal').removeAttr("type");
    //         var horaFim = viagem.horaFim;
    //         horaFim = horaFim.substring(11, 16);
    //         document.getElementById("txtHoraFinal").value = horaFim;
    //     }

    //     document.getElementById("txtKmAtual").value = viagem.kmAtual;
    //     document.getElementById("txtKmInicial").value = viagem.kmInicial;
    //     document.getElementById("txtKmFinal").value = viagem.kmFinal;

    document.getElementById("ddtCombustivelInicial").ej2_instances[0].value = [viagem.combustivelInicial];
    document.getElementById("ddtCombustivelFinal").ej2_instances[0].value = [viagem.combustivelFinal];

    //     console.log("ddtCombustivelInicial : " + ddtCombustivelInicial.value);
    //     console.log("ddtCombustivelInicialViagem : " + ddtCombustivelInicial.value);

    //     console.log("ddtCombustivelFinal : " + [viagem.combustivelInicial]);
    //     console.log("ddtCombustivelFinalViagem : " + [viagem.combustivelFinal]);

    //     if (viagem.status === "Realizada") {

    //         const DataFinalizacao = moment(viagem.dataCriacao).format("DD/MM/YYYY");
    //         const HoraFinalizacao = moment(viagem.dataCriacao).format("HH:mm");


    //         var usuarioFinalizacao;

    //         $.ajax({
    //             url: '/api/Agenda/RecuperaUsuario',
    //             type: "Get",
    //             data: {id: viagem.usuarioIdFinalizacao },
    //             contentType: "application/json; charset=utf-8",
    //             dataType: "json",
    //             success: function (data) {
    //                 $.each(data, function (key, val) {
    //                     usuarioFinalizacao = val;
    //                 });
    //                 console.log("Usuário: " + usuarioFinalizacao)
    //                 document.getElementById("lblUsuarioFinalizacao").innerHTML = " - Finalizada por " + usuarioFinalizacao + " em " + DataFinalizacao + " às " + HoraFinalizacao;

    //             },
    //             error: function (err) {
    //                 console.log(err)
    //                 alert('something went wrong')
    //             }
    //         });

    //     }

    // if viagem.viagemId == null
    //     {
    //         document.getElementById("txtDataInicial").value = moment(Date()).format("YYYY-MM-DD");
    //         document.getElementById("txtHoraInicial").value = moment(Date()).format("HH:mm");
    //         document.getElementById("divFicha").style.display = 'none';

    //     }


    //Bloqueia controles caso a viagem já tenha sido realizada ou cancelada
    if (viagem.status === 'Realizada' || viagem.status === 'Cancelada') {


        // Loop through all child elements of the <div>
        $("#divPainel :input").each(function () {
            $(this).prop("disabled", true);
        });


        var rte = document.getElementById("rte").ej2_instances[0];
        rte.enabled = false; // To disable
        var cmbMotorista = document.getElementById("cmbMotorista").ej2_instances[0];
        cmbMotorista.enabled = false; // To disable
        var cmbVeiculo = document.getElementById("cmbVeiculo").ej2_instances[0];
        cmbVeiculo.enabled = false; // To disable
        var cmbRequisitante = document.getElementById("cmbRequisitante").ej2_instances[0];
        cmbRequisitante.enabled = false; // To disable
        var ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
        ddtSetor.enabled = false; // To disable
        var ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
        ddtCombustivelInicial.enabled = false; // To disable
        var ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0];
        ddtCombustivelFinal.enabled = false; // To disable
        var ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
        ddtSetor.enabled = false; // To disable
        document.getElementById('ddtFinalidade').ej2_instances[0].enabled = false;
        document.getElementById("ddtEventos").ej2_instances[0].enabled = false;
        var cmdRequisitante = document.getElementById("btnRequisitante");
        cmdRequisitante.disabled = true; // To disable
        var cmdSetor = document.getElementById("btnSetor");
        cmdSetor.disabled = true; // To disable
        var cmdEvento = document.getElementById("btnEvento");
        cmdEvento.disabled = true; // To disable

        document.getElementById("divSubmit").style.display = 'none';
        $("#btnSubmit").hide();

        // }

        // debugger;

        // //Atualiza Controles SYNCFUSION da Página
        // if ("@Model.ViagemObj.Viagem.CombustivelInicial" != null) {
        //     var ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
        //     ddtCombustivelInicial.value = ['@Model.ViagemObj.Viagem.CombustivelInicial'];

        // }

        // if ("@Model.ViagemObj.Viagem.CombustivelFinal" != null) {

        //     var ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0];
        //     ddtCombustivelFinal.value = ['@Model.ViagemObj.Viagem.CombustivelFinal'];

        // }


    }

}

    //Configura a Exibição do Modal de Eventos
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =//

    $("#modalEvento").modal({
        keyboard: true,
        backdrop: false,
        show: false,
    }).on("show.bs.modal", function (event) {
    }).on("hide.bs.modal", function (event) {
        var setores = document.getElementById('ddtSetorRequisitanteEvento').ej2_instances[0];
        setores.value = "";
        var requisitantes = document.getElementById('lstRequisitanteEvento').ej2_instances[0];
        requisitantes.value = "";
        $("#txtNome").val('');
        $("#txtDescricao").val('');
        $("#txtDataInicial").val('');
        $("#txtDataFinal").val('');
        $('.modal-backdrop').remove();
        $(document.body).removeClass("modal-open");
    });

    //Configura a Exibição do Modal de Requisitantes
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =//

    $("#modalRequisitante").modal({
        keyboard: true,
        backdrop: "static",
        show: false,
    }).on("show.bs.modal", function (event) {
    }).on("hide.bs.modal", function (event) {
        var setores = document.getElementById('ddtSetorRequisitante').ej2_instances[0];
    setores.value = "";
        $("#txtPonto").val('');
        $("#txtNome").val('');
        $("#txtRamal").val('');
        $("#txtEmail").val('');
        $('.modal-backdrop').remove();
    });

    //Configura a Exibição do Modal de Setores
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =//

    $("#modalSetor").modal({
        keyboard: true,
        backdrop: "static",
        show: false,
    }).on("show.bs.modal", function (event) {
    }).on("hide.bs.modal", function (event) {
        var setores = document.getElementById('ddtSetorPai').ej2_instances[0];
        setores.value = "";
        $("#txtSigla").val('');
        $("#txtNomeSetor").val('');
        $("#txtRamalSetor").val('');
    });


    $("#txtNoFichaVistoria").focusout(function () {

        if (document.getElementById("txtNoFichaVistoria").value === '') {
            return;
        }

        var noFichaVistoria = document.getElementById("txtNoFichaVistoria").value;


        //Verifica se Número da Ficha está muito diferente do último inserido
        $.ajax({
            url: "/Viagens/Upsert?handler=VerificaFicha",
            method: "GET",
            datatype: "json",
            data: { id: document.getElementById("txtNoFichaVistoria").value },
            success: function (res) {

                var maxFichaVistoria = [res.data];

                console.log("NoFichaVistoria: " + noFichaVistoria);
                console.log("MAxFichaVistoria: " + maxFichaVistoria);

                if ((noFichaVistoria > (parseInt(maxFichaVistoria) + 100))) {
                    swal({
                        title: "Alerta na Ficha de Vistoria",
                        text: "O número inserido difere em +100 da última Ficha inserida!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                        buttons: {
                            ok: "Ok"
                        }
                    })

                    return;
                }

                if ((noFichaVistoria < (parseInt(maxFichaVistoria) - 100))) {
                    swal({
                        title: "Alerta na Ficha de Vistoria",
                        text: "O número inserido difere em -100 da última Ficha inserida!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                        buttons: {
                            ok: "Ok"
                        }
                    })

                    return;
                }

                //debugger;
            }
        })


        //Verifica se Número da Ficha já foi cadastrado
        $.ajax({
            url: "/Viagens/Upsert?handler=FichaExistente",
            method: "GET",
            datatype: "json",
            data: { id: document.getElementById("txtNoFichaVistoria").value },
            success: function (res) {

                var ExisteFicha = [res.data];

                console.log("Data: " + [res.data]);
                console.log("ExisteFicha: " + ExisteFicha);

                //debugger;

                if (ExisteFicha[0] === true) {
                    swal({
                        title: "Alerta na Ficha de Vistoria",
                        text: "Já existe uma Ficha inserida com esta numeração!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                        buttons: {
                            ok: "Ok"
                        }
                    })

                    return;
                }

                //debugger;
            }
        })


    });


    //Verifica se Data Final é menor que Data Inicial
    $("#txtDataFinal").focusout(function () {

        DataInicial = $("#txtDataInicial").val();
        DataFinal = $("#txtDataFinal").val();

        if (DataFinal === '') {
            return;
        }

        if ((DataFinal < DataInicial)) {
            $("#txtDataFinal").val('');
            swal({
                title: "Erro na Data",
                text: "A data final deve ser maior que a inicial!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })

        }
    });

    //Verifica se Data Inicial é maior que Data Final
    $("#txtDataInicial").focusout(function () {

        DataInicial = $("#txtDataInicial").val();
        DataFinal = $("#txtDataFinal").val();

        if (DataInicial === '' || DataFinal === '') {
            return;
        }

        if ((DataInicial > DataFinal)) {
            $("#txtDataInicial").val('');
            swal({
                title: "Erro na Data",
                text: "A data inicial deve ser menor que a final!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })

        }
    });

    //Verifica se Hora Final é menor que Hora Inicial e se tem Data Final
    $("#txtHoraFinal").focusout(function () {

        HoraInicial = $("#txtHoraInicial").val();
        HoraFinal = $("#txtHoraFinal").val();
        DataInicial = $("#txtDataInicial").val();
        DataFinal = $("#txtDataFinal").val();

        console.log(HoraInicial);
        console.log(HoraFinal);
        console.log(DataFinal);

        if (DataFinal === '') {
            $("#txtHoraFinal").val('');
            swal({
                title: "Erro na Hora Final",
                text: "Preencha a Data Final para poder preencher a Hora Final!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
        }

        if ((HoraFinal < HoraInicial) && (DataInicial === DataFinal)) {
            $("#txtHoraFinal").val('');
            swal({
                title: "Erro na Hora",
                text: "A hora final deve ser maior que a inicial!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })

        }
    });

    //Verifica se Hora inicial é maior que Hora final
    $("#txtHoraInicial").focusout(function () {

        HoraInicial = $("#txtHoraInicial").val();
        HoraFinal = $("#txtHoraFinal").val();

        console.log(HoraInicial);
        console.log(HoraFinal);

        if (HoraFinal === '') {
            return;
        }

        if (HoraInicial > HoraFinal) {
            $("#txtHoraInicial").val('');
            swal({
                title: "Erro na Hora",
                text: "A hora inicial deve ser menor que a final!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })

        }

       // //Verifica se já existe um veículo agendado para esse horário
       //require(['nodeMssqlModule'], function (nodeMssql)
       // {
       //     // Your code using node-mssql
       // });

    });


    //define(['node-mssql'], function (nodeMssql)
    //{
    //    // Configure your database connection
    //    const config = {
    //        user: 'Frotix',
    //        password: 'efi3qae5F!',
    //        server: 'localhost',
    //        database: 'Frotix',
    //    };

    //    // Create a connection pool
    //    const pool = new nodeMssql.ConnectionPool(config);

    //    // Connect to the database
    //    pool.connect().then(() =>
    //    {
    //        debugger;

    //        DataInicial = $("#txtDataInicial").val();
    //        HoraInicial = $("#txtHoraInicial").val();

    //        // Create a new connection pool
    //        let startDate = new Date(DataInicial + ' ' + HoraInicial + ':00');
    //        //const momentStartDate = moment(DataInicial + ' ' + HoraInicial + ':00')
    //        let hours = 1;

    //        let startHour = new Date(startDate.getTime() - 1 * 60 * 60 * 1000);
    //        let endHour = new Date(startDate.getTime() + 1 * 60 * 60 * 1000);


    //        // Query the database
    //        return pool.request().query('SELECT * FROM Viagens WHERE EventoId IS NOT NULL AND HoraInicio BETWEEN @StartHour AND @EndHour');
    //    }).then(result =>
    //    {
    //        console.log(result.recordset);
    //        pool.close();
    //    }).catch(err =>
    //    {
    //        console.error('Error:', err);
    //        pool.close();
    //    });

    //    // Export the node-mssql module for use
    //    return nodeMssql;
    //});

    //Verifica se KM Final é menor que KM Inicial
    $("#txtKmFinal").focusout(function () {

        kmInicial = parseInt($("#txtKmInicial").val());
        kmFinal = parseInt($("#txtKmFinal").val());

        if (kmFinal < kmInicial) {
            $("#txtKmFinal").val('');
            swal({
                title: "Erro na Quilometragem",
                text: "A quilometragem final deve ser maior que a inicial!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })

        }


        if ((kmFinal - kmInicial) > 100) {
            swal({
                title: "Alerta na Quilometragem",
                text: "A quilometragem final excede em 100km a inicial!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })

        }



    });


    //Verifica se KM Inicial é maior que KM Inicial
    $("#txtKmInicial").focusout(function () {

        kmInicial = parseInt($("#txtKmInicial").val());
        kmFinal = parseInt($("#txtKmFinal").val());

        if (kmInicial > kmFinal) {
            $("#txtKmInicial").val('');
            swal({
                title: "Erro na Quilometragem",
                text: "A quilometragem inicial deve ser menor que a final!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })

        }
    });

    //Verifica se KM Inicial é menor ou diferente de KM Atual
    $("#txtKmInicial").focusout(function () {

        if ($("#txtKmInicial").val() === '' || $("#txtKmInicial").val() === null) {
            return;
        }

        kmInicial = parseInt($("#txtKmInicial").val());
        kmAtual = parseInt($("#txtKmAtual").val());

        console.log(kmInicial);

        if (kmInicial < kmAtual) {
            $("#txtKmInicial").val('');
            swal({
                title: "Erro na Quilometragem",
                text: "A quilometragem inicial deve ser maior que a atual!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

        if (kmInicial !== kmAtual) {
            //$("#txtKmInicial").val('');
            swal({
                title: "Erro na Quilometragem",
                text: "A quilometragem inicial não confere com a atual!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

    });


    function toolbarClick(e) {
        if (e.item.id == "rte_toolbar_Image") {
            var element = document.getElementById('rte_upload')
            element.ej2_instances[0].uploading = function upload(args) {
                args.currentRequest.setRequestHeader('XSRF-TOKEN', document.getElementsByName('__RequestVerificationToken')[0].value);
            }
        }
    }

    //Preenche Lista de Eventos Após Inserção de um novo
    function PreencheListaEventos(novoeventoId) {

        $.ajax({
            url: "/Viagens/Upsert?handler=AJAXPreencheListaEventos",
            method: "GET",
            datatype: "json",
            success: function (res) {

                var eventoid = res.data[0].eventoId;
                var nome = res.data[0].nome;

                let EventoList = [{ "EventoId": eventoid, "Nome": nome }];

                for (var i = 1; i < res.data.length; ++i) {
                    console.log(res.data[i].eventoId + res.data[i].nome);

                    eventoid = res.data[i].eventoId;
                    nome = res.data[i].nome;

                    let evento = { EventoId: eventoid, Nome: nome }
                    EventoList.push(evento);

                }

                console.log(EventoList);

                document.getElementById("ddtEventos").ej2_instances[0].fields.dataSource = EventoList;

            }
        })

        document.getElementById("ddtEventos").ej2_instances[0].refresh();

    }


    //Preenche Lista de Requisitantes Após Inserção de um novo
    function PreencheListaRequisitantes() {

        $.ajax({
            url: "/Viagens/Upsert?handler=AJAXPreencheListaRequisitantes",
            method: "GET",
            datatype: "json",
            success: function (res) {

                var requisitanteid = res.data[0].requisitanteId;
                var nomerequisitante = res.data[0].requisitante;

                let RequisitanteList = [{ "RequisitanteId": requisitanteid, "Requisitante": nomerequisitante }];

                for (var i = 1; i < res.data.length; ++i) {
                    console.log(res.data[i].requisitanteId + res.data[i].requisitante);

                    requisitanteid = res.data[i].requisitanteId;
                    nomerequisitante = res.data[i].requisitante;

                    let requisitante = { RequisitanteId: requisitanteid, Requisitante: nomerequisitante }
                    RequisitanteList.push(requisitante);

                }

                console.log(RequisitanteList);

                document.getElementById("cmbRequisitante").ej2_instances[0].fields.dataSource = RequisitanteList;

            }
        })

        document.getElementById("cmbRequisitante").ej2_instances[0].refresh();
    }

    //Preenche Lista de Setores Após Inserção de um novo
    function PreencheListaSetores(SetorSolicitanteId) {

        $.ajax({
            url: "/Viagens/Upsert?handler=AJAXPreencheListaSetores",
            method: "GET",
            datatype: "json",
            success: function (res) {


                var setorSolicitanteId = res.data[0].setorSolicitanteId;
                var setorPaiId = res.data[0].setorPaiId;
                var nome = res.data[0].nome;
                var hasChild = res.data[0].hasChild;

                let SetorList = [{ "SetorSolicitanteId": setorSolicitanteId, "SetorPaiId": setorPaiId, "Nome": nome, "HasChild": hasChild }];

                for (var i = 1; i < res.data.length; ++i) {
                    console.log(res.data[i].requisitanteId + res.data[i].requisitante);

                    setorSolicitanteId = res.data[i].setorSolicitanteId;
                    setorPaiId = res.data[i].setorPaiId;
                    nome = res.data[i].nome;
                    hasChild = res.data[i].hasChild;

                    let setor = { "SetorSolicitanteId": setorSolicitanteId, "SetorPaiId": setorPaiId, "Nome": nome, "HasChild": hasChild }
                    SetorList.push(setor);
                }

                console.log(SetorList);

                document.getElementById("ddtSetor").ej2_instances[0].fields.dataSource = SetorList;

            }
        })

        document.getElementById("ddtSetor").ej2_instances[0].refresh();
        var strSetor = String(SetorSolicitanteId);
        document.getElementById("ddtSetor").ej2_instances[0].value = [strSetor];
    }

    //Escolheu um Requisitante
    function RequisitanteValueChange() {

        var ddTreeObj = document.getElementById("cmbRequisitante").ej2_instances[0];

        if (ddTreeObj.value === null) {
            return;
        }

        var requisitanteid = String(ddTreeObj.value);

        //Pega Setor Padrão do Requisitante
        $.ajax({
            url: "/Viagens/Upsert?handler=PegaSetor",
            method: "GET",
            datatype: "json",
            data: { id: requisitanteid },
            success: function (res) {
                document.getElementById("ddtSetor").ej2_instances[0].value = [res.data];
            }
        })

        //Pega Ramal do Requisitante
        $.ajax({
            url: "/Viagens/Upsert?handler=PegaRamal",
            method: "GET",
            datatype: "json",
            data: { id: requisitanteid },
            success: function (res) {
                var ramal = res.data;
                var s = document.getElementById("txtRamalRequisitante");
                s.value = ramal;
            }
        })

        //debugger;

    }

//Escolheu um Requisitante
function RequisitanteEventoValueChange() {

    var ddTreeObj = document.getElementById("lstRequisitanteEvento").ej2_instances[0];

    if (ddTreeObj.value === null) {
        return;
    }

    var requisitanteid = String(ddTreeObj.value);

    //Pega Setor Padrão do Requisitante
    $.ajax({
        url: "/Viagens/Upsert?handler=PegaSetor",
        method: "GET",
        datatype: "json",
        data: { id: requisitanteid },
        success: function (res) {
            document.getElementById("ddtSetorRequisitanteEvento").ej2_instances[0].value = [res.data];
        }
    })

}



    //Escolheu um Motorista
    function MotoristaValueChange() {

        var ddTreeObj = document.getElementById("cmbMotorista").ej2_instances[0];

        console.log("Objeto Requisitante: " + ddTreeObj);

        if (ddTreeObj.value === null) {
            return;
        }

        var motoristaid = String(ddTreeObj.value);

        //Verifica se Motorista está em alguma viagem
        $.ajax({
            url: "/Viagens/Upsert?handler=VerificaMotoristaViagem",
            method: "GET",
            datatype: "json",
            data: { id: motoristaid },
            success: function (res) {

                var viajando = res.data;

                console.log(viajando);

                if (viajando) {
                    swal({
                        title: "Motorista em Viagem",
                        text: "Este motorista encontra-se em uma viagem não terminada!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                        buttons: {
                            ok: "Ok"
                        }
                    })
                }
            }
        })
    }

    //Escolheu um Veículo
    function VeiculoValueChange() {

        var ddTreeObj = document.getElementById("cmbVeiculo").ej2_instances[0];

        console.log("Objeto Requisitante: " + ddTreeObj);

        if (ddTreeObj.value === null) {
            return;
        }

        var veiculoid = String(ddTreeObj.value);

        //Verifica se o veículo está em alguma viagem
        $.ajax({
            url: "/Viagens/Upsert?handler=VerificaVeiculoViagem",
            method: "GET",
            datatype: "json",
            data: { id: veiculoid },
            success: function (res) {
                var viajando = res.data;
                console.log(viajando);
                if (viajando) {
                    swal({
                        title: "Veículo em Viagem",
                        text: "Este veículo encontra-se em uma viagem não terminada!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                        buttons: {
                            ok: "Ok"
                        }
                    })
                }
            }
        })

        //Pega Km Atual do Veículo
        $.ajax({
            url: "/Viagens/Upsert?handler=PegaKmAtualVeiculo",
            method: "GET",
            datatype: "json",
            data: { id: veiculoid },
            success: function (res) {
                var km = res.data;
                var kmAtual = document.getElementById("txtKmAtual");
                kmAtual.value = km;
            }
        })

    }

    function valueChange() {
        //    var ddTreeObj = document.getElementById("ddtree").ej2_instances[0];
        //    console.info(ddTreeObj.value + " - " + ddTreeObj.text);
    }

    function select(args) {
        //    var ddTreeObj = document.getElementById("ddtree").ej2_instances[0];
        //    console.info(ddTreeObj.value + " - " + ddTreeObj.text);
    }

    function ddtCombustivelChange() {

        //var ddtCombustivel = document.getElementById("ddtCombustivel").ej2_instances[0];
        //console.log(ddtCombustivel.value);

    }


    // Botão InserirEvento do Modal
    //===================================
    $("#btnInserirEvento").click(function (e) {

        e.preventDefault();

        if ($("#txtNomeDoEvento").val() === "") {
            swal({
                title: 'Atenção',
                text: "O Nome do Evento é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };

        if ($("#txtDescricao").val() === "") {
            swal({
                title: 'Atenção',
                text: "A Descrição do Evento é obrigatória!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };

        if ($("#txtDataInicialEvento").val() === "") {
            swal({
                title: 'Atenção',
                text: "A Data Inicial é obrigatória!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };

        if ($("#txtDataFinalEvento").val() === "") {
            swal({
                title: 'Atenção',
                text: "A Data Final é obrigatória!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };

        if ($("#txtQtdPessoas").val() === "") {
            swal({
                title: 'Atenção',
                text: "A Quantidade de Pessoas é obrigatória!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };

        var setores = document.getElementById('ddtSetorRequisitanteEvento').ej2_instances[0];
        if ((setores.value === null)) {
            swal({
                title: 'Atenção',
                text: "O Setor do Requisitante é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };
        var setorSolicitanteId = setores.value.toString();

        var requisitantes = document.getElementById('lstRequisitanteEvento').ej2_instances[0];
        if ((requisitantes.value === null)) {
            swal({
                title: 'Atenção',
                text: "O Requisitante é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };
        var requisitanteId = requisitantes.value.toString();

        var objEvento = JSON.stringify({ "Nome": $('#txtNomeDoEvento').val(), "Descricao": $('#txtDescricaoEvento').val(), "SetorSolicitanteId": setorSolicitanteId, "RequisitanteId": requisitanteId, "QtdParticipantes": $('#txtQtdPessoas').val(), "DataInicial": moment(document.getElementById('txtDataInicialEvento').value).format("MM-DD-YYYY"), "DataFinal": moment(document.getElementById('txtDataFinalEvento').value).format("MM-DD-YYYY"), "Status": "1" });

        console.log(objEvento);

        $.ajax({
            type: "post",
            url: "/api/Viagem/AdicionarEvento",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objEvento,

            success: function (data) {
                toastr.success(data.message);
                PreencheListaEventos(data.eventoId);
                $("#modalEvento").hide();

            },
            error: function (data) {
                alert('error');
                console.log(data);
            }
        });
    });


    // Botão InserirRequisitante do Modal
    //===================================
    $("#btnInserirRequisitante").click(function (e) {

        e.preventDefault();

        if ($("#txtPonto").val() === "") {
            swal({
                title: 'Atenção',
                text: "O Ponto do Requisitante é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };

        if ($("#txtNome").val() === "") {
            swal({
                title: 'Atenção',
                text: "O Nome do Requisitante é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };

        if ($("#txtRamal").val() === "") {
            swal({
                title: 'Atenção',
                text: "O Ramal do Requisitante é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };

        var setores = document.getElementById('ddtSetorRequisitante').ej2_instances[0];
        if ((setores.value === null)) {
            swal({
                title: 'Atenção',
                text: "O Setor do Requisitante é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };

        var setorSolicitanteId = setores.value.toString();

        var objRequisitante = JSON.stringify({ "Nome": $('#txtNome').val(), "Ponto": $('#txtPonto').val(), "Ramal": $('#txtRamal').val(), "Email": $('#txtEmail').val(), "SetorSolicitanteId": setorSolicitanteId })

        $.ajax({
            type: "post",
            url: "/api/Viagem/AdicionarRequisitante",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objRequisitante,

            success: function (data) {

                if (data.success) {
                    toastr.success(data.message);
                    let d = document.getElementById('modalRequisitante')
                    d.style.display = "none"
                    // PreencheListaRequisitantes();
                    document.getElementById("cmbRequisitante").ej2_instances[0].addItem({ RequisitanteId: data.requisitanteid, Requisitante: $('#txtNome').val() + " - " + $('#txtPonto').val() }, 0)
                    $("#modalRequisitante").hide();
                    $('.modal-backdrop').remove();

                    $('body').removeClass('modal-open');
                    $("body").css("overflow", "auto");

                    $("#btnFecharRequisitante").click();
                    console.log("Passei por todas as etapas do Sucess do Adiciona Requisitante no AJAX");
                }
                else {
                    toastr.error(data.message);
                }

            },
            error: function (data) {
                toastr.error("Já existe um requisitante com este ponto/nome");
                console.log(data);
            }
        });
    });


    // Botão InserirSetor do Modal
    //============================
    $("#btnInserirSetor").click(function (e) {

        e.preventDefault();

        if ($("#txtNomeSetor").val() === "") {
            swal({
                title: 'Atenção',
                text: "O Nome do Setor é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };

        if ($("#txtRamalSetor").val() === "") {
            swal({
                title: 'Atenção',
                text: "O Ramal do Seor é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };

        setorPaiId = null;

        if (document.getElementById('ddtSetorPai').ej2_instances[0].value !== '' && document.getElementById('ddtSetorPai').ej2_instances[0].value !== null) {
            setorPaiId = document.getElementById('ddtSetorPai').ej2_instances[0].value.toString();
        }

        if ((setorPaiId === null)) {
            var objSetor = JSON.stringify({ "Nome": $('#txtNomeSetor').val(), "Ramal": $('#txtRamalSetor').val(), "Sigla": $('#txtSigla').val() })
        }
        else {
            var objSetor = JSON.stringify({ "Nome": $('#txtNomeSetor').val(), "Ramal": $('#txtRamalSetor').val(), "Sigla": $('#txtSigla').val(), "SetorPaiId": setorPaiId })
        };

        console.log(objSetor);

        $.ajax({
            type: "post",
            url: "/api/Viagem/AdicionarSetor",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objSetor,

            success: function (data) {
                toastr.success(data.message);
                PreencheListaSetores(data.setorId);
                $("#modalSetor").hide();
                let d = document.getElementById('modalSetor')
                d.style.display = "none"
                $("#modalSetor").hide();
                $('.modal-backdrop').remove();
                $('body').removeClass('modal-open');
                $("body").css("overflow", "auto");

            },
            error: function (data) {
                alert('error');
                console.log(data);
            }
        });
    });



    //Carrega a foto no controle e redimensiona o painel
    //==================================================
    $("#txtFile").change(function (event) {
        var files = event.target.files; f
        $("#imgViewer").attr("src", window.URL.createObjectURL(files[0]));
        $("#painelfundo").css({
            "padding-bottom:": "200px"
        });
    });




    //Controla o Submit do formulário através de botões escondidos (permite a validação via javascript)
    //=================================================================================================
    $("#btnSubmit").click(function (event) {

        event.preventDefault()

        if (document.getElementById("txtNoFichaVistoria").value === "") {
            swal({
                title: "Informação Ausente",
                text: "O número da Ficha de Vistoria é obrigatório",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

        if (document.getElementById("txtDataInicial").value === "") {
            swal({
                title: "Informação Ausente",
                text: "A Data Inicial é obrigatória",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

        if (document.getElementById("txtHoraInicial").value === "") {
            swal({
                title: "Informação Ausente",
                text: "A Hora Inicial é obrigatória",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

        var lstFinalidade = document.getElementById("ddtFinalidade").ej2_instances[0];
        if (lstFinalidade.value[0] === null) {
            swal({
                title: "Informação Ausente",
                text: "A Finalidade é obrigatória",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

        if (document.getElementById("txtOrigem").value === "") {
            swal({
                title: "Informação Ausente",
                text: "A Origem é obrigatória",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

        var ddtMotorista = document.getElementById("cmbMotorista").ej2_instances[0];
        if (ddtMotorista.value === null) {
            swal({
                title: "Informação Ausente",
                text: "O Motorista é obrigatório",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

        var cmbVeiculo = document.getElementById("cmbVeiculo").ej2_instances[0];
        if (cmbVeiculo.value === null) {
            swal({
                title: "Informação Ausente",
                text: "O Veículo é obrigatório",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

        if (document.getElementById("txtKmInicial").value === "") {
            swal({
                title: "Informação Ausente",
                text: "A Quilometragem Inicial é obrigatória",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

        var ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];

        console.log(ddtCombustivelInicial.value);

        if (ddtCombustivelInicial.value !== "tanquevazio" && ddtCombustivelInicial.value !== "tanqueumquarto" && ddtCombustivelInicial.value !== "tanquemeiotanque" && ddtCombustivelInicial.value !== "tanquetresquartos" && ddtCombustivelInicial.value !== "tanquecheio") {
            console.log("Compustível Inicial: " + ddtCombustivelInicial.value);
        }

        if (ddtCombustivelInicial.value === null) {
            swal({
                title: "Informação Ausente",
                text: "O Nível de Combustível Inicial é obrigatório",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

        var cmbRequisitante = document.getElementById("cmbRequisitante").ej2_instances[0];
        if (cmbRequisitante.value[0] === null) {
            swal({
                title: "Informação Ausente",
                text: "O Requisitante é obrigatório",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

        if (document.getElementById("txtRamalRequisitante").value === "") {
            swal({
                title: "Informação Ausente",
                text: "O Ramal do Requisitante é obrigatório",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

        var ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
        if (ddtSetor.value === null) {
            swal({
                title: "Informação Ausente",
                text: "O Setor Solicitante é obrigatório",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }

        $("#btnSubmit").prop("disabled", true);


        $("#btnEscondido").click();

    });

