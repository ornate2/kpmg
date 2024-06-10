sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, ODataModel, MessageToast, JSONModel) {
    "use strict";
 
    return Controller.extend("kpmg.controller.kpmg", {
        onInit: function () {
            // Initialization logic if needed
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
       
            oModel.create("/Predict", payload, {
                success: function (data) {
                    console.log(data.description);
                    const parsedData = JSON.parse(data.description);
                    console.log(parsedData);
                   
                    setTimeout(function () {
                        oBusyDialog.close();
                        var oPredictionModel = new sap.ui.model.json.JSONModel(parsedData);
                        oView.setModel(oPredictionModel, "predictionModel");
           
                        var form = that.getView().byId("FormToolbar1");
                        form.setVisible(true);
                        var panel = that.getView().byId("panel1");
                        panel.setExpanded(!panel.getExpanded());
                    }, 3000);
                },
                error: function (error) {
                    MessageToast.show("Error occurred while predicting.");
                    console.error("Error:", error);
                    oBusyDialog.close(); 
                }
            });
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
