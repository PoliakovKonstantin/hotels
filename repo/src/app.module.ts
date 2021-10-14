import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { HotelsService } from './hotels/hotels.service';
import { HotelsModule } from './hotels/hotels.module';
import { ReservationsModule } from './reservations/reservations.module';
import { SupportModule } from './support/support.module';
import { SupportGateway } from './support.gateway';
import * as dotenv from "dotenv"
dotenv.config({ path: 'C:/diplom/hotels/connection.env' })
@Module({
  imports: [UsersModule,MongooseModule.forRoot(process.env.connection), HotelsModule, ReservationsModule, SupportModule],
  controllers: [AppController],
  providers: [AppService, HotelsService, SupportGateway],
})
export class AppModule {}
