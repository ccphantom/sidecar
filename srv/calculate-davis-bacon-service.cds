using {
    HourBase,
    CustomerInfo,
    UnionBenefit,
    EmployerBenefitBase
} from '../custom/custom-type';

service CalculateDavisBaconService @(impl : './lib/calculate-davis-bacon-service.js') {

    action calculateDavisBacon(hoursBase : array of HourBase, employerBenefitBase : array of EmployerBenefitBase, customerInfo : CustomerInfo) returns {
        message : String(50);
        unionBenefits   : array of UnionBenefit
    };
}
