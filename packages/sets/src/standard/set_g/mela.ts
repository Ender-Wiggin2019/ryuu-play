import {
  AttachEnergyPrompt,
  CardType,
  Effect,
  EndTurnEffect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  GamePhase,
  KnockOutEffect,
  PlayerType,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

export class Mela extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 15227,
      name: '梅洛可',
      yorenCode: 'Y1354',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '060/064',
      },
      image: 'img\\296\\171.png',
      hash: '7504a7af47e9e6d53a9efc76ab471cb0',
    },
    collection: {
      id: 296,
      name: '嗨皮卡组 七夕青鸟&拉帝欧斯&烈焰猴&一家鼠',
      commodityCode: 'CSVH3C',
      salesDate: '2025-09-12',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/296/171.png',
  };

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_g';

  public name: string = 'Mela';

  public fullName: string = 'Mela CSVH3C';

  public text: string =
    'You can use this card only if any of your Pokemon were Knocked Out during your opponent\'s last turn. ' +
    'Attach a Basic Fire Energy card from your discard pile to 1 of your Pokemon. ' +
    'If you do, draw cards until you have 6 cards in your hand.';

  public readonly KNOCKED_OUT_LAST_TURN_MARKER = 'MELA_KNOCKED_OUT_LAST_TURN_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      const fireBasicEnergyInDiscard = player.discard.cards.filter(
        card => card instanceof EnergyCard
          && card.energyType === EnergyType.BASIC
          && card.provides.includes(CardType.FIRE)
      );

      if (!player.marker.hasMarker(this.KNOCKED_OUT_LAST_TURN_MARKER) || fireBasicEnergyInDiscard.length === 0) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      effect.preventDefault = true;
      return store.prompt(
        state,
        new AttachEnergyPrompt(
          player.id,
          GameMessage.ATTACH_ENERGY_CARDS,
          player.discard,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.FIRE] },
          { min: 1, max: 1, allowCancel: false }
        ),
        transfers => {
          const transfer = (transfers || [])[0];
          if (transfer) {
            const target = StateUtils.getTarget(state, player, transfer.to);
            player.discard.moveCardTo(transfer.card, target.energies);
          }

          player.hand.moveCardTo(this, player.supporter);
          const cardsToDraw = Math.max(0, 6 - player.hand.cards.length);
          if (cardsToDraw > 0) {
            player.deck.moveTo(player.hand, cardsToDraw);
          }
        }
      );
    }

    if (effect instanceof KnockOutEffect) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const duringTurn = [GamePhase.PLAYER_TURN, GamePhase.ATTACK].includes(state.phase);

      if (!duringTurn || state.players[state.activePlayer] !== opponent) {
        return state;
      }

      const cardList = StateUtils.findCardList(state, this);
      const owner = StateUtils.findOwner(state, cardList);
      if (owner === player) {
        effect.player.marker.addMarker(this.KNOCKED_OUT_LAST_TURN_MARKER, this);
      }
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.KNOCKED_OUT_LAST_TURN_MARKER);
      return state;
    }

    return state;
  }
}
