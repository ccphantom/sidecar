using { com.reachnett.union as union } from '../db/schema';
@path: 'service/union'
service UnionService {
    //@odata.draft.enabled
    // @Capabilities : { 
    //     Insertable : true,
    //     Updatable  : true,
    //     Deletable  : true,
    //  }
    entity Unions as projection on union.Unions;
    entity Crafts as projection on union.Crafts;
    entity Classes as projection on union.Classes;
    entity UnionRates as projection on union.UnionRates;
    entity UnionFringes as projection on union.UnionFringes;
    entity DavisBacon as projection on union.DavisBacon;
    entity ConstantParameter as projection on union.ConstantParameter;
}