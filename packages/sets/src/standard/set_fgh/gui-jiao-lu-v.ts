import {
  AttackEffect,
  Card,
  CardList,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  PowerType,
  RetreatEffect,
  Stage,
  State,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function* usePathfinder(
  next: Function,
  store: StoreLike,
  state: State,
  self: GuiJiaoLuV,
  effect: RetreatEffect
): IterableIterator<State> {
  const player = effect.player;
  const targetSlot = player.bench[effect.benchIndex];

  if (targetSlot === undefined || targetSlot.getPokemonCard() !== self) {
    return state;
  }

  const pool = new CardList();
  const sources: { card: Card; list: CardList }[] = [];

  [player.active, ...player.bench].forEach(slot => {
    slot.energies.cards.forEach(card => {
      pool.cards.push(card);
      sources.push({ card, list: slot.energies });
    });
  });

  if (pool.cards.length === 0) {
    return state;
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.MOVE_ENERGY_CARDS,
      pool,
      { superType: SuperType.ENERGY },
      { min: 0, max: pool.cards.length, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  for (const card of selected) {
    const source = sources.find(item => item.card === card);
    if (source !== undefined) {
      source.list.moveCardTo(card, targetSlot.energies);
    }
  }

  return state;
}

export class GuiJiaoLuV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9930,
      name: '诡角鹿V',
      yorenCode: 'Y948',
      cardType: '1',
      commodityCode: 'CS5aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '146/127',
        rarityLabel: 'SR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: '宝可梦V',
        specialCardLabel: null,
        hp: 220,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/183/244.png',
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 9521,
          name: '屏障猛攻',
          text: '造成这只宝可梦身上附有的能量数量×40点伤害。',
          cost: ['COLORLESS', 'COLORLESS', 'COLORLESS'],
          damage: '40×',
        },
      ],
      features: [
        {
          id: 1275,
          name: '拓荒之路',
          text: '在自己的回合，当这只宝可梦从备战区被放入战斗场时，可使用1次。选择任意数量的附着于自己场上宝可梦身上的能量，转附于这只宝可梦身上。',
        },
      ],
      illustratorNames: ['aky CG Works'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: '',
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 183,
      commodityCode: 'CS5aC',
      name: '补充包 勇魅群星 魅',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/183/244.png',
  };

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 220;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '拓荒之路',
      powerType: PowerType.ABILITY,
      text: '在自己的回合，当这只宝可梦从备战区被放入战斗场时，可使用1次。选择任意数量的附着于自己场上宝可梦身上的能量，转附于这只宝可梦身上。',
    },
  ];

  public attacks = [
    {
      name: '屏障猛攻',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '40×',
      text: '造成这只宝可梦身上附有的能量数量×40点伤害。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '诡角鹿V';

  public fullName: string = '诡角鹿V 146/127#9930';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof RetreatEffect) {
      const player = effect.player;
      const targetSlot = player.bench[effect.benchIndex];
      if (targetSlot?.getPokemonCard() === this) {
        const generator = usePathfinder(() => generator.next(), store, state, this, effect);
        return generator.next().value;
      }
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const pokemon = effect.player.active.getPokemonCard();
      if (pokemon === this) {
        effect.damage = effect.player.active.energies.cards.length * 40;
      }
      return state;
    }

    return state;
  }
}
