import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy } from './entities/policy.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class PoliciesService {
  constructor(
    @InjectRepository(Policy)
    private policiesRepository: Repository<Policy>,
  ) {}

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-f]{24}$/i.test(id);
  }

  private convertToObjectId(id: string): ObjectId {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid policy ID format: ${id}`);
    }
    return new ObjectId(id);
  }

  async create(createPolicyDto: CreatePolicyDto) {
    const policy = this.policiesRepository.create(createPolicyDto);
    return this.policiesRepository.save(policy);
  }

  async findAll() {
    return this.policiesRepository.find();
  }

  async findOne(id: string) {
    return this.policiesRepository.findOne({ where: { id: this.convertToObjectId(id) } });
  }

  async update(id: string, updatePolicyDto: UpdatePolicyDto) {
    await this.policiesRepository.update(this.convertToObjectId(id), updatePolicyDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.policiesRepository.delete(this.convertToObjectId(id));
  }
}
