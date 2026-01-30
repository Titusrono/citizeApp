import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    const blog = this.blogRepository.create(createBlogDto);
    return this.blogRepository.save(blog);
  }

  async findAll(): Promise<Blog[]> {
    return this.blogRepository.find({
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Blog | null> {
    return this.blogRepository.findOne({
      where: { _id: new ObjectId(id) } as any,
    });
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog | null> {
    await this.blogRepository.update(
      { _id: new ObjectId(id) } as any,
      updateBlogDto,
    );
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.blogRepository.delete({ _id: new ObjectId(id) } as any);
    return { message: 'Blog deleted successfully' };
  }
}
