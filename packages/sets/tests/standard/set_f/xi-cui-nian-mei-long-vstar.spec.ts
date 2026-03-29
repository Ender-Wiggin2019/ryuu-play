import {
  AttackAction,
  CardType,
  PlayerType,
  Simulator,
  SlotType,
  UseAbilityAction,
} from '@ptcg/common';

import { XiCuiNianMeiLongVSTAR } from '../../../src/standard/set_f/xi-cui-nian-mei-long-vstar';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('洗翠 黏美龙VSTAR set_f', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('heals all damage with 润泽星耀 and only allows the VSTAR Power once', () => {
    const goodraVstar = new XiCuiNianMeiLongVSTAR();
    const { player } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [goodraVstar], [CardType.WATER, CardType.METAL, CardType.COLORLESS]);
    player.active.damage = 120;

    sim.dispatch(new UseAbilityAction(1, '润泽星耀', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    expect(player.active.damage).toBe(0);

    player.active.damage = 30;
    expect(() => {
      sim.dispatch(new UseAbilityAction(1, '润泽星耀', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).toThrow();
  });

  it('reduces the next opponent turn attack damage by 80 with Steel Rolling', () => {
    const goodraVstar = new XiCuiNianMeiLongVSTAR();
    const opponentPokemon = new TestPokemon();
    opponentPokemon.attacks[0].damage = '100';

    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [goodraVstar], [CardType.WATER, CardType.METAL, CardType.COLORLESS]);
    opponent.active.pokemons.cards = [opponentPokemon];

    sim.dispatch(new AttackAction(1, '钢铁滚动'));

    expect(opponent.active.damage).toBe(200);

    sim.dispatch(new AttackAction(2, 'Test attack'));

    expect(player.active.damage).toBe(20);
  });
});
