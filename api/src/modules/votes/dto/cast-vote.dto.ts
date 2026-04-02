export class CastVoteDto {
  userId: string;
  vote: 'yes' | 'no';
  reason?: string;
}
