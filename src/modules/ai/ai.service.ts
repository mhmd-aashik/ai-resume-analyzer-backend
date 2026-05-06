import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { buildResumeAnalyzerPrompt } from './prompts/resume-analyzer.prompt';

export type ResumeAnalysisAiResult = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  atsFeedback: string[];
  improvementSuggestions: string[];
  summarySuggestion: string;
  recommendation: string;
};

@Injectable()
export class AiService {
  constructor(private readonly configService: ConfigService) {}

  async analyzeResume(params: {
    resumeText: string;
    jobDescription: string;
  }): Promise<ResumeAnalysisAiResult> {
    const baseUrl =
      this.configService.get<string>('OLLAMA_BASE_URL') ||
      'http://localhost:11434';

    const model = this.configService.get<string>('OLLAMA_MODEL') || 'llama3.2';

    const prompt = buildResumeAnalyzerPrompt({
      resumeText: params.resumeText,
      jobDescription: params.jobDescription,
    });

    try {
      console.log(`Starting AI analysis with model: ${model} at ${baseUrl}`);
      const response = await axios.post(`${baseUrl}/api/generate`, {
        model,
        prompt,
        format: 'json',
        stream: false,
      }, { timeout: 300000 }); // Increase timeout to 5m
      console.log('AI response received successfully');
      console.log('AI raw response:', response.data.response);
      const rawText = response.data.response;
      const parsed = JSON.parse(rawText);

      return {
        score: Number(parsed.score) || 0,
        matchedSkills: Array.isArray(parsed.matchedSkills)
          ? parsed.matchedSkills
          : [],
        missingSkills: Array.isArray(parsed.missingSkills)
          ? parsed.missingSkills
          : [],
        atsFeedback: Array.isArray(parsed.atsFeedback)
          ? parsed.atsFeedback
          : [],
        improvementSuggestions: Array.isArray(parsed.improvementSuggestions)
          ? parsed.improvementSuggestions
          : [],
        summarySuggestion: String(parsed.summarySuggestion || ''),
        recommendation: String(parsed.recommendation || ''),
      };
    } catch (error) {
      console.error('AI analysis error:', error);

      throw new InternalServerErrorException(
        'Failed to analyze resume using AI',
      );
    }
  }
}
