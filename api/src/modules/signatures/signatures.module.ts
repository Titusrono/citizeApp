import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignaturesService } from './signatures.service';
import { SignaturesController } from './signatures.controller';
import { Signature } from './entities/signature.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Signature])],
  controllers: [SignaturesController],
  providers: [SignaturesService],
})
export class SignaturesModule {}
