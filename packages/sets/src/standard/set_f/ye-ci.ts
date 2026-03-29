import {
  AttachEnergyPrompt,
  Card,
  CardTarget,
  Effect,
  EnergyCard,
  EnergyType,
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

const defaultSeed: VariantTrainerSeed = {
  set: 'set_g',
  name: '也慈',
  fullName: '也慈 157/128#15744',
  text: '在使用这张卡牌的回合结束前，自己所有的宝可梦，无法使用招式。（也包括新出场的宝可梦。）\n选择自己牌库中最多2张基本能量，附着于自己的1只宝可梦身上。并重洗牌库。\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 15744,
      name: '也慈',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '157/128',
        rarityLabel: 'SAR',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/386.png',
      ruleLines: [
        '在使用这张卡牌的回合结束前，自己所有的宝可梦，无法使用招式。（也包括新出场的宝可梦。）',
        '选择自己牌库中最多2张基本能量，附着于自己的1只宝可梦身上。并重洗牌库。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/386.png',
  },
};

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  const energyCount = player.discard.cards.filter(
    card => card instanceof EnergyCard && card.energyType === EnergyType.BASIC
  ).length;
  const hasTarget = player.active.pokemons.cards.length > 0 || player.bench.some(slot => slot.pokemons.cards.length > 0);
  if (energyCount > 0 && hasTarget) {
    const blockedTo: CardTarget[] = [];
    if (player.active.pokemons.cards.length === 0) {
      blockedTo.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 });
    }
    player.bench.forEach((bench, index) => {
      if (bench.pokemons.cards.length === 0) {
        blockedTo.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index });
      }
    });

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
        { allowCancel: true, min: 0, max: Math.min(2, energyCount), blockedTo, sameTarget: true }
      ),
      result => {
        transfers = result || [];
        next();
      }
    );

    for (const transfer of transfers) {
      const target = StateUtils.getTarget(state, player, transfer.to);
      player.discard.moveCardTo(transfer.card, target.energies);
    }
  }

  const drawCount = Math.min(3, player.deck.cards.length);
  player.deck.moveTo(player.hand, drawCount);
  return state;
}

export class YeCi extends VariantTrainerCard {
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
