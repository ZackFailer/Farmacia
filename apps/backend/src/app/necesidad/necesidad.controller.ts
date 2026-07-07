import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { NecesidadService } from './necesidad.service';
import { CrearNecesidadDto } from './dto/crear-necesidad.dto';
import { ActualizarNecesidadDto } from './dto/actualizar-necesidad.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@Controller('necesidades')
@Roles(UserRole.ADMIN, UserRole.SURVEYOR, UserRole.RECEPTIONIST)
export class NecesidadController {
  constructor(private readonly service: NecesidadService) {}

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
  create(@Body() dto: CrearNecesidadDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarNecesidadDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
