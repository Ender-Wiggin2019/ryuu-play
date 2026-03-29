import {
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

import { amnesia } from '../../common/attacks/amnesia';

export class RaltsCs65C extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10963,
      name: '拉鲁拉丝',
      yorenCode: 'P280',
      cardType: '1',
      commodityCode: 'CS6.5C',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '029/072',
        rarityLabel: 'C',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 60,
        evolveText: '基础',
        weakness: '钢 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/45.png',
      ruleLines: [],
      attacks: [
        {
          id: 8142,
          name: '记忆跳越',
          text: '选择1个对手战斗宝可梦所拥有的招式。在下一个对手的回合，受到这个招式影响的宝可梦，将无法使用被选择的招式。',
          cost: ['超'],
          damage: '10',
        },
      ],
      features: [],
      illustratorNames: ['Nagomi Nijo'],
      pokemonCategory: '心情宝可梦',
      pokedexCode: '280',
      pokedexText: '能敏锐地捕捉人和宝可梦的感情。感受到敌意后就会躲进暗处。',
      height: 0.4,
      weight: 6.6,
      deckRuleLimit: null,
    },
    collection: {
      id: 222,
      commodityCode: 'CS6.5C',
      name: '强化包 胜象星引',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/45.png',
  };

  public stage: Stage = Stage.BASIC;
  public cardTypes: CardType[] = [CardType.PSYCHIC];
  public hp: number = 60;
  public weakness = [{ type: CardType.METAL }];
  public retreat = [CardType.COLORLESS];
  public attacks = [
    {
      name: '记忆跳越',
      cost: [CardType.PSYCHIC],
      damage: '10',
      text: '选择1个对手战斗宝可梦所拥有的招式。在下一个对手的回合，受到这个招式影响的宝可梦，将无法使用被选择的招式。',
    },
  ];
  public set: string = 'set_f';
  public name: string = '拉鲁拉丝';
  public fullName: string = '拉鲁拉丝 CS6.5C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    const memoryHop = amnesia(this, store, state, effect);

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      return memoryHop.use(effect);
    }

    return state;
  }
}
