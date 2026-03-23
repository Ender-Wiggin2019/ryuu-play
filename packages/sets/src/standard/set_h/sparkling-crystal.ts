import {
  CardTag,
  CardType,
  CheckAttackCostEffect,
  Effect,
  State,
  StoreLike,
  TrainerCard,
  TrainerType,
} from '@ptcg/common';

export class SparklingCrystal extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 17563,
      name: '璀璨结晶',
      yorenCode: 'Y1475',
      cardType: '2',
      specialCard: '9',
      nameSamePokemonId: 2944,
      commodityCode: 'CSV8C',
      details: {
        id: 17563,
        cardName: '璀璨结晶',
        regulationMarkText: 'H',
        collectionNumber: '186/207',
        commodityCode: 'CSV8C',
        rarity: '22',
        rarityText: 'ACE',
        yorenCode: 'Y1475',
        cardType: '2',
        cardTypeText: '训练家',
        ruleText:
          '身上放有这张卡牌的「太晶」宝可梦使用招式时，使用那个招式所需能量，减少1个。（减少的可以是任意属性的能量。）|在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。',
        illustratorName: ['Toyste Beach'],
        commodityList: [
          {
            commodityName: '补充包 璀璨诡幻',
            commodityCode: 'CSV8C',
          },
        ],
        trainerType: '4',
        trainerTypeText: '宝可梦道具',
        collectionFlag: 0,
        specialCard: '9',
        special_shiny_type: 0,
      },
      image: 'img/458/501.png',
      hash: '3287766f29cd42d9038d36a15b52e77a',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13',
      series: '3',
      seriesText: '朱&紫',
      goodsType: '1',
      linkType: 0,
      image: 'img/458/cover.png',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/458/501.png',
  };

  public trainerType: TrainerType = TrainerType.TOOL;

  public tags = [CardTag.ACE_SPEC];

  public set: string = 'set_h';

  public name: string = 'Sparkling Crystal';

  public fullName: string = 'Sparkling Crystal CSV8C';

  public text: string =
    'The attacks of the Tera Pokemon this card is attached to cost 1 less Energy. ' +
    '(The Energy can be of any type.)';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckAttackCostEffect && effect.player.active.trainers.cards.includes(this)) {
      const pokemonCard = effect.player.active.getPokemonCard();
      if (!pokemonCard || !pokemonCard.tags.includes(CardTag.TERA) || effect.cost.length === 0) {
        return state;
      }

      const nonColorlessIndex = effect.cost.findIndex(type => type !== CardType.COLORLESS);
      const removeIndex = nonColorlessIndex >= 0 ? nonColorlessIndex : 0;
      effect.cost.splice(removeIndex, 1);
    }

    return state;
  }
}
