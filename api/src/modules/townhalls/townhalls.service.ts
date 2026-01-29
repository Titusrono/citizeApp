import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Townhall } from './entities/townhall.entity';
import { CreateTownhallDto } from './dto/create-townhall.dto';
import { UpdateTownhallDto } from './dto/update-townhall.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class TownhallsService {
  constructor(
    @InjectRepository(Townhall)
    private townhallsRepository: Repository<Townhall>,
  ) {}

  async create(createTownhallDto: CreateTownhallDto) {
    const townhall = this.townhallsRepository.create(createTownhallDto);
    return this.townhallsRepository.save(townhall);
  }

  async findAll() {
    return this.townhallsRepository.find();
  }

  async findOne(id: string) {
    return this.townhallsRepository.findOne({ where: { id: new ObjectId(id) } });
  }

  async update(id: string, updateTownhallDto: UpdateTownhallDto) {
    await this.townhallsRepository.update(id, updateTownhallDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.townhallsRepository.delete(id);
  }
}
