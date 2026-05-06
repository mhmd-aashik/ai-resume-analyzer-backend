import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { AiModule } from '../ai/ai.module';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';

@Module({
  imports: [AiModule, DbModule],
  controllers: [ResumeController],
  providers: [ResumeService],
})
export class ResumeModule {}
