import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../../db/db.service.js';
import { resumeAnalyses } from '../../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { extractTextFromPdf } from './utils/pdf-parser.util.js';
import { AiService } from '../ai/ai.service.js';
import { sanitizeTextForDatabase } from '../../common/utils/text-sanitizer.util.js';

@Injectable()
export class ResumeService {
  constructor(
    private readonly dbService: DbService,
    private readonly aiService: AiService,
  ) {}

  async analyzeResume(file: Express.Multer.File, jobDescription: string) {
    if (!jobDescription || jobDescription.trim().length < 20) {
      throw new BadRequestException('Job description is too short');
    }

    console.log(`Analyzing resume: ${file.originalname}`);

    try {
      console.log('Extracting text from PDF...');
      const rawResumeText = await extractTextFromPdf(file.buffer);
      const resumeText = sanitizeTextForDatabase(rawResumeText);
      const cleanJobDescription = sanitizeTextForDatabase(jobDescription);
      
      console.log(`Text extracted and sanitized (${resumeText.length} chars)`);

      console.log('Calling AI service...');
      const aiResult = await this.aiService.analyzeResume({
        resumeText,
        jobDescription: cleanJobDescription,
      });
      console.log('AI analysis completed');

      // Temporary debug logs before insert
      console.log("Resume text contains null byte:", resumeText.includes("\0"));
      console.log("Job description contains null byte:", cleanJobDescription.includes("\0"));

      console.log('Saving to database...');
      const [savedAnalysis] = await this.dbService.db
        .insert(resumeAnalyses)
        .values({
          resumeFileName: sanitizeTextForDatabase(file.originalname),
          resumeText,
          jobDescription: cleanJobDescription,
          score: aiResult.score,
          matchedSkills: aiResult.matchedSkills,
          missingSkills: aiResult.missingSkills,
          atsFeedback: aiResult.atsFeedback,
          improvementSuggestions: aiResult.improvementSuggestions,
          summarySuggestion: sanitizeTextForDatabase(aiResult.summarySuggestion),
          recommendation: sanitizeTextForDatabase(aiResult.recommendation),
        })
        .returning();

      console.log('Analysis saved to database successfully');
      return savedAnalysis;
    } catch (error: any) {
      console.error('Resume analyze error:', error);
      
      // If it's a database error, log the specific reason
      if (error.code) {
        console.error(`Database Error Code: ${error.code}`);
        console.error(`Database Error Detail: ${error.detail}`);
        console.error(`Database Error Hint: ${error.hint}`);
      }

      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to analyze resume: ${error.message || 'Unknown error'}`,
      );
    }
  }

  async getHistory(limit = 10, offset = 0) {
    const items = await this.dbService.db
      .select()
      .from(resumeAnalyses)
      .orderBy(desc(resumeAnalyses.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await this.dbService.db
      .select({ count: sql<number>`count(*)` })
      .from(resumeAnalyses);

    return {
      items,
      total: Number(countResult?.count || 0),
    };
  }

  async getAnalysisById(id: string) {
    const [analysis] = await this.dbService.db
      .select()
      .from(resumeAnalyses)
      .where(eq(resumeAnalyses.id, id));

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    return analysis;
  }
}
