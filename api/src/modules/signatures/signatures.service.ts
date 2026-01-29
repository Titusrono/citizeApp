import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signature } from './entities/signature.entity';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { UpdateSignatureDto } from './dto/update-signature.dto';
import { User } from '../users/entities/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class SignaturesService {
  constructor(
    @InjectRepository(Signature)
    private signaturesRepository: Repository<Signature>,
  ) {}

  async create(createSignatureDto: CreateSignatureDto, user: User) {
    const signature = this.signaturesRepository.create({
      ...createSignatureDto,
      user,
    });
    return this.signaturesRepository.save(signature);
  }

  async findAll() {
    return this.signaturesRepository.find({ relations: ['user', 'petition'] });
  }

  async findOne(id: string) {
    return this.signaturesRepository.findOne({ where: { id: new ObjectId(id) }, relations: ['user', 'petition'] });
  }

  async update(id: string, updateSignatureDto: UpdateSignatureDto) {
    await this.signaturesRepository.update(id, updateSignatureDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.signaturesRepository.delete(id);
  }
}
