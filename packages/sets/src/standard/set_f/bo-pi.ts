import {
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  EnergyCard,
  PlayerType,
  PokemonSlot,
  SlotType,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function toTarget(player: any, slot: PokemonSlot) {
  const benchIndex = player.bench.indexOf(slot);
  if (slot === player.active) {
    return { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 };
  }
  return { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: benchIndex };
}

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  const candidates: PokemonSlot[] = [];
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (pokemonSlot, _card, target) => {
    if (pokemonSlot.energies.cards.length > 0) {
      candidates.push(pokemonSlot);
    }
  });

  if (candidates.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let sourceTargets: PokemonSlot[] = [];
  const sourceBlocked = player.bench
    .map((slot, index) => ({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index }))
    .filter(target => player.bench[target.index].energies.cards.length === 0);
  if (player.active.energies.cards.length === 0) {
    sourceBlocked.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 });
  }

  if (player.active.energies.cards.length === 0 && player.bench.every(slot => slot.energies.cards.length === 0)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let sourceSlot: PokemonSlot | undefined;
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: false, blocked: sourceBlocked }
    ),
    results => {
      sourceTargets = results || [];
      sourceSlot = sourceTargets[0];
      next();
    }
  );

  if (sourceSlot === undefined || sourceSlot.energies.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const sourceTarget = toTarget(player, sourceSlot);
  const destinationBlocked = [sourceTarget];

  let destinationSlot: PokemonSlot[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: false, blocked: destinationBlocked }
    ),
    results => {
      destinationSlot = results || [];
      next();
    }
  );

  if (destinationSlot.length === 0 || destinationSlot[0] === sourceSlot) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const maxTransfer = Math.min(2, sourceSlot.energies.cards.length);
  let selected: EnergyCard[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_ATTACH,
      sourceSlot.energies,
      {},
      { min: 1, max: maxTransfer, allowCancel: false }
    ),
    cards => {
      selected = (cards || []) as EnergyCard[];
      next();
    }
  );

  if (selected.length > 0) {
    sourceSlot.energies.moveCardsTo(selected, destinationSlot[0].energies);
  }

  return state;
}

export class BoPi extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public rawData = {
    raw_card: {
      id: 14816,
      name: '波琵',
      yorenCode: 'Y1353',
      cardType: '2',
      commodityCode: 'CSV5C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '159/129',
        rarityLabel: 'SAR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/388.png',
      ruleLines: [
        '选择自己场上1只宝可梦身上附着的最多2个能量，转附于自己的1只其他宝可梦身上。',
        '在自己的回合只可以使用1张支援者卡。'
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Ryota Murayama'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 298,
      commodityCode: 'CSV5C',
      name: '补充包 黑晶炽诚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/388.png',
  };

  public set: string = 'set_g';

  public name: string = '波琵';

  public fullName: string = '波琵 159/129#14816';

  public text: string = '选择自己场上1只宝可梦身上附着的最多2个能量，转附于自己的1只其他宝可梦身上。\n在自己的回合只可以使用1张支援者卡。';

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
