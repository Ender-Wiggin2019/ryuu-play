import {
  CardTag,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  GamePhase,
  KnockOutEffect,
  ShuffleDeckPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

export class UnfairStamp extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 17550,
      name: '不公印章',
      yorenCode: 'Y1462',
      cardType: '2',
      specialCard: '9',
      nameSamePokemonId: 2931,
      commodityCode: 'CSV8C',
      details: {
        id: 17550,
        cardName: '不公印章',
        regulationMarkText: 'H',
        collectionNumber: '173/207',
        commodityCode: 'CSV8C',
        rarity: '22',
        rarityText: 'ACE',
        yorenCode: 'Y1462',
        cardType: '2',
        cardTypeText: '训练家',
        ruleText:
          '这张卡牌，只有在上一个对手的回合，自己的宝可梦【昏厥】时才可使用。\n\n双方玩家，各将所有手牌放回牌库并重洗牌库。然后，自己从牌库上方抽取5张卡牌，对手从牌库上方抽取2张卡牌。|在自己的回合可以使用任意张物品卡。',
        illustratorName: ['Toyste Beach'],
        commodityList: [
          {
            commodityName: '补充包 璀璨诡幻',
            commodityCode: 'CSV8C',
          },
        ],
        trainerType: '1',
        trainerTypeText: '物品',
        collectionFlag: 0,
        specialCard: '9',
        special_shiny_type: 0,
      },
      image: 'img/458/472.png',
      hash: '3f443bee524a495f85728eb769fdccc7',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13',
      series: '3',
      seriesText: '朱&紫',
      goodsType: '1',
      linkType: 0,
      image: 'img/458/cover.png',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/458/472.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [CardTag.ACE_SPEC];

  public set: string = 'set_h';

  public name: string = 'Unfair Stamp';

  public fullName: string = 'Unfair Stamp CSV8C';

  public text: string =
    'You can use this card only if any of your Pokemon were Knocked Out during your opponent\'s last turn. ' +
    'Each player shuffles their hand into their deck. Then, you draw 5 cards, and your opponent draws 2 cards.';

  public readonly KNOCKED_OUT_LAST_TURN_MARKER = 'UNFAIR_STAMP_KNOCKED_OUT_LAST_TURN_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (!player.marker.hasMarker(this.KNOCKED_OUT_LAST_TURN_MARKER, this)) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      const playerCards = player.hand.cards.filter(card => card !== this);
      const opponentCards = opponent.hand.cards.slice();

      player.hand.moveCardsTo(playerCards, player.deck);
      opponent.hand.moveCardsTo(opponentCards, opponent.deck);

      return store.prompt(
        state,
        [new ShuffleDeckPrompt(player.id), new ShuffleDeckPrompt(opponent.id)],
        order => {
          player.deck.applyOrder(order[0]);
          opponent.deck.applyOrder(order[1]);
          player.deck.moveTo(player.hand, Math.min(5, player.deck.cards.length));
          opponent.deck.moveTo(opponent.hand, Math.min(2, opponent.deck.cards.length));
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
      effect.player.marker.removeMarker(this.KNOCKED_OUT_LAST_TURN_MARKER, this);
      return state;
    }

    return state;
  }
}
