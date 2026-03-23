import { CardType, EnergyCard } from '@ptcg/common';

export class DarknessEnergy extends EnergyCard {
  public rawData = {
    raw_card: {
      id: 16868,
      name: '基本恶能量',
      yorenCode: 'Y463',
      cardType: '3',
      details: {
        regulationMarkText: 'H',
        collectionNumber: 'DAR'
      },
      image: 'img/326/90.png',
      hash: '25877681b31f8debb7a41826bb6252b1'
    },
    collection: {
      id: 326,
      commodityCode: 'CSVSC',
      name: '对战学院',
      salesDate: '2026-01-16'
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/326/90.png'
  };

  public provides: CardType[] = [CardType.DARK];

  public set: string = 'set_h';

  public name: string = 'Darkness Energy';

  public fullName: string = 'Darkness Energy CSVSC';
}
