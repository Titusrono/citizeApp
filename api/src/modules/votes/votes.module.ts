import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { Vote } from './entities/vote.entity';
import { UserVote } from './entities/user-vote.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, UserVote]), AuthModule],
  controllers: [VotesController],
  providers: [VotesService],
})
export class VotesModule {}
