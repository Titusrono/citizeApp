import { Test, TestingModule } from '@nestjs/testing';
import { TownhallsService } from './townhalls.service';

describe('TownhallsService', () => {
  let service: TownhallsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TownhallsService],
    }).compile();

    service = module.get<TownhallsService>(TownhallsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
