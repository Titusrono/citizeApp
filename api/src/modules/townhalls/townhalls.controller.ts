import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TownhallsService } from './townhalls.service';
import { CreateTownhallDto } from './dto/create-townhall.dto';
import { UpdateTownhallDto } from './dto/update-townhall.dto';

@Controller('townhalls')
export class TownhallsController {
  constructor(private readonly townhallsService: TownhallsService) {}

  @Post()
  create(@Body() createTownhallDto: CreateTownhallDto) {
    return this.townhallsService.create(createTownhallDto);
  }

  @Get()
  findAll() {
    return this.townhallsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.townhallsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTownhallDto: UpdateTownhallDto) {
    return this.townhallsService.update(+id, updateTownhallDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.townhallsService.remove(+id);
  }
}
