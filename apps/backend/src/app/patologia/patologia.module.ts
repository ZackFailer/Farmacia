import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatologiaController } from './patologia.controller';
import { PatologiaService } from './patologia.service';
import { CatalogoPatologia } from '../common/entities/patologia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CatalogoPatologia])],
  controllers: [PatologiaController],
  providers: [PatologiaService],
  exports: [PatologiaService],
})
export class PatologiaModule {}
