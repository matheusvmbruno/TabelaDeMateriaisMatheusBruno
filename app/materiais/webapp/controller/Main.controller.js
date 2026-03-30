sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/materiais/materiais/model/models"
], function (Controller, JSONModel, models) {
    "use strict";

    return Controller.extend("com.materiais.materiais.controller.Main", {
        onInit: function () {
            // Rota que chama o handler ao inicializar
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteMain").attachMatched(this._onRouteMatched, this);
        },

        // Handler da rota
        _onRouteMatched: function () {
            this._cadastrarModel();
            this._carregarDados();
        },

        // Cadastra a model na página
        _cadastrarModel: function () {
            var oModel = new JSONModel(models.tableMaterial);
            this.getView().setModel(oModel, "tableMaterial");
        },

        // Carrega dados iniciais na model
        _carregarDados: function () {
            var oModel = this.getView().getModel("tableMaterial");

            fetch("/odata/v4/material/Material")
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    oModel.setProperty("/materiais", data.value);
                }.bind(this))
                .catch(function () {
                    sap.m.MessageBox.error("Erro ao carregar materiais.");
                });
        },

        // Botão Filtrar
        onFiltrar: function () {
            var oInput = this.byId("inputQuantidade");
            var quantidade = parseInt(oInput.getValue());

            if (!quantidade || quantidade <= 0) {
                sap.m.MessageBox.error("Informe uma quantidade válida.");
                return;
            }

            // Chama a função filtroMateriais do CAP
            var sUrl = "/odata/v4/material/filtroMateriais(quantidade=" + quantidade + ")";

            fetch(sUrl)
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    var oModel = this.getView().getModel("tableMaterial");
                    oModel.setProperty("/materiais", data.value);
                }.bind(this))
                .catch(function () {
                    sap.m.MessageBox.error("Erro ao buscar materiais.");
                });
        }

    });
});