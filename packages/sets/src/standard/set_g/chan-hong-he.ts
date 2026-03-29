import {
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PlayPokemonEffect,
  PokemonCard,
  PowerType,
  ShuffleDeckPrompt,
  ShowCardsPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function hasUnionWingAttack(card: PokemonCard | undefined): boolean {
  return card !== undefined && card.attacks.some(attack => attack.name === '团结之翼');
}

export class ChanHongHe extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 15551,
      name: '缠红鹤',
      yorenCode: 'P0973',
      cardType: '1',
      commodityCode: 'CSVE2C2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '134/207',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        hp: 110,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: '斗 -30',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/132.png',
      ruleLines: [],
      attacks: [
        {
          id: 1181,
          name: '团结之翼',
          text: '造成自己弃牌区中，拥有招式「团结之翼」的宝可梦的张数×20伤害。',
          cost: ['无色', '无色'],
          damage: '20×',
        },
      ],
      features: [
        {
          id: 150,
          name: '快速结群',
          text: '在自己的回合，当将这张卡牌从手牌使出放于备战区时，可使用1次。选择自己牌库中最多3张「缠红鹤」，在给对手看过之后，加入手牌。并重洗牌库。',
        },
      ],
      illustratorNames: ['Oswaldo KATO'],
      pokemonCategory: '同步宝可梦',
      pokedexCode: '0973',
      pokedexText: '通过有节奏地煽动头上的羽毛来控制对手的注意力，让它行动变得迟缓。',
      height: 1.4,
      weight: 11.0,
      deckRuleLimit: null,
    },
    collection: {
      id: 308,
      commodityCode: 'CSVE2C2',
      name: '对战派对 耀梦 下',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/132.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp = 110;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '快速结群',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合，当将这张卡牌从手牌使出放于备战区时，可使用1次。选择自己牌库中最多3张「缠红鹤」，在给对手看过之后，加入手牌。并重洗牌库。',
    },
  ];

  public attacks = [
    {
      name: '团结之翼',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '20×',
      text: '造成自己弃牌区中，拥有招式「团结之翼」的宝可梦的张数×20伤害。',
    },
  ];

  public set = 'set_g';

  public name = '缠红鹤';

  public fullName = '缠红鹤 134/207#15551';

  public readonly FAST_FLOCK_MARKER = 'FAST_FLOCK_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (player.marker.hasMarker(this.FAST_FLOCK_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const available = player.deck.cards.filter(card => card instanceof PokemonCard && card.name === this.name).length;
      player.marker.addMarker(this.FAST_FLOCK_MARKER, this);

      if (available === 0) {
        return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
          player.deck.applyOrder(order);
        });
      }

      const blocked = player.deck.cards
        .map((card, index) => (card instanceof PokemonCard && card.name === this.name ? null : index))
        .filter((value): value is number => value !== null);

      let selected: PokemonCard[] = [];
      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_HAND,
          player.deck,
          { superType: SuperType.POKEMON, name: this.name },
          { min: 0, max: Math.min(3, available), allowCancel: true, blocked }
        ),
        cards => {
          selected = (cards || []) as PokemonCard[];
          player.deck.moveCardsTo(selected, player.hand);

          if (selected.length > 0) {
            store.prompt(
              state,
              new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected),
              () => {
                store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
                  player.deck.applyOrder(order);
                });
              }
            );
            return;
          }

          store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
            player.deck.applyOrder(order);
          });
        }
      );
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const discardCount = effect.player.discard.cards.filter(card => card instanceof PokemonCard && hasUnionWingAttack(card)).length;
      effect.damage = discardCount * 20;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.FAST_FLOCK_MARKER, this);
    }

    return state;
  }
}
