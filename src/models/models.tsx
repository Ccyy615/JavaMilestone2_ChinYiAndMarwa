export interface FlightsRequestDTO{
    flightId:number; //PK
    airline:string;
    placeDepart:string;
    destination:string;
    departDate:string;
    arrivalDate:string;
    departTime:string;
    arrivalTime:string;
    price:number;
    internalCode:string;

}

export interface FlightsResponsetDTO{
    flightId:number; //PK
    airline:string;
    placeDepart:string;
    departDate:string;
    departTime:string;
    destination:string;
    arrivalDate:string;
    arrivalTime:string;
    price:number;
}

export interface PassengerRequestDTO{
    firstName:string;
    lastName:string;
    dateOfBirth:string;
    gender:string;
    address:string;
    phoneNumber:string;
    email:string;
    passportNumber:string;
    passportExpiryDate:string;
    creditCardNumber:string;
    numOfBaggage:number;
}

export interface PassengerReesponsetDTO{
    passengerId:number;
    firstName:string;
    lastName:string;
    
}