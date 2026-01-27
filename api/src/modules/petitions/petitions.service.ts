import { Injectable } from '@nestjs/common';
import { CreatePetitionDto } from './dto/create-petition.dto';
import { UpdatePetitionDto } from './dto/update-petition.dto';

@Injectable()
export class PetitionsService {
  create(createPetitionDto: CreatePetitionDto) {
    return 'This action adds a new petition';
  }

  findAll() {
    return `This action returns all petitions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} petition`;
  }

  update(id: number, updatePetitionDto: UpdatePetitionDto) {
    return `This action updates a #${id} petition`;
  }

  remove(id: number) {
    return `This action removes a #${id} petition`;
  }
}
