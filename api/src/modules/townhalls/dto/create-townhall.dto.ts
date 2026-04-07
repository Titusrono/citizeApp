import { IsString, IsUrl, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateTownhallDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(10)
  @IsOptional()
  agenda?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsUrl()
  @IsOptional()
  meetLink?: string;

  @IsUrl()
  @IsOptional()
  recordingLink?: string;

  @IsBoolean()
  @IsOptional()
  isLive?: boolean;
}
