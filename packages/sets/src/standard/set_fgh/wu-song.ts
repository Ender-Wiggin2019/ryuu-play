import {
  CoinFlipPrompt,
  Effect,
  GameError,
  GameMessage,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_h',
  name: '悟松',
  fullName: '悟松 229/204#16395',
  text: '双方玩家，各将自己所有的手牌反面朝上重洗，放回牌库下方。然后，双方玩家各抛掷1次硬币，如果为正面则从牌库上方抽取6张卡牌，如果为反面，则抽取3张卡牌。\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 16395,
      name: '悟松',
      cardType: '2',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '229/204',
        rarityLabel: 'SR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        attributeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: null,
        evolveText: null,
        weakness: null,
        resistance: null,
        retreatCost: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/574.png',
      ruleLines: [
        '双方玩家，各将自己所有的手牌反面朝上重洗，放回牌库下方。然后，双方玩家各抛掷1次硬币，如果为正面则从牌库上方抽取6张卡牌，如果为反面，则抽取3张卡牌。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/574.png',
  },
};

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = state.players.find(p => p.id !== player.id);
  if (opponent === undefined) {
    throw new GameError(GameMessage.INVALID_GAME_STATE);
  }

  player.hand.moveToBottom(player.deck);
  opponent.hand.moveToBottom(opponent.deck);

  let playerFlip = false;
  let opponentFlip = false;
  yield store.prompt(
    state,
    [new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), new CoinFlipPrompt(opponent.id, GameMessage.COIN_FLIP)],
    result => {
      playerFlip = result[0];
      opponentFlip = result[1];
      next();
    }
  );

  player.deck.moveTo(player.hand, Math.min(playerFlip ? 6 : 3, player.deck.cards.length));
  opponent.deck.moveTo(opponent.hand, Math.min(opponentFlip ? 6 : 3, opponent.deck.cards.length));
  return state;
}

export class WuSong extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
