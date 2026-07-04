import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { DatabaseSeedService } from './database-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [DatabaseSeedService],
})
export class CommonModule {}
