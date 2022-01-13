const cds = require('@sap/cds')

class CalculateBenefitService extends cds.ApplicationService {

    async init() {
        this.on('calculateBenefit', this.calculateBenefit);
        await super.init()
    }
    async calculateBenefit(req) {

        let { benefitBase, benefitOverride, benefitCumulation, customerInfo } = req.data;
        // 1. Initialize Response
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
                    (elmt.validFrom <= elmtEarning.workdate && elmt.validTo >= elmtEarning.workdate) &&
                    (elmt.baseCode == elmtEarning.earnCode)
                );
            });

            candidatePersonalBenefits = candidatePersonalBenefits.filter(elmt => {
                return ((elmt.unionCode == elmtEarning.globalUnionCode || elmt.unionCode == '*') &&
                    (elmt.unionClass == elmtEarning.globalUnionClass || elmt.unionClass == '*') &&
                    (elmt.unionCraft == elmtEarning.globalUnionCraft || elmt.unionCraft == '*') &&
                    (elmt.projectID == elmtEarning.projectID || elmt.projectID == '*') &&
                    (elmt.beginDate <= elmtEarning.workdate && elmt.endDate >= elmtEarning.workdate)
                );
            });

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
            });

            candidatePersonalBenefits.sort((a, b) => {                                                   // prioritize by specification 
                let aCode = a.benefitCode.toUpperCase();
                let bCode = b.benefitCode.toUpperCase();
                if (aCode < bCode) {
                    return -1;
                } else if (aCode > bCode) {
                    return 1;
                } else {
                    if (a.projectID === b.projectID && a.unionCode === b.unionCode && a.unionClass === b.unionClass && a.unionCraft === b.unionCraft) {
                        return 0;
                    } else if (a.projectID != '*' && a.unionCode != '*' && a.unionClass != '*' && a.unionCraft != '*') {
                        return -1;
                    } else if (b.projectID != '*' && b.unionCode != '*' && b.unionClass != '*' && b.unionCraft != '*') {
                        return 1;
                    } else if (a.projectID == '*' && a.unionCode != '*' && a.unionClass != '*' && a.unionCraft != '*') {
                        return -1;
                    } else if (b.projectID == '*' && b.unionCode != '*' && b.unionClass != '*' && b.unionCraft != '*') {
                        return 1;
                    } else if (a.projectID == '*' && a.unionCode != '*' && a.unionClass == '*' && a.unionCraft == '*') {
                        return -1;
                    } else if (b.projectID == '*' && b.unionCode != '*' && b.unionClass == '*' && b.unionCraft == '*') {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });

            candidatePersonalBenefits.filter((elmt, index, array) => {
                if (index == array.findIndex((elmt2) => {
                    return elmt2.benefitCode == elmt.benefitCode;
                })) {
                    return true;
                } else {
                    return false;
                }
            });

            //4.2 Calculate
            let helpRate = null;
            let helpHours = null;
            let helpAmount = null;
            let helpUnionBenefit = null;
            candidatePersonalBenefits.forEach(elmtBenefit => {

                switch (elmtBenefit.calcMethod) {
                    case 'H': // hourly rate
                        helpRate = elmtBenefit.benefitRate;
                        helpHours = elmtEarning.hours;
                        helpAmount = helpHours * helpRate;
                        break;
                    case 'F': // fixed amount
                        helpRate = elmtBenefit.benefitRate;
                        helpHours = elmtEarning.hours;
                        helpAmount = elmtBenefit.benefitRate;
                        break;
                    case 'A': // percentage
                        helpRate = elmtEarning.rate;
                        helpHours = elmtEarning.hours;
                        helpAmount = elmtEarning.amount * elmtBenefit.benefitRate / 100;
                        break;
                    default:
                        break;
                }
                helpUnionBenefit = {
                    customerID: customerInfo.customerID,
                    workdate: elmtEarning.workdate,
                    benefitCode: elmtBenefit.benefitCode,
                    globalUnionCode: elmtBenefit.unionCode,
                    globalUnionCraft: elmtBenefit.unionCraft,
                    globalUnionClass: elmtBenefit.unionClass,
                    sapALZNR: elmtEarning.sapALZNR,
                    sapC1ZNR: elmtEarning.sapC1ZNR,
                    sapABART: elmtEarning.sapABART,
                    sapAPZNR: elmtEarning.sapAPZNR,
                    sapUNPTR: elmtEarning.sapUNPTR,
                    sapTRFGR: elmtEarning.sapTRFGR,
                    sapTRFST: elmtEarning.sapTRFST,
                    sapPOSNR: elmtEarning.sapPOSNR,
                    rate: helpRate,
                    hours: helpHours,
                    amount: helpAmount
                }
                unionBenefitArray.push(helpUnionBenefit);                                                      // append
            })
        });

        // 5. Wrap up response
        returnData.message = 'Benefit Calculated Successfully';
        return req.reply(returnData)
    }
}
module.exports = CalculateBenefitService