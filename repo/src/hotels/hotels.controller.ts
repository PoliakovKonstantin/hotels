import { Controller, Get, Post, Put, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { request } from 'express';
import {  Hotel, HotelRoomService1, HotelsService } from './hotels.service';
import * as jwt from 'jsonwebtoken'
import * as dotenv from "dotenv"
import * as mongoose from 'mongoose'
import { ObjectId } from 'mongodb';
import { Mongoose, Query } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express/multer';
dotenv.config({ path: 'C:/diplom (2)/diplom/hotels/connection.env' })
var HotelRoomService=new HotelRoomService1()
const HotelService=new HotelsService()
const Hotel1=new Hotel()
@Controller()
export class HotelsController {
    @Get('/api/common/hotel-rooms')
    async search(@Req() request, @Res() response) {
        let {limit  ,offset,hotel,isEnabled}=request.query
        if(isEnabled==='true') isEnabled=true
        else if(isEnabled!==true ) isEnabled=false
        if(!limit) limit=10000
        if(!offset) offset=0
        const cookie=request.cookies.users_Cookie || jwt.sign({role:'client'},process.env.tokenKey)
        if(jwt.verify(cookie,process.env.tokenKey).role!='admin' || jwt.verify(cookie,process.env.tokenKey).role!='manager' ) {isEnabled=true}
        const obj={
            limit:limit,
            offset:offset,
            title:hotel,
            isEnabled:isEnabled
        }
        const rooms=await HotelRoomService.search(obj)
        console.log(rooms)
        try{
            if(limit) {rooms.splice(limit,rooms.length)}
            for(let i=0;i<offset;i++) rooms.unshift(rooms.pop());
            response.send(rooms)
        }
            
            
            catch(e) {
                console.log('not ok')
                response.send(rooms)
            }
    }
    @Get('/api/common/hotel-rooms/:id')
    async findRoomById(@Req() request, @Res() response) {
        const {id}=request.params
        const room=await HotelRoomService.findById(id,true)
        const hotel=await HotelService.findById(room.hotel)
        const obj={
            id: room._id,
            description:room.description,
            images:room.images,
            isEnabled:room.isEnabled,
            hotel: {
                id:hotel._id,
                title: hotel.title,
                description: hotel.description
            }
            
        }
        response.send(obj)
    }
    @Post('api/admin/hotels')
    async createHotel(@Req() request, @Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='admin') {
            const {title,description}=request.body
            const obj={
                _id:new ObjectId(),
                title:title,
                description:description,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            await HotelService.create(obj)
            response.send({id:obj._id,title:obj.title,description:obj.description})
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='admin') {
            response.status(403).send("Вы не админ!")
        }
    }
    @Get('api/admin/hotels')
    async getHotels(@Req() request, @Res() response){
        var a
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='admin') {
            let {limit,offset}=request.query
            if(!limit) limit=10000
            if(!offset) offset=0
            const hotels=await Hotel1.Hotel.find({},(err,hotels)=>{
                if(err) throw err
                if(limit) {hotels.splice(limit,hotels.length)}
                for(let i=0;i<offset;i++) hotels.unshift(hotels.pop()); 
                a=hotels
                response.send(a)
            })
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='admin') {
            response.status(403).send("Вы не админ!")
        }
    }
    @Put('/api/admin/hotels/:id')
    async updateHotel(@Req() request, @Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='admin') {
            const {id}=request.params
            try {
                const {title,description}=request.body
                await Hotel1.Hotel.findByIdAndUpdate(id,{description:description,updatedAt: new Date()},(err,hotel)=>{
                    if(err) throw err
                    response.send({
                        id:hotel._id,
                        title:hotel.title,
                        description: hotel.description
                    })
            })
            }
            catch(e){
                console.error(e)
            }
            
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='admin') {
            response.status(403).send("Вы не админ!")
        }
    }
    @Post('api/admin/hotel-rooms/')
    @UseInterceptors(FileInterceptor('images'))
    async createRoom(@UploadedFile() file: string[],@Req() request, @Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='admin') {
            const {title,description,hotelId}=request.body
            const isEnabled:boolean=request.body.isEnabled || true
                const obj={
                    _id: new ObjectId(),
                    description:description,
                    images: file,
                    hotel:hotelId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            try {
                const {title,description}=request.body
                HotelRoomService.create(obj)
                const hotel=await HotelService.findById(obj.hotel)
                console.log({
                    id: obj._id,
                    description:obj.description,
                    images:obj.images,
                    isEnabled:isEnabled,
                    hotel: {
                        id:hotel._id,
                        title: hotel.title,
                        description: hotel.description
                    }
                    
                })
                response.send({
                    id: obj._id,
                    description:obj.description,
                    images:obj.images,
                    isEnabled:isEnabled,
                    hotel: {
                        id:hotel._id,
                        title: hotel.title,
                        description: hotel.description
                    }
                    
                })
            }
            catch(e){
                response.send(e)
                console.error(e)
            }
            
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='admin') {
            response.status(403).send("Вы не админ!")
        }
    }

    @Put('/api/admin/hotel-rooms/:id')
    @UseInterceptors(FileInterceptor('images'))
    async updateRoom(@UploadedFile() file: string[],@Req() request,@Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='admin') {
            const {description,hotelId}=request.body
            const isEnabled:boolean=request.body.isEnabled || true
            const {id}=request.params
                const obj={
                    description:description,
                    images: file,
                    hotel:hotelId,
                    isEnabled,
                    updatedAt: new Date()
                }
            const room=await HotelRoomService.update(new ObjectId(id),obj)
            const hotel=await HotelService.findById(obj.hotel)
            response.send({
                id: room._id,
                description:room.description,
                images:room.images,
                isEnabled:room.isEnabled,
                hotel: {
                    id:hotel._id,
                    title: hotel.title,
                    description: hotel.description
                }
                
            })
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='admin') {
            response.status(403).send("Вы не админ!")
        }
    }
}