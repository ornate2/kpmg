module.exports = cds.service.impl(async function (srv) {
    srv.on('POST', 'Predict', async (req) => {
        try {
            let errorDescription = req.data.description || "";
            let serialNumber = req.data.serialNumber || "";
            let serviceOrderCodes = req.data.serviceOrderCodes || "";

            console.log("Received request data:", req.data);

            let payload = {
                "Error Description": errorDescription,
                "Equipment Number/Serial Number": serialNumber,
                "Service Order Error Codes/Activity Numbers": serviceOrderCodes
            };

            payload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== ""));

            console.log("Sending payload to prediction API:", payload);

            const predictApi = await cds.connect.to('PredictDest');

            const predictResponse = await predictApi.send({
                method: 'POST',
                path: `/predict`,
                data: payload,
                headers: {
                    "Content-Type": "application/json",
                    "AI-Resource-Group": "default"
                }
            });

            console.log("Received prediction response:", predictResponse);


            return {
                description: JSON.stringify(predictResponse)
            };
        } catch (error) {
            console.error(error.message);
            req.error(500, error.message);
        }
    });
});
