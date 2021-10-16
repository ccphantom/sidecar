namespace com.reachnett.union;

using { managed, temporal, cuid } from '@sap/cds/common';

entity Unions : managed, temporal {
    key customerID : String(10) not null;
    key code : String(5) not null;
    key validTo : Timestamp not null;
    unionRef : String(10);
    unionNumber : String(4);
    region : String(40);
    shortText: String(40);
    longText: String(80)
}

entity Crafts : managed, temporal {
    key customerID : String(10) not null;
    key code : String(5) not null;
    key validTo : Timestamp not null;
    craftRef: String(10);
    shortText: String(40);
    longText: String(80)
}

entity Classes : managed, temporal {
    key customerID : String(10) not null;
    key code : String(5) not null;
    key validTo : Timestamp not null;
    classRef: String(10);
    shortText: String(40);
    longText: String(80)
}