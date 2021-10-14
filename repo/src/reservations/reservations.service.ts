import { Injectable } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from'@nestjs/mongoose';
import * as mongoose from 'mongoose'
export type ID = string | mongoose.Schema.Types.ObjectId

@Schema()
export class Reservation {
    Reservation: any;
   constructor(){
    this.Reservation = mongoose.model("Reservation", ReservationSchema)
   }
    @Prop({type:mongoose.Schema.Types.ObjectId,required:true,unique:true})
    _id:mongoose.ObjectId
    @Prop({type:String,required:true,unique:false})
    userId:mongoose.ObjectId
    @Prop({type:mongoose.Schema.Types.ObjectId,required:false,unique:false})
    hotelId:mongoose.ObjectId
    @Prop({type:mongoose.Schema.Types.ObjectId,required:true,unique:false})
    roomId:mongoose.ObjectId
    @Prop({required:true,unique:false})
    dateStart:Date
    @Prop({required:true,unique:false})
    dateEnd:Date
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation)

interface ReservationDto {
    user: ID;
    hotel: ID;
    room: ID;
    dateStart: Date;
    dateEnd: Date;
  }
  
  interface ReservationSearchOptions {
    user: ID;
    dateStart: Date;
    dateEnd: Date;
  }
  interface IReservation {
    addReservation(data: ReservationDto): Promise<Reservation>;
    removeReservation(id: ID): Promise<void>;
    getReservations(
      filter: ReservationSearchOptions
    ): Promise<Array<Reservation>>;
  }


@Injectable()
export class ReservationsService implements IReservation{
    async addReservation(data: ReservationDto): Promise<Reservation> {
        try{
            const Reservation1=new Reservation()
                return await Reservation1.Reservation.create(data,(err)=>{
                    if(err) throw err
                })
                
        }
        catch(e) {
            console.error(e)
        }
    }
    async removeReservation(id: ID): Promise<void> {
        try{
            const Reservation1=new Reservation()
            return await Reservation1.Reservation.findByIdAndDelete(id,(err)=>{
                if(err) throw err
            })
        }
        
        catch(e) {
            console.error(e)
        }
    }
    async getReservations(filter: ReservationSearchOptions): Promise<Reservation[]> {
        try{
            let a
            const Reservation1=new Reservation()
            return await Reservation1.Reservation.find(filter,(err,reserv)=>{
                if (err) throw err
            })
        }
        catch(e) {
            console.error(e)
        }
    }
}