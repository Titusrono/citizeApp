export class CreatePetitionDto {
  title!: string;
  description?: string;
  category?: string;
  targetAuthority?: string;
  supportingDocs?: string;
  status?: string;
}
