const cds = require('@sap/cds')

class CalculateBenefitService extends cds.ApplicationService {

    async init() {
        this.on('calculateBenefit', this.calculateBenefit);
        await super.init()
    }
    async calculateBenefit(req) {

        let { benefitBase, benefitOverride, benefitCumulation, customerInfo } = req.data;
        // 1. Initialize Response
        const unionBenefit = {
            customerID: null, workdate: null, benefitCode: null,
            hours: null, rate: null, amount: null,
            globalUnionCode: null, globalClassCode: null, globalCraftCode: null,
            sapALZNR: null, sapC1ZNR: null, sapABART: null,
            sapAPZNR: null, sapUNPTR: null, sapTRFGR: null,
            sapTRFST: null, sapPOSNR: null,
        };
        const unionBenefitArray = [];
        const returnData = { message: null, unionBenefit: unionBenefitArray }

        // 2. Check if there is valid data feed
        if (benefitBase.length == 0) {
            returnData.message = 'No data feed';
            return req.reply(returnData)
        };
        // 3. Read from Database
        const db = await cds.connect.to('db');
        const { Unions, Crafts, Classes, UnionRates, UnionFringes } = db.entities('com.reachnett.union');
        const criteriaGlobalUnionCode = [...new Set(benefitBase.map(element => {
            return element.globalUnionCode
        }))];

        const unionFringes = await db.read(UnionFringes).where({
            customerID: customerInfo.customerID,
            and: { unionCode: { in: criteriaGlobalUnionCode } }
        });


        // 4. Start Processing Benefit Base Line Items
        benefitBase.sort((a, b) => (
            a.workdate.localeCompare(b.workdate) ||
            a.earnCode.localeCompare(b.earnCode) ||
            a.baseCode.localeCompare(b.baseCode) ||
            a.globalUnionCode.localeCompare(b.globalUnionCode)
        ));

        benefitBase.forEach(elmtEarning => {
            // 4.1. Gather all associated benefits for this line item setup
            let candidateBenefits = JSON.parse(JSON.stringify(unionFringes));                            //deep copy
            let candidatePersonalBenefits = JSON.parse(JSON.stringify(benefitOverride));
            candidateBenefits = candidateBenefits.filter(elmt => {                                       // knock out unrelative
                return ((elmt.unionCode == elmtEarning.globalUnionCode || elmt.unionCode == '*') &&
                    (elmt.unionClass == elmtEarning.globalUnionClass || elmt.unionClass == '*') &&
                    (elmt.unionCraft == elmtEarning.globalUnionCraft || elmt.unionCraft == '*') &&
                    (elmt.projectID == elmtEarning.projectID || elmt.projectID == '*') &&
                    (elmt.validFrom <= elmtEarning.workdate && elmt.validTo >= elmtEarning.workdate)
                );
            })

            candidatePersonalBenefits = candidatePersonalBenefits.filter(elmt => {
                return ((elmt.unionCode == elmtEarning.globalUnionCode || elmt.unionCode == '*') &&
                    (elmt.unionClass == elmtEarning.globalUnionClass || elmt.unionClass == '*') &&
                    (elmt.unionCraft == elmtEarning.globalUnionCraft || elmt.unionCraft == '*') &&
                    (elmt.projectID == elmtEarning.projectID || elmt.projectID == '*') &&
                    (elmt.beginDate <= elmtEarning.workdate && elmt.endDate >= elmtEarning.workdate)
                );
            })

            let personalBenefitCodes = [...new Set(candidatePersonalBenefits.map(e => e.benefitCode))];  // merge generic into personal benefits if not duplicated
            candidateBenefits.forEach(elmt => {
                if (!personalBenefitCodes.includes(elmt.unionFringe)) {
                    let helpArray = {
                        customerID: elmt.customerID,
                        unionInfoPointer: elmt.unionInfoPointer,
                        benefitCode: elmt.unionFringe,
                        projectID: elmt.projectID,
                        endDate: elmt.validTo,
                        beginDate: elmt.validFrom,
                        benefitDescrition: elmt.fringeDescription,
                        benefitRate: elmt.fringeRate,
                        calcMethod: elmt.calculationMethod,
                        baseBucket: elmt.baseCode,
                        paymentModel: elmt.paymentModel,
                        unionCode: elmt.unionCode,
                        unionCraft: elmt.unionCraft,
                        unionClass: elmt.unionClass
                    }
                    candidatePersonalBenefits.push(helpArray);
                }
            })

            let tempBenefits = [];                                                                        // prioritize
            tempBenefits = candidatePersonalBenefits;  // Need to add Prioritize Logic
            candidatePersonalBenefits = tempBenefits;

            //4.2 Calculate
            candidatePersonalBenefits.forEach(elmtBenefit => {
                unionBenefit.customerID = elmtBenefit.customerID;
                unionBenefit.workdate = elmtEarning.workdate;
                unionBenefit.benefitCode = elmtBenefit.benefitCode;
                unionBenefit.globalUnionCode = elmtBenefit.unionCode;
                unionBenefit.globalUnionCraft = elmtBenefit.unionCraft;
                unionBenefit.globalUnionClass = elmtBenefit.unionClass;
                unionBenefit.sapALZNR = elmtEarning.sapALZNR;
                unionBenefit.sapC1ZNR = elmtEarning.sapC1ZNR;
                unionBenefit.sapABART = elmtEarning.sapABART;
                unionBenefit.sapAPZNR = elmtEarning.sapAPZNR;
                unionBenefit.sapUNPTR = elmtEarning.sapUNPTR;
                unionBenefit.sapTRFGR = elmtEarning.sapTRFGR;
                unionBenefit.sapTRFST = elmtEarning.sapTRFST;
                unionBenefit.sapPOSNR = elmtEarning.sapPOSNR;

                switch (elmtBenefit.calcMethod) {
                    case 'H': // hourly rate
                        unionBenefit.rate = elmtBenefit.benefitRate;
                        unionBenefit.hours = elmtEarning.hours;
                        unionBenefit.amount = unionBenefit.hours * unionBenefit.rate;
                        break;
                    case 'F': // fixed amount
                        unionBenefit.rate = elmtBenefit.benefitRate;
                        unionBenefit.hours = elmtEarning.hours;
                        unionBenefit.amount = elmtBenefit.benefitRate;
                        break;
                    case 'A': // percentage
                        unionBenefit.rate = elmtEarning.rate;
                        unionBenefit.hours = elmtEarning.hours;
                        unionBenefit.amount = elmtEarning.amount * elmtBenefit.benefitRate / 100;
                        break;
                    default:
                        break;
                }

                unionBenefitArray.push(unionBenefit);                                                      // append
            })

        });

        // 5. Wrap up response
        returnData.message = 'Benefit Calculated Successfully';
        return req.reply(returnData)
    }
}
module.exports = CalculateBenefitService