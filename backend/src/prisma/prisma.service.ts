import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getPrismaClientOptions } from './prisma-client.factory';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super(getPrismaClientOptions());
  }

  async onModuleInit() {
    await this.$connect();
  }
}
