$(document).ready(function () {
    try
    {
        $("#status").on("change", function () {
            try
            {
                var status = $(this).val();
                $("#ListaContratos").empty();
                loadListaContratos(status);
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("Glosa_<num>.js", "callback@$.on#1", error);
            }
        });

        //--------- Esconde Elementos -----------
        //=======================================

        $("#tabVeiculos").attr("hidden", "hidden");
        $("#tab_borders_icons-4").attr("hidden", "hidden");
        $("#tblVeiculos").attr("hidden", "hidden");

        //--------- Carrega Lista de Contratos -----------
        //================================================
        loadListaContratos(1);

        function loadListaContratos(tipoContrato) {
            try
            {
                $.ajax({
                    type: "get",
                    url: "/api/Contrato/ListaContratosVeiculosGlosa",
                    data: { tipoContrato: tipoContrato || "" },
                    success: function (res) {
                        try
                        {
                            console.log("Função Nova:", res.data);

                            var option = "<option>-- Selecione um Contrato --</option>";

                            if (res && res.data && res.data.length) {
                                res.data.forEach(function (obj) {
                                    try
                                    {
                                        option +=
                                            '<option value="' +
                                            obj.value +
                                            '">' +
                                            obj.text +
                                            "</option>";
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "Glosa_<num>.js",
                                            "callback@res.data.forEach#0",
                                            error,
                                        );
                                    }
                                });
                            }

                            $("#ListaContratos").empty().append(option);
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("Glosa_<num>.js", "success", error);
                        }
                    },
                    error: function (error) {
                        try
                        {
                            console.log(error);
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("Glosa_<num>.js", "error", error);
                        }
                    },
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("Glosa_<num>.js", "loadListaContratos", error);
            }
        }

        //--------- Carrega Tabela de Motoristas -----------
        //==================================================
        // function loadTblMotoristas() {
        //     var id = $("#ListaContratos").val();

        //     var dataTableMotorista = $('#tblMotorista').DataTable();
        //     dataTableMotorista.destroy();

        //     dataTableMotorista = $('#tblMotorista').DataTable({
        //         'columnDefs': [
        //             {
        //                 "targets": 0,                //Nome
        //                 "className": "text-left",
        //                 "width": "15%",
        //             },
        //             {
        //                 "targets": 1,               //Ponto
        //                 "className": "text-center",
        //                 "width": "6%",
        //             },
        //             {
        //                 "targets": 2,               //CNH
        //                 "className": "text-center",
        //                 "width": "6%",
        //             },
        //             {
        //                 "targets": 3,               //Cat.
        //                 "className": "text-center",
        //                 "width": "5%",
        //                 "defaultContent": "",
        //             },
        //             {
        //                 "targets": 4,               //Celular
        //                 "className": "text-center",
        //                 "width": "8%",
        //             },
        //             {
        //                 "targets": 5,               //Unidade
        //                 "className": "text-left",
        //                 "width": "5%",
        //             },
        //             {
        //                 "targets": 6,               //Status
        //                 "className": "text-center",
        //                 "width": "5%",
        //             },
        //             {
        //                 "targets": 7,               //Ação
        //                 "className": "text-center",
        //                 "width": "8%",
        //             }
        //         ],
        //         responsive: true,
        //         "ajax": {
        //             "url": "/api/motorista/motoristacontratos",
        //             "data": { id: id },
        //             "type": "GET",
        //             "datatype": "json"
        //         },
        //         "columns": [
        //             { "data": "nome" },
        //             { "data": "ponto" },
        //             { "data": "cnh" },
        //             { "data": "categoriaCNH" },
        //             { "data": "celular01" },
        //             { "data": "sigla" },
        //             {
        //                 "data": "status",
        //                 "render": function (data, type, row, meta) {
        //                     if (data)
        //                         return '<a href="javascript:void" class="updateStatusMotorista btn btn-verde btn-xs text-white" data-url="/api/Motorista/updateStatusMotorista?Id=' + row.motoristaId + '">Ativo</a>';
        //                     else
        //                         return '<a href="javascript:void" class="updateStatusMotorista btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Motorista/updateStatusMotorista?Id=' + row.motoristaId + '">Inativo</a>';
        //                 },
        //             },
        //             {
        //                 "data": "motoristaId",
        //                 "render": function (data) {
        //                     return `<div class="text-center">
        //                     <a class="btn-deletemotoristacontrato btn btn-vinho btn-xs text-white"   aria-label="Excluir o Motorista do Contrato!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
        //                         <i class="far fa-trash-alt"></i>
        //                     </a>
        //         </div>`;
        //                 },
        //             },
        //         ],
        //         "language": {
        //             "url": "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
        //             "emptyTable": "Sem Dados para Exibição"
        //         },
        //         "width": "100%"
        //     });

        // }

        //--------- Carrega Tabela de Operadores -----------
        //==================================================
        // function loadTblOperadores() {
        //     var id = $("#ListaContratos").val();

        //     var dataTableOperadores = $('#tblOperador').DataTable();
        //     dataTableOperadores.destroy();

        //     dataTableOperadores = $('#tblOperador').DataTable({
        //         'columnDefs': [
        //             {
        //                 "targets": 0,                //Nome
        //                 "className": "text-left",
        //                 "width": "15%",
        //             },
        //             {
        //                 "targets": 1,               //Ponto
        //                 "className": "text-center",
        //                 "width": "6%",
        //             },
        //             {
        //                 "targets": 2,               //Celular
        //                 "className": "text-center",
        //                 "width": "8%",
        //             },
        //             {
        //                 "targets": 3,               //Status
        //                 "className": "text-center",
        //                 "width": "5%",
        //             },
        //             {
        //                 "targets": 4,               //Ação
        //                 "className": "text-center",
        //                 "width": "8%",
        //             }
        //         ],
        //         responsive: true,
        //         "ajax": {
        //             "url": "/api/operador/operadorcontratos",
        //             "type": "GET",
        //             "data": { id: id },
        //             "datatype": "json"
        //         },
        //         "columns": [
        //             { "data": "nome" },
        //             { "data": "ponto" },
        //             { "data": "celular01" },
        //             {
        //                 "data": "status",
        //                 "render": function (data, type, row, meta) {
        //                     if (data)
        //                         return '<a href="javascript:void" class="updateStatusOperador btn btn-verde btn-xs text-white" data-url="/api/Operador/updateStatusOperador?Id=' + row.operadorId + '">Ativo</a>';
        //                     else
        //                         return '<a href="javascript:void" class="updateStatusOperador btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Motorista/updateStatusOperador?Id=' + row.operadorId + '">Inativo</a>';
        //                 },
        //             },
        //             {
        //                 "data": "operadorId",
        //                 "render": function (data) {
        //                     return `<div class="text-center">
        //                     <a class="btn-deleteoperadorcontrato btn btn-vinho btn-xs text-white"   aria-label="Remover o Operador do Contrato!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
        //                         <i class="far fa-trash-alt"></i>
        //                     </a>
        //         </div>`;
        //                 },
        //             },
        //         ],
        //         "language": {
        //             "url": "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
        //             "emptyTable": "Sem Dados para Exibição"
        //         },
        //         "width": "100%"
        //     });
        // }

        //--------- Carrega Tabela de Lavadores -----------
        //=================================================
        // function loadTblLavadores() {
        //     var id = $("#ListaContratos").val();

        //     var dataTableLavadores = $('#tblLavador').DataTable();
        //     dataTableLavadores.destroy();

        //     dataTableLavadores = $('#tblLavador').DataTable({
        //         'columnDefs': [
        //             {
        //                 "targets": 0,                //Nome
        //                 "className": "text-left",
        //                 "width": "15%",
        //             },
        //             {
        //                 "targets": 1,               //Ponto
        //                 "className": "text-center",
        //                 "width": "6%",
        //             },
        //             {
        //                 "targets": 2,               //Celular
        //                 "className": "text-center",
        //                 "width": "8%",
        //             },
        //             {
        //                 "targets": 3,               //Status
        //                 "className": "text-center",
        //                 "width": "5%",
        //             },
        //             {
        //                 "targets": 4,               //Ação
        //                 "className": "text-center",
        //                 "width": "8%",
        //             }
        //         ],
        //         responsive: true,
        //         "ajax": {
        //             "url": "/api/lavador/lavadorcontratos",
        //             "type": "GET",
        //             "data": { id: id },
        //             "datatype": "json"
        //         },
        //         "columns": [
        //             { "data": "nome" },
        //             { "data": "ponto" },
        //             { "data": "celular01" },
        //             {
        //                 "data": "status",
        //                 "render": function (data, type, row, meta) {
        //                     if (data)
        //                         return '<a href="javascript:void" class="updateStatusLavador btn btn-verde btn-xs text-white" data-url="/api/Lavador/updateStatusLavador?Id=' + row.lavadorId + '">Ativo</a>';
        //                     else
        //                         return '<a href="javascript:void" class="updateStatusLavador btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Lavador/updateStatusLavador?Id=' + row.lavadorId + '">Inativo</a>';
        //                 },
        //             },
        //             {
        //                 "data": "lavadorId",
        //                 "render": function (data) {
        //                     return `<div class="text-center">
        //                     <a class="btn-deletelavadorcontrato btn btn-vinho btn-xs text-white"   aria-label="Remover o Lavador do Contrato!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
        //                         <i class="far fa-trash-alt"></i>
        //                     </a>
        //         </div>`;
        //                 },
        //             },
        //         ],
        //         "language": {
        //             "url": "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
        //             "emptyTable": "Sem Dados para Exibição"
        //         },
        //         "width": "100%"
        //     });
        // }

        //--------- Carrega Tabela de Veículos -----------
        //================================================
        function loadTblVeiculos() {
            try
            {
                var id = $("#ListaContratos").val();

                var dataTableVeiculo = $("#tblVeiculo").DataTable();
                dataTableVeiculo.destroy();

                dataTableVeiculo = $("#tblVeiculo").DataTable({
                    columnDefs: [
                        {
                            targets: 0, //Placa
                            className: "text-center",
                            width: "9%",
                        },
                        {
                            targets: 1, //Marca/Modelo
                            className: "text-left",
                            width: "17%",
                        },
                        {
                            targets: 2, //Sigla
                            className: "text-center",
                            width: "5%",
                            defaultContent: "",
                        },
                        {
                            targets: 3, //Combustível
                            className: "text-center",
                            width: "5%",
                        },
                        {
                            targets: 4, //Status
                            className: "text-center",
                            width: "7%",
                        },
                        {
                            targets: 5, //Ação
                            className: "text-center",
                            width: "8%",
                        },
                    ],

                    responsive: true,
                    ajax: {
                        url: "/api/veiculo/glosaveiculocontratos",
                        data: { id: id },
                        type: "GET",
                        datatype: "json",
                    },
                    columns: [
                        { data: "placa" },
                        { data: "marcaModelo" },
                        { data: "sigla" },
                        { data: "combustivelDescricao" },
                        {
                            data: "status",
                            render: function (data, type, row, meta) {
                                try
                                {
                                    if (data)
                                        return (
                                            '<a href="javascript:void" class="updateStatusVeiculo btn btn-verde btn-xs text-white" data-url="/api/Veiculo/updateStatusVeiculo?Id=' +
                                            row.veiculoId +
                                            '">Ativo</a>'
                                        );
                                    else
                                        return (
                                            '<a href="javascript:void" class="updateStatusVeiculo btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Veiculo/updateStatusVeiculo?Id=' +
                                            row.veiculoId +
                                            '">Inativo</a>'
                                        );
                                }
                                catch (error)
                                {
                                    Alerta.TratamentoErroComLinha(
                                        "Glosa_<num>.js",
                                        "render",
                                        error,
                                    );
                                }
                            },
                        },
                        {
                            data: "veiculoId",
                            render: function (data) {
                                try
                                {
                                    return `<div class="text-center">
                                <a class="btn-deleteveiculocontrato btn btn-vinho btn-xs text-white"   aria-label="Remover o veículo do contrato !" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                    </div>`;
                                }
                                catch (error)
                                {
                                    Alerta.TratamentoErroComLinha(
                                        "Glosa_<num>.js",
                                        "render",
                                        error,
                                    );
                                }
                            },
                        },
                    ],

                    language: {
                        url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                        emptyTable: "Sem Dados para Exibição",
                    },
                    width: "100%",
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("Glosa_<num>.js", "loadTblVeiculos", error);
            }
        }

        //--------- Carrega Tabela de Notas Fiscais -----------
        //=====================================================
        function loadTblNotas() {
            try
            {
                var id = $("#ListaContratos").val();

                var dataTableNotas = $("#tblNotas").DataTable();
                dataTableNotas.destroy();

                dataTableNotas = $("#tblNotas").DataTable({
                    columnDefs: [
                        {
                            targets: 0, //Número da Nota
                            className: "text-center",
                            width: "8%",
                        },
                        {
                            targets: 1, //Data de Emissão
                            className: "text-center",
                            width: "8%",
                        },
                        {
                            targets: 2, //Valor
                            className: "text-right",
                            width: "10%",
                        },
                        {
                            targets: 3, //Valor Glosa.
                            className: "text-right",
                            width: "8%",
                        },
                        {
                            targets: 4, //Motivo Glosa
                            className: "text-left",
                            width: "15%",
                        },
                        {
                            targets: 5, //Ação
                            className: "text-center",
                            width: "8%",
                        },
                        {
                            targets: 6, //ContratoId
                            className: "text-center",
                            width: "10%",
                            visible: false,
                        },
                        {
                            targets: 7, //EmpenhoId
                            className: "text-center",
                            width: "10%",
                            visible: false,
                        },
                    ],

                    responsive: true,
                    ajax: {
                        url: "/api/notafiscal/nfcontratos",
                        data: { id: id },
                        type: "GET",
                        datatype: "json",
                    },
                    columns: [
                        { data: "numeroNF" },
                        { data: "dataFormatada" },
                        { data: "valorNFFormatado" },
                        { data: "valorGlosaFormatado" },
                        { data: "motivoGlosa" },
                        {
                            data: "notaFiscalId",
                            render: function (data) {
                                try
                                {
                                    return `<div class="text-center">
                                <a class="btn btn-delete btn-vinho btn-xs text-white" aria-label="Excluir a Nota Fiscal!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                        </div>`;
                                }
                                catch (error)
                                {
                                    Alerta.TratamentoErroComLinha(
                                        "Glosa_<num>.js",
                                        "render",
                                        error,
                                    );
                                }
                            },
                        },
                        { data: "contratoId" },
                        { data: "empenhoId" },
                    ],

                    language: {
                        url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                        emptyTable: "Sem Dados para Exibição",
                    },
                    width: "100%",
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("Glosa_<num>.js", "loadTblNotas", error);
            }
        }

        $("#ListaContratos").on("change", function () {
            try
            {
                var id = $("#ListaContratos").val();

                $.ajax({
                    type: "get",
                    url: "/api/Contrato/PegaContrato",
                    data: { id: id },
                    success: function (res) {
                        try
                        {
                            console.info(res.data);
                            console.info(res.data[0].contratoLavadores);
                            console.info(res.data[0].contratoMotoristas);
                            console.info(res.data[0].contratoOperadores);
                            console.info(res.data[0].tipoContrato);

                            //--------- Esconde Elementos -----------
                            //=======================================
                            $("#tabMotoristas").attr("hidden", "hidden");
                            $("#tab_borders_icons-1").attr("hidden", "hidden");
                            $("#tblMotoristas").attr("hidden", "hidden");

                            $("#tabOperadores").attr("hidden", "hidden");
                            $("#tab_borders_icons-2").attr("hidden", "hidden");
                            $("#tblOperadores").attr("hidden", "hidden");

                            $("#tabLavadores").attr("hidden", "hidden");
                            $("#tab_borders_icons-3").attr("hidden", "hidden");
                            $("#tblLavadores").attr("hidden", "hidden");

                            $("#tabVeiculos").attr("hidden", "hidden");
                            $("#tab_borders_icons-4").attr("hidden", "hidden");
                            $("#tblVeiculos").attr("hidden", "hidden");

                            $("#tabNotas").attr("hidden", "hidden");
                            $("#tab_borders_icons-5").attr("hidden", "hidden");
                            $("#tblNotFiscal").attr("hidden", "hidden");

                            //--------- Exibe Elementos da Terceirização -----------
                            //======================================================
                            if (res.data[0].tipoContrato === "Terceirização") {
                                if (res.data[0].contratoMotoristas === true) {
                                    $("#tabMotoristas").removeAttr("hidden");
                                    $("#tab_borders_icons-1").removeAttr("hidden");
                                    $("#tblMotoristas").removeAttr("hidden");
                                    $(".nav-tabs li:eq(0) a").tab("show");
                                    loadTblMotoristas();
                                }

                                if (res.data[0].contratoOperadores === true) {
                                    $("#tabOperadores").removeAttr("hidden");
                                    $("#tab_borders_icons-2").removeAttr("hidden");
                                    $("#tblOperadores").removeAttr("hidden");
                                    if (res.data[0].contratoMotoristas === false) {
                                        $(".nav-tabs li:eq(1) a").tab("show");
                                    }
                                    loadTblOperadores();
                                }

                                if (res.data[0].contratoLavadores === true) {
                                    $("#tabLavadores").removeAttr("hidden");
                                    $("#tab_borders_icons-3").removeAttr("hidden");
                                    $("#tblLavadores").removeAttr("hidden");
                                    if (
                                        res.data[0].contratoMotoristas === false ||
                                        res.data[0].contratoOperadores === false
                                    ) {
                                        $(".nav-tabs li:eq(2) a").tab("show");
                                    }
                                    loadTblLavadores();
                                }
                            }

                            //--------- Exibe Veículos -----------
                            //====================================
                            if (res.data[0].tipoContrato === "Locação") {
                                $("#tabVeiculos").removeAttr("hidden");
                                $("#tab_borders_icons-4").removeAttr("hidden");
                                $("#tblVeiculo").removeAttr("hidden");
                                $(".nav-tabs li:eq(3) a").tab("show");
                                loadTblVeiculos();
                            }

                            //--------- Exibe Notas Fiscais de Serviços -----------
                            //=====================================================
                            if (res.data[0].tipoContrato === "Serviços") {
                                $("#tabNotas").removeAttr("hidden");
                                $("#tab_borders_icons-5").removeAttr("hidden");
                                $(".nav-tabs li:eq(4) a").tab("show");
                                $("#tblNotaFiscal").removeAttr("hidden");
                                loadTblNotas();
                                console.log("Entrei nas Notas");
                            }
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("Glosa_<num>.js", "success", error);
                        }
                    },
                    error: function (err) {
                        try
                        {
                            console.log(err);
                            alert("something went wrong");
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("Glosa_<num>.js", "error", error);
                        }
                    },
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("Glosa_<num>.js", "callback@$.on#1", error);
            }
        });

        // -----------  Remove o Motorista do Contrato ----------------
        //=============================================================
        $(document).on("click", ".btn-deletemotoristacontrato", function () {
            try
            {
                var id = $(this).data("id");
                var contratoid = $("#ListaContratos").val();

                Alerta.Confirmar(
                    "Você tem certeza que deseja remover este motorista do contrato?",
                    "Não será possível recuperar os dados eliminados!",
                    "Remover",
                    "Cancelar"

                ).then((willDelete) => {
                    try
                    {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({
                                MotoristaId: id,
                                ContratoId: contratoid,
                            });
                            var url = "/api/Motorista/DeleteContrato";
                            $.ajax({
                                url: url,
                                type: "POST",
                                data: dataToPost,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (data) {
                                    try
                                    {
                                        if (data.success) {
                                            AppToast.show('Verde', data.message);
                                            loadTblMotoristas();
                                        } else {
                                            AppToast.show('Vermelho', data.message);
                                        }
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "Glosa_<num>.js",
                                            "success",
                                            error,
                                        );
                                    }
                                },
                                error: function (err) {
                                    try
                                    {
                                        console.log(err);
                                        alert("something went wrong");
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "Glosa_<num>.js",
                                            "error",
                                            error,
                                        );
                                    }
                                },
                            });
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha(
                            "Glosa_<num>.js",
                            "callback@swal.then#0",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("Glosa_<num>.js", "callback@$.on#2", error);
            }
        });

        // -----------  Remove o Operador do Contrato ----------------
        //============================================================
        $(document).on("click", ".btn-deleteoperadorcontrato", function () {
            try
            {
                var id = $(this).data("id");
                var contratoid = $("#ListaContratos").val();


                Alerta.Confirmar(
                    "Você tem certeza que deseja remover este operador do contrato?",
                    "Não será possível recuperar os dados eliminados!",
                    "Remover",
                    "Cancelar"

                ).then((willDelete) => {
                    try
                    {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({
                                OperadorId: id,
                                ContratoId: contratoid,
                            });
                            var url = "/api/Operador/DeleteContrato";
                            $.ajax({
                                url: url,
                                type: "POST",
                                data: dataToPost,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (data) {
                                    try
                                    {
                                        if (data.success) {
                                            AppToast.show('Verde', data.message);
                                            loadTblOperadores();
                                        } else {
                                            AppToast.show('Vermelho', data.message);
                                        }
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "Glosa_<num>.js",
                                            "success",
                                            error,
                                        );
                                    }
                                },
                                error: function (err) {
                                    try
                                    {
                                        console.log(err);
                                        alert("something went wrong");
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "Glosa_<num>.js",
                                            "error",
                                            error,
                                        );
                                    }
                                },
                            });
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha(
                            "Glosa_<num>.js",
                            "callback@swal.then#0",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("Glosa_<num>.js", "callback@$.on#2", error);
            }
        });

        // -----------  Remove o Lavador do Contrato ----------------
        //============================================================
        $(document).on("click", ".btn-deletelavadorcontrato", function () {
            try
            {
                var id = $(this).data("id");
                var contratoid = $("#ListaContratos").val();

                Alerta.Confirmar(
                    "Você tem certeza que deseja remover este lavador do contrato?",
                    "Não será possível recuperar os dados eliminados!",
                    "Remover",
                    "Cancelar"

                ).then((willDelete) => {
                    try
                    {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({
                                LavadorId: id,
                                ContratoId: contratoid,
                            });
                            var url = "/api/Lavador/DeleteContrato";
                            $.ajax({
                                url: url,
                                type: "POST",
                                data: dataToPost,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (data) {
                                    try
                                    {
                                        if (data.success) {
                                            AppToast.show('Verde', data.message);
                                            loadTblLavadores();
                                        } else {
                                            AppToast.show('Vermelho', data.message);
                                        }
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "Glosa_<num>.js",
                                            "success",
                                            error,
                                        );
                                    }
                                },
                                error: function (err) {
                                    try
                                    {
                                        console.log(err);
                                        alert("something went wrong");
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "Glosa_<num>.js",
                                            "error",
                                            error,
                                        );
                                    }
                                },
                            });
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha(
                            "Glosa_<num>.js",
                            "callback@swal.then#0",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("Glosa_<num>.js", "callback@$.on#2", error);
            }
        });

        // -----------  Remove o Veículo do Contrato ----------------
        //=============================================================
        $(document).on("click", ".btn-deleteveiculocontrato", function () {
            try
            {
                var id = $(this).data("id");
                var contratoid = $("#ListaContratos").val();

                Alerta.Confirmar(
                    "Você tem certeza que deseja remover este veículo do contrato?",
                    "Não será possível recuperar os dados eliminados!",
                    "Remover",
                    "Cancelar"
                ).then((willDelete) => {
                    try
                    {
                        if (willDelete) {
                            var dataToPost = JSON.stringify({
                                VeiculoId: id,
                                ContratoId: contratoid,
                            });
                            var url = "/api/Veiculo/DeleteContrato";
                            $.ajax({
                                url: url,
                                type: "POST",
                                data: dataToPost,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (data) {
                                    try
                                    {
                                        if (data.success) {
                                            AppToast.show('Verde', data.message);
                                            loadTblVeiculos();
                                        } else {
                                            AppToast.show('Vermelho', data.message);
                                        }
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "Glosa_<num>.js",
                                            "success",
                                            error,
                                        );
                                    }
                                },
                                error: function (err) {
                                    try
                                    {
                                        console.log(err);
                                        alert("something went wrong");
                                    }
                                    catch (error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "Glosa_<num>.js",
                                            "error",
                                            error,
                                        );
                                    }
                                },
                            });
                        }
                    }
                    catch (error)
                    {
                        Alerta.TratamentoErroComLinha(
                            "Glosa_<num>.js",
                            "callback@swal.then#0",
                            error,
                        );
                    }
                });
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("Glosa_<num>.js", "callback@$.on#2", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("Glosa_<num>.js", "callback@$.ready#0", error);
    }
});
