import { Test, TestingModule } from '@nestjs/testing';
import { TownhallsController } from './townhalls.controller';
import { TownhallsService } from './townhalls.service';

describe('TownhallsController', () => {
  let controller: TownhallsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TownhallsController],
      providers: [TownhallsService],
    }).compile();

    controller = module.get<TownhallsController>(TownhallsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
