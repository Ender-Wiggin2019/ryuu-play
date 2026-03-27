import {
  AttackEffect,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  Stage,
  State,
  StoreLike,
  SuperType,
  TrainerCard,
  TrainerType,
} from '@ptcg/common';

export class RotomV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10957,
      name: '洛托姆V',
      yorenCode: 'Y1161',
      cardType: '1',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '023/072',
      },
      image: 'img/222/38.png',
      hash: '8b928fefda813ee544e7366d0d65bea2',
    },
    collection: {
      id: 222,
      commodityCode: 'CS6.5C',
      name: '强化包 胜象星引',
      salesDate: '2024-11-15',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/38.png',
  };

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 190;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: 'Instant Charge',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: 'Once during your turn, you may draw 3 cards. If you use this Ability, your turn ends.',
    },
  ];

  public attacks = [
    {
      name: 'Scrap Short',
      cost: [CardType.LIGHTNING, CardType.COLORLESS],
      damage: '40+',
      text:
        'You may put any number of Pokemon Tool cards from your discard pile into the Lost Zone. ' +
        'This attack does 40 more damage for each card you put in the Lost Zone in this way.',
    },
  ];

  public set: string = 'SSH';

  public name: string = 'Rotom V';

  public fullName: string = 'Rotom V LOR';

  public readonly INSTANT_CHARGE_MARKER = 'INSTANT_CHARGE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.marker.hasMarker(this.INSTANT_CHARGE_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      player.deck.moveTo(player.hand, Math.min(3, player.deck.cards.length));
      player.marker.addMarker(this.INSTANT_CHARGE_MARKER, this);
      store.reduceEffect(state, new EndTurnEffect(player));
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const maxCards = player.discard.cards.filter(
        card => card.superType === SuperType.TRAINER && card instanceof TrainerCard && card.trainerType === TrainerType.TOOL
      ).length;

      if (maxCards === 0) {
        return state;
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_DISCARD,
          player.discard,
          { superType: SuperType.TRAINER, trainerType: TrainerType.TOOL },
          { min: 0, max: maxCards, allowCancel: false }
        ),
        selected => {
          const cards = selected || [];
          player.discard.toLostZone(cards);
          effect.damage += cards.length * 40;
        }
      );
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.INSTANT_CHARGE_MARKER, this);
      return state;
    }

    return state;
  }
}
