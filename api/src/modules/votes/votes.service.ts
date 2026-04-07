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
    
    let saved;
    try {
      saved = await this.votesRepository.save(vote);
      console.log('[VotesService.create] ✅ Vote created with ID:', saved.id?.toString());
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[VotesService.create] ❌ ERROR saving vote:', error.message);
      throw error;
    }
    
    // Return normalized response matching findAll format
    const normalized = this.normalizeVote(saved);
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

  async getAllVotesRaw() {
    console.log('[VotesService.getAllVotesRaw] Fetching raw votes directly');
    const votes = await this.votesRepository.find({ relations: ['user'] });
    console.log('[VotesService.getAllVotesRaw] Found', votes.length, 'votes in database');
    return votes;
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
    
    // Get all user votes to check which votes this user has already voted on
    const userVotes = await this.userVoteRepository.find({
      relations: ['user', 'vote']
    });
    
    const userVotedVoteIds = new Set(
      userVotes
        .filter(uv => uv.user?.id?.toString() === user.id?.toString())
        .map(uv => uv.vote?.id?.toString())
    );
    
    console.log('[VotesService.findAllForUser] User has already voted on', userVotedVoteIds.size, 'votes');
    
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
        hasVoted: userVotedVoteIds.has(vote.id?.toString()),
      }));

    console.log('[VotesService.findAllForUser] Returning', eligibleVotes.length, 'eligible votes for user');
    return eligibleVotes;
  }

  async findOne(id: string) {
    const vote = await this.votesRepository.findOne({ where: { id: this.convertToObjectId(id) }, relations: ['user'] });
    if (!vote) return null;
    
    // Return normalized response with string IDs
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
  }

  async update(id: string, updateVoteDto: UpdateVoteDto) {
    await this.votesRepository.update(this.convertToObjectId(id), updateVoteDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.votesRepository.delete(this.convertToObjectId(id));
  }

  async castVote(voteId: string, castVoteDto: CastVoteDto, user: User) {
    console.log('[VotesService.castVote] Starting vote cast for voteId:', voteId, 'user:', user.id?.toString());
    
    // Validate vote ID format
    let objectId: ObjectId;
    try {
      if (!this.isValidObjectId(voteId)) {
        throw new BadRequestException(`Invalid vote ID format: ${voteId}`);
      }
      objectId = this.convertToObjectId(voteId);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[VotesService.castVote] ERROR converting ID:', error.message);
      throw error;
    }

    // Try to find vote by ObjectId, with fallback to string comparison
    let vote: Vote | null | undefined = await this.votesRepository.findOne({
      where: { id: objectId }
    });

    if (!vote) {
      const allVotes = await this.votesRepository.find();
      vote = allVotes.find(v => v.id?.toString() === voteId);
      
      if (!vote) {
        throw new NotFoundException(`Vote/Proposal with ID ${voteId} not found`);
      }
    }

    console.log('[VotesService.castVote] Found vote:', vote.id?.toString(), 'Title:', vote.title);

    vote = this.normalizeVote(vote);
    
    // Check if user is eligible to vote based on vote level
    this.checkVoteEligibility(vote, user);

    // Check if user has already voted on this proposal (double-check before saving)
    const userVotesList = await this.userVoteRepository.find({
      relations: ['user', 'vote']
    });
    
    const existingVote = userVotesList.find(
      uv => uv.vote?.id?.toString() === vote.id?.toString() && 
            uv.user?.id?.toString() === user.id?.toString()
    );

    if (existingVote) {
      console.log('[VotesService.castVote] User already voted on this proposal');
      throw new ConflictException('You have already voted on this proposal. One vote per proposal per user is allowed.');
    }
    
    console.log('[VotesService.castVote] User eligible and no prior vote found, proceeding...');

    try {
      // Create and save the vote with full entity objects for MongoDB relationships
      console.log('[VotesService.castVote] Creating userVote record with vote ID:', vote.id?.toString(), 'user ID:', user.id?.toString());
      
      // For MongoDB relationships with TypeORM, we pass full entity objects
      const userVote = this.userVoteRepository.create({
        vote, // Pass full vote object
        user, // Pass full user object
        voteValue: castVoteDto.vote,
        ...(castVoteDto.reason && { reason: castVoteDto.reason }),
      });

      console.log('[VotesService.castVote] UserVote created, saving to database...');
      const saved = await this.userVoteRepository.save(userVote);
      console.log('[VotesService.castVote] ✅ Vote cast successfully for proposal:', voteId, 'User:', user.id?.toString());
      
      return saved;
    } catch (err: any) {
      // Catch duplicate key errors from database (in case of race condition)
      if (err?.code === 11000 || err?.message?.includes('duplicate')) {
        console.log('[VotesService.castVote] ⚠️ Duplicate vote detected (race condition):', err.message);
        throw new ConflictException('You have already voted on this proposal. One vote per proposal per user is allowed.');
      }
      
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[VotesService.castVote] ❌ ERROR saving vote:', error.message, error.stack);
      throw error;
    }
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
    // Validate and convert ID
    let objectId: ObjectId;
    try {
      if (!this.isValidObjectId(id)) {
        throw new BadRequestException(`Invalid vote ID format: ${id}`);
      }
      objectId = this.convertToObjectId(id);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[VotesService.getVoteResults] ERROR converting ID:', error.message);
      throw error;
    }

    // Try to find vote by ObjectId
    let vote: Vote | null | undefined = await this.votesRepository.findOne({
      where: { id: objectId },
      relations: ['user'],
    });

    // If ObjectId query fails, fallback to string comparison
    if (!vote) {
      const allVotes = await this.votesRepository.find({ relations: ['user'] });
      const searchIdStr = id;
      vote = allVotes.find(v => v.id?.toString() === searchIdStr);
      
      if (!vote) {
        throw new NotFoundException(`Vote with ID ${id} not found. Database contains ${allVotes.length} votes.`);
      }
    }

    // Fetch user votes and calculate results
    // TypeORM MongoDB may have issues with nested ID queries, so we fetch all and filter
    let userVotes = await this.userVoteRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
    
    // Filter to only votes for this proposal
    userVotes = userVotes.filter(uv => uv.vote?.id?.toString() === vote.id?.toString());
    
    console.log('[VotesService.getVoteResults] Found', userVotes.length, 'votes for proposal:', vote.id?.toString());

    const yesCount = userVotes.filter(uv => uv.voteValue === 'yes').length;
    const noCount = userVotes.filter(uv => uv.voteValue === 'no').length;
    const totalVotes = userVotes.length;

    console.log('[VotesService.getVoteResults] Vote counts - Yes:', yesCount, 'No:', noCount, 'Total:', totalVotes);

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
      auditTrail: userVotes
        .filter(uv => uv.user) // Only include votes where user relation loaded
        .map(uv => ({
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

