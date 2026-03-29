import {
  AttachEnergyPrompt,
  AttackAction,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  PlayerType,
  ResolvePromptAction,
  RetreatAction,
  SpecialCondition,
  SlotType,
  Stage,
  SuperType,
  TrainerCard,
  TrainerType,
  UseAbilityAction,
} from '@ptcg/common';

import { Baxcalibur } from '../../../src/standard/set_g/baxcalibur';
import { BruteBonnet } from '../../../src/standard/set_g/brute-bonnet';
import { ChienPaoEx } from '../../../src/standard/set_g/chien-pao-ex';
import { Frigibax } from '../../../src/standard/set_g/frigibax';
import { Frigibax2 } from '../../../src/standard/set_g/frigibax2';
import { IronValiantEx } from '../../../src/standard/set_g/iron-valiant-ex';
import { NoivernEx } from '../../../src/standard/set_g/noivern-ex';
import { TestCard } from '../../test-cards/test-card';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

class BasicPokemon extends TestPokemon {
  public stage = Stage.BASIC;
  public name = 'Basic Pokemon';
  public fullName = 'Basic Pokemon TEST';
}

class AncientEnergy extends TestEnergy {
  public name = '驱劲能量 古代';
  public fullName = '驱劲能量 古代 TEST';
}

class ToolCard extends TrainerCard {
  public trainerType = TrainerType.TOOL;
  public superType = SuperType.TRAINER;
  public set = 'TEST';
  public name = 'Tool';
  public fullName = 'Tool TEST';
  public text = '';
}

describe('worker E set_g batch', () => {
  it('poisons the opponent Active Pokemon when 猛恶菇 uses 烈毒粉尘 with 驱劲能量 古代 attached', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new BruteBonnet();
    const specialEnergy = new AncientEnergy(CardType.COLORLESS);
    const { player, opponent } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.active.energies.cards = [specialEnergy];
    opponent.active.pokemons.cards = [new BasicPokemon()];

    sim.dispatch(new UseAbilityAction(1, '烈毒粉尘', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    expect(opponent.active.specialConditions).toContain(SpecialCondition.POISONED);
    expect(player.active.specialConditions).not.toContain(SpecialCondition.POISONED);
  });

  it('places 2 damage counters when 铁武者ex retreats to the Active Spot', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new IronValiantEx();
    const { player, opponent, state } = TestUtils.getAll(sim);

    state.turn = 1;
    player.active.pokemons.cards = [new BasicPokemon()];
    player.bench[0].pokemons.cards = [card];
    opponent.active.pokemons.cards = [new BasicPokemon()];

    sim.dispatch(new RetreatAction(1, 0));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.active]));

    expect(player.active.getPokemonCard()).toBe(card);
    expect(opponent.active.damage).toBe(20);
  });

  it('prevents damage from a Basic Pokemon after 音波龙ex uses 隐秘飞行', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new NoivernEx();
    const { player, opponent } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.active.energies.cards = [new TestEnergy(CardType.WATER), new TestEnergy(CardType.DARK)];
    opponent.active.pokemons.cards = [new BasicPokemon()];

    sim.dispatch(new AttackAction(1, '隐秘飞行'));
    sim.dispatch(new AttackAction(2, 'Test attack'));

    expect(player.active.damage).toBe(0);
  });

  it('searches up to 2 Water Energy cards into hand with 古剑豹ex', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new ChienPaoEx();
    const waterA = new TestEnergy(CardType.WATER);
    const waterB = new TestEnergy(CardType.WATER);
    const filler = new ToolCard();
    const { player } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.hand.cards = [];
    player.deck.cards = [waterA, filler, waterB];

    sim.dispatch(new UseAbilityAction(1, '战栗冷气', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [waterA, waterB]));

    expect(player.hand.cards).toContain(waterA);
    expect(player.hand.cards).toContain(waterB);
    expect(player.deck.cards).toContain(filler);
  });

  it('discards selected Water Energy cards for 冰雹利刃', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new ChienPaoEx();
    const activeA = new TestEnergy(CardType.WATER);
    const activeB = new TestEnergy(CardType.WATER);
    const benchEnergy = new TestEnergy(CardType.WATER);
    const { player, opponent } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.active.energies.cards = [activeA, activeB];
    player.bench[0].pokemons.cards = [new BasicPokemon()];
    player.bench[0].energies.cards = [benchEnergy];
    opponent.active.pokemons.cards = [new BasicPokemon()];

    sim.dispatch(new AttackAction(1, '冰雹利刃'));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [activeA, benchEnergy]));

    expect(player.discard.cards).toContain(activeA);
    expect(player.discard.cards).toContain(benchEnergy);
    expect(opponent.active.damage).toBe(120);
  });

  it('draws a card with the 70 HP 凉脊龙', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new Frigibax2();
    const drawnCard = new TestCard();
    const { player } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.active.energies.cards = [new TestEnergy(CardType.WATER)];
    player.hand.cards = [];
    player.deck.cards = [drawnCard];

    sim.dispatch(new AttackAction(1, '招来'));

    expect(player.hand.cards).toContain(drawnCard);
    expect(player.deck.cards).not.toContain(drawnCard);
  });

  it('deals 30 damage with the 60 HP 凉脊龙', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new Frigibax();
    const { player, opponent } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.active.energies.cards = [new TestEnergy(CardType.WATER), new TestEnergy(CardType.COLORLESS)];
    opponent.active.pokemons.cards = [new BasicPokemon()];

    sim.dispatch(new AttackAction(1, '撞击'));

    expect(opponent.active.damage).toBe(30);
  });

  it('attaches a basic Water Energy from hand with 戟脊龙', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new Baxcalibur();
    const water = new TestEnergy(CardType.WATER);
    const { player } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.bench[0].pokemons.cards = [new BasicPokemon()];
    player.hand.cards = [water, new TestCard()];

    sim.dispatch(new UseAbilityAction(1, '极低温', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    const prompt = TestUtils.getLastPrompt(sim) as AttachEnergyPrompt;
    expect(prompt).toBeTruthy();

    sim.dispatch(new ResolvePromptAction(prompt.id, [
      {
        to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 },
        card: water,
      },
    ]));

    expect(player.bench[0].energies.cards).toContain(water);
  });
});
