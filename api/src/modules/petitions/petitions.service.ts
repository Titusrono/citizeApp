import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Petition } from './entities/petition.entity';
import { CreatePetitionDto } from './dto/create-petition.dto';
import { UpdatePetitionDto } from './dto/update-petition.dto';
import { User } from '../users/entities/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class PetitionsService {
  constructor(
    @InjectRepository(Petition)
    private petitionsRepository: Repository<Petition>,
  ) {}

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-f]{24}$/i.test(id);
  }

  private convertToObjectId(id: string): ObjectId {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid petition ID format: ${id}`);
    }
    return new ObjectId(id);
  }

  async create(createPetitionDto: CreatePetitionDto, user: User) {
    const petition = this.petitionsRepository.create({
      ...createPetitionDto,
      user,
    });
    return this.petitionsRepository.save(petition);
  }

  async findAll() {
    return this.petitionsRepository.find({ relations: ['user'] });
  }

  async findOne(id: string) {
    return this.petitionsRepository.findOne({ where: { id: this.convertToObjectId(id) }, relations: ['user'] });
  }

  async update(id: string, updatePetitionDto: UpdatePetitionDto) {
    await this.petitionsRepository.update(this.convertToObjectId(id), updatePetitionDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.petitionsRepository.delete(this.convertToObjectId(id));
  }
}
