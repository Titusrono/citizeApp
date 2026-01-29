import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from './entities/issue.entity';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { User } from '../users/entities/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private issuesRepository: Repository<Issue>,
  ) {}

  async create(createIssueDto: CreateIssueDto, user: User) {
    const issue = this.issuesRepository.create({
      ...createIssueDto,
      user,
    });
    return this.issuesRepository.save(issue);
  }

  async findAll() {
    return this.issuesRepository.find({ relations: ['user'] });
  }

  async findOne(id: string) {
    return this.issuesRepository.findOne({ where: { id: new ObjectId(id) }, relations: ['user'] });
  }

  async update(id: string, updateIssueDto: UpdateIssueDto) {
    await this.issuesRepository.update(id, updateIssueDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.issuesRepository.delete(id);
  }
}
