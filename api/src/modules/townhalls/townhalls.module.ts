import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TownhallsService } from './townhalls.service';
import { TownhallsController } from './townhalls.controller';
import { Townhall } from './entities/townhall.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Townhall])],
  controllers: [TownhallsController],
  providers: [TownhallsService],
})
export class TownhallsModule {}
