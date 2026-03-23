import {
  CardTag,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  ShuffleDeckPrompt,
  State,
  StoreLike,
  TrainerCard,
  TrainerType,
  UseTrainerInPlayEffect,
} from '@ptcg/common';

const VSTAR_POWER_USED_MARKER = 'VSTAR_POWER_USED_MARKER';

export class ForestSealStone extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 16952,
      name: '森林封印石',
      yorenCode: 'Y1172',
      cardType: '2',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '022/033',
      },
      image: 'img\\330\\21.png',
      hash: '089ac17e579a802dd9ed8401cfe90cb6',
    },
    collection: {
      id: 330,
      name: '大师战略卡组构筑套装 喷火龙ex',
      commodityCode: 'CSVM1aC',
      salesDate: '2026-01-16',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/330/21.png',
  };

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'set_f';

  public name: string = 'Forest Seal Stone';

  public fullName: string = 'Forest Seal Stone CSVM1aC';

  public text: string =
    'The Pokemon V this card is attached to can use the VSTAR Power on this card. ' +
    'Star Alchemy: During your turn, you may search your deck for a card and put it into your hand. Then, shuffle your deck. ' +
    '(You can\'t use more than 1 VSTAR Power in a game.)';

  public useWhenInPlay = true;

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseTrainerInPlayEffect && effect.trainerCard === this) {
      const player = effect.player;
      const pokemonCard = effect.target.getPokemonCard();

      if (!pokemonCard || !pokemonCard.tags.includes(CardTag.POKEMON_V)) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(VSTAR_POWER_USED_MARKER)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      let selectedCards = [];
      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_HAND,
          player.deck,
          {},
          { min: 1, max: 1, allowCancel: false }
        ),
        cards => {
          selectedCards = cards || [];
          player.deck.moveCardsTo(selectedCards, player.hand);
          player.marker.addMarker(VSTAR_POWER_USED_MARKER, this);

          store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
            player.deck.applyOrder(order);
          });
        }
      );
    }

    return state;
  }
}
