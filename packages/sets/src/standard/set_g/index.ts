import { Card } from '@ptcg/common';
import { Arven } from './arven';
import { Baxcalibur } from './baxcalibur';
import { BruteBonnet } from './brute-bonnet';
import { ChienPaoEx } from './chien-pao-ex';
import { EarthenVessel } from './earthen-vessel';
import { Ditto } from './ditto';
import { feiTianTangLangVariants } from './fei-tian-tang-lang';
import { Frigibax } from './frigibax';
import { Frigibax2 } from './frigibax2';
import { GholdengoEx } from './gholdengo-ex';
import { Gimmighoul } from './gimmighoul';
import { Gimmighoul2 } from './gimmighoul2';
import { IronValiantEx } from './iron-valiant-ex';
import { JuQianTangLang } from './ju-qian-tang-lang';
import { KaBiShouG } from './ka-bi-shou-g';
import { Iono } from './iono';
import { Klawf } from './klawf';
import { createMiMiQiuVariants } from './mi-mi-qiu';
import { MiLiLong } from './mi-li-long';
import { Noibat } from './noibat';
import { NoivernEx } from './noivern-ex';
import { ProfessorTurosScenario } from './professor-turos-scenario';
import { SuperEnergyRetrieval } from './super-energy-retrieval';

export const setG: Card[] = [
  new Arven(),
  new Baxcalibur(),
  new BruteBonnet(),
  new ChienPaoEx(),
  new Ditto(),
  new EarthenVessel(),
  ...feiTianTangLangVariants,
  new Frigibax(),
  new Frigibax2(),
  new Gimmighoul(),
  new Gimmighoul2(),
  new GholdengoEx(),
  new IronValiantEx(),
  new JuQianTangLang(),
  new KaBiShouG(),
  new Iono(),
  new Klawf(),
  ...createMiMiQiuVariants(),
  new MiLiLong(),
  new Noibat(),
  new NoivernEx(),
  new ProfessorTurosScenario(),
  new SuperEnergyRetrieval(),
];

export * from './baxcalibur';
export * from './brute-bonnet';
export * from './chien-pao-ex';
export * from './ditto';
export * from './fei-tian-tang-lang';
export * from './frigibax';
export * from './frigibax2';
export * from './iron-valiant-ex';
export * from './klawf';
export * from './mi-mi-qiu';
export * from './mi-li-long';
export * from './noibat';
export * from './noivern-ex';
export * from './ju-qian-tang-lang';
