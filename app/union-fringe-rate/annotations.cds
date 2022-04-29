using UnionService as service from '../../srv/union-service';


// annotate UnionService.UnionFringes with @(Capabilities.InsertRestrictions : {Insertable : true, });

annotate UnionService.UnionFringes with {
    ID                @title : 'ID';
    customerID        @title : 'Customer ID';
    unionInfoPointer  @title : 'Union Info Pointer';
    unionCode         @title : 'Union Code';
    unionCraft        @title : 'Union Craft';
    unionClass        @title : 'Union Class';
    projectID         @title : 'Project ID';
    unionFringe       @title : 'Union Fringe';
    fringeDescription @title : 'Fringe Desc';
    fringeRate        @title : 'Fringe Rate';
    validFrom         @title : 'Valid From';
    validTo           @title : 'Valid To';
}

annotate UnionService.UnionFringes with @(UI : {
    HeaderInfo         : {
        $Type          : 'UI.HeaderInfoType',
        TypeName       : 'UnionFringe',
        TypeNamePlural : 'UnionFringes',
        Title          : {
            $Type : 'UI.DataField',
            Value : unionFringe
        },
        Description    : {
            $Type : 'UI.DataField',
            Value : fringeDescription
        }
    },
    SelectionFields    : [
        unionCode,
        unionCraft,
        unionClass,
        unionFringe
    ],
    LineItem           : [
        {Value : unionCode},
        {Value : unionCraft},
        {Value : unionClass},
        {Value : unionFringe},
        {Value : fringeRate},
        {Value : validFrom},
        {Value : validTo}
    ],
    Facets             : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Details}',
        Target : '@UI.FieldGroup#Detail'
    }],
    FieldGroup #Detail : {Data : [
                                  {Value : unionCode},
                                  {Value : unionCraft},
                                  {Value : unionClass},
                                  {Value : unionFringe},
                                  {Value : fringeRate},
                                  {Value : validFrom},
                                  {Value : validTo}
                         ]}
});
