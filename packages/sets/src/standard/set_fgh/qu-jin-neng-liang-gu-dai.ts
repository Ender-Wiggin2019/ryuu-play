import {
  AddSpecialConditionsEffect,
  AttachEnergyEffect,
  CardType,
  CheckHpEffect,
  CheckProvidedEnergyEffect,
  CheckTableStateEffect,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  State,
  StoreLike,
} from '@ptcg/common';

function isAncientPokemon(card: PokemonCard | undefined): boolean {
  if (card === undefined) {
    return false;
  }

  const rawData = card as any;
  const labels = [
    rawData.rawData?.raw_card?.details?.specialCardLabel,
    rawData.rawData?.api_card?.specialCardLabel,
  ];

  return labels.some((label: unknown) => label === '古代');
}

export class QuJinNengLiangGuDai extends EnergyCard {
  public provides: CardType[] = [];

  public energyType = EnergyType.SPECIAL;

  public set: string = 'set_g';

  public name = '驱劲能量 古代';

  public fullName = '驱劲能量 古代 CSV6C';

  public text =
    '只要这张卡牌，附着于「古代」宝可梦身上，这张卡牌就提供1个【无】能量，并且这只宝可梦的最大HP「+60」，且不会受到特殊状态的影响。' +
    '将这张卡牌附着于「古代」宝可梦以外的宝可梦身上时，将这张卡牌舍弃。';

  public rawData = {
    raw_card: {
      id: 15970,
      name: '驱劲能量 古代',
      yorenCode: 'Y1373',
      cardType: '3',
      commodityCode: 'CSV6C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '118/128',
        rarityLabel: 'U★★★',
        cardTypeLabel: '能量',
        trainerTypeLabel: null,
        specialCardLabel: '古代',
        attributeLabel: null,
        energyTypeLabel: '特殊能量',
        pokemonTypeLabel: null,
        hp: null,
        evolveText: null,
        weakness: null,
        resistance: null,
        retreatCost: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/327.png',
      ruleLines: [
        '身上放有这张卡牌的「古代」宝可梦，最大HP「+60」，那只宝可梦，不会陷入特殊状态，已经处于的特殊状态，也全部恢复。',
        '将这张卡牌附着于「古代」宝可梦以外的宝可梦身上时，将这张卡牌舍弃。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['5ban Graphics'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 311,
      commodityCode: 'CSV6C',
      name: '补充包 真实玄虚',
      commodityNames: ['补充包 真实玄虚'],
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/327.png',
  };

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttachEnergyEffect && effect.energyCard === this) {
      if (!isAncientPokemon(effect.target.getPokemonCard())) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      effect.target.specialConditions = [];
      effect.target.poisonDamage = 10;
      effect.target.burnDamage = 20;
      return state;
    }

    if (effect instanceof CheckProvidedEnergyEffect && effect.source.energies.cards.includes(this)) {
      if (!isAncientPokemon(effect.source.getPokemonCard())) {
        return state;
      }

      effect.energyMap.forEach(item => {
        if (item.card === this) {
          item.provides = [CardType.COLORLESS];
        }
      });
      return state;
    }

    if (effect instanceof CheckHpEffect && effect.target.energies.cards.includes(this)) {
      if (!isAncientPokemon(effect.target.getPokemonCard())) {
        return state;
      }

      effect.hp += 60;
      return state;
    }

    if (effect instanceof AddSpecialConditionsEffect && effect.target.energies.cards.includes(this)) {
      if (!isAncientPokemon(effect.target.getPokemonCard())) {
        return state;
      }

      effect.preventDefault = true;
      return state;
    }

    if (effect instanceof CheckTableStateEffect) {
      state.players.forEach(player => {
        player.forEachPokemon(PlayerType.BOTTOM_PLAYER, pokemonSlot => {
          if (!pokemonSlot.energies.cards.includes(this)) {
            return;
          }

          if (!isAncientPokemon(pokemonSlot.getPokemonCard())) {
            pokemonSlot.moveCardTo(this, player.discard);
          }
        });
      });
    }

    return state;
  }
}
