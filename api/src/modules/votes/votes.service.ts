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
    console.log('[VotesService.create] Creating vote with DTO:', createVoteDto);
    console.log('[VotesService.create] Created by user:', user?.id, user?.email);
    
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
    
    const saved = await this.votesRepository.save(vote);
    console.log('[VotesService.create] Vote saved successfully with ID:', saved.id);
    return saved;
  }

  async findAll() {
    console.log('[VotesService.findAll] Fetching all votes');
    const votes = await this.votesRepository.find({ relations: ['user'] });
    console.log('[VotesService.findAll] Found', votes.length, 'votes');
    
    const result = votes.map(vote => {
      const normalized = this.normalizeVote(vote);
      return {
        _id: normalized.id?.toString(),
        id: normalized.id?.toString(),
        title: normalized.title,
        description: normalized.description,
        eligibility: normalized.eligibility,
        endDate: normalized.end_date,
        voteLevel: normalized.voteLevel,
        selectedSubCounties: normalized.selectedSubCounties,
        selectedWards: normalized.selectedWards,
      };
    });
    
    console.log('[VotesService.findAll] Returning', result.length, 'normalized votes');
    return result;
  }

  async findAllForUser(user: User) {
    console.log('[VotesService.findAllForUser] Filtering votes for user:', {
      userId: user?.id,
      email: user?.email,
      subCounty: user?.subCounty,
      ward: user?.ward,
    });

    const allVotes = await this.votesRepository.find({ relations: ['user'] });
    console.log('[VotesService.findAllForUser] Found', allVotes.length, 'total votes');
    
    // Filter votes based on user's eligibility
    const eligibleVotes = allVotes
      .map(vote => this.normalizeVote(vote))
      .filter(vote => {
        if (vote.voteLevel === VoteLevel.GENERAL) {
          console.log('[VotesService.findAllForUser] Including GENERAL vote:', vote.id);
          return true; // All users can see general votes
        }
        if (vote.voteLevel === VoteLevel.SUB_COUNTY) {
          const subCounties = this.ensureArray(vote.selectedSubCounties);
          const isEligible = subCounties.includes(user.subCounty);
          console.log('[VotesService.findAllForUser] SUB_COUNTY vote:', vote.id, '- User subCounty:', user.subCounty, '- Vote subCounties:', subCounties, '- Eligible:', isEligible);
          return isEligible;
        }
        if (vote.voteLevel === VoteLevel.WARD) {
          const wards = this.ensureArray(vote.selectedWards);
          const isEligible = wards.includes(user.ward);
          console.log('[VotesService.findAllForUser] WARD vote:', vote.id, '- User ward:', user.ward, '- Vote wards:', wards, '- Eligible:', isEligible);
          return isEligible;
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

    console.log('[VotesService.findAllForUser] Returning', eligibleVotes.length, 'eligible votes for user');
    return eligibleVotes;
  }

  async findOne(id: string) {
    const vote = await this.votesRepository.findOne({ where: { id: this.convertToObjectId(id) }, relations: ['user'] });
    return vote ? this.normalizeVote(vote) : null;
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
    let vote = votes.find(v => v.id?.toString() === voteId || v.id?.equals(new ObjectId(voteId)));
    
    if (!vote) {
      console.error(`Vote not found. Looking for ID: ${voteId}`);
      console.error(`Available votes:`, votes.map(v => v.id?.toString()));
      throw new NotFoundException(`Vote/Proposal with ID ${voteId} not found`);
    }

    // Normalize the vote to ensure arrays are properly formatted
    vote = this.normalizeVote(vote);

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

  private normalizeVote(vote: Vote): Vote {
    // Convert string arrays (from old simple-array storage) to actual arrays
    if (vote.selectedSubCounties && typeof vote.selectedSubCounties === 'string') {
      vote.selectedSubCounties = (vote.selectedSubCounties as any)
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }
    if (vote.selectedWards && typeof vote.selectedWards === 'string') {
      vote.selectedWards = (vote.selectedWards as any)
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }
    return vote;
  }

  private ensureArray(value: any): string[] {
    if (!value) {
      return [];
    }
    // If it's already an array, return it
    if (Array.isArray(value)) {
      return value;
    }
    // If it's a string (from old simple-array storage), split it
    if (typeof value === 'string') {
      return value.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
    }
    return [];
  }

  private checkVoteEligibility(vote: Vote, user: User): void {
    if (vote.voteLevel === VoteLevel.GENERAL) {
      return; // All users can vote
    }
    
    if (vote.voteLevel === VoteLevel.SUB_COUNTY) {
      const subCounties = this.ensureArray(vote.selectedSubCounties);
      if (!subCounties.includes(user.subCounty)) {
        throw new ForbiddenException(
          `You are not eligible to vote on this proposal. This vote is only for sub-counties: ${subCounties.join(', ')}`
        );
      }
      return;
    }
    
    if (vote.voteLevel === VoteLevel.WARD) {
      const wards = this.ensureArray(vote.selectedWards);
      if (!wards.includes(user.ward)) {
        throw new ForbiddenException(
          `You are not eligible to vote on this proposal. This vote is only for wards: ${wards.join(', ')}`
        );
      }
      return;
    }
  }

  async getVoteResults(id: string) {
    // Get the vote with all associated user votes for accountability tracking
    const vote = await this.votesRepository.findOne({
      where: { id: this.convertToObjectId(id) },
      relations: ['user']
    });

    if (!vote) {
      throw new NotFoundException(`Vote with ID ${id} not found`);
    }

    // Get all user votes for this vote
    const userVotes = await this.userVoteRepository.find({
      where: { vote: { id: vote.id } },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });

    // Count votes
    const yesCount = userVotes.filter(uv => uv.voteValue === 'yes').length;
    const noCount = userVotes.filter(uv => uv.voteValue === 'no').length;
    const totalVotes = userVotes.length;

    // Return comprehensive vote results with audit trail
    return {
      _id: vote.id?.toString(),
      id: vote.id?.toString(),
      title: vote.title,
      description: vote.description,
      eligibility: vote.eligibility,
      endDate: vote.end_date,
      voteLevel: vote.voteLevel,
      selectedSubCounties: vote.selectedSubCounties || [],
      selectedWards: vote.selectedWards || [],
      results: {
        yesCount,
        noCount,
        totalVotes,
        yesPercentage: totalVotes > 0 ? ((yesCount / totalVotes) * 100).toFixed(2) : 0,
        noPercentage: totalVotes > 0 ? ((noCount / totalVotes) * 100).toFixed(2) : 0
      },
      auditTrail: userVotes.map(uv => ({
        userId: uv.user.id?.toString(),
        username: uv.user.username,
        email: uv.user.email,
        ward: uv.user.ward,
        subCounty: uv.user.subCounty,
        voteValue: uv.voteValue,
        reason: uv.reason || null,
        timestamp: uv.createdAt
      }))
    };
  }
}

