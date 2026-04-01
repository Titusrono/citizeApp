import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UpdateVoteDto } from './dto/update-vote.dto';
import { User } from '../users/entities/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
  ) {}

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-f]{24}$/i.test(id);
  }

  private convertToObjectId(id: string): ObjectId {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid vote ID format: ${id}`);
    }
    return new ObjectId(id);
  }

  async create(createVoteDto: CreateVoteDto, user: User) {
    const vote = this.votesRepository.create({
      ...createVoteDto,
      user,
    });
    return this.votesRepository.save(vote);
  }

  async findAll() {
    return this.votesRepository.find({ relations: ['user'] });
  }

  async findOne(id: string) {
    return this.votesRepository.findOne({ where: { id: this.convertToObjectId(id) }, relations: ['user'] });
  }

  async update(id: string, updateVoteDto: UpdateVoteDto) {
    await this.votesRepository.update(this.convertToObjectId(id), updateVoteDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.votesRepository.delete(this.convertToObjectId(id));
  }
}
