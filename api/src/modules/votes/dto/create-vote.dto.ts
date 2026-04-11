import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsArray } from 'class-validator';
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
  selectedSubCounties?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selectedWards?: string[];
}
