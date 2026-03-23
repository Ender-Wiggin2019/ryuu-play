import { CardType, EnergyCard } from '@ptcg/common';

export class PsychicEnergy extends EnergyCard {
  public rawData = {
    raw_card: {
      id: 16866,
      name: '基本超能量',
      yorenCode: 'Y461',
      cardType: '3',
      details: {
        regulationMarkText: 'H',
        collectionNumber: 'PSY'
      },
      image: 'img/326/96.png',
      hash: '51609c9bf59d3b28e1bea053ade1b232'
    },
    collection: {
      id: 326,
      commodityCode: 'CSVSC',
      name: '对战学院',
      salesDate: '2026-01-16'
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/326/96.png'
  };

  public provides: CardType[] = [CardType.PSYCHIC];

  public set: string = 'set_h';

  public name: string = 'Psychic Energy';

  public fullName: string = 'Psychic Energy CSVSC';
}
