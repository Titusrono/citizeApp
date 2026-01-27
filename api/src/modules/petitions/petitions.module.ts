import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetitionsService } from './petitions.service';
import { PetitionsController } from './petitions.controller';
import { Petition } from './entities/petition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Petition])],
  controllers: [PetitionsController],
  providers: [PetitionsService],
})
export class PetitionsModule {}
