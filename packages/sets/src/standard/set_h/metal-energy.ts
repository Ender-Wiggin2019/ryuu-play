import { CardType, EnergyCard } from '@ptcg/common';

export class MetalEnergy extends EnergyCard {
  public rawData = {
    raw_card: {
      id: 16869,
      name: '基本钢能量',
      yorenCode: 'Y464',
      cardType: '3',
      details: {
        regulationMarkText: 'H',
        collectionNumber: 'MET'
      },
      image: 'img/326/95.png',
      hash: 'c21f0054bd1f8cd0380ce75261c32668'
    },
    collection: {
      id: 326,
      commodityCode: 'CSVSC',
      name: '对战学院',
      salesDate: '2026-01-16'
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/326/95.png'
  };

  public provides: CardType[] = [CardType.METAL];

  public set: string = 'set_h';

  public name: string = 'Metal Energy';

  public fullName: string = 'Metal Energy CSVSC';
}
