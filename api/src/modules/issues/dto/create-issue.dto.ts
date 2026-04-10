import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateIssueDto {
	@IsString()
	@IsNotEmpty()
	description: string;

	@IsString()
	@IsNotEmpty()
	location: string;

	@IsString()
	@IsNotEmpty()
	category: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	images?: string[];
}
