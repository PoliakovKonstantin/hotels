import { Injectable } from '@nestjs/common';
import { Prop, SchemaFactory,Schema } from '@nestjs/mongoose';
import * as mongoose from 'mongoose'
import { ObjectId } from 'mongodb';
export type  HotelsDocument =Hotel & Document
export type ID = string | ObjectId | number

@Schema()
export class Hotel {
    Hotel: any;
   constructor(){
    this.Hotel = mongoose.model("Hotel", HotelsSchema)
   }
    @Prop({required:true,unique:true})
    _id:ObjectId
    @Prop({required:true,unique:false})
    title:ObjectId
    @Prop({required:false,unique:false})
    description:string
    @Prop({required:true,unique:false})
    createdAt:Date
    @Prop({required:true,unique:false})
    updatedAt:Date
}

@Schema()
export class HotelRoom {
    HotelRoom: any;
   constructor(){
    this.HotelRoom = mongoose.model("HotelRoom", HotelRoomsSchema)
   }
    @Prop({required:true,unique:true,ref:'Hotel'})
    _id:ObjectId
    @Prop({required:true,unique:false})
    hotel:ObjectId
    @Prop({required:false,unique:false})
    description:string
    @Prop({required:false,unique:false,default:[]})
    images:string[]
    @Prop({required:true,unique:false})
    createdAt:Date
    @Prop({required:true,unique:false})
    updatedAt:Date
    @Prop({required:true,unique:false,default:true})
    isEnabled:boolean
}
export const HotelsSchema = SchemaFactory.createForClass(Hotel)
export const HotelRoomsSchema = SchemaFactory.createForClass(HotelRoom)

interface IHotelService {
    create(data: any): Promise<Hotel>;
    findById(id: ID): Promise<Hotel>;
    search(params: Pick<Hotel, "title">): Promise<Hotel[]>;
  }
  
  interface SearchRoomsParams {
    limit: number;
    offset: number;
    title: string;
    isEnabled?: true;
  }
  
  interface HotelRoomService {
    create(data: Partial<HotelRoom>): Promise<HotelRoom>;
    findById(id: ID, isEnabled?: true): Promise<HotelRoom>;
    search(params: SearchRoomsParams): Promise<HotelRoom[]>;
    update(id: ID, data: Partial<HotelRoom>): Promise<HotelRoom>;
  }

@Injectable()
export class HotelsService implements IHotelService{
    async create(data: any): Promise<Hotel> {
        const Hotel1=new Hotel()
        try{
            return await Hotel1.Hotel.create(data,(err,hotel)=>{
                if (err) throw err

            }
            )
        }
        catch(e) {
            console.error(e)
        }
    }
    findById(id: ID): Promise<Hotel> {
        try{
            var a
            const Hotel1=new Hotel()
            return Hotel1.Hotel.findById(id,(err,hotel)=>{
                if (err) throw err
            })
        }
        catch(e) {
            console.error(e)
        }
    }
    search(params: Pick<Hotel, 'title'>): Promise<Hotel[]> {
        try{
            var a
            const Hotel1=new Hotel()
            Hotel1.Hotel.findOne({},(err,hotel)=>{
                if (err) throw err
                a=hotel
            })
        }
        catch(e) {
            console.error(e)
        }
        return a
    }
}


@Injectable()
export class HotelRoomService1 implements HotelRoomService{
    async create(data: Partial<HotelRoom>): Promise<HotelRoom> {
        const HotelRoom1=new HotelRoom()
            return await HotelRoom1.HotelRoom.create(data,(err,rooms)=>{
                if (err) throw err
                //console.log(rooms)
            })
    }
    async findById(id: ID, isEnabled?: true): Promise<HotelRoom> {
        try{
            const HotelRoom1=new HotelRoom()
            var a
            return await HotelRoom1.HotelRoom.findById(new ObjectId(id),(err,room)=>{
                if (err) throw err
                if(isEnabled==room.isEnabled || isEnabled==undefined) {
                    a=room
                }
            })
        }
        catch(e) {
            console.error(e)
        }
    }
    async search(params: SearchRoomsParams): Promise<HotelRoom[]> {
        try{
            const HotelRoom1=new HotelRoom()
            const Hotel1=new Hotel()
            return await HotelRoom1.HotelRoom.find({hotel:params.title,isEnabled:params.isEnabled},(err,rooms)=>{})}
        catch(e) {
            console.error(e)
        }
    }
    async update(id: ID, data: Partial<HotelRoom>): Promise<HotelRoom> {
        
        try{
            const HotelRoom1=new HotelRoom()
            const Hotel1=new Hotel()
            return await HotelRoom1.HotelRoom.findByIdAndUpdate(id,data,(err,room)=>{
                if (err) throw err
            })
        }
        catch(e) {
            console.error(e)
        }
    }
}