import { IsString, IsDateString, IsInt, IsArray, IsOptional, Min, Max } from 'class-validator';

export class CreateCommitJobDto {
  @IsString()
  repoName: string;

  @IsString()
  repoOwner: string;

  @IsString()
  repoUrl: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  @Min(1)
  @Max(20)
  commitsPerDay: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  commitMessages?: string[];
}