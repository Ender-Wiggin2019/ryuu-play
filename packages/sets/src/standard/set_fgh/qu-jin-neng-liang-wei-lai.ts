import {
  AttachEnergyEffect,
  CardType,
  CheckProvidedEnergyEffect,
  CheckRetreatCostEffect,
  CheckTableStateEffect,
  DealDamageEffect,
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

function isFuturePokemon(card: PokemonCard | undefined): boolean {
  if (card === undefined) {
    return false;
  }

  const rawData = card as any;
  const labels = [
    rawData.rawData?.raw_card?.details?.specialCardLabel,
    rawData.rawData?.api_card?.specialCardLabel,
  ];

  return labels.some((label: unknown) => label === '未来');
}

export class QuJinNengLiangWeiLai extends EnergyCard {
  public provides: CardType[] = [];

  public energyType = EnergyType.SPECIAL;

  public set: string = 'set_g';

  public name = '驱劲能量 未来';

  public fullName = '驱劲能量 未来 CSV6C';

  public text =
    '只要这张卡牌，附着于「未来」宝可梦身上，这张卡牌就提供1个【无】能量，且这只宝可梦的撤退所需能量全部消除，' +
    '其使用的招式，给对手的战斗宝可梦造成的伤害「+20」。将这张卡牌附着于「未来」宝可梦以外的宝可梦身上时，将这张卡牌舍弃。';

  public rawData = {
    raw_card: {
      id: 15971,
      name: '驱劲能量 未来',
      yorenCode: 'Y1374',
      cardType: '3',
      commodityCode: 'CSV6C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '119/128',
        rarityLabel: 'U★★★',
        cardTypeLabel: '能量',
        trainerTypeLabel: null,
        specialCardLabel: '未来',
        attributeLabel: null,
        energyTypeLabel: '特殊能量',
        pokemonTypeLabel: null,
        hp: null,
        evolveText: null,
        weakness: null,
        resistance: null,
        retreatCost: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/330.png',
      ruleLines: [
        '身上放有这张卡牌的「未来」宝可梦，【撤退】所需能量全部消除，所使用的招式，给对手的战斗宝可梦造成的伤害「+20」。',
        '将这张卡牌附着于「未来」宝可梦以外的宝可梦身上时，将这张卡牌舍弃。',
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
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/330.png',
  };

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttachEnergyEffect && effect.energyCard === this) {
      if (!isFuturePokemon(effect.target.getPokemonCard())) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      return state;
    }

    if (effect instanceof CheckProvidedEnergyEffect && effect.source.energies.cards.includes(this)) {
      if (!isFuturePokemon(effect.source.getPokemonCard())) {
        return state;
      }

      effect.energyMap.forEach(item => {
        if (item.card === this) {
          item.provides = [CardType.COLORLESS];
        }
      });
      return state;
    }

    if (effect instanceof CheckRetreatCostEffect && effect.player.active.energies.cards.includes(this)) {
      if (!isFuturePokemon(effect.player.active.getPokemonCard())) {
        return state;
      }

      effect.cost = [];
      return state;
    }

    if (effect instanceof DealDamageEffect && effect.source.energies.cards.includes(this)) {
      if (!isFuturePokemon(effect.source.getPokemonCard()) || effect.damage <= 0) {
        return state;
      }

      effect.damage += 20;
      return state;
    }

    if (effect instanceof CheckTableStateEffect) {
      state.players.forEach(player => {
        player.forEachPokemon(PlayerType.BOTTOM_PLAYER, pokemonSlot => {
          if (!pokemonSlot.energies.cards.includes(this)) {
            return;
          }

          if (!isFuturePokemon(pokemonSlot.getPokemonCard())) {
            pokemonSlot.moveCardTo(this, player.discard);
          }
        });
      });
    }

    return state;
  }
}
