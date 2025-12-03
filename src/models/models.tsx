export interface FlightsRequestDTO{
    airline:string;
    placeDepart:string;
    destination:string;
    departDate:string;
    arrivalDate:string;
    departTime:string;
    arrivalTime:string;
    price:number;

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
    flightId: number;
}

export interface PassengerResponseDTO{
    passengerId:number;
    firstName:string;
    lastName:string;
    phoneNumber?: string;
    email?: string;
    passportNumber?: string;
    passportExpiryDate?: string;
    creditCardNumber?: string;
    numOfBaggage?: number;
    flightId: number;
    flightsSummary?: any[];
    
}