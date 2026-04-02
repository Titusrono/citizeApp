import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Petition } from './entities/petition.entity';
import { CreatePetitionDto } from './dto/create-petition.dto';
import { UpdatePetitionDto } from './dto/update-petition.dto';
import { User, UserRole } from '../users/entities/user.entity';
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

  async update(id: string, updatePetitionDto: UpdatePetitionDto, user?: User) {
    const petition = await this.petitionsRepository.findOne({
      where: { id: this.convertToObjectId(id) },
      relations: ['user']
    });

    if (!petition) {
      throw new BadRequestException('Petition not found');
    }

    // Check authorization: user can update if they created it or if they're an admin
    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
    const isCreator = petition.user?.id?.toString() === user?.id?.toString();

    if (!isAdmin && !isCreator) {
      throw new BadRequestException('You can only update petitions you created');
    }

    await this.petitionsRepository.update(this.convertToObjectId(id), updatePetitionDto);
    return this.findOne(id);
  }

  async remove(id: string, user?: User) {
    const petition = await this.petitionsRepository.findOne({
      where: { id: this.convertToObjectId(id) },
      relations: ['user']
    });

    if (!petition) {
      throw new BadRequestException('Petition not found');
    }

    // Check authorization: user can delete if they created it or if they're an admin
    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
    const isCreator = petition.user?.id?.toString() === user?.id?.toString();

    if (!isAdmin && !isCreator) {
      throw new BadRequestException('You can only delete petitions you created');
    }

    return this.petitionsRepository.delete(this.convertToObjectId(id));
  }
}
