import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsArray, ArrayMinSize } from 'class-validator';
import { VoteLevel } from '../entities/vote.entity';

export class CreateVoteDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  eligibility?: string;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @IsEnum(VoteLevel)
  @IsOptional()
  voteLevel?: VoteLevel;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayMinSize(1)
  selectedSubCounties?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayMinSize(1)
  selectedWards?: string[];
}
