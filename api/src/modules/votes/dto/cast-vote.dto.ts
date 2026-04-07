import { IsIn, IsOptional, IsString } from 'class-validator';

export class CastVoteDto {
  @IsIn(['yes', 'no'])
  vote: 'yes' | 'no';

  @IsOptional()
  @IsString()
  reason?: string;
}
