import {
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameMessage,
  PlayerType,
  PokemonSlot,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const moveTargets: { slot: PokemonSlot }[] = [];
  opponent.forEachPokemon(PlayerType.TOP_PLAYER, (pokemonSlot) => {
    const specialEnergies = pokemonSlot.energies.cards.filter(card => card.superType === SuperType.ENERGY && card.energyType === EnergyType.SPECIAL);
    if (specialEnergies.length > 0) {
      moveTargets.push({ slot: pokemonSlot });
    }
  });

  if (moveTargets.length === 0) {
    return state;
  }

  for (const target of moveTargets) {
    let selected: EnergyCard[] = [];
    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DISCARD,
        target.slot.energies,
        { superType: SuperType.ENERGY, energyType: EnergyType.SPECIAL },
        { min: 1, max: 1, allowCancel: false }
      ),
      cards => {
        selected = (cards || []) as EnergyCard[];
        next();
      }
    );

    if (selected.length > 0) {
      target.slot.energies.moveCardsTo(selected, opponent.discard);
    }
  }

  return state;
}

export class PiNa extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public rawData = {
    raw_card: {
      id: 13324,
      name: '皮拿',
      yorenCode: 'Y1296',
      cardType: '2',
      commodityCode: 'CSV3C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '161/130',
        rarityLabel: 'SAR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/392.png',
      ruleLines: [
        '选择对手所有宝可梦身上附着的特殊能量各1个，放于弃牌区。',
        '在自己的回合只可以使用1张支援者卡。'
      ],
      attacks: [],
      features: [],
      illustratorNames: ['KIYOTAKA OSHIYAMA'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 270,
      commodityCode: 'CSV3C',
      name: '补充包 无畏太晶',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/392.png',
  };

  public set: string = 'set_g';

  public name: string = '皮拿';

  public fullName: string = '皮拿 161/130#13324';

  public text: string = '选择对手所有宝可梦身上附着的特殊能量各1个，放于弃牌区。\n在自己的回合只可以使用1张支援者卡。';

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
