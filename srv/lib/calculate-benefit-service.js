const cds = require('@sap/cds')

class CalculateBenefitService extends cds.ApplicationService {

    async init() {
        this.on('calculateBenefit', this.calculateBenefit);
        await super.init()
    }
    async calculateBenefit(req) {
        const db = await cds.connect.to('db');
        const { Unions } = db.entities('com.reachnett.union');
        const { unions } = await db.read(Unions);
        const { benefitBase, benefitOverride, benefitCumulation, customerInfo } = req.data;
        let unionBenefitArray = [];
        benefitBase.forEach(element => {
            let amount = element.hours * element.rate;
            let unionBenefit = {
                customerID      : "",
                workdate        : element.workdate,
                benefitCode     : "",
                hours           : element.hours,
                rate            : element.rate,
                amount          : amount,
                globalUnionCode : element.globalUnionCode,
                globalClassCode : "",
                globalCraftCode : "",
                sapALZNR        : "",
                sapC1ZNR        : "",
                sapABART        : "",
                sapAPZNR        : "",
                sapUNPTR        : "",
                sapTRFGR        : "",
                sapTRFST        : "",
                sapPOSNR        : "",
            };
            unionBenefitArray.push(unionBenefit)
        });

        let returnData = {
            message : 'dummy return message',
            unionBenefit : unionBenefitArray
        }

        return req.reply( returnData )
    }
}
module.exports = CalculateBenefitService