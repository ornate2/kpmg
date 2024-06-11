sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, ODataModel, MessageToast, JSONModel) {
    "use strict";
 
    return Controller.extend("kpmg.controller.kpmg", {
        onInit: function () {
            // Pagination model
            var oPaginationModel = new JSONModel({
                currentPage: 1,
                limit: 20,
                canNext: true,
                canPrevious: false
            });
            this.getView().setModel(oPaginationModel, "paginationModel");
        },

        onPressPredictButton: function () {
            var that = this;
            var oView = this.getView();
            var sDescription = oView.byId("descriptionInput").getValue();
            var sSerialNumber = oView.byId("serialNumberInput").getValue();
            var sServiceOrderCodes = oView.byId("serviceOrderCodesInput").getValue();

            var oModel = oView.getModel();
            var oBusyDialog = new sap.m.BusyDialog();
            oBusyDialog.open();

            var payload = {
                "description": sDescription,
                "serialNumber": sSerialNumber,
                "serviceOrderCodes": sServiceOrderCodes
            };

            var oPaginationModel = this.getView().getModel("paginationModel");
            var currentPage = oPaginationModel.getProperty("/currentPage");
            var limit = oPaginationModel.getProperty("/limit");
            var skip = (currentPage - 1) * limit;

            oModel.create("/Predict", payload, {
                success: function (data) {
                    const parsedData = JSON.parse(data.description);
                    const transformedData = Object.keys(parsedData).map((instance, index) => ({
                        serialNumber: index + 1,
                        equipmentNumberSerialNumber: parsedData[instance]['Equipment Number/Serial Number'],
                        errorDescription: parsedData[instance]['Error Description'],
                        quantityUsed: parsedData[instance]['Quantity Used'],
                        serviceOrderErrorCodesActivityNumbers: parsedData[instance]['Service Order Error Codes/Activity Numbers'],
                        sparePartDescription: parsedData[instance]['Spare Part Description'],
                        sparePartUsed: parsedData[instance]['Spare Part Used'],
                        tasksUsed: parsedData[instance]['Tasks Used']
                    }));

                    var paginatedData = transformedData.slice(skip, skip + limit);

                    setTimeout(function () {
                        oBusyDialog.close();
                        var oPredictionModel = new JSONModel({ predictions: paginatedData });
                        oView.setModel(oPredictionModel, "predictionModel");

                        // Update pagination model
                        oPaginationModel.setProperty("/canNext", (skip + limit) < transformedData.length);
                        oPaginationModel.setProperty("/canPrevious", currentPage > 1);

                        var panel = that.getView().byId("panel1");
                        panel.setExpanded(!panel.getExpanded());
                    }, 3000);
                },
                error: function (error) {
                    MessageToast.show("Error occurred while predicting.");
                    oBusyDialog.close();
                }
            });
        },

        onPreviousPage: function () {
            var oPaginationModel = this.getView().getModel("paginationModel");
            var currentPage = oPaginationModel.getProperty("/currentPage");

            if (currentPage > 1) {
                oPaginationModel.setProperty("/currentPage", currentPage - 1);
                this.onPressPredictButton();
            }
        },

        onNextPage: function () {
            var oPaginationModel = this.getView().getModel("paginationModel");
            var currentPage = oPaginationModel.getProperty("/currentPage");

            oPaginationModel.setProperty("/currentPage", currentPage + 1);
            this.onPressPredictButton();
        },

        onOpenDialog: function () {
            if (!this.pDialog) {
                this.pDialog = this.loadFragment({
                    name: "kpmg.fragments.PredictionResults"
                }).then(function (oDialog) {
                    this.pDialog = oDialog;
                    oDialog.open();
                }.bind(this)).catch(function (error) {
                    console.error("Error loading fragment:", error);
                });
            } else {
                this.pDialog.open();
            }
        },

        onCancelPress: function () {
            var oDialog = this.getView().byId("helloDialog");
            if (oDialog) {
                oDialog.close();
            } else {
                console.error("Dialog not found or not initialized properly.");
            }
        },

        onSubmitPress: function(){
            this.onOpenDialog();
        }
    });
});
