import { CardType, EnergyCard } from '@ptcg/common';

export class FightingEnergy extends EnergyCard {
  public rawData = {
    raw_card: {
      id: 16867,
      name: '基本斗能量',
      yorenCode: 'Y462',
      cardType: '3',
      details: {
        regulationMarkText: 'H',
        collectionNumber: 'FIG'
      },
      image: 'img/326/91.png',
      hash: 'e28006a34d97f64933169cf28feef01a'
    },
    collection: {
      id: 326,
      commodityCode: 'CSVSC',
      name: '对战学院',
      salesDate: '2026-01-16'
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/326/91.png'
  };

  public provides: CardType[] = [CardType.FIGHTING];

  public set: string = 'set_h';

  public name: string = 'Fighting Energy';

  public fullName: string = 'Fighting Energy CSVSC';
}
