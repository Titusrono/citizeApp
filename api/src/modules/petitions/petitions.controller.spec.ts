import { Test, TestingModule } from '@nestjs/testing';
import { PetitionsController } from './petitions.controller';
import { PetitionsService } from './petitions.service';

describe('PetitionsController', () => {
  let controller: PetitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetitionsController],
      providers: [PetitionsService],
    }).compile();

    controller = module.get<PetitionsController>(PetitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
