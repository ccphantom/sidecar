using {
    BenefitBase,
    BenefitOverride,
    BenefitCumulation,
    CustomerInfo,
    UnionBenefit
} from '../custom/custom-type';

type UnionBenefitParameter : {
    customerInfo                         : CustomerInfo;
    calculationBase                      : array of {
        employeeNumber                   : String(8);
        unionBenefitParametersByEmployee : array of {
            payPeriodInfo                : {
                sequenceNumber           : String(5);
                payDate                  : Date
            };
            benefitBase                  : array of BenefitBase;
            benefitOverride              : array of BenefitOverride;
            benefitCumulation            : array of BenefitCumulation;
        };
    }
}

type UnionBenefitReturn : {
    employeeNumber         : String(8);
    unionBenefitResults    : array of {
        message            : String(50);
        payPeriodInfo      : {
            sequenceNumber : String(5);
            payDate        : Date
        };
        unionBenefitResult : array of UnionBenefit
    }
}

service CalculateBenefitService @(impl : './lib/calculate-benefit-service.js') {

    action calculateBenefit(unionBenefitParameters : UnionBenefitParameter) returns {
        unionBenefits : array of UnionBenefitReturn
    };
}
