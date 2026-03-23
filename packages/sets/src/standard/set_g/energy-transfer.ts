import {
  CardTransfer,
  Effect,
  EnergyType,
  GameError,
  GameMessage,
  MoveEnergyPrompt,
  PlayerType,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  self: EnergyTransfer,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  let hasBasicEnergy = false;
  let pokemonCount = 0;

  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, pokemonSlot => {
    pokemonCount += 1;
    const basicEnergyAttached = pokemonSlot.energies.cards.some(card => card.energyType === EnergyType.BASIC);
    hasBasicEnergy = hasBasicEnergy || basicEnergyAttached;
  });

  if (!hasBasicEnergy || pokemonCount <= 1) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;

  let transfers: CardTransfer[] = [];
  yield store.prompt(
    state,
    new MoveEnergyPrompt(
      player.id,
      GameMessage.MOVE_ENERGY_CARDS,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { energyType: EnergyType.BASIC },
      { min: 1, max: 1, allowCancel: true }
    ),
    result => {
      transfers = result || [];
      next();
    }
  );

  if (transfers.length === 0) {
    return state;
  }

  player.hand.moveCardTo(self, player.discard);

  transfers.forEach(transfer => {
    const source = StateUtils.getTarget(state, player, transfer.from);
    const target = StateUtils.getTarget(state, player, transfer.to);
    source.moveCardTo(transfer.card, target.energies);
  });

  return state;
}

export class EnergyTransfer extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 12572,
      yorenCode: 'Y193',
      name: '能量转移',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '106/177',
      },
      image: 'img\\251\\72.png',
      hash: '5e7b7a9804cb48b380461a9112b95256',
    },
    collection: {
      id: 251,
      name: '对战派对 共梦 上',
      commodityCode: 'CSVE1C1',
      salesDate: '2025-02-28',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/251/72.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'set_g';

  public name: string = 'Energy Switch';

  public fullName: string = 'Energy Switch CSVE1C1';

  public text: string = 'Move a basic Energy from 1 of your Pokemon to another of your Pokemon.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
