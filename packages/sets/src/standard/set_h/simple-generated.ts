import {
  AttackEffect,
  Card,
  CardTag,
  CardType,
  CheckProvidedEnergyEffect,
  EnergyType,
  Effect,
  PokemonCard,
  PowerType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

type GeneratedSimpleHPokemonCardData = {
  set: string;
  name: string;
  fullName: string;
  tags: string[];
  stage: Stage;
  evolvesFrom: string;
  cardTypes: CardType[];
  hp: number;
  weakness: { type: CardType; value?: number }[];
  resistance: { type: CardType; value: number }[];
  retreat: CardType[];
  powers: { name: string; text: string; powerType: PowerType }[];
  attacks: { name: string; cost: CardType[]; damage: string; text: string }[];
  rawData: Record<string, unknown>;
};

class GeneratedSimpleHPokemonCard extends PokemonCard {
  public set = 'set_h';
  public name = '';
  public fullName = '';
  public tags: string[] = [];
  public stage = Stage.BASIC;
  public evolvesFrom = '';
  public cardTypes: CardType[] = [];
  public hp = 0;
  public weakness: { type: CardType; value?: number }[] = [];
  public resistance: { type: CardType; value: number }[] = [];
  public retreat: CardType[] = [];
  public powers: { name: string; text: string; powerType: PowerType }[] = [];
  public attacks: { name: string; cost: CardType[]; damage: string; text: string }[] = [];

  constructor(data: GeneratedSimpleHPokemonCardData) {
    super();
    this.set = data.set;
    this.name = data.name;
    this.fullName = data.fullName;
    this.tags = data.tags;
    this.stage = data.stage;
    this.evolvesFrom = data.evolvesFrom;
    this.cardTypes = data.cardTypes;
    this.hp = data.hp;
    this.weakness = data.weakness;
    this.resistance = data.resistance;
    this.retreat = data.retreat;
    this.powers = data.powers;
    this.attacks = data.attacks;
    this.rawData = data.rawData as any;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack.name === '特殊滚动' && this.name === '奇诺栗鼠') {
      const checkProvidedEnergy = new CheckProvidedEnergyEffect(effect.player, effect.player.active);
      state = store.reduceEffect(state, checkProvidedEnergy);
      const specialEnergyCount = checkProvidedEnergy.energyMap
        .filter(e => e.card.energyType === EnergyType.SPECIAL)
        .length;
      effect.damage = specialEnergyCount * 70;
      return state;
    }

    return state;
  }
}

