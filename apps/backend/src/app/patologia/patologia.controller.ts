import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PatologiaService } from './patologia.service';
import { CrearPatologiaDto } from './dto/crear-patologia.dto';
import { ActualizarPatologiaDto } from './dto/actualizar-patologia.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@Controller('patologias')
@Roles(UserRole.ADMIN, UserRole.SURVEYOR, UserRole.RECEPTIONIST)
export class PatologiaController {
  constructor(private readonly service: PatologiaService) {}

  @Get()
  findAll(@Query('incluirInactivos') incluirInactivos?: string) {
    return incluirInactivos === 'true'
      ? this.service.findAllIncludingInactives()
      : this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CrearPatologiaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarPatologiaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
