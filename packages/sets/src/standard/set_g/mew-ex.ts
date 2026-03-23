import {
  Attack,
  AttackEffect,
  CardTag,
  CardType,
  ChooseAttackPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  UseAttackEffect,
} from '@ptcg/common';

export class MewEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 14076,
      name: '梦幻ex',
      yorenCode: 'Y1191',
      cardType: '1',
      pokemonType: '11',
      commodityCode: 'PROMO21',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '003/SV-P',
        rarity: 'promo',
        rarityText: 'PROMO',
      },
      image: 'img/212/2.png',
      hash: '2755c50f2d33d1b648f0aca3de695b25',
    },
    collection: {
      id: 212,
      commodityCode: 'PROMO21',
      name: '特典卡 朱&紫',
      salesDate: '2025-01-17',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/212/2.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 180;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public powers = [
    {
      name: 'Restart',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: 'Once during your turn, you may draw cards until you have 3 cards in your hand.',
    },
  ];

  public attacks = [
    {
      name: 'Genome Hacking',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '',
      text: "Choose 1 of your opponent's Active Pokemon's attacks and use it as this attack.",
    },
  ];

  public set: string = 'set_g';

  public name: string = 'Mew ex';

  public fullName: string = 'Mew ex PROMO21';

  public readonly RESTART_MARKER = 'RESTART_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.marker.hasMarker(this.RESTART_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const cardsToDraw = Math.min(3 - player.hand.cards.length, player.deck.cards.length);
      if (cardsToDraw <= 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      player.deck.moveTo(player.hand, cardsToDraw);
      player.marker.addMarker(this.RESTART_MARKER, this);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const opponentActive = opponent.active.getPokemonCard();

      if (opponentActive === undefined || opponentActive.attacks.length === 0) {
        return state;
      }

      return store.prompt(
        state,
        new ChooseAttackPrompt(player.id, GameMessage.CHOOSE_ATTACK_TO_COPY, [opponentActive], {
          allowCancel: false,
        }),
        result => {
          if (result !== null) {
            const attack = result as Attack;
            const useAttackEffect = new UseAttackEffect(player, attack);
            store.reduceEffect(state, useAttackEffect);
          }
        }
      );
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.RESTART_MARKER, this);
      return state;
    }

    return state;
  }
}
