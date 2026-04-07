import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
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
      isApproved: false, // New petitions start unapproved
    });
    return this.petitionsRepository.save(petition);
  }

  async findAll(user?: User) {
    // If user is admin/super_admin, return all petitions
    // Otherwise, return only approved petitions
    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

    if (isAdmin) {
      return this.petitionsRepository.find({ relations: ['user', 'approvedBy'], order: { createdAt: 'DESC' } });
    }

    // For citizens, only show approved petitions
    return this.petitionsRepository.find({
      where: { isApproved: true },
      relations: ['user', 'approvedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string) {
    console.log('[PetitionsService.findOne] Fetching petition with id:', id);
    try {
      // Use string ID directly - TypeORM MongoDB will handle conversion
      const result = await this.petitionsRepository.findOne({ 
        where: { id: id as any }, 
        relations: ['user', 'approvedBy'] 
      });
      console.log('[PetitionsService.findOne] Result:', result ? result.id?.toString() : 'NOT FOUND');
      return result;
    } catch (error) {
      console.error('[PetitionsService.findOne] Error:', error);
      // Fallback: search all petitions for matching ID
      console.log('[PetitionsService.findOne] Fallback: searching all petitions');
      const all = await this.petitionsRepository.find({ relations: ['user', 'approvedBy'] });
      return all.find(p => p.id?.toString() === id) || null;
    }
  }

  async update(id: string, updatePetitionDto: UpdatePetitionDto, user?: User) {
    const objectId = this.convertToObjectId(id);
    // Fallback: search all petitions for matching ID
    const allPetitions = await this.petitionsRepository.find({ relations: ['user'] });
    const petition = allPetitions.find(p => p.id?.toString() === id);

    if (!petition) {
      throw new BadRequestException('Petition not found');
    }

    // Check authorization
    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
    const isCreator = petition.user?.id?.toString() === user?.id?.toString();

    // Approved petitions can ONLY be edited by admins
    if (petition.isApproved && !isAdmin) {
      throw new ForbiddenException('Approved petitions cannot be edited. Contact an administrator.');
    }

    // Unapproved petitions can be edited by creator or admin
    if (!isAdmin && !isCreator) {
      throw new ForbiddenException('You can only update petitions you created');
    }

    await this.petitionsRepository.update(this.convertToObjectId(id), updatePetitionDto);
    return this.findOne(id);
  }

  async remove(id: string, user?: User) {
    const objectId = this.convertToObjectId(id);
    // Fallback: search all petitions for matching ID
    const allPetitions = await this.petitionsRepository.find({ relations: ['user'] });
    const petition = allPetitions.find(p => p.id?.toString() === id);

    if (!petition) {
      throw new BadRequestException('Petition not found');
    }

    // Check authorization
    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
    const isCreator = petition.user?.id?.toString() === user?.id?.toString();

    // Approved petitions can ONLY be deleted by admins
    if (petition.isApproved && !isAdmin) {
      throw new ForbiddenException('Approved petitions cannot be deleted. Contact an administrator.');
    }

    // Unapproved petitions can be deleted by creator or admin
    if (!isAdmin && !isCreator) {
      throw new ForbiddenException('You can only delete petitions you created');
    }

    return this.petitionsRepository.delete(this.convertToObjectId(id));
  }

  async approvePetition(id: string, user: User) {
    console.log('[PetitionsService.approvePetition] Starting - ID:', id, 'Type:', typeof id);
    
    // Only admins can approve
    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
    if (!isAdmin) {
      throw new ForbiddenException('Only administrators can approve petitions');
    }

    console.log('[PetitionsService.approvePetition] User is admin, proceeding with approval');
    
    // Validate and convert ID
    if (!this.isValidObjectId(id)) {
      console.error('[PetitionsService.approvePetition] Invalid ID format:', id);
      throw new BadRequestException(`Invalid petition ID format: ${id}`);
    }

    const objectId = this.convertToObjectId(id);
    console.log('[PetitionsService.approvePetition] Converted to ObjectId:', objectId.toString());

    // DEBUG: Log all petitions in DB to see if ID exists
    const allPetitions = await this.petitionsRepository.find();
    console.log('[PetitionsService.approvePetition] Total petitions in DB:', allPetitions.length);
    allPetitions.forEach((p, idx) => {
      console.log(`  [${idx}] Petition ID: ${p.id?.toString()} | Title: ${p.title}`);
    });
    
    // Search for the petition in the list
    const petition = allPetitions.find(p => p.id?.toString() === id);

    console.log('[PetitionsService.approvePetition] Found petition:', petition ? petition.id?.toString() : 'NOT FOUND');

    if (!petition) {
      console.error('[PetitionsService.approvePetition] Petition not found with ID:', id);
      throw new BadRequestException('Petition not found');
    }

    if (petition.isApproved) {
      throw new BadRequestException('This petition is already approved');
    }

    await this.petitionsRepository.update(
      objectId,
      {
        isApproved: true,
        approvedBy: user,
        approvedAt: new Date()
      }
    );

    console.log('[PetitionsService] Petition approved:', id, 'by', user.id?.toString());
    return this.findOne(id);
  }

  async rejectPetition(id: string, user: User) {
    console.log('[PetitionsService.rejectPetition] Starting - ID:', id, 'Type:', typeof id);
    
    // Only admins can reject
    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
    if (!isAdmin) {
      throw new ForbiddenException('Only administrators can reject petitions');
    }

    console.log('[PetitionsService.rejectPetition] User is admin, proceeding with rejection');

    // Validate and convert ID
    if (!this.isValidObjectId(id)) {
      console.error('[PetitionsService.rejectPetition] Invalid ID format:', id);
      throw new BadRequestException(`Invalid petition ID format: ${id}`);
    }

    const objectId = this.convertToObjectId(id);
    console.log('[PetitionsService.rejectPetition] Converted to ObjectId:', objectId.toString());

    // Fallback: search all petitions for matching ID
    const allPetitions = await this.petitionsRepository.find({ relations: ['user'] });
    const petition = allPetitions.find(p => p.id?.toString() === id);

    console.log('[PetitionsService.rejectPetition] Found petition:', petition ? petition.id?.toString() : 'NOT FOUND');

    if (!petition) {
      console.error('[PetitionsService.rejectPetition] Petition not found with ID:', id);
      throw new BadRequestException('Petition not found');
    }

    if (petition.isApproved) {
      throw new BadRequestException('Cannot reject an already approved petition');
    }

    // Delete rejected petition
    console.log('[PetitionsService] Petition rejected and deleted:', id);
    return this.petitionsRepository.delete(objectId);
  }
}
