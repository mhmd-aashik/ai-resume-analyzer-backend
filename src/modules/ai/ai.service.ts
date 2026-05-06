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
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const model =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-1.5-flash';

    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY is not configured');
    }

    const prompt = buildResumeAnalyzerPrompt({
      resumeText: params.resumeText,
      jobDescription: params.jobDescription,
    });

    try {
      console.log(`Starting AI analysis with Gemini model: ${model}`);

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        },
        { timeout: 300000 },
      );

      console.log('Gemini response received successfully');
      
      const candidate = response.data.candidates?.[0];
      if (!candidate) {
        throw new Error('Gemini returned no candidates');
      }

      if (candidate.finishReason === 'SAFETY') {
        throw new Error('Gemini response was blocked due to safety settings');
      }

      const rawText = candidate.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Gemini response contains no text content');
      }

      console.log('AI raw response:', rawText);
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.[0]?.error?.message || error.response?.data?.error?.message || error.message;
      console.error(
        'AI analysis error:',
        JSON.stringify(error.response?.data || error.message, null, 2),
      );

      throw new InternalServerErrorException(
        `Failed to analyze resume: ${errorMessage}`,
      );
    }
  }
}
