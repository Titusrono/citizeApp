import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PetitionsService } from './petitions.service';
import { CreatePetitionDto } from './dto/create-petition.dto';
import { UpdatePetitionDto } from './dto/update-petition.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('petitions')
export class PetitionsController {
  constructor(private readonly petitionsService: PetitionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CITIZEN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('supportingDocs'))
  async create(
    @Body() createPetitionDto: CreatePetitionDto,
    @UploadedFile() file: any,
    @Req() req: any
  ) {
    // If file is uploaded, store the filename
    if (file) {
      createPetitionDto.supportingDocs = file.originalname;
    }
    return this.petitionsService.create(createPetitionDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: any) {
    // Pass user so service can filter based on role
    return this.petitionsService.findAll(req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.petitionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CITIZEN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() updatePetitionDto: UpdatePetitionDto, @Req() req: any) {
    return this.petitionsService.update(id, updatePetitionDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CITIZEN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.petitionsService.remove(id, req.user);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async approvePetition(@Param('id') id: string, @Req() req: any) {
    console.log('[PetitionsController] Approving petition:', id);
    return this.petitionsService.approvePetition(id, req.user);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async rejectPetition(@Param('id') id: string, @Req() req: any) {
    console.log('[PetitionsController] Rejecting petition:', id);
    return this.petitionsService.rejectPetition(id, req.user);
  }
}
