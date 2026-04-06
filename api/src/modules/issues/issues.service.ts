import { Injectable, BadRequestException } from '@nestjs/common';
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

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-f]{24}$/i.test(id);
  }

  private convertToObjectId(id: string): ObjectId {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid issue ID format: ${id}`);
    }
    return new ObjectId(id);
  }

  async create(createIssueDto: CreateIssueDto, user: User) {
    const userIdString = user.id instanceof ObjectId ? user.id.toString() : String(user.id);
    const issue = this.issuesRepository.create({
      ...createIssueDto,
      user,
      userId: userIdString // Store userId as string for easier querying
    });
    return this.issuesRepository.save(issue);
  }

  async findAll() {
    return this.issuesRepository.find({ relations: ['user'] });
  }

  // Find issues by filters (userId and/or approved status)
  async findByFilters(userId?: string, approved?: boolean) {
    console.log('findByFilters called with userId:', userId, 'approved:', approved);
    
    const filter: any = {};
    
    if (userId) {
      console.log('Filtering by userId (string):', userId);
      filter.userId = userId;
    }
    
    if (approved !== undefined) {
      console.log('Filtering by approved:', approved);
      filter.approved = approved;
    }
    
    console.log('MongoDB filter:', filter);
    const results = await this.issuesRepository.find({ 
      where: filter,
      relations: ['user']
    });
    
    console.log('findByFilters - results count:', results.length);
    if (results.length > 0) {
      console.log('findByFilters - first result userId:', results[0].userId);
    }
    
    return results;
  }

  async findOne(id: string) {
    return this.issuesRepository.findOne({ where: { id: this.convertToObjectId(id) }, relations: ['user'] });
  }

  async update(id: string, updateIssueDto: UpdateIssueDto) {
    await this.issuesRepository.update(this.convertToObjectId(id), updateIssueDto);
    return this.findOne(id);
  }

  async approve(id: string) {
    const objectId = this.convertToObjectId(id);
    
    // Update the issue to mark it as approved
    const result = await this.issuesRepository.update(
      { id: objectId },
      { approved: true }
    );
    
    if (result.affected === 0) {
      throw new BadRequestException(`Issue with ID ${id} not found`);
    }
    
    // Return the updated issue with relations
    return this.issuesRepository.findOne({ where: { id: objectId }, relations: ['user'] });
  }

  async remove(id: string) {
    return this.issuesRepository.delete(this.convertToObjectId(id));
  }
}
