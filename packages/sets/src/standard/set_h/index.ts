import { Card } from '@ptcg/common';
import { Arbok } from './arbok';
import { AmoongussEx } from './amoonguss-ex';
import { Ariados } from './ariados';
import { Absol } from './absol';
import { BlackKyuremEx } from './black-kyurem-ex';
import { IronCrownEx } from './iron-crown-ex';
import { IronLeaves } from './iron-leaves';
import { IronThornsEx } from './iron-thorns-ex';
import { DragapultEx } from './dragapult-ex';
import { Drakloak } from './drakloak';
import { Dreepy } from './dreepy';
import { Dusclops } from './dusclops';
import { Dusknoir } from './dusknoir';
import { Duskull } from './duskull';
import { Ekans } from './ekans';
import { FezandipitiEx } from './fezandipiti-ex';
import { Foongus } from './foongus';
import { HuoKongLong } from './huo-kong-long';
import { KaBiShouH } from './ka-bi-shou-h';
import { CornerstoneMaskOgerponEx } from './cornerstone-mask-ogerpon-ex';
import { createChouChouYuVariants } from './chou-chou-yu';
import { HearthflameMaskOgerponEx } from './hearthflame-mask-ogerpon-ex';
import { createHongLeiJinGangXingVariants } from './hong-lei-jin-gang-xing';
import { IronBundle } from './iron-bundle';
import { Ledyba } from './ledyba';
import { Ledian } from './ledian';
import { Lechonk } from './lechonk';
import { jiaHeRenWaExTeraVariants } from './jia-he-ren-wa-ex-tera';
import { createMeiNaSiExVariants } from './mei-na-si-ex';
import { miLiLongDragonVariants } from './mi-li-long-dragon';
import { Miraidon } from './miraidon';
import { PenHuoLongEx } from './pen-huo-long-ex';
import { createPoKongYanExVariants } from './po-kong-yan-ex';
import { QiLinQi } from './qi-lin-qi';
import { QiLinQiEx } from './qi-lin-qi-ex';
import { SandyShocks } from './sandy-shocks';
import { ShaTiePi } from './sha-tie-pi';
import { RagingBolt } from './raging-bolt';
import { RagingBoltEx } from './raging-bolt-ex';
import { ShuangFuZhanLong } from './shuang-fu-zhan-long';
import { simpleHCards } from './simple-generated';
import { TealMaskOgerponEx } from './teal-mask-ogerpon-ex';
import { Timburr } from './timburr';
import { tuLongDiDiVariants } from './tu-long-di-di';
import { TyranitarEx } from './tyranitar-ex';
import { Venipede } from './venipede';
import { WellspringMaskOgerponEx } from './wellspring-mask-ogerpon-ex';
import { XiaoHuoLong } from './xiao-huo-long';
import { XueTongZi } from './xue-tong-zi';
import { XueYaoNv } from './xue-yao-nv';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type VariantPokemonLike = Card & {
  name: string;
  fullName: string;
  rawData: {
    raw_card: {
      id: number;
      commodityCode?: string;
      details: {
        collectionNumber: string;
        rarityLabel?: string;
      };
      image?: string;
      illustratorNames?: string[];
    };
    image_url?: string;
  };
};

type PokemonVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  illustratorNames?: string[];
};

function seedPokemonVariant<T extends VariantPokemonLike>(instance: T, options: PokemonVariantSeed): T {
  instance.rawData = {
    ...instance.rawData,
    raw_card: {
      ...instance.rawData.raw_card,
      id: options.id,
      image: getCardImageUrl(options.id),
      ...(options.illustratorNames ? { illustratorNames: options.illustratorNames } : {}),
      details: {
        ...instance.rawData.raw_card.details,
        collectionNumber: options.collectionNumber,
        rarityLabel: options.rarityLabel,
      },
    },
    image_url: getR2CardImageUrl(options.id),
  };
  instance.fullName = `${instance.name} ${instance.rawData.raw_card.commodityCode || 'CSV8C'} ${options.collectionNumber}#${options.id}`;
  return instance;
}

function seedPokemonVariants<T extends VariantPokemonLike>(factory: () => T, variants: PokemonVariantSeed[]): T[] {
  return variants.map(variant => seedPokemonVariant(factory(), variant));
}

