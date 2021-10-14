import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { request } from 'express';
import { SupportRequest, SupportRequestClientService, SupportRequestEmployeeService, SupportRequestService } from './support.service';
import * as jwt from 'jsonwebtoken'

import { ObjectId } from 'mongodb';
const service=new SupportRequest()
const SupportRequest1=new SupportRequestClientService()
const SupportRequestService1=new SupportRequestService()
const SupportRequestEmployee1=new SupportRequestEmployeeService()
import * as dotenv from "dotenv"
dotenv.config({ path: 'C:/diplom (2)/diplom/hotels/connection.env' })
@Controller()
export class SupportController {
    @Post('/api/client/support-requests/')
    async createReq(@Req() request, @Res() response) {



        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='client') {
            const {text}=request.body
            const id=new ObjectId()
            const a =await SupportRequest1.createSupportRequest({
                text:text,
                user:jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).id,
                messages: null,
                isActive: null,
                createdAt: null,
                _id:id
            })
            let abc=false
            response.send({
                id:id,
                text: a.messages[0].text,
                createdAt:a.createdAt,
                isActive: a.isActive,
                hasNewMessages: abc
            })
            }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='client') {
            response.status(403).send("Вы не клиент!")
        }
        
    }
    @Get('/api/client/support-requests/') 
    async getReqsByUser(@Req() request,@Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='client') {
                const {offset,limit,isActive}=request.query
                const obj={
                    user:jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).id,
                    isActive:isActive
                }
                const reqs:any=await SupportRequestService1.findSupportRequests(obj)
                reqs.splice(limit,reqs.length)
                function abc(msgs) {
                    let a=false
                        msgs.map(el=>{
                            if(!el.readAt && jwt.verify(el.author,process.env.tokenKey).role!='client'){ a=true; return}
                        })
                    return a
                }
                for(let i=0;i<offset;i++) reqs.unshift(reqs.pop());
                reqs.map((el)=>{
                    reqs[reqs.indexOf(el)]={
                        id:el._id,
                        createdAt: el.createdAt,
                        isActive: el.isActive,
                        hasNewMessages:abc(el.messages)
                    }
                })
                response.send(reqs)
            }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='client') {
            response.status(403).send("Вы не клиент!")
        }
    
    }
    @Get('/api/manager/support-requests/')
    async getReqsByManager(@Req() request,@Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='manager') {
                const {offset,limit,isActive}=request.query
                const obj={
                    isActive:isActive
                }
                const reqs:any=await SupportRequestService1.findSupportRequests(obj)
                function abc() {
                    let a=false
                    reqs.messages.map(el=>{
                        if(!el.readAt && jwt.verify(el.author,process.env.tokenKey).role!='manager'){ a=true; return}
                    })
                    return a
                }
                reqs.splice(limit,reqs.length)
                for(let i=0;i<offset;i++) reqs.unshift(reqs.pop());
                for (var el in reqs){
                    reqs[el]={
                        id:reqs[el]._id,
                        createdAt: reqs[el].createdAt,
                        isActive: reqs[el].isActive,
                        hasNewMessages:abc(),
                        client: {
                            id:reqs[el].user,
                            name:jwt.verify(reqs[el].user,process.env.tokenKey).name,
                            email:jwt.verify(reqs[el].user,process.env.tokenKey).email,
                            contactPhone:jwt.verify(reqs[el].user,process.env.tokenKey).contactPhone
                        }
                    }
                }
                response.send(reqs)
            }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='manager') {
            response.status(403).send("Вы не менеджер!")
        }
    }
    @Get('/api/common/support-requests/:id/messages')
    async getMessages(@Req() request, @Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='manager' ||jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='client' ) {
                
            try{
                const {id}=request.params
                response.send(await SupportRequestService1.getMessages(id))
            }
            catch(e) {
                response.send(null)
            }
            }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='client' || jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='manager') {
            response.status(403).send("Вы не менеджер, и не клиент!")
        }
    }
    @Post('/api/common/support-requests/:id/messages')
    async sendMsg(@Req() request, @Res() response) {
        const {id}=request.params
        if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='client') {
            let abc=await service.SupportRequest.findOne({user:jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).id})
            if(!abc) abc={_id:'12345'}
            if(id!=abc._id){
                response.status(403).send('Это не вы отправили данный запрос')
    
            }
        }
        
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='manager' ||jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='client' ) {
                const {text}=request.body
                const obj={
                    _id:new ObjectId(),
                    sentAt: new Date(),
                    text:text,
                    supportRequest:id,
                    readAt:null,
                    author: jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).id
                    
                }
                response.send(await SupportRequestService1.sendMessage(obj))
            }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='client' || jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='manager') {
            response.status(403).send("Вы не менеджер, и не клиент!")
        }
    }
    @Post('/api/common/support-requests/:id/messages/read')
    async markMessagesAsRead(@Req() request, @Res() response) {
        try{
            const {id}=request.params
            if(!request.cookies.users_Cookie) {
                response.status(401).send("Вы не авторизованы!")
            }
            else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='manager') {
                let {createdBefore}=request.body
                createdBefore=new Date(Date.parse(createdBefore))
                const obj={
                    supportRequest: id,
                    createdBefore:createdBefore,
                    author:null
                }
                await SupportRequestEmployee1.markMessagesAsRead(obj)
                response.json({
                    success:true
                })
            }
            else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='client') {
                const abc=await service.SupportRequest.findOne({user:jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).id})

                if(id!=abc._id){
                    response.status(403).send('Это не вы отправили данный запрос')

                }
                else{
                    let {createdBefore}=request.body
                    createdBefore=new Date(Date.parse(createdBefore))
                    const obj={
                        supportRequest: id,
                        createdBefore:createdBefore,
                        author:null
                    }
                    await SupportRequest1.markMessagesAsRead(obj)
                    response.json({
                        success:true
                    })
                    }
                
            }
            else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='client' || jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='manager') {
                response.status(403).send("Вы не менеджер, и не клиент!")
            }
        }
        catch(e) {
            response.send(e)
            console.error(e)
        }
        
    }
}