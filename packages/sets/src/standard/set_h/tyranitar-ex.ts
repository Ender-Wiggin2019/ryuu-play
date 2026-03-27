import {
  AttackEffect,
  Card,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class TyranitarEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16303,
      name: '班基拉斯ex',
      yorenCode: 'Y1365',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '137/204',
      },
      image: 'img/324/374.png',
      hash: '2594a0bf6d5466587d54d6a4bf4d5e7b',
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
      salesDate: '2026-01-16',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/374.png',
  };

  public tags = [CardTag.POKEMON_EX, CardTag.TERA];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = '沙基拉斯';

  public cardTypes: CardType[] = [CardType.DARK];

  public hp: number = 340;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '压碎',
      cost: [CardType.COLORLESS],
      damage: '50x',
      text: '造成这只宝可梦身上附着的能量数量×50点伤害。',
    },
    {
      name: '暴君粉碎',
      cost: [CardType.DARK, CardType.COLORLESS, CardType.COLORLESS],
      damage: '150',
      text: '在不看对手手牌正面的前提下，选择其中1张放于弃牌区。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '班基拉斯ex';

  public fullName: string = '班基拉斯ex CSV7C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = effect.player.active.energies.cards.length * 50;
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const opponent = StateUtils.getOpponent(state, effect.player);

      if (opponent.hand.cards.length === 0) {
        return state;
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          effect.player.id,
          GameMessage.CHOOSE_CARD_TO_DISCARD,
          opponent.hand,
          {},
          { min: 1, max: 1, allowCancel: false, isSecret: true }
        ),
        selected => {
          const cards = (selected || []) as Card[];
          const resolvedCards = cards
            .map(card => {
              if (opponent.hand.cards.includes(card)) {
                return card;
              }

              const selectedIndex = opponent.hand.cards.findIndex(handCard => handCard.id === card.id);
              if (selectedIndex !== -1) {
                return opponent.hand.cards[selectedIndex];
              }

              return undefined;
            })
            .filter((card): card is Card => card !== undefined);

          const cardsToDiscard = resolvedCards.length > 0
            ? resolvedCards
            : opponent.hand.cards.slice(0, 1);

          opponent.hand.moveCardsTo(cardsToDiscard, opponent.discard);
        }
      );
    }

    return state;
  }
}
