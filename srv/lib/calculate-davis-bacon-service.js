const cds = require('@sap/cds');

class CalculateDavisBaconService extends cds.ApplicationService {

    async init() {
        this.on('calculateDavisBacon', this.calculateDavisBacon);
        await super.init()
    }
    async calculateDavisBacon(req) {
        let returnData = { message: null, unionBenefits: [] }
        let { hoursBase, employerBenefitBase, customerInfo } = req.data;
        let { passValidation, returnMessage } = this.validateInputData(hoursBase, employerBenefitBase, customerInfo)
        if (passValidation == false) {
            returnData.message = returnMessage
            return req.reply(returnData)
        }
        let totalHours = this.getTotalHours(hoursBase)
        let totalEmployerPay = this.getTotalEmployerPay(employerBenefitBase)
        let employerPayRate = totalEmployerPay / totalHours

        for (const hourBase of hoursBase) {
            const unionBenefit = await this.buildDavisBaconRecord(hourBase, employerPayRate, customerInfo)
            if (Object.keys(unionBenefit).length != 0) {
                returnData.unionBenefits.push(unionBenefit)
            }
        }
        returnData.message = 'Davis Bacon Calculated Successfully';
        return req.reply(returnData)
    }

    validateInputData(hoursBase, employerBenefitBase, customerInfo) {
        let passValidation = true
        let returnMessage = ""
        if (hoursBase.length == 0) {
            passValidation = false
            returnMessage = "Hour base table is empty"
        } else if (employerBenefitBase.length == 0) {
            passValidation = false
            returnMessage = "Employer benefit base table is empty"
        } else if (customerInfo.length == 0) {
            passValidation = false
            returnMessage = "Customer information is empty"
        }

        return {
            passValidation,
            returnMessage
        }

    }
    getTotalHours(hoursBase) {
        let totalHours = 0
        hoursBase.forEach(hourBase => {
            totalHours = totalHours + parseFloat(hourBase.hours)
        })
        return totalHours
    }
    getTotalEmployerPay(employerBenefitBase) {
        let totalEmployerPay = 0.
        employerBenefitBase.forEach(employerBenefit => {
            totalEmployerPay = totalEmployerPay + parseFloat(employerBenefit.amount)
        })
        return totalEmployerPay
    }
    async buildDavisBaconRecord(hourBase, employerPayRate, customerInfo) {
        let totalPayRate = 0.
        if (parseFloat(hourBase.percentage) > 100) {
            totalPayRate = parseFloat(hourBase.rate) * 100 / parseFloat(hourBase.percentage)
        } else {
            totalPayRate = parseFloat(hourBase.rate)
        }
        totalPayRate = totalPayRate + employerPayRate
        const davisBaconElement = await this.readDavisBaconRate(customerInfo, hourBase)
        if (davisBaconElement.length == 0) {
            return {}
        }
        let davisBaconRate = davisBaconElement[0].combinedRate
        if (davisBaconRate > totalPayRate) {
            let amountDifference = (davisBaconRate - totalPayRate) * hourBase.hours
            let unionBenefit = {
                customerID: customerInfo.customerID,
                workdate: hourBase.workdate,
                benefitCode: "9B46",
                hours: hourBase.hours,
                rate: "",
                amount: amountDifference,
                globalUnionCode: hourBase.globalUnionCode,
                globalClassCode: hourBase.globalClassCode,
                globalCraftCode: hourBase.globalCraftCode,
                projectID: hourBase.projectID,
                sapALZNR: hourBase.sapALZNR,
                sapC1ZNR: hourBase.sapC1ZNR,
                sapABART: hourBase.sapABART,
                sapAPZNR: hourBase.sapAPZNR,
                sapUNPTR: hourBase.sapUNPTR,
                sapTRFGR: hourBase.sapTRFGR,
                sapTRFST: hourBase.sapTRFST,
                sapPOSNR: hourBase.sapPOSNR,
            }
            return unionBenefit
        }
        return {}
    }
    async readDavisBaconRate(customerInfo, hourBase) {
        const davisBaconElement = await SELECT.from`DavisBacon`.where`
                                            customerID = ${customerInfo.customerID} and
                                            unionInfoPointer = ${hourBase.sapUNPTR} and
                                            projectID = ${hourBase.projectID} and
                                            validFrom <= ${hourBase.workdate} and
                                            validTo >= ${hourBase.workdate} 
                                        `
        return davisBaconElement
    }
}
module.exports = CalculateDavisBaconService