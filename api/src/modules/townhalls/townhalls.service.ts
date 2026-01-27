import { Injectable } from '@nestjs/common';
import { CreateTownhallDto } from './dto/create-townhall.dto';
import { UpdateTownhallDto } from './dto/update-townhall.dto';

@Injectable()
export class TownhallsService {
  create(createTownhallDto: CreateTownhallDto) {
    return 'This action adds a new townhall';
  }

  findAll() {
    return `This action returns all townhalls`;
  }

  findOne(id: number) {
    return `This action returns a #${id} townhall`;
  }

  update(id: number, updateTownhallDto: UpdateTownhallDto) {
    return `This action updates a #${id} townhall`;
  }

  remove(id: number) {
    return `This action removes a #${id} townhall`;
  }
}
