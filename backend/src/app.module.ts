import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AreasModule } from './areas/areas.module';
import { AuthModule } from './auth/auth.module';
import { BuscaModule } from './busca/busca.module';
import { DemandasModule } from './demandas/demandas.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    AreasModule,
    UsuariosModule,
    DemandasModule,
    NotificacoesModule,
    BuscaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
