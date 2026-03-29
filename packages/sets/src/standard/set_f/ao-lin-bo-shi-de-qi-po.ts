import {
  AttachEnergyPrompt,
  Card,
  CardTarget,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  PlayerType,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';
import { isAncientPokemonCard } from '../../common/utils/special-card-label';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_g',
  name: '奥琳博士的气魄',
  fullName: '奥琳博士的气魄 238/SV-P#17375',
  text: '选择自己最多2只「古代」宝可梦，各附着1张弃牌区中的基本能量。然后，从自己牌库上方抽取3张卡牌。\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 17375,
      name: '奥琳博士的气魄',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '238/SV-P',
        rarityLabel: '无标记',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/454/6.png',
      ruleLines: [
        '选择自己最多2只「古代」宝可梦，各附着1张弃牌区中的基本能量。然后，从自己牌库上方抽取3张卡牌。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/454/6.png',
  },
};

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  const energyCount = player.discard.cards.filter(
    card => card instanceof EnergyCard && card.energyType === EnergyType.BASIC
  ).length;

  const blockedTo: CardTarget[] = [];
  let ancientTargets = 0;
  if (player.active.pokemons.cards.length === 0) {
    blockedTo.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 });
  }
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (_slot, pokemon, target) => {
    if (isAncientPokemonCard(pokemon)) {
      ancientTargets += 1;
      return;
    }
    blockedTo.push(target);
  });

  if (energyCount === 0 || ancientTargets === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let transfers: { to: CardTarget; card: Card }[] = [];
  yield store.prompt(
    state,
    new AttachEnergyPrompt(
      player.id,
      GameMessage.ATTACH_ENERGY_TO_ACTIVE,
      player.discard,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
      { allowCancel: true, min: 0, max: Math.min(2, energyCount, ancientTargets), blockedTo, sameTarget: false, differentTargets: true }
    ),
    result => {
      transfers = (result || []).slice(0, Math.min(2, energyCount, ancientTargets));
      next();
    }
  );

  for (const transfer of transfers) {
    const target = StateUtils.getTarget(state, player, transfer.to);
    player.discard.moveCardTo(transfer.card, target.energies);
  }

  const drawCount = Math.min(3, player.deck.cards.length);
  player.deck.moveTo(player.hand, drawCount);
  return state;
}

export class AoLinBoShiDeQiPo extends VariantTrainerCard {
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
