import { Injectable, BadRequestException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote, VoteLevel } from './entities/vote.entity';
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
    const voteLevel = createVoteDto.voteLevel || VoteLevel.GENERAL;
    
    // Validate level-specific selections
    if (voteLevel === VoteLevel.SUB_COUNTY && (!createVoteDto.selectedSubCounties || createVoteDto.selectedSubCounties.length === 0)) {
      throw new BadRequestException('selectedSubCounties is required for sub-county level votes');
    }
    if (voteLevel === VoteLevel.WARD && (!createVoteDto.selectedWards || createVoteDto.selectedWards.length === 0)) {
      throw new BadRequestException('selectedWards is required for ward level votes');
    }

    const vote = this.votesRepository.create({
      title: createVoteDto.title,
      description: createVoteDto.description,
      eligibility: createVoteDto.eligibility || '',
      end_date: new Date(createVoteDto.endDate),
      voteLevel,
      selectedSubCounties: createVoteDto.selectedSubCounties || [],
      selectedWards: createVoteDto.selectedWards || [],
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
      voteLevel: vote.voteLevel,
      selectedSubCounties: vote.selectedSubCounties,
      selectedWards: vote.selectedWards,
    }));
  }

  async findAllForUser(user: User) {
    const allVotes = await this.votesRepository.find({ relations: ['user'] });
    
    // Filter votes based on user's eligibility
    return allVotes
      .filter(vote => {
        if (vote.voteLevel === VoteLevel.GENERAL) {
          return true; // All users can see general votes
        }
        if (vote.voteLevel === VoteLevel.SUB_COUNTY) {
          return vote.selectedSubCounties?.includes(user.subCounty);
        }
        if (vote.voteLevel === VoteLevel.WARD) {
          return vote.selectedWards?.includes(user.ward);
        }
        return false;
      })
      .map(vote => ({
        _id: vote.id?.toString(),
        id: vote.id?.toString(),
        title: vote.title,
        description: vote.description,
        eligibility: vote.eligibility,
        endDate: vote.end_date,
        voteLevel: vote.voteLevel,
        selectedSubCounties: vote.selectedSubCounties,
        selectedWards: vote.selectedWards,
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

  async castVote(voteId: string, castVoteDto: CastVoteDto, user: User) {
    // Get all votes and find matching one
    const votes = await this.votesRepository.find();
    const vote = votes.find(v => v.id?.toString() === voteId || v.id?.equals(new ObjectId(voteId)));
    
    if (!vote) {
      console.error(`Vote not found. Looking for ID: ${voteId}`);
      console.error(`Available votes:`, votes.map(v => v.id?.toString()));
      throw new NotFoundException(`Vote/Proposal with ID ${voteId} not found`);
    }

    // Check if user is eligible to vote based on vote level
    this.checkVoteEligibility(vote, user);

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

  private checkVoteEligibility(vote: Vote, user: User): void {
    if (vote.voteLevel === VoteLevel.GENERAL) {
      return; // All users can vote
    }
    
    if (vote.voteLevel === VoteLevel.SUB_COUNTY) {
      if (!vote.selectedSubCounties?.includes(user.subCounty)) {
        throw new ForbiddenException(
          `You are not eligible to vote on this proposal. This vote is only for sub-counties: ${vote.selectedSubCounties?.join(', ')}`
        );
      }
      return;
    }
    
    if (vote.voteLevel === VoteLevel.WARD) {
      if (!vote.selectedWards?.includes(user.ward)) {
        throw new ForbiddenException(
          `You are not eligible to vote on this proposal. This vote is only for wards: ${vote.selectedWards?.join(', ')}`
        );
      }
      return;
    }
  }
}
