import {
  AttackEffect,
  CardTag,
  CardType,
  Effect,
  PlayerType,
  PokemonCard,
  SelectPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class HongMingYueEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 15748,
      name: '轰鸣月ex',
      yorenCode: 'Y1370',
      cardType: '1',
      commodityCode: 'CSV6C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '161/128',
        rarityLabel: 'UR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '恶',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: '古代',
        hp: 230,
        evolveText: '基础',
        weakness: '草 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/390.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 2715,
          name: '发狂深挖',
          text: '令对手的战斗宝可梦【昏厥】。然后，给这只宝可梦造成200伤害。',
          cost: ['DARK', 'DARK', 'COLORLESS'],
          damage: '',
        },
        {
          id: 2716,
          name: '灾厄风暴',
          text: '若希望，可将场上的竞技场放于弃牌区。在这种情况下，追加造成120伤害。',
          cost: ['DARK', 'DARK', 'COLORLESS'],
          damage: '100+',
        },
      ],
      features: [],
    },
    collection: {
      id: 311,
      commodityCode: 'CSV6C',
      name: '补充包 真实玄虚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/390.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.DARK];

  public hp: number = 230;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '发狂深挖',
      cost: [CardType.DARK, CardType.DARK, CardType.COLORLESS],
      damage: '',
      text: '令对手的战斗宝可梦【昏厥】。然后，给这只宝可梦造成200伤害。',
    },
    {
      name: '灾厄风暴',
      cost: [CardType.DARK, CardType.DARK, CardType.COLORLESS],
      damage: '100+',
      text: '若希望，可将场上的竞技场放于弃牌区。在这种情况下，追加造成120伤害。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '轰鸣月ex';

  public fullName: string = '轰鸣月ex 161/128#15748';

  public readonly CHAOTIC_SKY_MARKER = 'CHAOTIC_SKY_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 0;
      effect.opponent.active.damage += effect.opponent.active.hp;
      effect.player.active.damage += 200;
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const stadium = StateUtils.getStadiumCard(state);
      if (stadium === undefined) {
        return state;
      }

      return store.prompt(
        state,
        new SelectPrompt(effect.player.id, '是否弃置场地', ['不弃置', '弃置场地'], { allowCancel: false }),
        choice => {
          if (choice === 1) {
            const stadiumList = StateUtils.findCardList(state, stadium);
            const owner = StateUtils.findOwner(state, stadiumList);
            stadiumList.moveTo(owner.discard);
            effect.damage += 120;
          }
        }
      );
    }

    return state;
  }
}
