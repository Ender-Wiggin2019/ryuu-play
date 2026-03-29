import {
  CardTag,
  ChoosePokemonPrompt,
  DealDamageEffect,
  Effect,
  EndTurnEffect,
  GameMessage,
  PlayerType,
  PokemonSlot,
  SelectPrompt,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function isBattlePokemonEXorV(slot: PokemonSlot): boolean {
  const pokemon = slot.getPokemonCard();
  if (pokemon === undefined) {
    return false;
  }

  return pokemon.tags.includes(CardTag.POKEMON_EX) || pokemon.tags.includes(CardTag.POKEMON_V);
}

function* playCard(next: Function, store: StoreLike, state: State, self: WuLi, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const hasBench = player.bench.some(slot => slot.pokemons.cards.length > 0);

  let choice = 0;
  const options = hasBench
    ? ['交换自己的战斗宝可梦', '本回合对战宝可梦【ex】・V伤害+30']
    : ['本回合对战宝可梦【ex】・V伤害+30'];

  if (options.length > 1) {
    yield store.prompt(
      state,
      new SelectPrompt(player.id, GameMessage.CHOOSE_OPTION, options, { allowCancel: false, defaultValue: 0 }),
      result => {
        choice = result ?? 0;
        next();
      }
    );
  }

  if (choice === 0 && hasBench) {
    const blocked = player.bench
      .map((slot, index) => ({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index }))
      .filter(target => player.bench[target.index].pokemons.cards.length === 0);

    let targets: PokemonSlot[] = [];
    yield store.prompt(
      state,
      new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_SWITCH,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false, blocked }
      ),
      result => {
        targets = result || [];
        next();
      }
    );

    if (targets.length > 0) {
      player.switchPokemon(targets[0]);
    }
  } else {
    player.marker.addMarker(self.WU_LI_MARKER, self);
  }

  if (player.hand.cards.includes(effect.trainerCard)) {
    player.hand.moveCardTo(effect.trainerCard, player.discard);
  }

  return state;
}

export class WuLi extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public readonly WU_LI_MARKER = 'WU_LI_MARKER';

  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof DealDamageEffect && effect.player.marker.hasMarker(this.WU_LI_MARKER, this)) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      if (effect.damage > 0 && effect.target === opponent.active && isBattlePokemonEXorV(effect.target)) {
        effect.damage += 30;
      }
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.WU_LI_MARKER, this);
    }

    return state;
  }
}
