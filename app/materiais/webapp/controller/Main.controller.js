sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "com/materiais/materiais/model/models"
], function (Controller, JSONModel, MessageBox, models) {
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
                    MessageBox.error("Erro ao carregar materiais.");
                });
        },

        // Botão Filtrar
        onFiltrar: function () {
            var oInput = this.byId("inputQuantidade");
            var quantidade = parseInt(oInput.getValue());

            if (!quantidade || quantidade <= 0) {
                MessageBox.error("Informe uma quantidade válida.");
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
                    MessageBox.error("Erro ao buscar materiais.");
                });
        },

        // Abre o pop-up
        onAbrirCriar: function () {
            // Limpa os campos antes de abrir
            this.byId("inputNumMat").setValue("");
            this.byId("inputNome").setValue("");
            this.byId("inputDescr").setValue("");

            this.byId("dialogCriar").open();
        },

        // Cancela e fecha o pop-up
        onCancelarCriar: function () {
            this.byId("dialogCriar").close();
        },

        // Confirma e envia para a action
        onConfirmarCriar: async function () {
            var sNumMat = this.byId("inputNumMat").getValue();
            var sNome = this.byId("inputNome").getValue();
            var sDescr = this.byId("inputDescr").getValue();

            // Validação dos campos
            if (!sNumMat || !sNome || !sDescr) {
                MessageBox.error("Todos os campos são obrigatórios.");
                return;
            }

            try {
                var res = await fetch("/odata/v4/material/adicionarMaterial", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        NumMat: parseInt(sNumMat),
                        Nome: sNome,
                        Descr: sDescr
                    })
                });

                var data = await res.json();
                console.log("status:", res.ok, "data:", JSON.stringify(data));

                if (!res.ok) {
                    var sMensagem = data.error && data.error.message
                        ? data.error.message
                        : "Erro ao criar material.";
                    MessageBox.error(sMensagem);
                } else {
                    MessageBox.success(data.value, {
                        onClose: function () {
                            this.byId("dialogCriar").close();
                            this._carregarDados();
                        }.bind(this)
                    });
                }
            } catch (e) {
                console.log("catch error:", e);
                MessageBox.error("Erro ao criar material.");
            }
        }

    });

});