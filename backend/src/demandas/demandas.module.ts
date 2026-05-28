import { Module } from '@nestjs/common';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';
import { DemandasController } from './demandas.controller';
import { DemandasService } from './demandas.service';

@Module({
  imports: [NotificacoesModule],
  controllers: [DemandasController],
  providers: [DemandasService],
  exports: [DemandasService],
})
export class DemandasModule {}
