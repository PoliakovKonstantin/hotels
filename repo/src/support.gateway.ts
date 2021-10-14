import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

import { eventEmitter } from './support/support.service';
@WebSocketGateway()
export class SupportGateway {
  @SubscribeMessage('subscribeToChat')
  handleMessage(client: any, payload: any) {
    eventEmitter.on(payload,(data)=>{
      client.emit('msg',data)
    })
  }
}
