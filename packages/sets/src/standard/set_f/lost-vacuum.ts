import {
  Card,
  CardList,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
  SelectPrompt,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  TrainerCard,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  self: LostVacuum,
  effect: Effect
): IterableIterator<State> {
  const trainerEffect = effect as any;
  const player = trainerEffect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const handChoices = player.hand.cards.filter((card: Card) => card !== self);
  const hasStadium = player.stadium.cards.length > 0 || opponent.stadium.cards.length > 0;

  const toolTargets: any[] = [];
  state.players.forEach(p => {
    p.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList: any, _card: Card, target: any) => {
      if (cardList.getTools().length > 0) {
        toolTargets.push(target);
      }
    });
  });

  if (handChoices.length === 0 || (!hasStadium && toolTargets.length === 0)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  trainerEffect.preventDefault = true;

  const handTemp = new CardList();
  handTemp.cards = handChoices;

  let discarded: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      handTemp,
      {},
      { min: 1, max: 1, allowCancel: true }
    ),
    cards => {
      discarded = cards || [];
      next();
    }
  );

  if (discarded.length === 0) {
    return state;
  }

  player.hand.moveCardTo(self, player.discard);
  player.hand.moveCardsTo(discarded, player.lostzone);

  let choice = 0;
  const options: string[] = [];
  if (toolTargets.length > 0) {
    options.push('TOOL');
  }
  if (hasStadium) {
    options.push('STADIUM');
  }

  if (options.length > 1) {
    yield store.prompt(state, new SelectPrompt(player.id, GameMessage.CHOOSE_OPTION, ['宝可梦道具', '竞技场'], { allowCancel: false }), result => {
      choice = result ?? 0;
      next();
    });
  }

  const picked = options[Math.min(choice, options.length - 1)];
  if (picked === 'STADIUM') {
    const stadiumOwner = player.stadium.cards.length > 0 ? player : opponent;
    stadiumOwner.stadium.moveTo(stadiumOwner.lostzone);
    return state;
  }

  let targets: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_DISCARD_CARDS,
      PlayerType.ANY,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: false }
    ),
    result => {
      targets = result || [];
      next();
    }
  );

  if (targets.length === 0 || targets[0].trainers.cards.length === 0) {
    return state;
  }

  const tool = targets[0].trainers.cards.find((card: Card) => card instanceof TrainerCard && (card as TrainerCard).trainerType === TrainerType.TOOL);
  if (tool !== undefined) {
    targets[0].trainers.moveCardTo(tool, StateUtils.findOwner(state, targets[0]).lostzone);
  }

  return state;
}

export class LostVacuum extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if ((effect as any).trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }
    return state;
  }
}
