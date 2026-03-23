import { CardType, EnergyCard } from '@ptcg/common';

export class FireEnergy extends EnergyCard {
  public rawData = {
    raw_card: {
      id: 16863,
      name: '基本火能量',
      yorenCode: 'Y458',
      cardType: '3',
      details: {
        regulationMarkText: 'H',
        collectionNumber: 'FIR'
      },
      image: 'img/326/92.png',
      hash: 'f561a352ed1c841a100b3ec2e186c808'
    },
    collection: {
      id: 326,
      commodityCode: 'CSVSC',
      name: '对战学院',
      salesDate: '2026-01-16'
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/326/92.png'
  };

  public provides: CardType[] = [CardType.FIRE];

  public set: string = 'set_h';

  public name: string = 'Fire Energy';

  public fullName: string = 'Fire Energy CSVSC';
}
