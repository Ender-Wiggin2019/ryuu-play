import {
  Card,
  CardTag,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  PokemonSlot,
  ShuffleDeckPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
  TrainerCard,
  TrainerType,
  UseStadiumEffect,
} from '@ptcg/common';

function hasRuleBox(card: PokemonCard): boolean {
  return card.tags.includes(CardTag.POKEMON_EX)
    || card.tags.includes(CardTag.POKEMON_GX)
    || card.tags.includes(CardTag.POKEMON_LV_X)
    || card.tags.includes(CardTag.POKEMON_V)
    || card.tags.includes(CardTag.POKEMON_VSTAR)
    || card.tags.includes(CardTag.RADIANT);
}

function* useStadium(
  next: Function,
  store: StoreLike,
  state: State,
  effect: UseStadiumEffect
): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonSlot[] = player.bench.filter(b => b.pokemons.cards.length === 0);

  if (slots.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_STADIUM);
  }

  const blocked: number[] = [];
  let available = 0;

  player.deck.cards.forEach((card, index) => {
    if (card instanceof PokemonCard && card.stage === Stage.BASIC && !hasRuleBox(card)) {
      available += 1;
      return;
    }
    blocked.push(index);
  });

  if (available === 0) {
    throw new GameError(GameMessage.CANNOT_USE_STADIUM);
  }

  let selectedCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
      player.deck,
      {},
      { min: 0, max: 1, allowCancel: true, blocked }
    ),
    cards => {
      selectedCards = cards || [];
      next();
    }
  );

  if (selectedCards.length > 0) {
    player.deck.moveCardTo(selectedCards[0], slots[0].pokemons);
    slots[0].pokemonPlayedTurn = state.turn;
  }

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Artazon extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 16930,
      yorenCode: 'Y1265',
      cardType: '2',
      nameSamePokemonId: 2663,
      details: {
        id: 16930,
        cardName: '深钵镇',
        regulationMarkText: 'G',
        collectionNumber: '033/033',
        rarity: '10',
        rarityText: '无标记',
        yorenCode: 'Y1265',
        cardType: '2',
        cardTypeText: '训练家',
        ruleText:
          '双方玩家，每次在自己的回合有1次机会，可选择自己牌库中的1张【基础】宝可梦（除「拥有规则的宝可梦」外），放于备战区。并重洗牌库。|在自己的回合，可以将1张竞技场卡放于战斗场旁。如果有别的竞技场卡被放于场上的话，则将此卡放于弃牌区。无法将同名的竞技场卡放于场上。',
        illustratorName: ['Oswaldo KATO'],
        commodityList: [
          {
            commodityName: '大师战略卡组构筑套装 沙奈朵ex',
            commodityCode: 'CSVM1bC',
          },
        ],
        trainerType: '3',
        trainerTypeText: '竞技场',
        collectionFlag: 0,
        special_shiny_type: 0,
      },
      name: '深钵镇',
      image: 'img\\329\\32.png',
      hash: 'af10be7a20ff43bffe77180bc17aaf2b',
    },
    collection: {
      id: 329,
      name: '大师战略卡组构筑套装 沙奈朵ex',
      commodityCode: 'CSVM1bC',
      salesDate: '2026-01-16',
      series: '3',
      seriesText: '朱&紫',
      goodsType: '3',
      linkType: 0,
      image: 'img/329/cover.png',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/329/32.png',
  };

  public trainerType: TrainerType = TrainerType.STADIUM;

  public set: string = 'set_g';

  public name: string = 'Artazon';

  public fullName: string = 'Artazon CSVM1bC';

  public text: string =
    'Once during each player\'s turn, that player may search their deck for a Basic Pokemon that doesn\'t have a Rule Box and put it onto their Bench. Then, that player shuffles their deck. (Pokemon ex, Pokemon V, etc. have Rule Boxes.)';

  public useWhenInPlay = true;

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseStadiumEffect && StateUtils.getStadiumCard(state) === this) {
      const generator = useStadium(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
