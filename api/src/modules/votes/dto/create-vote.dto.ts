import { VoteLevel } from '../entities/vote.entity';

export class CreateVoteDto {
  title!: string;
  description!: string;
  eligibility?: string;
  endDate!: string;
  voteLevel?: VoteLevel;
  selectedSubCounties?: string[];
  selectedWards?: string[];
}
