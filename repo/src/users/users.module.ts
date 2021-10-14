import { Module } from '@nestjs/common';
import { User,IUserService, UsersSchema, UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  exports:[UsersService],
  providers: [User,UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
