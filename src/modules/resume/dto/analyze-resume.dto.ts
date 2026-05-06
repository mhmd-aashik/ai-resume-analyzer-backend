import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AnalyzeResumeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  jobDescription: string;
}
