import { Injectable } from '@nestjs/common';
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

  async create(createPolicyDto: CreatePolicyDto) {
    const policy = this.policiesRepository.create(createPolicyDto);
    return this.policiesRepository.save(policy);
  }

  async findAll() {
    return this.policiesRepository.find();
  }

  async findOne(id: string) {
    return this.policiesRepository.findOne({ where: { id: new ObjectId(id) } });
  }

  async update(id: string, updatePolicyDto: UpdatePolicyDto) {
    await this.policiesRepository.update(id, updatePolicyDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.policiesRepository.delete(id);
  }
}
