import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AnalyzeResumeDto } from './dto/analyze-resume.dto';
import { ResumeService } from './resume.service';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async analyzeResume(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: AnalyzeResumeDto,
  ) {
    const result = await this.resumeService.analyzeResume(
      file,
      body.jobDescription,
    );
    return {
      message: 'Resume analyzed successfully',
      data: result,
    };
  }

  @Get('history')
  getHistory() {
    return this.resumeService.getHistory();
  }

  @Get(':id')
  getAnalysisById(@Param('id', ParseUUIDPipe) id: string) {
    return this.resumeService.getAnalysisById(id);
  }
}
