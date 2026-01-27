import { Test, TestingModule } from '@nestjs/testing';
import { PetitionsService } from './petitions.service';

describe('PetitionsService', () => {
  let service: PetitionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PetitionsService],
    }).compile();

    service = module.get<PetitionsService>(PetitionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
