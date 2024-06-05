sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, ODataModel, MessageToast,JSONModel) {
    "use strict";
 
    return Controller.extend("kpmg.controller.kpmg", {
        onInit: function () {
           
        },
        onPressPredictButton: function () {
            var that = this;
            var oView = this.getView();
            var sDescription = oView.byId("descriptionInput").getValue();
       
            var oModel = oView.getModel();
            var oBusyDialog = new sap.m.BusyDialog(); // Create a BusyDialog instance
       
            oBusyDialog.open(); // Open the BusyDialog
       
            oModel.create("/Predict", {
                "description": sDescription
            }, {
                success: function (data) {
                    console.log(data.description);
                    const parsedData = JSON.parse(data.description);
                    console.log(parsedData);
                 
                   
                    // Close the BusyDialog after 5 seconds
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
                    oBusyDialog.close(); // Close the BusyDialog in case of error
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
 