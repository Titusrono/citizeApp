import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePetitionDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  targetAuthority?: string;

  @IsString()
  @IsOptional()
  supportingDocs?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
