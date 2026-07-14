import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';

class UpdateParametroDto {
  @IsString()
  @IsNotEmpty()
  valor!: string;
}
import { AdministracionService } from './administracion.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/types/jwt-user.type';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { ActualizarConfiguracionDto } from './dto/actualizar-configuracion.dto';

@Roles(UserRole.ADMIN)
@Controller()
export class AdministracionController {
  constructor(private readonly administracionService: AdministracionService) {}

  @Get('usuarios')
  getUsuarios(@Query('incluirInactivos') incluirInactivos?: string) {
    return this.administracionService.getUsuarios(incluirInactivos === 'true');
  }

  @Post('usuarios')
  createUsuario(
    @Body() dto: CrearUsuarioDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.administracionService.createUsuario(dto, user.sub);
  }

  @Patch('usuarios/:id')
  updateUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
  ) {
    return this.administracionService.updateUsuario(id, dto);
  }

  @Delete('usuarios/:id')
  deleteUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.administracionService.deleteUsuario(id);
  }

  @Get('configuraciones')
  getConfiguraciones() {
    return this.administracionService.getConfiguraciones();
  }

  @Patch('configuraciones/:id')
  updateConfiguracion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarConfiguracionDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.administracionService.updateConfiguracion(id, dto, user.sub);
  }

  @Get('parametros')
  getParametros() {
    return this.administracionService.getParametros();
  }

  @Patch('parametros/:clave')
  updateParametro(
    @Param('clave') clave: string,
    @Body() dto: UpdateParametroDto,
  ) {
    return this.administracionService.updateParametro(clave, dto.valor);
  }
}
