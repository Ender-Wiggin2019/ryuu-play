import {
  CardTarget,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  SlotType,
  Stage,
  State,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_f',
  name: '捩木',
  fullName: '捩木 189/207#15577',
  text: '选择自己弃牌区中的1张【基础】宝可梦，与自己场上的1只【基础】宝可梦互换（继承所有放于其身上的卡牌、伤害指示物、特殊状态、效果等等）。将被互换的宝可梦放于弃牌区。\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 15577,
      name: '捩木',
      cardType: '2',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '189/207',
        rarityLabel: 'U',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        attributeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: null,
        evolveText: null,
        weakness: null,
        resistance: null,
        retreatCost: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/194.png',
      ruleLines: [
        '选择自己弃牌区中的1张【基础】宝可梦，与自己场上的1只【基础】宝可梦互换（继承所有放于其身上的卡牌、伤害指示物、特殊状态、效果等等）。将被互换的宝可梦放于弃牌区。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/194.png',
  },
};

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  const discardBlocked: number[] = [];
  let hasDiscardBasic = false;
  player.discard.cards.forEach((card, index) => {
    if (!(card instanceof PokemonCard) || card.stage !== Stage.BASIC) {
      discardBlocked.push(index);
    } else {
      hasDiscardBasic = true;
    }
  });

  const playBlocked: CardTarget[] = [];
  let hasPlayBasic = false;
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (slot, pokemon, target) => {
    if (pokemon.stage !== Stage.BASIC) {
      playBlocked.push(target);
      return;
    }
    hasPlayBasic = true;
  });

  if (!hasDiscardBasic || !hasPlayBasic) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selectedDiscard: PokemonCard[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.discard,
      { superType: SuperType.POKEMON, stage: Stage.BASIC },
      { min: 1, max: 1, allowCancel: false, blocked: discardBlocked }
    ),
    cards => {
      selectedDiscard = (cards || []).filter((card): card is PokemonCard => card instanceof PokemonCard && card.stage === Stage.BASIC);
      next();
    }
  );

  if (selectedDiscard.length === 0) {
    return state;
  }

  let targetSlots: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_SWITCH,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: false, blocked: playBlocked }
    ),
    result => {
      targetSlots = result || [];
      next();
    }
  );

  if (targetSlots.length === 0) {
    return state;
  }

  const target = targetSlots[0];
  const currentPokemon = target.getPokemonCard();
  if (currentPokemon === undefined) {
    return state;
  }

  target.pokemons.moveCardTo(currentPokemon, player.discard);
  player.discard.moveCardTo(selectedDiscard[0], target.pokemons);
  return state;
}

export class NieMu extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
