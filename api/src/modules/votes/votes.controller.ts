import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UpdateVoteDto } from './dto/update-vote.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CITIZEN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(@Body() createVoteDto: CreateVoteDto, @Req() req) {
    console.log('[VotesController.create] POST /votes called');
    const result = await this.votesService.create(createVoteDto, req.user);
    console.log('[VotesController.create] Vote created, returning:', result?.id);
    return result;
  }

  @Get()
  async findAll() {
    console.log('[VotesController.findAll] GET /votes called');
    const result = await this.votesService.findAll();
    console.log('[VotesController.findAll] Returning', result?.length, 'votes');
    return result;
  }

  @Get('debug/all')
  async debugAllVotes() {
    console.log('[VotesController.debugAllVotes] ============ DEBUG: Listing ALL votes in database ============');
    const votes = await this.votesService.getAllVotesRaw();
    console.log('[VotesController.debugAllVotes] Found', votes.length, 'votes');
    votes.forEach((v, idx) => {
      console.log(`[${idx}] ID: ${v.id?.toString()} | Title: ${v.title}`);
    });
    return {
      totalCount: votes.length,
      votes: votes.map(v => ({
        _id: v.id?.toString(),
        id: v.id?.toString(),
        title: v.title,
        description: v.description
      }))
    };
  }

  @Get('me/eligible')
  @UseGuards(JwtAuthGuard)
  async findAllForUser(@Req() req) {
    console.log('[VotesController.findAllForUser] GET /votes/me/eligible called for user:', req.user?.email);
    const result = await this.votesService.findAllForUser(req.user);
    console.log('[VotesController.findAllForUser] Returning', result?.length, 'eligible votes');
    return result;
  }

  @Get(':id/results')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CITIZEN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getVoteResults(@Param('id') id: string, @Req() req) {
    console.log('[VotesController.getVoteResults] GET /votes/:id/results called for user:', req.user?.email);
    const results = await this.votesService.getVoteResults(id);
    
    // Filter out audit trail for citizens (privacy protection)
    if (req.user?.role === UserRole.CITIZEN) {
      console.log('[VotesController.getVoteResults] Citizen user - hiding audit trail');
      return {
        _id: results._id,
        id: results.id,
        title: results.title,
        description: results.description,
        eligibility: results.eligibility,
        endDate: results.endDate,
        voteLevel: results.voteLevel,
        selectedSubCounties: results.selectedSubCounties,
        selectedWards: results.selectedWards,
        results: results.results
        // auditTrail excluded for citizen privacy
      };
    }
    
    // Admin/SuperAdmin get full results with audit trail
    return results;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.votesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() updateVoteDto: UpdateVoteDto) {
    return this.votesService.update(id, updateVoteDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    return this.votesService.remove(id);
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  async castVote(@Param('id') id: string, @Body() castVoteDto: CastVoteDto, @Req() req) {
    // Use authenticated user's ID instead of trusting client input
    return this.votesService.castVote(id, castVoteDto, req.user);
  }
}

