import { DataSource } from 'typeorm';
import { Medicamento } from '../app/common/entities/medicamento.entity';

const medicamentos = [
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
  { nombreGenerico: 'Dexametasona', nombreComercial: 'Decadron', presentacion: 'Inyectable', concentracion: 8, esVital: true },
  { nombreGenerico: 'Azitromicina', nombreComercial: 'Zitromax', presentacion: 'Tableta', concentracion: 500, esVital: true },
  { nombreGenerico: 'Azitromicina', nombreComercial: 'Zitromax', presentacion: 'Suspensión', concentracion: 200, esVital: true },
  { nombreGenerico: 'Hidroclorotiazida', nombreComercial: 'Hidroclorotiazida', presentacion: 'Tableta', concentracion: 25, esVital: true },
  { nombreGenerico: 'Carbamazepina', nombreComercial: 'Tegretol', presentacion: 'Tableta', concentracion: 200, esVital: true },
  { nombreGenerico: 'Ácido Valproico', nombreComercial: 'Depakene', presentacion: 'Cápsula', concentracion: 250, esVital: true },
  { nombreGenerico: 'Furosemida', nombreComercial: 'Lasix', presentacion: 'Tableta', concentracion: 40, esVital: true },
  { nombreGenerico: 'Hierro Sulfato', nombreComercial: 'Fero-Grad', presentacion: 'Tableta', concentracion: 200, esVital: true },
  { nombreGenerico: 'Ácido Fólico', nombreComercial: 'Ácido Fólico', presentacion: 'Tableta', concentracion: 5, esVital: true },
  { nombreGenerico: 'Vitamina B12', nombreComercial: 'Bedoyecta', presentacion: 'Inyectable', concentracion: 1000, esVital: false },
  { nombreGenerico: 'Loratadina', nombreComercial: 'Clarityne', presentacion: 'Tableta', concentracion: 10, esVital: false },
  { nombreGenerico: 'Diclofenaco', nombreComercial: 'Voltaren', presentacion: 'Tableta', concentracion: 50, esVital: false },
  { nombreGenerico: 'Hidrocortisona', nombreComercial: 'Hidrocortisona', presentacion: 'Crema', concentracion: 1, esVital: false },
  { nombreGenerico: 'Albendazol', nombreComercial: 'Zentel', presentacion: 'Suspensión', concentracion: 200, esVital: true },
  { nombreGenerico: 'Metronidazol', nombreComercial: 'Flagyl', presentacion: 'Tableta', concentracion: 250, esVital: true },
  { nombreGenerico: 'Cetirizina', nombreComercial: 'Zyrtec', presentacion: 'Jarabe', concentracion: 5, esVital: false },
  { nombreGenerico: 'Diazepam', nombreComercial: 'Valium', presentacion: 'Tableta', concentracion: 5, esVital: true },
  { nombreGenerico: 'Solución Salina 0.9%', nombreComercial: 'SSI 0.9%', presentacion: 'Frasco', concentracion: 500, esVital: true },
  { nombreGenerico: 'Ringer Lactato', nombreComercial: 'Ringer Lactato', presentacion: 'Frasco', concentracion: 500, esVital: true },
  { nombreGenerico: 'Glucosa 5%', nombreComercial: 'SG 5%', presentacion: 'Frasco', concentracion: 500, esVital: true },
  { nombreGenerico: 'Naloxona', nombreComercial: 'Narcan', presentacion: 'Inyectable', concentracion: 0.4, esVital: true },
  { nombreGenerico: 'Epinefrina', nombreComercial: 'Adrenalina', presentacion: 'Inyectable', concentracion: 1, esVital: true },
  { nombreGenerico: 'Haloperidol', nombreComercial: 'Haldol', presentacion: 'Tableta', concentracion: 5, esVital: true },
  { nombreGenerico: 'Loperamida', nombreComercial: 'Imodium', presentacion: 'Tableta', concentracion: 2, esVital: true },
  { nombreGenerico: 'Domperidona', nombreComercial: 'Motilium', presentacion: 'Tableta', concentracion: 10, esVital: false },
  { nombreGenerico: 'Amlodipina', nombreComercial: 'Norvasc', presentacion: 'Tableta', concentracion: 5, esVital: true },
  { nombreGenerico: 'Carvedilol', nombreComercial: 'Coreg', presentacion: 'Tableta', concentracion: 12.5, esVital: true },
];

export async function seedMedicamentos(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Medicamento);
  const count = await repo.count();
  if (count > 0) {
    console.log('[Seed] Medicamentos ya existen, omitiendo...');
    return;
  }

  for (const m of medicamentos) {
    const entity = repo.create({ ...m, unidadConcentracion: 'mg' });
    await repo.save(entity);
  }
  console.log(`[Seed] ${medicamentos.length} medicamentos insertados.`);
}
