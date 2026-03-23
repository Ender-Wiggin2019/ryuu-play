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
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/458/182.png'
  };

  public tags = [CardTag.POKEMON_EX, CardTag.TERA];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 210;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Sob',
      cost: [CardType.WATER],
      damage: '20',
      text: 'During your opponent\'s next turn, the Defending Pokemon can\'t retreat.',
    },
    {
      name: 'Torrential Pump',
      cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS],
      damage: '100',
      text:
        'You may shuffle 3 Energy from this Pokemon into your deck. If you do, this attack also does 120 damage ' +
        'to 1 of your opponent\'s Benched Pokemon. (Don\'t apply Weakness and Resistance for Benched Pokemon.)',
    },
  ];

  public set: string = 'set_h';

  public name: string = 'Wellspring Mask Ogerpon ex';

  public fullName: string = 'Wellspring Mask Ogerpon ex CSV8C';

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