export const setH: Card[] = [
  ...simpleHCards,
  new Absol(),
  ...seedPokemonVariants(() => new Absol(), [
    { id: 17755, collectionNumber: '127/207', rarityLabel: 'C★' },
    { id: 17931, collectionNumber: '127/207', rarityLabel: 'C★★' },
  ]),
  new Arbok(),
  ...seedPokemonVariants(() => new Arbok(), [
    { id: 16544, collectionNumber: '136/204', rarityLabel: 'C☆★' },
    { id: 16717, collectionNumber: '136/204', rarityLabel: 'C★★★' },
  ]),
  new AmoongussEx(),
  new Ariados(),
  ...seedPokemonVariants(() => new Ariados(), [
    { id: 16431, collectionNumber: '006/204', rarityLabel: 'U☆★' },
    { id: 16604, collectionNumber: '006/204', rarityLabel: 'U★★★' },
  ]),
  new BlackKyuremEx(),
  ...seedPokemonVariants(() => new BlackKyuremEx(), [
    { id: 17435, collectionNumber: '058/207', rarityLabel: 'RR' },
  ]),
  new Dreepy(),
  ...seedPokemonVariants(() => new Dreepy(), [
    { id: 17779, collectionNumber: '157/207', rarityLabel: 'C★' },
    { id: 17955, collectionNumber: '157/207', rarityLabel: 'C★★' },
  ]),
  new Drakloak(),
  ...seedPokemonVariants(() => new Drakloak(), [
    { id: 17780, collectionNumber: '158/207', rarityLabel: 'C★' },
    { id: 17956, collectionNumber: '158/207', rarityLabel: 'C★★' },
  ]),
  new DragapultEx(),
  ...seedPokemonVariants(() => new DragapultEx(), [
    { id: 17606, collectionNumber: '229/207', rarityLabel: 'SR' },
  ]),
  new Duskull(),
  ...seedPokemonVariants(() => new Duskull(), [
    { id: 17712, collectionNumber: '081/207', rarityLabel: 'C★' },
    { id: 17888, collectionNumber: '081/207', rarityLabel: 'C★★' },
  ]),
  new Dusclops(),
  ...seedPokemonVariants(() => new Dusclops(), [
    { id: 17713, collectionNumber: '082/207', rarityLabel: 'C★' },
    { id: 17889, collectionNumber: '082/207', rarityLabel: 'C★★' },
  ]),
  new Dusknoir(),
  ...seedPokemonVariants(() => new Dusknoir(), [
    { id: 17714, collectionNumber: '083/207', rarityLabel: 'R★' },
    { id: 17890, collectionNumber: '083/207', rarityLabel: 'R★★' },
  ]),
  new Ekans(),
  ...seedPokemonVariants(() => new Ekans(), [
    { id: 16543, collectionNumber: '135/204', rarityLabel: 'C☆★' },
    { id: 16716, collectionNumber: '135/204', rarityLabel: 'C★★★' },
  ]),
  new FezandipitiEx(),
  seedPokemonVariant(new FezandipitiEx(), {
    id: 17603,
    collectionNumber: '226/207',
    rarityLabel: 'SR',
    illustratorNames: ['5ban Graphics'],
  }),
  seedPokemonVariant(new FezandipitiEx(), {
    id: 17626,
    collectionNumber: '249/207',
    rarityLabel: 'SAR',
    illustratorNames: ['kantaro'],
  }),
  new Foongus(),
  ...seedPokemonVariants(() => new Foongus(), [
    { id: 17648, collectionNumber: '007/207', rarityLabel: 'C★' },
    { id: 17824, collectionNumber: '007/207', rarityLabel: 'C★★' },
  ]),
  new HuoKongLong(),
  new KaBiShouH(),
  ...miLiLongDragonVariants,
  new Ledyba(),
  ...seedPokemonVariants(() => new Ledyba(), [
    { id: 17644, collectionNumber: '003/207', rarityLabel: 'C★' },
    { id: 17820, collectionNumber: '003/207', rarityLabel: 'C★★' },
  ]),
  new Ledian(),
  ...seedPokemonVariants(() => new Ledian(), [
    { id: 17645, collectionNumber: '004/207', rarityLabel: 'R★' },
    { id: 17821, collectionNumber: '004/207', rarityLabel: 'R★★' },
  ]),
  new Lechonk(),
  ...jiaHeRenWaExTeraVariants,
  new Miraidon(),
  new PenHuoLongEx(),
  new RagingBolt(),
  new RagingBoltEx(),
  ...seedPokemonVariants(() => new RagingBoltEx(), [
    { id: 16393, collectionNumber: '227/204', rarityLabel: 'SR' },
    { id: 16410, collectionNumber: '244/204', rarityLabel: 'SAR' },
    { id: 16422, collectionNumber: '256/204', rarityLabel: 'UR' },
  ]),
  new IronLeaves(),
  new SandyShocks(),
  new ShaTiePi(),
  new QiLinQi(),
  new QiLinQiEx(),
  new ShuangFuZhanLong(),
  new IronCrownEx(),
  new IronThornsEx(),
  new HearthflameMaskOgerponEx(),
  ...seedPokemonVariants(() => new HearthflameMaskOgerponEx(), [
    { id: 17592, collectionNumber: '215/207', rarityLabel: 'SR' },
    { id: 17620, collectionNumber: '243/207', rarityLabel: 'SAR' },
  ]),
  new IronBundle(),
  new TealMaskOgerponEx(),
  ...seedPokemonVariants(() => new TealMaskOgerponEx(), [
    { id: 17591, collectionNumber: '214/207', rarityLabel: 'SR' },
    { id: 17619, collectionNumber: '242/207', rarityLabel: 'SAR' },
    { id: 17633, collectionNumber: '256/207', rarityLabel: 'UR' },
  ]),
  new CornerstoneMaskOgerponEx(),
  ...seedPokemonVariants(() => new CornerstoneMaskOgerponEx(), [
    { id: 17600, collectionNumber: '223/207', rarityLabel: 'SR' },
    { id: 17623, collectionNumber: '246/207', rarityLabel: 'SAR' },
  ]),
  ...createChouChouYuVariants(),
  ...createMeiNaSiExVariants(),
  ...createPoKongYanExVariants(),
  ...createHongLeiJinGangXingVariants(),
  new Timburr(),
  ...seedPokemonVariants(() => new Timburr(), [
    { id: 17739, collectionNumber: '110/207', rarityLabel: 'C★' },
    { id: 17915, collectionNumber: '110/207', rarityLabel: 'C★★' },
  ]),
  ...tuLongDiDiVariants,
  new TyranitarEx(),
  new Venipede(),
  ...seedPokemonVariants(() => new Venipede(), [
    { id: 17756, collectionNumber: '128/207', rarityLabel: 'C★' },
    { id: 17932, collectionNumber: '128/207', rarityLabel: 'C★★' },
  ]),
  new WellspringMaskOgerponEx(),
  ...seedPokemonVariants(() => new WellspringMaskOgerponEx(), [
    { id: 17597, collectionNumber: '220/207', rarityLabel: 'SR' },
    { id: 17622, collectionNumber: '245/207', rarityLabel: 'SAR' },
  ]),
  new XiaoHuoLong(),
  new XueTongZi(),
  ...seedPokemonVariants(() => new XueTongZi(), [
    { id: 16476, collectionNumber: '057/204', rarityLabel: 'C☆★' },
    { id: 16649, collectionNumber: '057/204', rarityLabel: 'C★★★' },
  ]),
  new XueYaoNv(),
  ...seedPokemonVariants(() => new XueYaoNv(), [
    { id: 17148, collectionNumber: '12 01/07', rarityLabel: '●' },
    { id: 17149, collectionNumber: '12 02/07', rarityLabel: '●' },
    { id: 17150, collectionNumber: '12 03/07', rarityLabel: '◆' },
    { id: 17151, collectionNumber: '12 04/07', rarityLabel: '◆' },
    { id: 17152, collectionNumber: '12 05/07', rarityLabel: '★' },
    { id: 17153, collectionNumber: '12 06/07', rarityLabel: '★★' },
    { id: 17154, collectionNumber: '12 07/07', rarityLabel: '★★★' },
    { id: 16478, collectionNumber: '059/204', rarityLabel: 'R☆★' },
    { id: 16651, collectionNumber: '059/204', rarityLabel: 'R★★★' },
  ]),
];
