var dataTableVeiculo;

$(document).ready(function () {
    try
    {
        loadList();
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha(
            "veiculositenscontrato_<num>.js",
            "callback@$.ready#0",
            error,
        );
    }
});

function loadList() {
    try
    {
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
                    targets: 2, //Contrato
                    className: "text-left",
                    width: "35%",
                },
                {
                    targets: 3, //Sigla
                    className: "text-center",
                    width: "5%",
                    defaultContent: "",
                },
                {
                    targets: 4, //Combustível
                    className: "text-center",
                    width: "5%",
                },
                {
                    targets: 5, //Status
                    className: "text-center",
                    width: "7%",
                },
                {
                    targets: 6, //Ação
                    className: "text-center",
                    width: "8%",
                },
            ],

            responsive: true,
            ajax: {
                url: "/api/veiculo",
                type: "GET",
                datatype: "json",
            },
            columns: [
                { data: "placa" },
                { data: "marcaModelo" },
                { data: "contratoVeiculo" },
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
                                "veiculositenscontrato_<num>.js",
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
                                <a href="/Veiculo/Upsert?id=${data}" class="btn btn-azul btn-xs text-white"  aria-label="Editar o Veículo!" data-microtip-position="top" role="tooltip"  style="cursor:pointer;">
                                    <i class="far fa-edit"></i> 
                                </a>
                                <a class="btn-delete btn btn-vinho btn-xs text-white"   aria-label="Excluir o Veículo!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                    </div>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha(
                                "veiculositenscontrato_<num>.js",
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
        Alerta.TratamentoErroComLinha("veiculositenscontrato_<num>.js", "loadList", error);
    }
}
