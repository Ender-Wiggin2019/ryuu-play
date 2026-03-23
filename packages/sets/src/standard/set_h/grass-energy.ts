import { CardType, EnergyCard } from '@ptcg/common';

export class GrassEnergy extends EnergyCard {
  public rawData = {
    raw_card: {
      id: 16862,
      name: '基本草能量',
      yorenCode: 'Y457',
      cardType: '3',
      details: {
        regulationMarkText: 'H',
        collectionNumber: 'GRA'
      },
      image: 'img/326/93.png',
      hash: '8c2eb414e99b72e52fa27b443e3bf7aa'
    },
    collection: {
      id: 326,
      commodityCode: 'CSVSC',
      name: '对战学院',
      salesDate: '2026-01-16'
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/326/93.png'
  };

  public provides: CardType[] = [CardType.GRASS];

  public set: string = 'set_h';

  public name: string = 'Grass Energy';

  public fullName: string = 'Grass Energy CSVSC';
}
