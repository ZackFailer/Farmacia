import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Medicamento } from './entities/medicamento.entity';
import { UserRole } from './enums/role.enum';

const medicamentosSeed = [
  { nombreGenerico: 'Paracetamol', nombreComercial: 'Tempra', presentacion: 'Tableta', concentracion: 500, esVital: true },
  { nombreGenerico: 'Paracetamol', nombreComercial: 'Tempra', presentacion: 'Jarabe', concentracion: 120, esVital: true },
  { nombreGenerico: 'Ibuprofeno', nombreComercial: 'Advil', presentacion: 'Tableta', concentracion: 400, esVital: true },
  { nombreGenerico: 'Ibuprofeno', nombreComercial: 'Advil', presentacion: 'Jarabe', concentracion: 100, esVital: true },
  { nombreGenerico: 'Amoxicilina', nombreComercial: 'Amoxil', presentacion: 'Cápsula', concentracion: 500, esVital: true },
  { nombreGenerico: 'Amoxicilina', nombreComercial: 'Amoxil', presentacion: 'Suspensión', concentracion: 250, esVital: true },
  { nombreGenerico: 'Omeprazol', nombreComercial: 'Losec', presentacion: 'Cápsula', concentracion: 20, esVital: false },
  { nombreGenerico: 'Losartán', nombreComercial: 'Cozaar', presentacion: 'Tableta', concentracion: 50, esVital: true },
  { nombreGenerico: 'Metformina', nombreComercial: 'Glucophage', presentacion: 'Tableta', concentracion: 850, esVital: true },
  { nombreGenerico: 'Salbutamol', nombreComercial: 'Ventolin', presentacion: 'Inhalador', concentracion: 100, esVital: true },
  { nombreGenerico: 'Enalapril', nombreComercial: 'Renitec', presentacion: 'Tableta', concentracion: 10, esVital: true },
  { nombreGenerico: 'Atorvastatina', nombreComercial: 'Lipitor', presentacion: 'Tableta', concentracion: 20, esVital: false },
  { nombreGenerico: 'Dexametasona', nombreComercial: 'Decadron', presentacion: 'Tableta', concentracion: 4, esVital: true },
  { nombreGenerico: 'Azitromicina', nombreComercial: 'Zitromax', presentacion: 'Tableta', concentracion: 500, esVital: true },
  { nombreGenerico: 'Hidroclorotiazida', nombreComercial: 'Hidroclorotiazida', presentacion: 'Tableta', concentracion: 25, esVital: true },
  { nombreGenerico: 'Carbamazepina', nombreComercial: 'Tegretol', presentacion: 'Tableta', concentracion: 200, esVital: true },
  { nombreGenerico: 'Furosemida', nombreComercial: 'Lasix', presentacion: 'Tableta', concentracion: 40, esVital: true },
  { nombreGenerico: 'Ácido Fólico', nombreComercial: 'Ácido Fólico', presentacion: 'Tableta', concentracion: 5, esVital: true },
  { nombreGenerico: 'Loratadina', nombreComercial: 'Clarityne', presentacion: 'Tableta', concentracion: 10, esVital: false },
  { nombreGenerico: 'Diclofenaco', nombreComercial: 'Voltaren', presentacion: 'Tableta', concentracion: 50, esVital: false },
  { nombreGenerico: 'Metronidazol', nombreComercial: 'Flagyl', presentacion: 'Tableta', concentracion: 250, esVital: true },
  { nombreGenerico: 'Diazepam', nombreComercial: 'Valium', presentacion: 'Tableta', concentracion: 5, esVital: true },
  { nombreGenerico: 'Epinefrina', nombreComercial: 'Adrenalina', presentacion: 'Inyectable', concentracion: 1, esVital: true },
  { nombreGenerico: 'Amlodipina', nombreComercial: 'Norvasc', presentacion: 'Tableta', concentracion: 5, esVital: true },
];

@Injectable()
export class DatabaseSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    const userCount = await this.usuarioRepository.count();
    if (userCount === 0) {
      const admin = this.usuarioRepository.create({
        username: 'admin',
        nombre: 'Administrador',
        rol: UserRole.ADMIN,
        pinHash: await hash('123456', 10),
      });
      await this.usuarioRepository.save(admin);

      const humberto = this.usuarioRepository.create({
        username: 'humber_farias',
        nombre: 'Humberto Farías',
        rol: UserRole.MEDICATION_RECEPTIONIST,
        pinHash: await hash('123456', 10),
      });
      await this.usuarioRepository.save(humberto);

      const encuestador = this.usuarioRepository.create({
        username: 'encuestador',
        nombre: 'Encuestador',
        rol: UserRole.SURVEYOR,
        pinHash: await hash('123456', 10),
      });
      await this.usuarioRepository.save(encuestador);
    }

    const medRepo = this.dataSource.getRepository(Medicamento);
    const medCount = await medRepo.count();
    if (medCount === 0) {
      for (const m of medicamentosSeed) {
        const entity = medRepo.create({ ...m, unidadConcentracion: 'mg' });
        await medRepo.save(entity);
      }
    }
  }
}
