import {
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  ShuffleDeckPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  CardType,
  AttackEffect,
} from '@ptcg/common';

export class Ditto extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 11531,
      name: '百变怪',
      yorenCode: 'P0132',
      cardType: '1',
      commodityCode: '151C4',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '168/151',
        rarityLabel: 'S',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 60,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/280/445.png',
      ruleLines: [],
      attacks: [
        {
          id: 1743,
          name: '粘粑粑',
          text: '',
          cost: ['无色'],
          damage: '10',
        },
      ],
      features: [
        {
          id: 205,
          name: '变身启动',
          text: '如果这只宝可梦在战斗场上的话，则仅在最初的自己的回合可以使用1次。选择自己牌库中的1张【基础】宝可梦（除「百变怪」外）。然后，将这只宝可梦，以及放于其身上的所有卡牌放于弃牌区，将被选择的宝可梦放于这只宝可梦原先的位置。并重洗牌库。',
        },
      ],
    },
    collection: {
      id: 280,
      commodityCode: '151C4',
      name: '收集啦151 聚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/280/445.png',
  };

  public stage = Stage.BASIC;

  public cardTypes = [CardType.COLORLESS];

  public hp = 60;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '变身启动',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '如果这只宝可梦在战斗场上的话，则仅在最初的自己的回合可以使用1次。选择自己牌库中的1张【基础】宝可梦（除「百变怪」外）。然后，将这只宝可梦，以及放于其身上的所有卡牌放于弃牌区，将被选择的宝可梦放于这只宝可梦原先的位置。并重洗牌库。',
    },
  ];

  public attacks = [
    {
      name: '粘粑粑',
      cost: [CardType.COLORLESS],
      damage: '10',
      text: '',
    },
  ];

  public set = 'set_g';

  public name = '百变怪';

  public fullName = '百变怪 168/151#11531';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const slot = StateUtils.findPokemonSlot(state, this);

      if (slot === undefined || player.active !== slot) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (state.turn > 2) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const blocked: number[] = [];
      let available = 0;
      player.deck.cards.forEach((card, index) => {
        if (card instanceof PokemonCard && card.stage === Stage.BASIC && card.name !== this.name) {
          available += 1;
          return;
        }
        blocked.push(index);
      });

      if (available === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_HAND,
          player.deck,
          { superType: SuperType.POKEMON, stage: Stage.BASIC },
          { min: 1, max: 1, allowCancel: false, blocked }
        ),
        selected => {
          const chosen = (selected || []).find(
            (card): card is PokemonCard => card instanceof PokemonCard && card.stage === Stage.BASIC && card.name !== this.name
          );

          if (chosen === undefined) {
            return;
          }

          slot.moveTo(player.discard);
          slot.clearEffects();
          player.deck.moveCardTo(chosen, slot.pokemons);
          slot.pokemonPlayedTurn = state.turn;

          store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
            player.deck.applyOrder(order);
          });
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 10;
      return state;
    }

    return state;
  }
}
