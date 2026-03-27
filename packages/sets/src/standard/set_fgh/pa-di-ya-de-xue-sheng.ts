import {
  Card,
  CardTag,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  TrainerCard,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  State,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_g',
  name: '帕底亚的学生',
  fullName: '帕底亚的学生 210/SV-P#17276',
  text: '选择自己牌库中的1张宝可梦（除「拥有规则的宝可梦」外），在给对手看过之后，加入手牌。并重洗牌库。可加入手牌的宝可梦的张数，会增加与自己弃牌区中「帕底亚的学生」（除这张卡牌外）张数相同的张数。\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 17276,
      name: '帕底亚的学生',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '210/SV-P',
        rarityLabel: '无标记',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/456/9.png',
      ruleLines: [
        '选择自己牌库中的1张宝可梦（除「拥有规则的宝可梦」外），在给对手看过之后，加入手牌。并重洗牌库。可加入手牌的宝可梦的张数，会增加与自己弃牌区中「帕底亚的学生」（除这张卡牌外）张数相同的张数。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/456/9.png',
  },
};

function isRuleBoxPokemon(card: Card): boolean {
  if (!(card instanceof PokemonCard)) {
    return false;
  }
  if (card.tags.includes(CardTag.POKEMON_EX)
    || card.tags.includes(CardTag.POKEMON_V)
    || card.tags.includes(CardTag.POKEMON_VSTAR)
    || card.tags.includes(CardTag.POKEMON_LV_X)
    || card.tags.includes(CardTag.RADIANT)
    || card.tags.includes(CardTag.POKEMON_SP)
    || card.tags.includes(CardTag.POKEMON_GX)) {
    return true;
  }

  const rawData = card as any;
  const labels = [
    rawData.rawData?.raw_card?.details?.pokemonTypeLabel,
    rawData.rawData?.api_card?.pokemonTypeLabel,
  ];
  return labels.some((label: unknown) => typeof label === 'string' && (
    label.includes('宝可梦ex')
    || label.includes('宝可梦VSTAR')
    || label.includes('宝可梦VMAX')
    || label.includes('光辉宝可梦')
    || label.includes('宝可梦V')
    || label.includes('宝可梦GX')
    || label.includes('宝可梦SP')
  ));
}

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = state.players.find(p => p.id !== player.id);
  if (opponent === undefined) {
    throw new GameError(GameMessage.INVALID_GAME_STATE);
  }

  const supporterCopies = player.discard.cards.filter(card =>
    card instanceof TrainerCard
    && card.trainerType === TrainerType.SUPPORTER
    && (card as any).name === '帕底亚的学生'
  ).length;

  const maxSearch = 1 + supporterCopies;
  const blocked: number[] = [];
  let eligible = 0;

  player.deck.cards.forEach((card, index) => {
    if (card instanceof PokemonCard && !isRuleBoxPokemon(card)) {
      eligible += 1;
      return;
    }
    blocked.push(index);
  });

  if (eligible === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const selectedCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      { superType: SuperType.POKEMON },
      { min: 1, max: Math.min(maxSearch, eligible), allowCancel: false, blocked }
    ),
    cards => {
      selectedCards.push(...(cards || []));
      next();
    }
  );

  if (selectedCards.length === 0) {
    return state;
  }

  player.deck.moveCardsTo(selectedCards, player.hand);
  yield store.prompt(state, new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selectedCards), () =>
    next()
  );

  if (player.deck.cards.length > 0) {
    return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
      player.deck.applyOrder(order);
    });
  }

  return state;
}

export class PaDiYaDeXueSheng extends VariantTrainerCard {
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
