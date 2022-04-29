using UnionService as service from '../../srv/union-service';

// annotate UnionService.Unions with @(Capabilities.NavigationRestrictions : {RestrictedProperties : [{
//     // NavigationProperty : UnionsObjectPage,
//     InsertRestrictions : {Insertable : true}
// }]});

annotate UnionService.Unions with @(Capabilities.InsertRestrictions : {Insertable : true, });

annotate UnionService.Unions with {
    ID          @title : 'ID';
    customerID  @title : 'Customer ID';
    code        @title : 'Code';
    unionRef    @title : 'Union Reference';
    unionNumber @title : 'Union Number';
    shortText   @title : 'Short Text';
    longText    @title : 'Long Text';
    validFrom   @title : 'Valid From';
    validTo     @title : 'Valid To';
    region      @title : 'Region';
}

annotate UnionService.Unions with @(UI : {
    HeaderInfo : {
        $Type          : 'UI.HeaderInfoType',
        TypeName       : 'Union',
        TypeNamePlural : 'Unions',
        Title : {
            $Type: 'UI.DataField',
            Value: code
        },
        Description : {
            $Type: 'UI.DataField',
            Value: shortText
        }
    },
    SelectionFields : [
        customerID,
        code
    ],
    LineItem   : [
        {Value : customerID},
        {Value : code},
        {Value : shortText},
        {Value : longText},
        {Value : validFrom},
        {Value : validTo}
    ],
    Facets : [
        {
            $Type: 'UI.ReferenceFacet', 
            Label: '{i18n>Details}', 
            Target: '@UI.FieldGroup#Detail'
        }
    ],
    FieldGroup #Detail : {
        Data : [
            {Value : customerID},
            {Value : code},
            {Value : shortText},
            {Value : longText},
            {Value : region},
            {Value : validFrom},
            {Value : validTo}
    ]}
});