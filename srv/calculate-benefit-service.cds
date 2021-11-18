using { BenefitBase, BenefitOverride, BenefitCumulation, CustomerInfo, UnionBenefit } from '../custom/custom-type';

service CalculateBenefitService @(impl : './lib/calculate-benefit-service.js') {
    
    action calculateBenefit( benefitBase : array of BenefitBase, 
                             benefitOverride : array of BenefitOverride, 
                             benefitCumulation : array of  BenefitCumulation, 
                             customerInfo : CustomerInfo ) 
                             returns UnionBenefit;
}
