import {
  ApplyWeaknessEffect,
  CardType,
  ChoosePokemonPrompt,
  CheckHpEffect,
  Effect,
  GameMessage,
  PlayPokemonEffect,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class Ledian extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17381,
      name: '安瓢虫',
      yorenCode: 'P166',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '004/207',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/9.png',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/9.png',
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '芭瓢虫';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 90;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [];

  public retreat = [];

  public powers = [
    {
      name: '烁星花纹',
      powerType: PowerType.ABILITY,
      text: '在自己的回合，当将这张卡牌从手牌使出并进行进化时，可使用1次。选择对手备战区中的1只剩余HP在「90」及以下的宝可梦，将其与战斗宝可梦互换。',
    },
  ];

  public attacks = [
    {
      name: '高速星星',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '70',
      text: '这个招式的伤害，不计算弱点、抗性以及对手战斗宝可梦身上所附加的效果。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '安瓢虫';

  public fullName: string = '安瓢虫 CSV8C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const blocked = opponent.bench
        .map((slot, index) => {
          if (slot.pokemons.cards.length === 0) {
            return { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index };
          }

          const checkHp = new CheckHpEffect(opponent, slot);
          store.reduceEffect(state, checkHp);
          const remainingHp = checkHp.hp - slot.damage;
          if (remainingHp > 90) {
            return { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index };
          }

          return null;
        })
        .filter((target): target is { player: PlayerType; slot: SlotType; index: number } => target !== null);

      if (blocked.length === opponent.bench.length) {
        return state;
      }

      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_NEW_ACTIVE_POKEMON,
          PlayerType.TOP_PLAYER,
          [SlotType.BENCH],
          { allowCancel: true, blocked }
        ),
        selected => {
          const targets = selected || [];
          if (targets.length > 0) {
            opponent.switchPokemon(targets[0]);
          }
        }
      );
    }

    if (effect instanceof ApplyWeaknessEffect && effect.attack === this.attacks[0]) {
      effect.ignoreWeakness = true;
      effect.ignoreResistance = true;
      return state;
    }

    return state;
  }
}
