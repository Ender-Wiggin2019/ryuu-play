import {
  AttackEffect,
  CardTag,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class HearthflameMaskOgerponEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17420,
      name: '厄诡椪 火灶面具ex',
      yorenCode: 'Y1444',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '043/207',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: '太晶',
        hp: 210,
        evolveText: '基础',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/120.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 302,
          name: '愤怒火灶',
          text: '造成这只宝可梦身上放置的伤害指示物数量×20伤害。',
          cost: ['火', '无色', '无色'],
          damage: '20×',
        },
        {
          id: 303,
          name: '强劲烈焰',
          text: '如果对手的战斗宝可梦为进化宝可梦的话，则追加造成140伤害。在这种情况下，将这只宝可梦身上附着的能量，全部放于弃牌区。',
          cost: ['火', '火', '火'],
          damage: '140+',
        },
      ],
      features: [],
      illustratorNames: ['Yano Keiji'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/120.png',
  };

  public tags = [CardTag.POKEMON_EX, CardTag.TERA];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 210;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '愤怒火灶',
      cost: [CardType.FIRE, CardType.COLORLESS, CardType.COLORLESS],
      damage: '20×',
      text: '造成这只宝可梦身上放置的伤害指示物数量×20伤害。',
    },
    {
      name: '强劲烈焰',
      cost: [CardType.FIRE, CardType.FIRE, CardType.FIRE],
      damage: '140+',
      text: '如果对手的战斗宝可梦为进化宝可梦的话，则追加造成140伤害。在这种情况下，将这只宝可梦身上附着的能量，全部放于弃牌区。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '厄诡椪 火灶面具ex';

  public fullName: string = '厄诡椪 火灶面具ex CSV8C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = Math.floor(effect.player.active.damage / 10) * 20;
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage = 140;

      const defendingPokemon = effect.opponent.active.getPokemonCard();
      if (defendingPokemon !== undefined && defendingPokemon.stage !== Stage.BASIC) {
        effect.damage += 140;
        effect.player.active.energies.moveTo(effect.player.discard);
      }

      return state;
    }

    return state;
  }
}
