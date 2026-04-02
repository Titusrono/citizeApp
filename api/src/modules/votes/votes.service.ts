import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { UserVote } from './entities/user-vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UpdateVoteDto } from './dto/update-vote.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { User } from '../users/entities/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
    @InjectRepository(UserVote)
    private userVoteRepository: Repository<UserVote>,
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
      title: createVoteDto.title,
      description: createVoteDto.description,
      eligibility: createVoteDto.eligibility || '',
      end_date: new Date(createVoteDto.endDate),
      user,
    });
    return this.votesRepository.save(vote);
  }

  async findAll() {
    const votes = await this.votesRepository.find({ relations: ['user'] });
    return votes.map(vote => ({
      _id: vote.id?.toString(),
      id: vote.id?.toString(),
      title: vote.title,
      description: vote.description,
      eligibility: vote.eligibility,
      endDate: vote.end_date,
    }));
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

  async castVote(voteId: string, castVoteDto: CastVoteDto) {
    // Get all votes and find matching one
    const votes = await this.votesRepository.find();
    const vote = votes.find(v => v.id?.toString() === voteId || v.id?.equals(new ObjectId(voteId)));
    
    if (!vote) {
      console.error(`Vote not found. Looking for ID: ${voteId}`);
      console.error(`Available votes:`, votes.map(v => v.id?.toString()));
      throw new NotFoundException(`Vote/Proposal with ID ${voteId} not found`);
    }

    // Check if user has already voted on this proposal
    const existingVote = await this.userVoteRepository.findOne({
      where: {
        vote: { id: vote.id },
        user: { id: new ObjectId(castVoteDto.userId) }
      }
    });

    if (existingVote) {
      throw new ConflictException('You have already voted on this proposal. One vote per proposal per user is allowed.');
    }

    // Create and save the vote
    const userVote = this.userVoteRepository.create({
      vote,
      user: { id: new ObjectId(castVoteDto.userId) } as User,
      voteValue: castVoteDto.vote,
      ...(castVoteDto.reason && { reason: castVoteDto.reason }),
    });

    return this.userVoteRepository.save(userVote);
  }
}
