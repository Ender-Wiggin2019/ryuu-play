import { CardType, EnergyCard } from '@ptcg/common';

export class WaterEnergy extends EnergyCard {
  public rawData = {
    raw_card: {
      id: 16864,
      name: '基本水能量',
      yorenCode: 'Y459',
      cardType: '3',
      details: {
        regulationMarkText: 'H',
        collectionNumber: 'WAT'
      },
      image: 'img/326/97.png',
      hash: 'ad644e1603c90021fd67ab81820b1691'
    },
    collection: {
      id: 326,
      commodityCode: 'CSVSC',
      name: '对战学院',
      salesDate: '2026-01-16'
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/326/97.png'
  };

  public provides: CardType[] = [CardType.WATER];

  public set: string = 'set_h';

  public name: string = 'Water Energy';

  public fullName: string = 'Water Energy CSVSC';
}
