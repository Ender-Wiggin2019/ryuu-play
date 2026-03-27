import {
  AttackEffect,
  Card,
  CardTag,
  CardType,
  CheckProvidedEnergyEffect,
  ChooseCardsPrompt,
  ChooseEnergyPrompt,
  ChoosePokemonPrompt,
  DealDamageEffect,
  DiscardCardsEffect,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  PutDamageEffect,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function* useHiddenCards(
  next: Function,
  store: StoreLike,
  state: State,
  self: GuangHuiJiaHeRenWa,
  effect: PowerEffect
): IterableIterator<State> {
  const player = effect.player;

  if (player.marker.hasMarker(self.CONCEALED_CARDS_MARKER, self)) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  const hasEnergyInHand = player.hand.cards.some(card => card.superType === SuperType.ENERGY);
  if (!hasEnergyInHand) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      player.hand,
      { superType: SuperType.ENERGY },
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  player.hand.moveCardsTo(selected, player.discard);
  player.deck.moveTo(player.hand, Math.min(2, player.deck.cards.length));
  player.marker.addMarker(self.CONCEALED_CARDS_MARKER, self);
  return state;
}

function* useMoonlightShuriken(
  next: Function,
  store: StoreLike,
  state: State,
  self: GuangHuiJiaHeRenWa,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;

  const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
  store.reduceEffect(state, checkProvidedEnergy);

  const chosenCount = Math.min(2, player.active.energies.cards.length);
  if (chosenCount < 2) {
    throw new GameError(GameMessage.CANNOT_USE_ATTACK);
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseEnergyPrompt(
      player.id,
      GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
      checkProvidedEnergy.energyMap,
      [CardType.COLORLESS, CardType.COLORLESS],
      { allowCancel: false }
    ),
    cards => {
      selected = (cards || []).map(item => item.card);
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  const discardEffect = new DiscardCardsEffect(effect, selected);
  discardEffect.target = player.active;
  store.reduceEffect(state, discardEffect);

  const opponent = effect.opponent;
  const availableTargets = 1 + opponent.bench.filter(b => b.pokemons.cards.length > 0).length;
  const targetCount = Math.min(2, availableTargets);
  let targets: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
      PlayerType.TOP_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { min: targetCount, max: targetCount, allowCancel: false }
    ),
    result => {
      targets = result || [];
      next();
    }
  );

  if (targets.length === 0) {
    return state;
  }

  targets.forEach(target => {
    if (target === opponent.active) {
      store.reduceEffect(state, new DealDamageEffect(effect, 90));
      return;
    }
    store.reduceEffect(state, new PutDamageEffect(effect, 90));
  });

  return state;
}

export class GuangHuiJiaHeRenWa extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10954,
      yorenCode: 'Y1160',
      cardType: '1',
      pokemonType: '7',
      nameSamePokemonId: 2480,
      details: {
        id: 10954,
        evolveText: '基础',
        cardName: '光辉甲贺忍蛙',
        regulationMarkText: 'F',
        collectionNumber: '020/072',
        rarity: '16',
        rarityText: 'K',
        hp: 130,
        attribute: '3',
        yorenCode: 'Y1160',
        cardType: '1',
        cardTypeText: '宝可梦',
        featureFlag: '1',
        cardFeatureItemList: [
          {
            featureName: '隐藏牌',
            featureDesc: '在自己的回合，如果将自己手牌中的1张能量放于弃牌区的话，则可使用1次。从自己牌库上方抽取2张卡牌。',
          },
        ],
        abilityItemList: [
          {
            abilityName: '月光手里剑',
            abilityText:
              '将附着于这只宝可梦身上的2个能量放于弃牌区，给对手的2只宝可梦，各造成90点伤害。[备战宝可梦不计算弱点、抗性。]',
            abilityCost: '3,3,11',
            abilityDamage: 'none',
          },
        ],
        ruleText: '1副卡组中只能放入1张光辉宝可梦卡。',
        pokemonCategory: '忍者宝可梦',
        weaknessType: '4',
        weaknessFormula: '×2',
        retreatCost: 1,
        pokedexCode: '658',
        pokedexText: '像忍者般神出鬼没。以敏捷的动作玩弄对手，再用水之手里剑将对方劈开。',
        height: 1.5,
        weight: 40.0,
        illustratorName: ['Souichirou Gunjima'],
        commodityList: [
          {
            commodityName: '强化包 胜象星引',
            commodityCode: 'CS6.5C',
          },
        ],
        pokemonType: '7',
        collectionFlag: 0,
        special_shiny_type: 0,
      },
      name: '光辉甲贺忍蛙',
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/33.png',
      hash: 'dc7b16b0287a06904797fd6e4dd7f48f',
    },
    collection: {
      id: 222,
      commodityCode: 'CS6.5C',
      name: '强化包 胜象星引',
      salesDate: '2024-11-15',
      series: '2',
      seriesText: '剑&盾',
      goodsType: '1',
      linkType: 0,
      image: 'img/222/cover.png',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/33.png',
  };

  public tags = [CardTag.RADIANT];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 130;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '隐藏牌',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合，如果将自己手牌中的1张能量放于弃牌区的话，则可使用1次。从自己牌库上方抽取2张卡牌。',
    },
  ];

  public attacks = [
    {
      name: '月光手里剑',
      cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS],
      damage: '',
      text: '将附着于这只宝可梦身上的2个能量放于弃牌区，给对手的2只宝可梦，各造成90点伤害。[备战宝可梦不计算弱点、抗性。]',
    },
  ];

  public set: string = 'set_f';

  public name: string = '光辉甲贺忍蛙';

  public fullName: string = '光辉甲贺忍蛙 CS6.5C';

  public readonly CONCEALED_CARDS_MARKER = 'CONCEALED_CARDS_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useHiddenCards(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useMoonlightShuriken(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.CONCEALED_CARDS_MARKER, this);
    }

    return state;
  }
}
