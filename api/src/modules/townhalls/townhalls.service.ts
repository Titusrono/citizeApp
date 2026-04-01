import { Injectable, BadRequestException } from '@nestjs/common';
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

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-f]{24}$/i.test(id);
  }

  private convertToObjectId(id: string): ObjectId {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid townhall ID format: ${id}`);
    }
    return new ObjectId(id);
  }

  async create(createTownhallDto: CreateTownhallDto) {
    const townhall = this.townhallsRepository.create(createTownhallDto);
    return this.townhallsRepository.save(townhall);
  }

  async findAll() {
    return this.townhallsRepository.find();
  }

  async findOne(id: string) {
    return this.townhallsRepository.findOne({ where: { id: this.convertToObjectId(id) } });
  }

  async update(id: string, updateTownhallDto: UpdateTownhallDto) {
    await this.townhallsRepository.update(this.convertToObjectId(id), updateTownhallDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.townhallsRepository.delete(this.convertToObjectId(id));
  }
}
