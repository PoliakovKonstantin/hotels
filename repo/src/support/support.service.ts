import { Injectable } from '@nestjs/common';
import { Prop,Schema,SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose'
import { User } from 'src/users/users.service';
import * as events from'events';

export var eventEmitter = new events.EventEmitter()
import * as jwt from 'jsonwebtoken'
export type ID = string | mongoose.Schema.Types.ObjectId
import * as bcrypt from "bcrypt"
import * as dotenv from "dotenv"
import { request } from 'express';
dotenv.config({ path: 'C:/diplom (2)/diplom/hotels/connection.env' })
@Schema()
export class Message {
    Message: any;
   constructor(){
    this.Message = mongoose.model("Message", MessageSchema)
   }
    @Prop({type:mongoose.Schema.Types.ObjectId,required:true,unique:true})
    _id:ObjectId
    @Prop({required:true,unique:false})
    author:ObjectId
    @Prop({required:true,unique:false})
    sentAt:Date
    @Prop({required:true,unique:false})
    text:String
    @Prop({required:false,unique:false})
    readAt:Date
}
export const MessageSchema = SchemaFactory.createForClass(Message)


@Schema()
export class SupportRequest {
    SupportRequest: any;
   constructor(){
    this.SupportRequest = mongoose.model("SupportRequest", SupportRequestSchema)
   }
    @Prop({type:mongoose.Schema.Types.ObjectId,required:true,unique:true})
    _id:ObjectId
    @Prop({required:true,unique:false})
    user:ObjectId
    @Prop({required:true,unique:false})
    createdAt:Date
    @Prop({required:false,unique:false})
    messages:Message[]
    @Prop({required:false,unique:false})
    isActive:boolean
}
export const SupportRequestSchema = SchemaFactory.createForClass(SupportRequest)

interface CreateSupportRequestDto {
    _id: ObjectId;
    messages: any;
    isActive: boolean;
    createdAt: Date;
    user: ID;
    text: string;
  }
  
  interface SendMessageDto {
    author: ID;
    text: string;
    supportRequest: ID;
    sentAt: Date
  }
  interface MarkMessagesAsReadDto {
    author: ID;
    supportRequest: ID;
    createdBefore: Date;
  }
  
  interface GetChatListParams {
    user: ID | null;
    isActive: boolean;
  }
  
  interface ISupportRequestService {
    findSupportRequests(params: GetChatListParams): Promise<SupportRequest[]>;
    sendMessage(data: SendMessageDto): Promise<Message>;
    getMessages(supportRequest: ID): Promise<Message[]>;
    subscribe(
      handler: (supportRequest: SupportRequest, message: Message) => void
    ): () => void;
  }
  
  interface ISupportRequestClientService {
    createSupportRequest(data: CreateSupportRequestDto): Promise<SupportRequest>;
    markMessagesAsRead(params: MarkMessagesAsReadDto);
    getUnreadCount(supportRequest: ID): Promise<Message[]>;
  }
  
  interface ISupportRequestEmployeeService {
    markMessagesAsRead(params: MarkMessagesAsReadDto);
    getUnreadCount(supportRequest: ID): Promise<Message[]>;
    closeRequest(supportRequest: ID): Promise<void>;
  }

@Injectable()
export class SupportRequestService implements ISupportRequestService {
    async findSupportRequests(params: GetChatListParams | any): Promise<SupportRequest[]> {
        try{
            const SupportRequest1=new SupportRequest()
            if(!params.user){
                return await  SupportRequest1.SupportRequest.findOne({isActive:params.isActive},(err,req)=>{
                    if (err) throw err
                    
                })
            }
            return await  SupportRequest1.SupportRequest.find(params,(err,req)=>{
                if (err) throw err
                
            })
        }
        catch(e) {
            console.error(e)
        }
    }
    async sendMessage(data: SendMessageDto): Promise<Message> {
        const msg=new Message()
        let abc=await msg.Message.create(data)
            abc.author={
                id:data.author,
                name: jwt.verify(data.author,process.env.tokenKey).name
            }
            const SupportRequest1=new SupportRequest()
            const obj=data
            await  SupportRequest1.SupportRequest.update(
                { _id: data.supportRequest }, 
                { $addToSet: { messages: obj} }
              );
              console.log(data)
              eventEmitter.emit(data.supportRequest as string,obj)
        return abc
    }
    async getMessages(supportRequest: ID): Promise<Message[]> {
        try{
            const SupportRequest1=new SupportRequest()
            const abc= await SupportRequest1.SupportRequest.findById(supportRequest,(err,req)=>{
                if (err) throw err
            })
            if(!abc) {
                return null
            }
            else{
                abc.messages.map(el=>{
                    abc.messages[abc.messages.indexOf(el)].author={
                        id:el.author,
                        name: jwt.verify(el.author,process.env.tokenKey).name
                    }
                })
                return abc.messages
            }
            
        }
        catch(e) {
            return null
        }
    }
    subscribe(handler: (supportRequest: SupportRequest, message: Message) => void): () => void {
        throw new Error('Method not implemented.');
    }
}


@Injectable()
export class SupportRequestClientService implements ISupportRequestClientService {
    async createSupportRequest(data: CreateSupportRequestDto | any): Promise<SupportRequest> {
        try{
            const SupportRequest1=new SupportRequest()
            data.createdAt=new Date()
            data.isActive=true
            const msg=new Message()
            data.messages=[]
            const msg1=await msg.Message.create({_id:new ObjectId(),text:data.text,author:data.user,sentAt:data.createdAt,readAt:null})
            data.messages.push(msg1)
            delete data.text
             await SupportRequest1.SupportRequest.create(data,(err,req)=>{
                if (err) throw err
            })
            return data
        }
        catch(e) {
            console.error(e)
        }
    }
    async markMessagesAsRead(params: MarkMessagesAsReadDto) {
        try{
            const SupportRequest1=new SupportRequest()
            let msg=new Message()
            await SupportRequest1.SupportRequest.findById(params.supportRequest,async(err: any,req: any)=>{
                const msgs=req.messages
                msgs.map((el)=>{
                    if(jwt.verify(el.author,process.env.tokenKey).role!='client' && el.sentAt.toISOString() < params.createdBefore.toISOString()) {
                        if(!el.readAt) {
                            req.messages[msgs.indexOf(el)].readAt=new Date()
                        }
                        msg.Message.findByIdAndUpdate(el._id,{readAt:new Date()},(doc)=>{})
                }

            })          
            await SupportRequest1.SupportRequest.findByIdAndUpdate(params.supportRequest,{messages:req.messages})
            }
            )
        }
        catch(e) {
            console.error(e)
        }
    }
    async getUnreadCount(supportRequest: ID): Promise<Message[]> {
        try{
            const msg=new Message()
            const msgs=await msg.Message.find({_id:supportRequest,  readAt:null},(err,msgs)=>{
            if(err) throw err
        })
            msgs.map((el)=>{
                if(jwt.verify(el.author,process.env.tokenKey)=='client') {
                    msgs.pop(msgs.indexOf(el))
            }
            
        }
            )
            return msgs.lenght()
        }
        catch(e) {
            console.error(e)
        }
        
    }
}

@Injectable()
export class SupportRequestEmployeeService implements ISupportRequestEmployeeService{
    async markMessagesAsRead(params: MarkMessagesAsReadDto) {
        try{
            const SupportRequest1=new SupportRequest()
            let msg=new Message()
            await SupportRequest1.SupportRequest.findById(params.supportRequest,async(err: any,req: any)=>{
                const msgs=req.messages
                msgs.map((el)=>{
                    if(jwt.verify(el.author,process.env.tokenKey).role=='client' && el.sentAt.toISOString() < params.createdBefore.toISOString()) {
                        if(!el.readAt) {
                            req.messages[msgs.indexOf(el)].readAt=new Date()
                        }
                        msg.Message.findByIdAndUpdate(el._id,{readAt:new Date()},(doc)=>{})
                }

            })         
            await SupportRequest1.SupportRequest.findByIdAndUpdate(params.supportRequest,{messages:req.messages})
            }
            )
        }
        catch(e) {
            console.error(e)
        }
    }
    async getUnreadCount(supportRequest: ID): Promise<Message[]> {
        try{
            const msg=new Message()
            const msgs=await msg.Message.find({readAt:null},(err,msgs)=>{
            if(err) throw err
        })
            msgs.map((el)=>{
                if(jwt.verify(el.author,process.env.tokenKey)!='client') {
                    msgs.pop(msgs.indexOf(el))
            }
            
        }
            )
            return msgs.lenght()
        }
        catch(e) {
            console.error(e)
        }
    }
    async closeRequest(supportRequest: ID): Promise<void> {
        try{
            const req=new SupportRequest()
            req.SupportRequest.findByIdAndUpdate(supportRequest,{isActive:false})
        }
        catch(e) {
            console.error(e)
        }
    }

}