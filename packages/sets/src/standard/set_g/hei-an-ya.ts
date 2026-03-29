import {
  AttackEffect,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  SlotType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

function hasUnionWingAttack(card: PokemonCard | undefined): boolean {
  return card !== undefined && card.attacks.some(attack => attack.name === '团结之翼');
}

export class HeiAnYa extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 15526,
      name: '黑暗鸦',
      yorenCode: 'P0198',
      cardType: '1',
      commodityCode: 'CSVE2C2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '089/207',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '恶',
        hp: 60,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: '斗 -30',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/95.png',
      ruleLines: [],
      attacks: [
        {
          id: 1144,
          name: '旋转折返',
          text: '将这只宝可梦与备战宝可梦互换。',
          cost: ['无色'],
          damage: '10',
        },
        {
          id: 1145,
          name: '团结之翼',
          text: '造成自己弃牌区中，拥有招式「团结之翼」的宝可梦的张数×20伤害。',
          cost: ['恶'],
          damage: '20×',
        },
      ],
      features: [],
      illustratorNames: ['saino misaki'],
      pokemonCategory: '黑暗宝可梦',
      pokedexCode: '0198',
      pokedexText: '人们相信晚上看到它就会发生不吉利的事。因此，它是受人忌讳的宝可梦。',
      height: 0.5,
      weight: 2.1,
      deckRuleLimit: null,
    },
    collection: {
      id: 308,
      commodityCode: 'CSVE2C2',
      name: '对战派对 耀梦 下',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/95.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.DARK];

  public hp = 60;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '旋转折返',
      cost: [CardType.COLORLESS],
      damage: '10',
      text: '将这只宝可梦与备战宝可梦互换。',
    },
    {
      name: '团结之翼',
      cost: [CardType.DARK],
      damage: '20×',
      text: '造成自己弃牌区中，拥有招式「团结之翼」的宝可梦的张数×20伤害。',
    },
  ];

  public set = 'set_g';

  public name = '黑暗鸦';

  public fullName = '黑暗鸦 089/207#15526';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const player = effect.player;
      const playerType = state.players[0] === player ? PlayerType.BOTTOM_PLAYER : PlayerType.TOP_PLAYER;
      const blocked = player.bench
        .map((slot, index) => (slot.pokemons.cards.length === 0 ? { player: playerType, slot: SlotType.BENCH, index } : null))
        .filter((target): target is { player: PlayerType; slot: SlotType; index: number } => target !== null);

      if (blocked.length === player.bench.length) {
        return state;
      }

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_NEW_ACTIVE_POKEMON,
          playerType,
          [SlotType.BENCH],
          { allowCancel: false, blocked }
        ),
        targets => {
          const target = targets?.[0];
          if (target !== undefined) {
            player.switchPokemon(target);
          }
        }
      );
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[1] || effect.attack.name === this.attacks[1].name)) {
      const discardCount = effect.player.discard.cards.filter(card => card instanceof PokemonCard && hasUnionWingAttack(card)).length;
      effect.damage = discardCount * 20;
    }

    return state;
  }
}
