import {
  AttachEnergyPrompt,
  CardTarget,
  CardType,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  ShuffleDeckPrompt,
  SlotType,
  SpecialCondition,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_h',
  name: '阿杏的秘招',
  fullName: '阿杏的秘招 233/207#17610',
  text: '选择自己最多2只【恶】宝可梦，各附着1张自己牌库中的「基本【恶】能量」。并重洗牌库。附着于战斗宝可梦身上的情况下，令那只宝可梦陷入【中毒】状态。\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 17610,
      name: '阿杏的秘招',
      yorenCode: 'Y1481',
      cardType: '2',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '233/207',
        rarityLabel: 'SR',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/584.png',
      ruleLines: [
        '选择自己最多2只【恶】宝可梦，各附着1张自己牌库中的「基本【恶】能量」。并重洗牌库。附着于战斗宝可梦身上的情况下，令那只宝可梦陷入【中毒】状态。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Taira Akitsu'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/584.png',
  },
};

function isDarkPokemon(pokemon: PokemonCard): boolean {
  return pokemon.cardTypes.includes(CardType.DARK);
}

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  const energyCount = player.deck.cards.filter(
    card => card instanceof EnergyCard && card.energyType === EnergyType.BASIC && card.provides.includes(CardType.DARK)
  ).length;

  const blockedTo: CardTarget[] = [];
  let hasDarkPokemon = false;
  let darkTargetCount = 0;
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (slot, pokemon, target) => {
    if (isDarkPokemon(pokemon)) {
      hasDarkPokemon = true;
      darkTargetCount += 1;
      return;
    }
    blockedTo.push(target);
  });

  if (!hasDarkPokemon || energyCount === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const max = Math.min(2, energyCount, darkTargetCount);
  if (max === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let transfers: { to: any; card: EnergyCard }[] = [];
  yield store.prompt(
    state,
    new AttachEnergyPrompt(
      player.id,
      GameMessage.ATTACH_ENERGY_TO_ACTIVE,
      player.deck,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.DARK] },
      { allowCancel: true, min: 0, max, blockedTo, sameTarget: false, differentTargets: true }
    ),
    result => {
      transfers = (result || []) as { to: any; card: EnergyCard }[];
      next();
    }
  );

  for (const transfer of transfers) {
    const target = StateUtils.getTarget(state, player, transfer.to);
    player.deck.moveCardTo(transfer.card, target.energies);
    if (target === player.active) {
      target.addSpecialCondition(SpecialCondition.POISONED);
    }
  }

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class AXingDeMiZhao extends VariantTrainerCard {
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
