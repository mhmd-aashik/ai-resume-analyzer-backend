import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { resumeAnalyses } from '../../db/schema';
import { AiService } from '../ai/ai.service';
import { extractTextFromPdf } from './utils/pdf-parser.util';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class ResumeService {
  constructor(
    private readonly aiService: AiService,
    private readonly dbService: DbService,
  ) {}

  async analyzeResume(params: {
    file: Express.Multer.File;
    jobDescription: string;
  }) {
    const { file, jobDescription } = params;

    if (!file) {
      throw new BadRequestException('Resume PDF file is required');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF resumes are allowed');
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      throw new BadRequestException('Job description is too short');
    }

    try {
      const resumeText = await extractTextFromPdf(file.buffer);

      const aiResult = await this.aiService.analyzeResume({
        resumeText,
        jobDescription,
      });

      const [savedAnalysis] = await this.dbService.db
        .insert(resumeAnalyses)
        .values({
          resumeFileName: file.originalname,
          resumeText,
          jobDescription,
          score: aiResult.score,
          matchedSkills: aiResult.matchedSkills,
          missingSkills: aiResult.missingSkills,
          atsFeedback: aiResult.atsFeedback,
          improvementSuggestions: aiResult.improvementSuggestions,
          summarySuggestion: aiResult.summarySuggestion,
          recommendation: aiResult.recommendation,
        })
        .returning();

      return {
        message: 'Resume analyzed successfully',
        data: savedAnalysis,
      };
    } catch (error) {
      console.error('Resume analyze error:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to analyze resume');
    }
  }

  async getAnalysesHistory() {
    return this.dbService.db
      .select()
      .from(resumeAnalyses)
      .orderBy(desc(resumeAnalyses.createdAt));
  }

  async getAnalysisById(id: string) {
    const [analysis] = await this.dbService.db
      .select()
      .from(resumeAnalyses)
      .where(eq(resumeAnalyses.id, id));

    return analysis;
  }
}
