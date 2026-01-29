import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TownhallsService } from './townhalls.service';
import { TownhallsController } from './townhalls.controller';
import { Townhall } from './entities/townhall.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Townhall]), AuthModule],
  controllers: [TownhallsController],
  providers: [TownhallsService],
})
export class TownhallsModule {}
