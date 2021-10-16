using { com.reachnett.union as union } from '../db/schema';
@path: 'service/union'
service UnionService {
    entity Unions as projection on union.Unions;
      annotate Unions with @odata.draft.enabled;
}