const generatedSimpleHPokemonData: GeneratedSimpleHPokemonCardData[] = [
  {
    'set': 'set_h',
    'name': '达克莱伊ex',
    'fullName': '达克莱伊ex CSVSC',
    'tags': [
      CardTag.POKEMON_EX
    ],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.DARK
    ],
    'hp': 210,
    'weakness': [
      {
        'type': CardType.GRASS
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS,
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '暗之风',
        'cost': [
          CardType.DARK,
          CardType.COLORLESS
        ],
        'damage': '40',
        'text': ''
      },
      {
        'name': '暗夜冲击',
        'cost': [
          CardType.DARK,
          CardType.DARK,
          CardType.COLORLESS
        ],
        'damage': '110',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16805,
        'name': '达克莱伊ex',
        'yorenCode': 'Y1360',
        'cardType': '1',
        'commodityCode': 'CSVSC',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '034/066'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/326/33.png'
      },
      'collection': {
        'id': 326,
        'commodityCode': 'CSVSC',
        'name': '对战学院'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/326/33.png'
    }
  },
  {
    'set': 'set_h',
    'name': '泡沫栗鼠',
    'fullName': '泡沫栗鼠 CSV7C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.COLORLESS
    ],
    'hp': 70,
    'weakness': [
      {
        'type': CardType.FIGHTING
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '敲打',
        'cost': [
          CardType.COLORLESS
        ],
        'damage': '10',
        'text': ''
      },
      {
        'name': '扫除',
        'cost': [
          CardType.COLORLESS,
          CardType.COLORLESS
        ],
        'damage': '',
        'text': '选择放于对手场上宝可梦身上最多2张「宝可梦道具」，放于弃牌区。'
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16336,
        'name': '泡沫栗鼠',
        'yorenCode': null,
        'cardType': '1',
        'commodityCode': 'CSV7C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '170/204'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/463.png'
      },
      'collection': {
        'id': 324,
        'commodityCode': 'CSV7C',
        'name': '补充包 利刃猛醒'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/463.png'
    }
  },
  {
    'set': 'set_h',
    'name': '奇诺栗鼠',
    'fullName': '奇诺栗鼠 CSV7C',
    'tags': [],
    'stage': Stage.STAGE_1,
    'evolvesFrom': '泡沫栗鼠',
    'cardTypes': [
      CardType.COLORLESS
    ],
    'hp': 110,
    'weakness': [
      {
        'type': CardType.FIGHTING
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '重掴',
        'cost': [
          CardType.COLORLESS
        ],
        'damage': '30',
        'text': ''
      },
      {
        'name': '特殊滚动',
        'cost': [
          CardType.COLORLESS,
          CardType.COLORLESS
        ],
        'damage': '70×',
        'text': '造成这只宝可梦身上附着的特殊能量张数×70伤害。'
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16747,
        'name': '奇诺栗鼠',
        'yorenCode': null,
        'cardType': '1',
        'commodityCode': 'CSV7C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '171/204'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/468.png'
      },
      'collection': {
        'id': 324,
        'commodityCode': 'CSV7C',
        'name': '补充包 利刃猛醒'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/468.png'
    }
  },
  {
    'set': 'set_h',
    'name': '好胜蟹',
    'fullName': '好胜蟹 CSV8C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.FIGHTING
    ],
    'hp': 90,
    'weakness': [
      {
        'type': CardType.PSYCHIC
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS,
      CardType.COLORLESS,
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '夹住',
        'cost': [
          CardType.COLORLESS,
          CardType.COLORLESS
        ],
        'damage': '20',
        'text': ''
      },
      {
        'name': '蟹钳锤',
        'cost': [
          CardType.COLORLESS,
          CardType.COLORLESS,
          CardType.COLORLESS
        ],
        'damage': '50',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 17492,
        'name': '好胜蟹',
        'yorenCode': 'P739',
        'cardType': '1',
        'commodityCode': 'CSV8C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '115/207'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/318.png'
      },
      'collection': {
        'id': 458,
        'commodityCode': 'CSV8C',
        'name': '补充包 璀璨诡幻'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/318.png'
    }
  },
  {
    'set': 'set_h',
    'name': '火稚鸡',
    'fullName': '火稚鸡 CSV7C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.FIRE
    ],
    'hp': 60,
    'weakness': [
      {
        'type': CardType.WATER
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '抓',
        'cost': [
          CardType.FIRE,
          CardType.COLORLESS
        ],
        'damage': '30',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16202,
        'name': '火稚鸡',
        'yorenCode': 'P255',
        'cardType': '1',
        'commodityCode': 'CSV7C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '036/204'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/99.png'
      },
      'collection': {
        'id': 324,
        'commodityCode': 'CSV7C',
        'name': '补充包 利刃猛醒'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/99.png'
    }
  },
  {
    'set': 'set_h',
    'name': '莱希拉姆',
    'fullName': '莱希拉姆 CSVSC',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.FIRE
    ],
    'hp': 130,
    'weakness': [
      {
        'type': CardType.WATER
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS,
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '高温爆破',
        'cost': [
          CardType.FIRE,
          CardType.COLORLESS,
          CardType.COLORLESS
        ],
        'damage': '90',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16780,
        'name': '莱希拉姆',
        'yorenCode': 'P643',
        'cardType': '1',
        'commodityCode': 'CSVSC',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '009/066'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/326/8.png'
      },
      'collection': {
        'id': 326,
        'commodityCode': 'CSVSC',
        'name': '对战学院'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/326/8.png'
    }
  },
  {
    'set': 'set_h',
    'name': '利欧路',
    'fullName': '利欧路 CSVSC',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.FIGHTING
    ],
    'hp': 70,
    'weakness': [
      {
        'type': CardType.PSYCHIC
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '重拳',
        'cost': [
          CardType.FIGHTING,
          CardType.COLORLESS
        ],
        'damage': '30',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16802,
        'name': '利欧路',
        'yorenCode': 'P447',
        'cardType': '1',
        'commodityCode': 'CSVSC',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '031/066'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/326/30.png'
      },
      'collection': {
        'id': 326,
        'commodityCode': 'CSVSC',
        'name': '对战学院'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/326/30.png'
    }
  },
  {
    'set': 'set_h',
    'name': '利牙鱼',
    'fullName': '利牙鱼 CSV7C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.WATER
    ],
    'hp': 50,
    'weakness': [
      {
        'type': CardType.LIGHTNING
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '飞溅',
        'cost': [
          CardType.COLORLESS,
          CardType.COLORLESS
        ],
        'damage': '30',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16221,
        'name': '利牙鱼',
        'yorenCode': 'P318',
        'cardType': '1',
        'commodityCode': 'CSV7C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '055/204'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/150.png'
      },
      'collection': {
        'id': 324,
        'commodityCode': 'CSV7C',
        'name': '补充包 利刃猛醒'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/150.png'
    }
  },
  {
    'set': 'set_h',
    'name': '龙虾小兵',
    'fullName': '龙虾小兵 CSV8C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.WATER
    ],
    'hp': 80,
    'weakness': [
      {
        'type': CardType.LIGHTNING
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS,
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '夹住',
        'cost': [
          CardType.WATER,
          CardType.WATER,
          CardType.COLORLESS
        ],
        'damage': '60',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 17431,
        'name': '龙虾小兵',
        'yorenCode': 'P341',
        'cardType': '1',
        'commodityCode': 'CSV8C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '054/207'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/149.png'
      },
      'collection': {
        'id': 458,
        'commodityCode': 'CSV8C',
        'name': '补充包 璀璨诡幻'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/149.png'
    }
  },
  {
    'set': 'set_h',
    'name': '玛力露',
    'fullName': '玛力露 CSVSC',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.WATER
    ],
    'hp': 70,
    'weakness': [
      {
        'type': CardType.LIGHTNING
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '滚动',
        'cost': [
          CardType.COLORLESS
        ],
        'damage': '10',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16784,
        'name': '玛力露',
        'yorenCode': 'P183',
        'cardType': '1',
        'commodityCode': 'CSVSC',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '013/066'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/326/12.png'
      },
      'collection': {
        'id': 326,
        'commodityCode': 'CSVSC',
        'name': '对战学院'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/326/12.png'
    }
  },
  {
    'set': 'set_h',
    'name': '蔓藤怪',
    'fullName': '蔓藤怪 CSV7C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.GRASS
    ],
    'hp': 80,
    'weakness': [
      {
        'type': CardType.FIRE
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS,
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '重掴',
        'cost': [
          CardType.COLORLESS
        ],
        'damage': '10',
        'text': ''
      },
      {
        'name': '藤蔓攻击',
        'cost': [
          CardType.GRASS,
          CardType.COLORLESS
        ],
        'damage': '30',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16167,
        'name': '蔓藤怪',
        'yorenCode': 'P114',
        'cardType': '1',
        'commodityCode': 'CSV7C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '001/204'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/0.png'
      },
      'collection': {
        'id': 324,
        'commodityCode': 'CSV7C',
        'name': '补充包 利刃猛醒'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/0.png'
    }
  },
  {
    'set': 'set_h',
    'name': '美录坦',
    'fullName': '美录坦 CSV7C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.METAL
    ],
    'hp': 80,
    'weakness': [
      {
        'type': CardType.FIRE
      }
    ],
    'resistance': [
      {
        'type': CardType.GRASS,
        'value': -30
      }
    ],
    'retreat': [
      CardType.COLORLESS,
      CardType.COLORLESS,
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '头锤',
        'cost': [
          CardType.METAL,
          CardType.METAL
        ],
        'damage': '50',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16315,
        'name': '美录坦',
        'yorenCode': 'P808',
        'cardType': '1',
        'commodityCode': 'CSV7C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '149/204'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/404.png'
      },
      'collection': {
        'id': 324,
        'commodityCode': 'CSV7C',
        'name': '补充包 利刃猛醒'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/404.png'
    }
  },
  {
    'set': 'set_h',
    'name': '咩利羊',
    'fullName': '咩利羊 CSVSC',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.LIGHTNING
    ],
    'hp': 60,
    'weakness': [
      {
        'type': CardType.FIGHTING
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '头锤',
        'cost': [
          CardType.LIGHTNING
        ],
        'damage': '10',
        'text': ''
      },
      {
        'name': '光亮弹',
        'cost': [
          CardType.LIGHTNING,
          CardType.COLORLESS
        ],
        'damage': '20',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16790,
        'name': '咩利羊',
        'yorenCode': 'P179',
        'cardType': '1',
        'commodityCode': 'CSVSC',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '019/066'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/326/18.png'
      },
      'collection': {
        'id': 326,
        'commodityCode': 'CSVSC',
        'name': '对战学院'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/326/18.png'
    }
  },
  {
    'set': 'set_h',
    'name': '纳噬草',
    'fullName': '纳噬草 CSV7C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.GRASS
    ],
    'hp': 50,
    'weakness': [
      {
        'type': CardType.FIRE
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '针刺',
        'cost': [
          CardType.COLORLESS,
          CardType.COLORLESS
        ],
        'damage': '30',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16194,
        'name': '纳噬草',
        'yorenCode': 'P0946',
        'cardType': '1',
        'commodityCode': 'CSV7C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '028/204'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/79.png'
      },
      'collection': {
        'id': 324,
        'commodityCode': 'CSV7C',
        'name': '补充包 利刃猛醒'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/79.png'
    }
  },
  {
    'set': 'set_h',
    'name': '泥驴仔',
    'fullName': '泥驴仔 CSV7C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.FIGHTING
    ],
    'hp': 80,
    'weakness': [
      {
        'type': CardType.GRASS
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS,
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '踢飞',
        'cost': [
          CardType.FIGHTING
        ],
        'damage': '10',
        'text': ''
      },
      {
        'name': '掷泥',
        'cost': [
          CardType.FIGHTING,
          CardType.COLORLESS,
          CardType.COLORLESS
        ],
        'damage': '50',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16291,
        'name': '泥驴仔',
        'yorenCode': 'P749',
        'cardType': '1',
        'commodityCode': 'CSV7C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '125/204'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/340.png'
      },
      'collection': {
        'id': 324,
        'commodityCode': 'CSV7C',
        'name': '补充包 利刃猛醒'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/340.png'
    }
  },
  {
    'set': 'set_h',
    'name': '敲音猴',
    'fullName': '敲音猴 CSV8C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.GRASS
    ],
    'hp': 70,
    'weakness': [
      {
        'type': CardType.FIRE
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '踢飞',
        'cost': [
          CardType.GRASS
        ],
        'damage': '10',
        'text': ''
      },
      {
        'name': '木枝突刺',
        'cost': [
          CardType.GRASS,
          CardType.GRASS
        ],
        'damage': '30',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 17397,
        'name': '敲音猴',
        'yorenCode': 'P810',
        'cardType': '1',
        'commodityCode': 'CSV8C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '020/207'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/55.png'
      },
      'collection': {
        'id': 458,
        'commodityCode': 'CSV8C',
        'name': '补充包 璀璨诡幻'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/55.png'
    }
  },
  {
    'set': 'set_h',
    'name': '燃烧虫',
    'fullName': '燃烧虫 CSV8C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.FIRE
    ],
    'hp': 70,
    'weakness': [
      {
        'type': CardType.WATER
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS,
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '冲撞',
        'cost': [
          CardType.COLORLESS
        ],
        'damage': '10',
        'text': ''
      },
      {
        'name': '吐火',
        'cost': [
          CardType.FIRE,
          CardType.COLORLESS
        ],
        'damage': '20',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 17585,
        'name': '燃烧虫',
        'yorenCode': 'P636',
        'cardType': '1',
        'commodityCode': 'CSV8C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '208/207'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/559.png'
      },
      'collection': {
        'id': 458,
        'commodityCode': 'CSV8C',
        'name': '补充包 璀璨诡幻'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/559.png'
    }
  },
  {
    'set': 'set_h',
    'name': '睡睡菇',
    'fullName': '睡睡菇 CSV8C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.GRASS
    ],
    'hp': 60,
    'weakness': [
      {
        'type': CardType.FIRE
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '紧贴',
        'cost': [
          CardType.COLORLESS
        ],
        'damage': '10',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 17394,
        'name': '睡睡菇',
        'yorenCode': 'P755',
        'cardType': '1',
        'commodityCode': 'CSV8C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '017/207'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/46.png'
      },
      'collection': {
        'id': 458,
        'commodityCode': 'CSV8C',
        'name': '补充包 璀璨诡幻'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/46.png'
    }
  },
  {
    'set': 'set_h',
    'name': '铜象',
    'fullName': '铜象 CSV8C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.METAL
    ],
    'hp': 100,
    'weakness': [
      {
        'type': CardType.FIRE
      }
    ],
    'resistance': [
      {
        'type': CardType.GRASS,
        'value': -30
      }
    ],
    'retreat': [
      CardType.COLORLESS,
      CardType.COLORLESS,
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '撞击',
        'cost': [
          CardType.METAL,
          CardType.COLORLESS
        ],
        'damage': '30',
        'text': ''
      },
      {
        'name': '正面对决',
        'cost': [
          CardType.METAL,
          CardType.METAL,
          CardType.COLORLESS
        ],
        'damage': '70',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 17524,
        'name': '铜象',
        'yorenCode': 'P878',
        'cardType': '1',
        'commodityCode': 'CSV8C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '147/207'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/402.png'
      },
      'collection': {
        'id': 458,
        'commodityCode': 'CSV8C',
        'name': '补充包 璀璨诡幻'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/402.png'
    }
  },
  {
    'set': 'set_h',
    'name': '小炭仔',
    'fullName': '小炭仔 CSV7C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.FIGHTING
    ],
    'hp': 80,
    'weakness': [
      {
        'type': CardType.GRASS
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS,
      CardType.COLORLESS,
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '滚动冲撞',
        'cost': [
          CardType.FIGHTING
        ],
        'damage': '10',
        'text': ''
      },
      {
        'name': '力量宝石',
        'cost': [
          CardType.FIGHTING,
          CardType.COLORLESS
        ],
        'damage': '30',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 16293,
        'name': '小炭仔',
        'yorenCode': 'P837',
        'cardType': '1',
        'commodityCode': 'CSV7C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '127/204'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/346.png'
      },
      'collection': {
        'id': 324,
        'commodityCode': 'CSV7C',
        'name': '补充包 利刃猛醒'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/346.png'
    }
  },
  {
    'set': 'set_h',
    'name': '小仙奶',
    'fullName': '小仙奶 CSV8C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.PSYCHIC
    ],
    'hp': 60,
    'weakness': [
      {
        'type': CardType.METAL
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '喃喃自语',
        'cost': [
          CardType.PSYCHIC
        ],
        'damage': '20',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 17467,
        'name': '小仙奶',
        'yorenCode': 'P868',
        'cardType': '1',
        'commodityCode': 'CSV8C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '090/207'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/245.png'
      },
      'collection': {
        'id': 458,
        'commodityCode': 'CSV8C',
        'name': '补充包 璀璨诡幻'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/245.png'
    }
  },
  {
    'set': 'set_h',
    'name': '咬咬龟',
    'fullName': '咬咬龟 CSV8C',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.WATER
    ],
    'hp': 80,
    'weakness': [
      {
        'type': CardType.LIGHTNING
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS,
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '头锤',
        'cost': [
          CardType.COLORLESS,
          CardType.COLORLESS,
          CardType.COLORLESS
        ],
        'damage': '60',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 17437,
        'name': '咬咬龟',
        'yorenCode': 'P833',
        'cardType': '1',
        'commodityCode': 'CSV8C',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '060/207'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/163.png'
      },
      'collection': {
        'id': 458,
        'commodityCode': 'CSV8C',
        'name': '补充包 璀璨诡幻'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/163.png'
    }
  },
  {
    'set': 'set_h',
    'name': '榛果球',
    'fullName': '榛果球 PROMOSVEVENT02',
    'tags': [],
    'stage': Stage.BASIC,
    'evolvesFrom': '',
    'cardTypes': [
      CardType.GRASS
    ],
    'hp': 70,
    'weakness': [
      {
        'type': CardType.FIRE
      }
    ],
    'resistance': [],
    'retreat': [
      CardType.COLORLESS,
      CardType.COLORLESS
    ],
    'powers': [],
    'attacks': [
      {
        'name': '冲撞',
        'cost': [
          CardType.COLORLESS,
          CardType.COLORLESS,
          CardType.COLORLESS
        ],
        'damage': '',
        'text': ''
      }
    ],
    'rawData': {
      'raw_card': {
        'id': 17277,
        'name': '榛果球',
        'yorenCode': 'P204',
        'cardType': '1',
        'commodityCode': 'PROMOSVEVENT02',
        'details': {
          'regulationMarkText': 'H',
          'collectionNumber': '171/SV-P'
        },
        'image': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/453/0.png'
      },
      'collection': {
        'id': 453,
        'commodityCode': 'PROMOSVEVENT02',
        'name': '活动特别包 第二弹'
      },
      'image_url': 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/453/0.png'
    }
  }
];

export const simpleHCards: Card[] = generatedSimpleHPokemonData.map(data => new GeneratedSimpleHPokemonCard(data));
