import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TownhallsService } from './townhalls.service';
import { CreateTownhallDto } from './dto/create-townhall.dto';
import { UpdateTownhallDto } from './dto/update-townhall.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('townhalls')
export class TownhallsController {
  constructor(private readonly townhallsService: TownhallsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(@Body() createTownhallDto: CreateTownhallDto) {
    return this.townhallsService.create(createTownhallDto);
  }

  @Get()
  async findAll() {
    return this.townhallsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.townhallsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() updateTownhallDto: UpdateTownhallDto) {
    return this.townhallsService.update(id, updateTownhallDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    return this.townhallsService.remove(id);
  }
}
