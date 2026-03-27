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
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/79.png'
  };

  public tags = [CardTag.POKEMON_EX, CardTag.TERA];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 210;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '碧草之舞',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text:
        '在自己的回合可以使用1次。选择自己手牌中的1张「基本【草】能量」，附着于这只宝可梦身上。然后，从自己牌库上方抽取1张卡牌。',
    }
  ];

  public attacks = [
    {
      name: '万叶阵雨',
      cost: [CardType.GRASS, CardType.GRASS, CardType.GRASS],
      damage: '30+',
      text: '追加造成双方战斗宝可梦身上附着的能量数量×30伤害。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '厄诡椪 碧草面具ex';

  public fullName: string = '厄诡椪 碧草面具ex CSV8C';

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
