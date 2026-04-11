import { IsIn, IsOptional, IsString } from 'class-validator';

/**
 * DTO for casting a vote on a proposal
 * The userId is automatically extracted from the authenticated user (JWT token)
 * This prevents users from voting on behalf of other users
 */
export class CastVoteDto {
  @IsIn(['yes', 'no'])
  vote: 'yes' | 'no';

  @IsOptional()
  @IsString()
  reason?: string;
}
