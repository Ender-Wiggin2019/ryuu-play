import { CardType, EnergyCard } from '@ptcg/common';

export class LightningEnergy extends EnergyCard {
  public rawData = {
    raw_card: {
      id: 16865,
      name: '基本雷能量',
      yorenCode: 'Y460',
      cardType: '3',
      details: {
        regulationMarkText: 'H',
        collectionNumber: 'LIG'
      },
      image: 'img/326/94.png',
      hash: '910c698c527c86e6f29ea8191a58109d'
    },
    collection: {
      id: 326,
      commodityCode: 'CSVSC',
      name: '对战学院',
      salesDate: '2026-01-16'
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/326/94.png'
  };

  public provides: CardType[] = [CardType.LIGHTNING];

  public set: string = 'set_h';

  public name: string = 'Lightning Energy';

  public fullName: string = 'Lightning Energy CSVSC';
}
