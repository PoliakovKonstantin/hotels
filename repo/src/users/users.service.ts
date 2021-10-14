import { Injectable } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from'@nestjs/mongoose';
import { Document } from'mongoose';
import * as mongoose from 'mongoose'
import * as dotenv from "dotenv"
dotenv.config({ path: 'C:/diplom (2)/diplom/hotels/connection.env' })
export type  UsersDocument =User & Document
export type ID = string | mongoose.Schema.Types.ObjectId
mongoose.connect(process.env.connection,{ useNewUrlParser: true })

export type role ="admin" | "client" | "manager"


@Schema()
export class User {
    User: mongoose.Model<Document<User, any, any>, any, any>;
    static User: any;
   constructor(){
    this.User = mongoose.model("User", UsersSchema)
   }
    @Prop({type:String,required:true,unique:true})
    _id:ID
    @Prop({required:true,unique:true})
    email:string
    @Prop({required:true,unique:false})
    passwordHash:string
    @Prop({required:true,unique:false})
    name:string
    @Prop({required:false,unique:false})
    contactPhone:string
    @Prop({required:true,unique:false,default:"client"})
    role:role
}
export const UsersSchema = SchemaFactory.createForClass(User)

export interface SearchUserParams {
    limit: number;
    offset: number;
    email: string;
    name: string;
    contactPhone: string;
  }
export  interface IUserService {
    create(data: Partial<User>): Promise<User>;
    findById(id: ID): Promise<User>;
    findByEmail(email: string): Promise<User>;
    findAll(params: SearchUserParams): Promise<User[]>;
  }


@Injectable()
export class UsersService{
    User: typeof User;
    constructor() {
        this.User=User
    }
    async findById(id: ID): Promise<User> {
            try{
                const User1=new User()
                return await User1.User.findById(id,(err,user)=>{
                    if (err) throw err
                })
            }
            catch(e) {
                console.error(e)
            }
           
    }
    async findByEmail(email: string): Promise<User> {
        try{
            const User1=new User()
            return await User1.User.findOne({email:email},(err,user)=>{
                if (err) throw err
            })
            }
        catch(e) {
            console.error(e)
        }
    }
    async findAll(params: SearchUserParams): Promise<User[]> {
        try{
            var a
            const User1=new User()
            return await User1.User.find({email:params.email,name:params.name,contactPhone:params.contactPhone},(err,users)=>{
                if(err) throw err
            })
        }
        catch(e) {
            console.error(e)
        }
        
    }
    async create(user) {
        try{
            let a
            const User1=new User()
            await User1.User.create(user,(err,user)=>{
                if (err) throw err
                a={id:user._id,email:user.email,name:user.name}
            })
            return a
        }
        catch(e) {
            console.error(e)
        }
    }
}