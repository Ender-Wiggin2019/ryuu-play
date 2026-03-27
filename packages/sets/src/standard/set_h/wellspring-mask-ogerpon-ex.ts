import {
  AttackEffect,
  Card,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  ConfirmPrompt,
  Effect,
  EnergyCard,
  GameMessage,
  PlayerType,
  PokemonSlot,
  PokemonCard,
  PutDamageEffect,
  ShuffleDeckPrompt,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

import { commonAttacks } from '../../common';

function* useTorrentialPump(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (player.active.energies.cards.length < 3) {
    return state;
  }

  let wantToUse = false;
  yield store.prompt(state, new ConfirmPrompt(player.id, GameMessage.WANT_TO_USE_ABILITY), result => {
    wantToUse = result;
    next();
  });

  if (!wantToUse) {
    return state;
  }

  let cards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DECK,
      player.active.energies,
      { superType: SuperType.ENERGY },
      { min: 3, max: 3, allowCancel: false }
    ),
    selected => {
      cards = selected || [];
      next();
    }
  );

  if (cards.length !== 3) {
    return state;
  }

  player.active.energies.moveCardsTo(cards as EnergyCard[], player.deck);

  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });

  const hasBenched = opponent.bench.some(slot => slot.pokemons.cards.length > 0);
  if (!hasBenched) {
    return state;
  }

  let targets: PokemonSlot[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
      PlayerType.TOP_PLAYER,
      [SlotType.BENCH],
      { allowCancel: false }
    ),
    results => {
      targets = results || [];
      next();
    }
  );

  if (targets.length > 0) {
    const damageEffect = new PutDamageEffect(effect, 120);
    damageEffect.target = targets[0];
    store.reduceEffect(state, damageEffect);
  }

  return state;
}

export class WellspringMaskOgerponEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17444,
      name: '厄诡椪 水井面具ex',
      yorenCode: 'Y1449',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '067/207'
      },
      image: 'img/458/182.png',
      hash: '1360b48940756dc08758a4f8c225e967'
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13'
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/182.png'
  };

  public tags = [CardTag.POKEMON_EX, CardTag.TERA];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 210;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '啜泣',
      cost: [CardType.COLORLESS],
      damage: '20',
      text: '在下一个对手的回合，受到这个招式影响的宝可梦，无法撤退。',
    },
    {
      name: '激流水泵',
      cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
      damage: '100',
      text:
        '若希望，可选择这只宝可梦身上附着的3个能量，放回牌库并重洗牌库。在这种情况下，给对手的1只备战宝可梦，也造成120伤害。[备战宝可梦不计算弱点、抗性。]',
    },
  ];

  public set: string = 'set_h';

  public name: string = '厄诡椪 水井面具ex';

  public fullName: string = '厄诡椪 水井面具ex CSV8C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    const cantRetreat = commonAttacks.cantRetreat(this, store, state, effect);

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      return cantRetreat.use(effect);
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useTorrentialPump(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
