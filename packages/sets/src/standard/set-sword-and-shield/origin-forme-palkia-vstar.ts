import {
  AttackEffect,
  Card,
  CardTag,
  CardTarget,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  Player,
  PlayerType,
  PokemonCard,
  PokemonSlot,
  PowerEffect,
  PowerType,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function getBlockedTargets(player: Player): CardTarget[] {
  const blocked: CardTarget[] = [];

  const activeCard = player.active.getPokemonCard();
  if (activeCard === undefined || !activeCard.cardTypes.includes(CardType.WATER)) {
    blocked.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 });
  }

  for (let i = 0; i < player.bench.length; i++) {
    const benchCard = player.bench[i].getPokemonCard();
    if (benchCard === undefined || !benchCard.cardTypes.includes(CardType.WATER)) {
      blocked.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: i });
    }
  }

  return blocked;
}

function* useStarPortal(
  next: Function,
  store: StoreLike,
  state: State,
  effect: PowerEffect
): IterableIterator<State> {
  const player = effect.player;
  const blockedTargets = getBlockedTargets(player);
  const hasWaterPokemon = blockedTargets.length < 6;
  const maxEnergyToAttach = Math.min(
    3,
    player.discard.cards.filter(c => c instanceof EnergyCard && c.provides.includes(CardType.WATER)).length
  );

  if (!hasWaterPokemon || maxEnergyToAttach === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let cards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_ATTACH,
      player.discard,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.WATER] },
      { min: 1, max: maxEnergyToAttach, allowCancel: false }
    ),
    selected => {
      cards = selected || [];
      next();
    }
  );

  for (const card of cards) {
    let target: PokemonSlot[] = [];
    yield store.prompt(
      state,
      new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.ACTIVE, SlotType.BENCH],
        { allowCancel: false, min: 1, max: 1, blocked: blockedTargets }
      ),
      result => {
        target = result || [];
        next();
      }
    );

    if (target.length > 0) {
      player.discard.moveCardTo(card, target[0].energies);
    }
  }

  return state;
}

export class OriginFormePalkiaVSTAR extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9555,
      name: '起源帕路奇亚VSTAR',
      yorenCode: 'Y973',
      cardType: '1',
      commodityCode: 'CS5bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '051/128',
      },
      image: 'img/182/91.png',
      hash: '07fed544c1c1ae4e887aca65e8bd2930',
      features: [
        {
          id: 1,
          name: '星界传说',
          text: '在自己的回合可以使用1次。从自己弃牌区将最多3张【水】能量卡，以任意方式附着于自己的【水】宝可梦身上。',
        },
      ],
    },
    collection: {
      id: 182,
      commodityCode: 'CS5bC',
      name: '补充包 勇魅群星 勇',
      salesDate: '2024-06-18',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/91.png',
  };

  public tags = [CardTag.POKEMON_VSTAR];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Origin Forme Palkia V';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 280;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: 'Star Portal',
      useWhenInPlay: true,
      useVSTARPower: true,
      powerType: PowerType.ABILITY,
      text:
        'During your turn, you may attach up to 3 W Energy cards from your discard pile to your W Pokemon ' +
        'in any way you like. (You can\'t use more than 1 VSTAR Power in a game.)',
    },
  ];

  public attacks = [
    {
      name: 'Subspace Swell',
      cost: [CardType.WATER, CardType.WATER],
      damage: '60+',
      text:
        'This attack does 20 more damage for each Benched Pokemon (both yours and your opponent\'s).',
    },
  ];

  public set: string = 'SSH';

  public name: string = 'Origin Forme Palkia VSTAR';

  public fullName: string = 'Origin Forme Palkia VSTAR SSH';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useStarPortal(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const ownBenchCount = player.bench.filter(slot => slot.getPokemonCard() !== undefined).length;
      const opponentBenchCount = opponent.bench.filter(slot => slot.getPokemonCard() !== undefined).length;

      effect.damage = 60 + (ownBenchCount + opponentBenchCount) * 20;
      return state;
    }

    return state;
  }
}
