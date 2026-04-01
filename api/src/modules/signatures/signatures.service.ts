import { Injectable, BadRequestException } from '@nestjs/common';
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

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-f]{24}$/i.test(id);
  }

  private convertToObjectId(id: string): ObjectId {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid signature ID format: ${id}`);
    }
    return new ObjectId(id);
  }

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
    return this.signaturesRepository.findOne({ where: { id: this.convertToObjectId(id) }, relations: ['user', 'petition'] });
  }

  async update(id: string, updateSignatureDto: UpdateSignatureDto) {
    await this.signaturesRepository.update(this.convertToObjectId(id), updateSignatureDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.signaturesRepository.delete(this.convertToObjectId(id));
  }
}
