const cds = require('@sap/cds')

class CalculateBenefitService extends cds.ApplicationService {

    async init() {
        this.on('calculateBenefit', this.calculateBenefit);
        await super.init()
    }
    async calculateBenefit(req) {
        let { benefitBase, benefitOverride, benefitCumulation, customerInfo } = req.data;
        if ( benefitBase.length == 0 ) return;
        benefitBase.sort((a, b) => (a.workdate.localeCompare(b.workdate) || a.earnCode.localeCompare(b.earnCode) || a.baseCode.localeCompare(b.baseCode) || a.globalUnionCode.localeCompare(b.globalUnionCode)));

        const db = await cds.connect.to('db');
        const { Unions, Crafts, Classes, UnionRates } = db.entities('com.reachnett.union');
        const { unions } = await db.read(Unions);

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