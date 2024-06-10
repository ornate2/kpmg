service PredictService {
 
    @cds.persistence.skip
    entity Predict {
        description : String;
        serialNumber: String;
        serviceOrderCodes: String;
    };
}