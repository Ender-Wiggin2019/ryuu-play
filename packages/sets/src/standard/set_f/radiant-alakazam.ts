import {
  AttackEffect,
  CardTarget,
  CardTag,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PlayerType,
  PowerEffect,
  PowerType,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  PokemonCard,
  PokemonSlot,
} from '@ptcg/common';

export class RadiantAlakazam extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 14101,
      name: '光辉胡地',
      yorenCode: 'Y1088',
      cardType: '1',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '004/024',
      },
      image: 'img\\282\\3.png',
      hash: '529b87db38a973c8dcc7e032adf61f91',
    },
    collection: {
      id: 282,
      name: '对战派对 耀梦 上 奖赏包',
      commodityCode: 'CSVE2pC',
      salesDate: '2025-07-18',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/282/3.png',
  };

  public tags = [CardTag.RADIANT];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 130;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: 'Painful Spoons',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text:
        'Once during your turn, you may move up to 2 damage counters from 1 of your opponent\'s Pokemon ' +
        'to another of their Pokemon.',
    },
  ];

  public attacks = [
    {
      name: 'Mind Ruler',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '20x',
      text: 'This attack does 20 damage for each card in your opponent\'s hand.',
    },
  ];

  public set: string = 'set_f';

  public name: string = 'Radiant Alakazam';

  public fullName: string = 'Radiant Alakazam CSVE2pC';

  public readonly PAINFUL_SPOONS_MARKER = 'PAINFUL_SPOONS_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (player.marker.hasMarker(this.PAINFUL_SPOONS_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const blockedFrom: CardTarget[] = [];
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (slot, _card, target) => {
        if (slot.damage < 10) {
          blockedFrom.push(target);
        }
      });

      if (blockedFrom.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      let sourceTargets: PokemonSlot[] = [];
      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          PlayerType.TOP_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { allowCancel: true, min: 1, max: 1, blocked: blockedFrom }
        ),
        results => {
          sourceTargets = results || [];
          if (sourceTargets.length === 0) {
            return;
          }

          const source = sourceTargets[0];
          const blockedTo: CardTarget[] = [];
          opponent.forEachPokemon(PlayerType.TOP_PLAYER, (slot, _card, target) => {
            if (slot === source) {
              blockedTo.push(target);
            }
          });
          store.prompt(
            state,
            new ChoosePokemonPrompt(
              player.id,
              GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
              PlayerType.TOP_PLAYER,
              [SlotType.ACTIVE, SlotType.BENCH],
              { allowCancel: false, min: 1, max: 1, blocked: blockedTo }
            ),
            targetResults => {
              const target = (targetResults || [])[0];
              if (!target) {
                return;
              }

              const countersToMove = Math.min(2, Math.floor(source.damage / 10));
              if (countersToMove === 0) {
                return;
              }

              source.damage -= countersToMove * 10;
              target.damage += countersToMove * 10;
              player.marker.addMarker(this.PAINFUL_SPOONS_MARKER, this);
            }
          );
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      effect.damage = opponent.hand.cards.length * 20;
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.PAINFUL_SPOONS_MARKER, this);
      return state;
    }

    return state;
  }
}
