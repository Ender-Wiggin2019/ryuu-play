import {
  AttachEnergyEffect,
  AttackEffect,
  CardTag,
  CardType,
  CheckProvidedEnergyEffect,
  ChooseCardsPrompt,
  Effect,
  EndTurnEffect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class TealMaskOgerponEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17405,
      name: '厄诡椪 碧草面具ex',
      yorenCode: 'Y1442',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '028/207'
      },
      image: 'img/458/79.png',
      hash: 'c8a138ab056301cbeb9b0dbf3ecc67d6'
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13'
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/458/79.png'
  };

  public tags = [CardTag.POKEMON_EX, CardTag.TERA];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 210;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: 'Teal Dance',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text:
        'Once during your turn, you may attach a Basic G Energy card from your hand to this Pokemon. ' +
        'If you attached Energy to a Pokemon in this way, draw a card.',
    }
  ];

  public attacks = [
    {
      name: 'Myriad Leaf Shower',
      cost: [CardType.GRASS, CardType.GRASS, CardType.COLORLESS],
      damage: '30+',
      text: 'This attack does 30 more damage for each Energy attached to both Active Pokemon.',
    },
  ];

  public set: string = 'set_h';

  public name: string = 'Teal Mask Ogerpon ex';

  public fullName: string = 'Teal Mask Ogerpon ex CSV8C';

  public readonly TEAL_DANCE_MARKER = 'TEAL_DANCE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (pokemonSlot === undefined) {
        return state;
      }

      if (player.marker.hasMarker(this.TEAL_DANCE_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const hasGrassEnergyInHand = player.hand.cards.some(c => {
        return c instanceof EnergyCard && c.energyType === EnergyType.BASIC && c.provides.includes(CardType.GRASS);
      });

      if (!hasGrassEnergyInHand) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const blocked: number[] = [];
      player.hand.cards.forEach((card, index) => {
        const isBasicGrassEnergy =
          card instanceof EnergyCard && card.energyType === EnergyType.BASIC && card.provides.includes(CardType.GRASS);
        if (!isBasicGrassEnergy) {
          blocked.push(index);
        }
      });

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.ATTACH_ENERGY_CARDS,
          player.hand,
          {},
          { allowCancel: true, min: 1, max: 1, blocked }
        ),
        selected => {
          const cards = selected || [];
          if (cards.length === 0) {
            return;
          }

          const energyCard = cards[0] as EnergyCard;
          const attachEnergyEffect = new AttachEnergyEffect(player, energyCard, pokemonSlot);
          store.reduceEffect(state, attachEnergyEffect);

          if (player.deck.cards.length > 0) {
            player.deck.moveTo(player.hand, 1);
          }
          player.marker.addMarker(this.TEAL_DANCE_MARKER, this);
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const playerProvidedEnergy = new CheckProvidedEnergyEffect(player);
      store.reduceEffect(state, playerProvidedEnergy);
      const playerEnergyCount = playerProvidedEnergy.energyMap.reduce((total, item) => {
        return total + item.provides.length;
      }, 0);

      const opponentProvidedEnergy = new CheckProvidedEnergyEffect(opponent);
      store.reduceEffect(state, opponentProvidedEnergy);
      const opponentEnergyCount = opponentProvidedEnergy.energyMap.reduce((total, item) => {
        return total + item.provides.length;
      }, 0);

      effect.damage += (playerEnergyCount + opponentEnergyCount) * 30;
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.TEAL_DANCE_MARKER, this);
      return state;
    }

    return state;
  }
}
