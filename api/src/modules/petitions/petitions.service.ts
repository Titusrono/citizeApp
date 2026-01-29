import { Injectable } from '@nestjs/common';
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
    return this.petitionsRepository.findOne({ where: { id: new ObjectId(id) }, relations: ['user'] });
  }

  async update(id: string, updatePetitionDto: UpdatePetitionDto) {
    await this.petitionsRepository.update(id, updatePetitionDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.petitionsRepository.delete(id);
  }
}
