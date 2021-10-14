import { Controller, Get, Post,Req,Res } from '@nestjs/common';
import { request } from 'express';
import * as jwt from 'jsonwebtoken'
import { User, UsersService } from './users.service';
import * as bcrypt from "bcrypt"
import * as dotenv from "dotenv"
dotenv.config({ path: 'C:/diplom (2)/diplom/hotels/connection.env' })
import { ObjectId } from 'mongodb';

const service=new UsersService()
import  * as mongoose  from 'mongodb';

const UsersService1=new UsersService()
const User1=new User
@Controller()
export class UsersController {
    @Post('api/auth/login')
    async login(@Req() request, @Res() response) {
        const {email,password}=request.body
        if(request.cookies.users_Cookie) {
            response.send("Вы уже авторизованы! Выйдите из учетной записи!")
        }
        else{
            const user=await service.findByEmail(email)
            if(!user){
                response.status(401).send('Неправильный логин или пароль')
            }
            if(user && await bcrypt.compare(password,user.passwordHash)==true) {
                const token=jwt.sign({id:user._id,email:email,password:password,role:user.role},process.env.tokenKey)
                response.cookie('users_Cookie',token).send({email:user.email,name:user.name,contactPhone:user.contactPhone})
            }
        }
    }
    @Post('/api/auth/logout')
    logout(@Req() request, @Res() response) {
        if(request.cookies.users_Cookie) {
            response.clearCookie('users_Cookie').send('ok')
        }
        else(response.status(401))
    }
    @Post('api/client/register')
    async reg(@Req() request, @Res() response) {
        let  {email,password,name,contactPhone,role}=request.body
        role='client'
        const User1=new User()
        const doc=await User1.User.findOne({email:email},async (doc)=>{})
            if(doc){response.status(400).send('Учетная запись с таким адресом электронной почты уже существует!')}
            else if(!doc){
                const salt=await bcrypt.genSalt()
                password=await bcrypt.hash(password,salt)
                const salt1=await bcrypt.genSalt(1)
                const user1={
                    
                    _id:await jwt.sign({email:email,name:name,contactPhone:contactPhone,role:role},process.env.tokenKey),
                    email:email,
                    passwordHash:password,
                    name:name,
                    contactPhone:contactPhone,
                    role:role
                }
                await service.create(user1).then(()=>{
                        response.send({_id:user1._id,email:user1.email,name:user1.name})}
                )}
    }
    @Post('/api/admin/users/')
    async createUserByAdmin(@Req() request, @Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='admin') {
            let {email,name,password,contactPhone,role}=request.body
            const User1=new User()
            const doc=await User1.User.findOne({email:email},async (doc)=>{})
            if(doc){
                response.status(400).send('Учетная запись с таким адресом электронной почты уже существует!')}
            else if(!doc){
                const salt=await bcrypt.genSalt(1)
                password=await bcrypt.hash(password,salt)
                const user1={
                    _id: jwt.sign({email:email,name:name,contactPhone:contactPhone,role:role},process.env.tokenKey),
                    email:email,
                    passwordHash:password,
                    name:name,
                    contactPhone:contactPhone,
                    role:role
                }
                await service.create(user1).then((user)=>{
                        response.send({
                            _id:user1._id,
                            email:user1.email,
                            name:user1.name,
                            contactPhone:user1.contactPhone
                        })}
                )}
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='admin') {
            response.status(403).send("Вы не админ!")
        }
    }
    @Get('/api/admin/users/')
    async getAllUsersByAdmin(@Req() request,@Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='admin') {
            const {name,email,contactPhone,offset,limit}=request.query
            const obj={
                name:name,
                email:email,
                contactPhone:contactPhone,
                offset:offset,
                limit:limit
            }
            const users=await service.findAll(obj)
            console.log(users)
            if(limit) {users.splice(limit,users.length)}
            for(let i=0;i<offset;i++) users.unshift(users.pop());
            response.send(users)
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='admin') {
            response.status(403).send("Вы не менеджер!")
        }          
    }
    @Get('/api/manager/users/')
    async getAllUsersByManager(@Req() request,@Res() response) {
        if(!request.cookies.users_Cookie) {
            response.status(401).send("Вы не авторизованы!")
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role=='manager') {
            const {name,email,contactPhone,offset,limit}=request.query
            const obj={
                name:name,
                email:email,
                contactPhone:contactPhone,
                offset:offset,
                limit:limit
            }
            const users=await service.findAll(obj)
            console.log(users)
            if(limit) {users.splice(limit,users.length)}
            for(let i=0;i<offset;i++) users.unshift(users.pop());
            response.send(users)
        }
        else if(jwt.verify(request.cookies.users_Cookie,process.env.tokenKey).role!='manager') {
            response.status(403).send("Вы не менеджер!")
        }        
    }
}