import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty } from 'class-validator';

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

	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	images: string[];
}
