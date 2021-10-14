import { Controller, Delete, Get, Post, Req, Res } from '@nestjs/common';
import { request } from 'express';
import * as jwt from 'jsonwebtoken'
import { HotelRoomService1, HotelsService, Hotel } from 'src/hotels/hotels.service';
import { Reservation, ReservationsService } from './reservations.service';
import { ObjectId } from 'mongodb';
import e from 'cors';
import { User } from 'src/users/users.service';

var HotelRoomService=new HotelRoomService1()
const HotelService=new HotelsService()
const Hotel1=new Hotel()
const Service=new ReservationsService()
const Reservation1=new Reservation()


@Controller()
export class ReservationsController {
    @Post('/api/client/reservations')
    async createReservation(@Req() request, @Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='client') {
            const {hotelRoom,startDate,endDate}=request.body
            const obj:any={
                _id: new ObjectId(),
                dateStart:new Date(Date.parse(startDate)),
                dateEnd:new Date(Date.parse(endDate)),
                roomId:hotelRoom,
                userId:jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).id
            }
            await Reservation1.Reservation.find({roomId:obj.roomId},async (err,reserv)=>{
                if(err) throw err
                let a:any=1
                Promise.all(reserv.map(reserv1=>{
                    let inputStart:any=obj.dateStart.toISOString()
                    let  start:any=reserv1.dateStart.toISOString()
                    let  inputEnd:any=obj.dateEnd.toISOString()
                    let  end:any=reserv1.dateEnd.toISOString()
                    console.log(start,end,inputStart,inputEnd)
                    if(((inputStart>=start) && (inputStart<=end)) || ((inputEnd>=start) && (inputEnd<=end))) {
                            response.send('Ой! Номер уже забронирован')
                            a=0
                            return
                    }
                    else{
                        a=1
                    
                    }
                })).then(async ()=>{
                    if(a==1){
                        await Service.addReservation(obj)
                        const room=await HotelRoomService.findById(hotelRoom,obj)
                        obj.hotelId=room.hotel
                        if(!room) response.send('room | not found').status(400)
                        else if(room){
                            const hotel=await HotelService.findById(obj.hotelId)
                            response.send({
                                startDate: startDate,
                                endDate: endDate,
                                hotelRoom: {
                                description: room.description,
                                images: room.images
                                },
                                hotel: {
                                title: hotel.title,
                                description: hotel.description
                                }
                          })
                        }
                        
                    }
                })
                
            })}
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='client') {
            response.status(403).send("Вы не клиент!")
        }
    }
    @Get('/api/client/reservations')
    async getReserv(@Req() request,@Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='client') {
            let arr:Object[]=[]
                    const reserv=await Reservation1.Reservation.find({userId:jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).id})
                    Promise.all(reserv.map(async (reserv1)=>{
                        const room=await HotelRoomService.findById(reserv1.roomId,true)
                        if(!room) response.send('room | not found').status(400)
                        else{
                            const hotel=await HotelService.findById(room.hotel)
                            arr.push(
                                {
                                    startDate: reserv1.dateStart,
                                    endDate: reserv1.dateEnd,
                                    hotelRoom: {
                                        description: room.description,
                                        images: room.images
                                    },
                                    hotel: {
                                        title: hotel.title,
                                        description: hotel.description
                                    }
                              }
                            )

                           
                    }
                    })).then(()=>{
                        response.send(arr)
                    })
                    
                        
                }
            
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='client') {
            response.status(403).send("Вы не клиент!")
        }
    }
    @Delete('/api/client/reservations/:id')
    async deleteReservation(@Req() request, @Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='client') {
            var {id}=request.params
            id=new ObjectId(id)
            const a=await Reservation1.Reservation.findById(id)
            if(a.userId!=jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).id) {
                response.status(403).send("Номер забронирован на другого пользователя!")
            }
            else if(a==null) {
                response.status(400).send('Такой брони не существует!')
            }
            else if(a!=null && a.userId==jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).id ){
                await Service.removeReservation(id)
                response.send()
            }
            
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='client') {
            response.status(403).send("Вы не клиент!!")
        }
    }
    @Get('/api/manager/reservations/:userId')
    async getReservationsByUserId(@Req() request, @Res() response) {
        try{
            if(!request.cookies.users_Cookie) {
                response.status(401).send("Вы не авторизованы!")
            }
            else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='manager') {
                    const {userId}=request.params  
                    let arr=[]
                    const reservs=await Reservation1.Reservation.find({userId:userId},(err,doc)=>{
                        if(err) throw err
                    })
                    Promise.all(reservs.map(async (reserv1)=>{
                        const room=await HotelRoomService.findById(reserv1.roomId,true)
                        if(!room) response.send('room | not found').status(400)
                        else{
                            const hotel=await HotelService.findById(room.hotel)
                            arr.push(
                                {
                                    startDate: reserv1.dateStart,
                                    endDate: reserv1.dateEnd,
                                    hotelRoom: {
                                        description: room.description,
                                        images: room.images
                                    },
                                    hotel: {
                                        title: hotel.title,
                                        description: hotel.description
                                    }
                              }
                            )

                           
                    }
                    })).then(()=>{
                        response.send(arr)
                    })
            }
            else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='manager') {
                response.status(403).send("Вы не менеджер!")
            }
        }
        catch(e) {
            console.error(e)
        }
    }
    @Delete('/api/manager/reservations/:userId/:reservationId')
    async deleteReservByManager(@Req() request, @Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='manager') {
            var {userId,reservationId}=request.params
            reservationId=new ObjectId(reservationId)
            const a=await Reservation1.Reservation.findById(reservationId)
            if(a.userId!=userId) {
                response.status(400).send('Такой брони не существует!')
            }
            else {
                await Service.removeReservation(reservationId)
                response.send()
            }
            
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='manager') {
            response.status(403).send("Вы не менеджер!")
        }
    }
}