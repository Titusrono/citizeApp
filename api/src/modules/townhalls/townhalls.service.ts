import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Townhall } from './entities/townhall.entity';
import { CreateTownhallDto } from './dto/create-townhall.dto';
import { UpdateTownhallDto } from './dto/update-townhall.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class TownhallsService {
  constructor(
    @InjectRepository(Townhall)
    private townhallsRepository: Repository<Townhall>,
  ) {}

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-f]{24}$/i.test(id);
  }

  private convertToObjectId(id: string): ObjectId {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid townhall ID format: ${id}`);
    }
    return new ObjectId(id);
  }

  async create(createTownhallDto: CreateTownhallDto) {
    console.log('[TownhallsService.create] ============ CREATE START ============');
    console.log('[TownhallsService.create] Received DTO:', JSON.stringify(createTownhallDto, null, 2));
    console.log('[TownhallsService.create] DTO keys:', Object.keys(createTownhallDto));
    
    try {
      const townhall = this.townhallsRepository.create(createTownhallDto);
      console.log('[TownhallsService.create] Created entity:', JSON.stringify(townhall, null, 2));
      
      const saved = await this.townhallsRepository.save(townhall);
      console.log('[TownhallsService.create] ✅ Saved successfully:', JSON.stringify(saved, null, 2));
      console.log('[TownhallsService.create] Saved keys:', Object.keys(saved));
      console.log('[TownhallsService.create] ============ CREATE END ============\n');
      
      return saved;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[TownhallsService.create] ❌ ERROR:', error.message);
      console.error('[TownhallsService.create] Stack:', error.stack);
      throw err;
    }
  }

  async findAll() {
    return this.townhallsRepository.find();
  }

  async findOne(id: string) {
    return this.townhallsRepository.findOne({ where: { id: this.convertToObjectId(id) } });
  }

  async update(id: string, updateTownhallDto: UpdateTownhallDto) {
    console.log('[TownhallsService.update] ============ UPDATE START ============');
    console.log('[TownhallsService.update] Received ID param:', id, '(type:', typeof id + ')');
    console.log('[TownhallsService.update] id === undefined:', id === undefined);
    console.log('[TownhallsService.update] id === "undefined":', id === 'undefined');
    console.log('[TownhallsService.update] Received DTO:', JSON.stringify(updateTownhallDto, null, 2));
    console.log('[TownhallsService.update] DTO keys:', Object.keys(updateTownhallDto));
    
    try {
      const objectId = this.convertToObjectId(id);
      await this.townhallsRepository.update(objectId, updateTownhallDto);
      console.log('[TownhallsService.update] Update query executed');
      
      const updated = await this.findOne(id);
      console.log('[TownhallsService.update] ✅ Retrieved updated record:', JSON.stringify(updated, null, 2));
      console.log('[TownhallsService.update] Updated keys:', Object.keys(updated || {}));
      console.log('[TownhallsService.update] ============ UPDATE END ============\n');
      
      return updated;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[TownhallsService.update] ❌ ERROR:', error.message);
      console.error('[TownhallsService.update] Stack:', error.stack);
      throw err;
    }
  }

  async remove(id: string) {
    return this.townhallsRepository.delete(this.convertToObjectId(id));
  }
}
