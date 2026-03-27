import {
  ChoosePokemonPrompt,
  Effect,
  GameMessage,
  PlayerType,
  SlotType,
  State,
  StoreLike,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

export class ProfessorTurosScenario extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 15712,
      yorenCode: 'Y1378',
      name: '弗图博士的剧本',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '125/128'
      },
      image: 'img\\311\\346.png',
      hash: '1d5043e30d4223a1c46f2a7d62bc0642'
    },
    collection: {
      id: 311,
      name: '补充包 真实玄虚',
      commodityCode: 'CSV6C',
      salesDate: '2025-11-07'
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/346.png'
  };

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_g';

  public name: string = 'Professor Turo\'s Scenario';

  public fullName: string = 'Professor Turo\'s Scenario CSV6C';

  public text: string =
    'Put 1 of your Pokemon into your hand. (Discard all cards attached to that Pokemon.)';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_PICK_UP,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { allowCancel: false }
        ),
        result => {
          const cardList = result.length > 0 ? result[0] : null;
          if (cardList !== null) {
            const pokemons = cardList.getPokemons();
            cardList.moveCardsTo(pokemons, player.hand);
            cardList.moveTo(player.discard);
            cardList.clearEffects();
          }
        }
      );
    }

    return state;
  }
}
