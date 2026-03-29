import { Card, SuperType, TrainerCard } from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

import { EnergySearch } from '../../base-sets/set-fossil/energy-search';
import { Switch } from '../set-black-and-white/switch';
import { CrushingHammer } from '../set-black-and-white/crushing-hammer';
import { EnhancedHammer } from '../set-black-and-white/enhanced-hammer';
import { EnergyRetrieval } from '../set-black-and-white/energy-retrieval';
import { ExpShare } from '../set-black-and-white/exp-share';
import { PokemonCatcher } from '../set-black-and-white/pokemon-catcher';
import { ProfessorJuniper } from '../set-black-and-white/professor-juniper';
import { SuperRod } from '../set-black-and-white/super-rod';
import { UltraBall } from '../set-black-and-white/ultra-ball';
import { UnfairStamp } from './unfair-stamp';
import { Lysandre } from '../set-black-and-white-2/lysandre';
import { DarkPatch } from '../set-black-and-white-2/dark-patch';
import { RareCandy } from '../set-black-and-white/rare-candy';
import { EnergySwitch } from '../set-black-and-white-3/energy-switch';
import { Potion } from '../set-black-and-white-3/potion';
import { Arven } from '../set_g/arven';
import { EarthenVessel } from '../set_g/earthen-vessel';
import { Iono } from '../set_g/iono';
import { SuperEnergyRetrieval } from '../set_g/super-energy-retrieval';
import { setF as generatedSetF } from './cards.generated';
import { ADu } from './a-du';
import { AdvancedAroma } from './advanced-aroma';
import { AFeng } from './a-feng';
import { AKeLuoMaDeShiYan } from './a-ke-luo-ma-de-shi-yan';
import { AKeLuoMaDeZhiNian } from './a-ke-luo-ma-de-zhi-nian';
import { AMang } from './a-mang';
import { AnZhongQiXi } from './an-zhong-qi-xi';
import { AoErDiJia } from './ao-er-di-jia';
import { AoLinBoShiDeQiPo } from './ao-lin-bo-shi-de-qi-po';
import { ASu } from './a-su';
import { AXingDeMiZhao } from './a-xing-de-mi-zhao';
import { Axun } from './axun';
import { BaShuo } from './ba-shuo';
import { BaiLuDeZhenXin } from './bai-lu-de-zhen-xin';
import { BanMuDeLingDaoLi } from './ban-mu-de-ling-dao-li';
import { Artazon } from './artazon';
import { BeachCourt } from './beach-court';
import { BengTaDeJingJiChang } from './beng-ta-de-jing-ji-chang';
import { BeiLiLa } from './bei-li-la';
import { BigAirBalloon } from './big-air-balloon';
import { BinMingDeHouYuan } from './bin-ming-de-hou-yuan';
import { BindingBand } from './binding-band';
import { BoPi } from './bo-pi';
import { BraveryCharm } from './bravery-charm';
import { BuddyBuddyPoffin } from './buddy-buddy-poffin';
import { CaiZhongDeHuoLi } from './cai-zhong-de-huo-li';
import { CapturingAroma } from './capturing-aroma';
import { ChaoQunYanJing } from './chao-qun-yan-jing';
import { ChangXiuHeFuShaoNv } from './chang-xiu-he-fu-shao-nv';
import { ChaKeLuo } from './cha-ke-luo';
import { ChenZhongJieLiBang } from './chen-zhong-jie-li-bang';
import { ChoiceBelt } from './choice-belt';
import { ChongLangShou } from './chong-lang-shou';
import { CounterCatcher } from './counter-catcher';
import { CynthiasAmbition } from './cynthias-ambition';
import { DaDiFengYinShi } from './da-di-feng-yin-shi';
import { DanYu } from './dan-yu';
import { DarkBall } from './dark-ball';
import { DefianceBand } from './defiance-band';
import { DefianceVest } from './defiance-vest';
import { DeliveryDrone } from './delivery-drone';
import { DisasterWilderness } from './disaster-wilderness';
import { DingJianBuZhuoQi } from './ding-jian-bu-zhuo-qi';
import { DuanKuXiaoZi } from './duan-ku-xiao-zi';
import { ElectricGenerator } from './electric-generator';
import { EncouragementLetter } from './encouragement-letter';
import { EnergySign } from './energy-sign';
import { EnergySticker } from './energy-sticker';
import { FeatherBall } from './feather-ball';
import { ForestSealStone } from './forest-seal-stone';
import { FuChouQuanXiang } from './fu-chou-quan-xiang';
import { FuLuGuo } from './fu-lu-guo';
import { FuTuBoShiDeJuBen } from './fu-tu-bo-shi-de-ju-ben';
import { GangShi } from './gang-shi';
import { GongRen } from './gong-ren';
import { GreatBall } from './great-ball';
import { GuanLiYuan } from './guan-li-yuan';
import { GuLuXia } from './gu-lu-xia';
import { HaiDai } from './hai-dai';
import { HaoHuaDouPeng } from './hao-hua-dou-peng';
import { HaoHuaZhaDan } from './hao-hua-zha-dan';
import { HeiLianDeGuanZhao } from './hei-lian-de-guan-zhao';
import { HisuianHeavyBall } from './hisuian-heavy-ball';
import { Honey } from './honey';
import { HuangBo } from './huang-bo';
import { HuoXia } from './huo-xia';
import { JiGuanBi } from './ji-guan-bi';
import { JinHua } from './jin-hua';
import { JiNiYa } from './ji-ni-ya';
import { JiXianYaoDai } from './ji-xian-yao-dai';
import { JinJiHuaBan } from './jin-ji-hua-ban';
import { Judge } from './judge';
import { JetEnergy } from './jet-energy';
import { KeLaWeiEr } from './ke-la-wei-er';
import { KongHuangMianJu } from './kong-huang-mian-ju';
import { KouSha } from './kou-sha';
import { KuSuoLuoSiQiDeQiTu } from './ku-suo-luo-si-qi-de-qi-tu';
import { LaBenBoShi } from './la-ben-bo-shi';
import { Leftovers } from './leftovers';
import { LeiHe } from './lei-he';
import { LeiMu } from './lei-mu';
import { LiJiaDeYaoQing } from './li-jia-de-yao-qing';
import { LinWeiYiJi } from './lin-wei-yi-ji';
import { LiPu } from './li-pu';
import { LiZhiShaLou } from './li-zhi-sha-lou';
import { LostVacuum } from './lost-vacuum';
import { LuckyHelmet } from './lucky-helmet';
import { Annihilape } from './annihilape';
import { createAErZhouSiVVariants } from './a-er-zhou-si-v';
import { createAErZhouSiVStarVariants } from './a-er-zhou-si-vstar';
import { BoBo, seedBoBoVariants } from './bo-bo';
import { BoBoCsv4C, seedBoBoCsv4CVariants } from './bo-bo-csv4c';
import { DaBiNiaoEx } from './da-bi-niao-ex';
import { DaBiNiaoV } from './da-bi-niao-v';
import { DaWeiLi } from './da-wei-li';
import { DaWeiLiCs5bC, DaWeiLiCs5bCCommon } from './da-wei-li-cs5bc';
import { DaWeiLiCs5aC, DaWeiLiCs5aCRareSparkle, DaWeiLiPromo3, DaWeiLiCszc, DaWeiLiCsve1C2, DaWeiLiCsve2pC2 } from './da-wei-li-variants';
import { DaYaLi } from './da-ya-li';
import { DaYaLiCs5aC } from './da-ya-li-cs5ac';
import { Drifloon } from './drifloon';
import { GardevoirEx } from './gardevoir-ex';
import { GuangHuiJiaHeRenWa } from './guang-hui-jia-he-ren-wa';
import { GuangHuiXiCuiDaNiuLa } from './guang-hui-xi-cui-da-niu-la';
import { GuangHuiPenHuoLong } from './guang-hui-pen-huo-long';
import { GuiJiaoLuV } from './gui-jiao-lu-v';
import { HuaYanGuai } from '../set_g/hua-yan-guai';
import { ZuZhouWaWaEx } from '../set_g/zu-zhou-wa-wa-ex';
import { YuanYingWaWa } from '../set_g/yuan-ying-wa-wa';
import { HongMingYueEx } from './hong-ming-yue-ex';
import { HouJiaoWei } from './hou-jiao-wei';
import { HouJiaoWeiG } from './hou-jiao-wei-g';
import { HuoKongLong } from './huo-kong-long';
import { huoKongLong151CVariants } from './huo-kong-long-151c';
import { huoKongLongCsv5cVariants } from './huo-kong-long-csv5c';
import { huoKongLongCs5aCVariants } from './huo-kong-long-cs5ac';
import { IronHandsEx } from './iron-hands-ex';
import { Kirlia } from './kirlia';
import { KirliaCs5aC } from './kirlia-cs5ac';
import { KirliaCsv2C } from './kirlia-csv2c';
import { LuoJiYaV } from './luo-ji-ya-v';
import { LuoJiYaVSTAR } from './luo-ji-ya-vstar';
import { LumineonV } from './lumineon-v';
import { MaJiaMu } from './ma-jia-mu';
import { Manaphy } from './manaphy';
import { MarniesPride } from './marnies-pride';
import { MasterBall } from './master-ball';
import { Mela } from './mela';
import { MewEx } from './mew-ex';
import { Mesagoza } from './mesagoza';
import { MetalLab } from './metal-lab';
import { MiKeLi } from './mi-ke-li';
import { Mimosa } from './mimosa';
import { MiraidonEx } from './miraidon-ex';
import { PiBaoBao } from './pi-bao-bao';
import { MooMooMilk } from './moo-moo-milk';
import { MuDan } from './mu-dan';
import { NaiNaiMeiDeXieZhu } from './nai-nai-mei-de-xie-zhu';
import { NengLiangWoLun } from './neng-liang-wo-lun';
import { Nemo } from './nemo';
import { NestBall } from './nest-ball';
import { NieKai } from './nie-kai';
import { NieMu } from './nie-mu';
import { NuYingGeEx } from './nu-ying-ge-ex';
import { OranguruV } from './oranguru-v';
import { Ditto } from '../set_g/ditto';
import { Klawf } from '../set_g/klawf';
import { KaBiShouG } from '../set_g/ka-bi-shou-g';
import { Noibat } from '../set_g/noibat';
import { Ralts } from './ralts';
import { RaltsCs5aC } from './ralts-cs5ac';
import { RaltsCs65C } from './ralts-cs65c';
import { KaBiShouF } from './ka-bi-shou-f';
import { KaBiShouBlock } from './ka-bi-shou-block';
import { ZuZhouWaWa } from './zu-zhou-wa-wa';
import { penHuoLongExVariants } from './pen-huo-long-ex';
import { DoubleTurboEnergy } from './double-turbo-energy';
import { RaichuV } from './raichu-v';
import { RaikouV } from './raikou-v';
import { RotomV } from './rotom-v';
import { TaoDaiLangEx } from './tao-dai-lang-ex';
import { GiftEnergy } from './gift-energy';
import { HuiLiBiaoEnergy } from './hui-li-biao-energy';
import { MistEnergy } from './mist-energy';
import { YaoQuanEr } from './yao-quan-er';
import { ZhenYiFa } from './zhen-yi-fa';
import { ShiZuDaNiao } from './shi-zu-da-niao';
import { xiaoHuoLongCards } from './xiao-huo-long';
import { YueYueXiongHeYueEx } from './yue-yue-xiong-he-yue-ex';
import { Zapdos } from './zapdos';
import { NightStretcher } from '../set_h/night-stretcher';
import { PaDiYaDeXueSheng } from './pa-di-ya-de-xue-sheng';
import { PalPad } from './pal-pad';
import { PiNa } from './pi-na';
import { PiPa } from './pi-pa';
import { PiaoTai } from './piao-tai';
import { PicnicBasket } from './picnic-basket';
import { PokeBall } from './poke-ball';
import { Pokegear30 } from './pokegear-3-0';
import { guaGuaPaoWaVariants } from './gua-gua-pao-wa';
import { huPaExVariants } from './hu-pa-ex';
import { qiYuanPaLuQiYaVVariants } from './qi-yuan-pa-lu-qi-ya-v';
import { qiYuanPaLuQiYaVstarVariants } from './qi-yuan-pa-lu-qi-ya-vstar';
import { PracticeStudio } from './practice-studio';
import { QianJinXiaoJie } from './qian-jin-xiao-jie';
import { QianLi } from './qian-li';
import { QianXiangGuo } from './qian-xiang-guo';
import { QiaoKeGuo } from './qiao-ke-guo';
import { QingMu } from './qing-mu';
import { QiuMing } from './qiu-ming';
import { GiratinaV } from './qi-la-di-na-v';
import { GiratinaVSTAR } from './qi-la-di-na-vstar';
import { createQiYuanDiYaLuKaVVariants } from './qi-yuan-di-ya-lu-ka-v';
import { createQiYuanDiYaLuKaVStarVariants } from './qi-yuan-di-ya-lu-ka-vstar';
import { RadiantAlakazam } from './radiant-alakazam';
import { RegidragoV } from './regidrago-v';
import { RegidragoVSTAR } from './regidrago-vstar';
import { RockChestPlate } from './rock-chest-plate';
import { RockyHelmet } from './rocky-helmet';
import { Roxanne } from './roxanne';
import { SafetyGoggles } from './safety-goggles';
import { SaiJi } from './sai-ji';
import { SandyShocksG } from './sandy-shocks-g';
import { SaWaLuo } from './sa-wa-luo';
import { ShaLi } from './sha-li';
import { ShaLiNa } from './sha-li-na';
import { ShenAoDeHuoBan } from './shen-ao-de-huo-ban';
import { ShenDai } from './shen-dai';
import { ShanDianNiao } from './shan-dian-niao';
import { ShouChiXunHuanShan } from './shou-chi-xun-huan-shan';
import { ShuaiJiaoYingRen } from './shuai-jiao-ying-ren';
import { ShuiLianDeZhaoGu } from './shui-lian-de-zhao-gu';
import { SongYeDeXinXin } from './song-ye-de-xin-xin';
import { SparklingCrystal } from './sparkling-crystal';
import { SturdyPickaxe } from './sturdy-pickaxe';
import { SuoLianZhanGao } from './suo-lian-zhan-gao';
import { SweetBall } from './sweet-ball';
import { TanXianJiaDeXiangDao } from './tan-xian-jia-de-xiang-dao';
import { TeamYellsCheer } from './team-yells-cheer';
import { TastyWaterKit } from './tasty-water-kit';
import { TempleOfSinnoh } from '../set-sword-and-shield/temple-of-sinnoh';
import { TianKongFengYinShi } from './tian-kong-feng-yin-shi';
import { TianXingDuiShouXia } from './tian-xing-dui-shou-xia';
import { Toolbox } from './toolbox';
import { TrekkingShoes } from './trekking-shoes';
import { SwitchCart } from './switch-cart';
import { TuTuTouKui } from './tu-tu-tou-kui';
import { TuiHua } from './tui-hua';
import { VariantTrainerSeed } from './variant-trainer-card';
import { VictoryStamp } from './victory-stamp';
import { VitalityBand } from './vitality-band';
import { WaDongXiongDi } from './wa-dong-xiong-di';
import { WanLong } from './wan-long';
import { WangLuo } from './wang-luo';
import { WisdomLake } from './wisdom-lake';
import { WuSong } from './wu-song';
import { WuLi } from './wu-li';
import { XiCanChuShi } from './xi-can-chu-shi';
import { XiCuiDeHuoBan } from './xi-cui-de-huo-ban';
import { XianHou } from './xian-hou';
import { XiaoSong } from './xiao-song';
import { Xiaobai } from './xiaobai';
import { XinLi } from './xin-li';
import { XingCunDuanLianQi } from './xing-cun-duan-lian-qi';
import { XingYue } from './xing-yue';
import { XunLuoMao } from './xun-luo-mao';
import { XiCuiNianMeiLongV } from './xi-cui-nian-mei-long-v';
import { XiCuiNianMeiLongVSTAR } from './xi-cui-nian-mei-long-vstar';
import { YaXuan } from './ya-xuan';
import { createYaoHuoHongHuVVariants } from './yao-huo-hong-hu-v';
import { YangSanJieJie } from './yang-san-jie-jie';
import { YeCanNvHai } from './ye-can-nv-hai';
import { YeCi } from './ye-ci';
import { YeYinPiFeng } from './ye-yin-pi-feng';
import { LegacyEnergy } from '../set_h/legacy-energy';
import { VGuardEnergy } from './v-guard-energy';
import { YeZeiSanJieMei } from './ye-zei-san-jie-mei';
import { YingHuoZhuanJia } from './ying-huo-zhuan-jia';
import { YingJiGuoDong } from './ying-ji-guo-dong';
import { YingXiongDouPeng } from './ying-xiong-dou-peng';
import { ZaiHuoXiang } from './zai-huo-xiang';
import { ZhengHuiDeChuanShu } from './zheng-hui-de-chuan-shu';
import { EnteiV } from './entei-v';
import { ZhouShuDanZi } from './zhou-shu-dan-zi';
import { Zisu } from './zisu';
import { AnMaMiDeJieDu } from './an-ma-mi-de-jie-du';
import { MeiLiSha } from './mei-li-sha';
import { ZhongLiZhongXin } from './zhong-li-zhong-xin';
import { ZuAiZhiTa } from './zu-ai-zhi-ta';

type TrainerCardLike = TrainerCard & VariantTrainerSeed;

function seedExisting<T extends TrainerCard>(instance: T, seed: VariantTrainerSeed): T {
  instance.tags = seed.tags || [];
  instance.trainerType = seed.trainerType;
  instance.set = seed.set;
  instance.name = seed.name;
  instance.fullName = seed.fullName;
  instance.text = seed.text;
  instance.canUseOnFirstTurn = seed.canUseOnFirstTurn;
  (instance as T & { rawData: typeof seed.rawData }).rawData = {
    ...seed.rawData,
    logic_group_key: seed.rawData.logic_group_key || `trainer:${seed.trainerType}:${instance.constructor.name}`
  };
  return instance;
}

type SeededCardLike = Card & {
  set: string;
  name: string;
  fullName: string;
  rawData?: any;
  text?: string;
  tags?: any[];
};

function seedCard<T extends SeededCardLike>(instance: T, seed: SeededCardLike): T {
  instance.set = seed.set;
  instance.name = seed.name;
  instance.fullName = seed.fullName;
  instance.rawData = seed.rawData;
  if ('text' in instance && 'text' in seed) {
    instance.text = seed.text;
  }
  if (Array.isArray(seed.tags)) {
    instance.tags = seed.tags;
  }
  return instance;
}

type PokemonVariantLike = Card & {
  name: string;
  fullName: string;
  rawData: {
    raw_card: {
      id: number;
      commodityCode?: string;
      details: {
        collectionNumber: string;
        rarityLabel?: string;
      };
      image?: string;
      illustratorNames?: string[];
    };
    collection?: {
      id: number;
      commodityCode?: string;
      name: string;
    };
    image_url?: string;
    logic_group_key?: string;
    variant_group_key?: string;
    variant_group_size?: number;
  };
};

type PokemonVariantSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
  logicGroupKey: string;
  variantGroupKey: string;
  variantGroupSize: number;
  illustratorNames?: string[];
};

function seedPokemonVariant<T extends PokemonVariantLike>(instance: T, options: PokemonVariantSeed): T {
  instance.rawData = {
    ...instance.rawData,
    raw_card: {
      ...instance.rawData.raw_card,
      id: options.id,
      commodityCode: options.commodityCode,
      image: getCardImageUrl(options.id),
      ...(options.illustratorNames ? { illustratorNames: options.illustratorNames } : {}),
      details: {
        ...instance.rawData.raw_card.details,
        collectionNumber: options.collectionNumber,
        rarityLabel: options.rarityLabel,
      },
    },
    collection: {
      id: options.collectionId,
      commodityCode: options.commodityCode,
      name: options.collectionName,
    },
    image_url: getR2CardImageUrl(options.id),
    logic_group_key: options.logicGroupKey,
    variant_group_key: options.variantGroupKey,
    variant_group_size: options.variantGroupSize,
  };
  instance.fullName = `${instance.name} ${options.collectionNumber}#${options.id}`;
  return instance;
}

function seedPokemonVariants<T extends PokemonVariantLike>(
  factory: () => T,
  variants: PokemonVariantSeed[]
): T[] {
  return variants.map(variant => seedPokemonVariant(factory(), variant));
}

function normalizeTrainerName(value: string): string {
  return value.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

const overrideFactories: Record<string, (card: TrainerCardLike) => Card> = {
  '友好宝芬': card => new BuddyBuddyPoffin(toSeed(card)),
  '捕获香氛': card => new CapturingAroma(toSeed(card)),
  '精灵球': card => new PokeBall(toSeed(card)),
  '宝可梦交替': card => seedExisting(new Switch(), toSeed(card)),
  '交替推车': card => new SwitchCart(toSeed(card)),
  '宝可梦捕捉器': card => seedExisting(new PokemonCatcher(), toSeed(card)),
  '神奇糖果': card => seedExisting(new RareCandy(), toSeed(card)),
  '高级球': card => seedExisting(new UltraBall(), toSeed(card)),
  '超级球': card => new GreatBall(toSeed(card)),
  '奇树': card => seedExisting(new Iono(), toSeed(card)),
  '裁判': card => new Judge(toSeed(card)),
  '妮莫': card => new Nemo(toSeed(card)),
  '阿驯': card => new Axun(toSeed(card)),
  '星月': card => new XingYue(toSeed(card)),
  '马加木': card => new MaJiaMu(toSeed(card)),
  '千金小姐': card => new QianJinXiaoJie(toSeed(card)),
  '神奥的伙伴': card => new ShenAoDeHuoBan(toSeed(card)),
  '洗翠的伙伴': card => new XiCuiDeHuoBan(toSeed(card)),
  '阿渡': card => new ADu(toSeed(card)),
  '吉尼亚': card => new JiNiYa(toSeed(card)),
  '克拉韦尔': card => new KeLaWeiEr(toSeed(card)),
  '阿速': card => new ASu(toSeed(card)),
  '野餐女孩': card => new YeCanNvHai(toSeed(card)),
  '滨名的后援': card => new BinMingDeHouYuan(toSeed(card)),
  '小菘': card => new XiaoSong(toSeed(card)),
  '正辉的传输': card => new ZhengHuiDeChuanShu(toSeed(card)),
  '牡丹': card => new MuDan(toSeed(card)),
  '瓢太': card => new PiaoTai(toSeed(card)),
  '莉普': card => new LiPu(toSeed(card)),
  '探险家的向导': card => new TanXianJiaDeXiangDao(toSeed(card)),
  '白露的真心': card => new BaiLuDeZhenXin(toSeed(card)),
  '西餐厨师': card => new XiCanChuShi(toSeed(card)),
  '枇琶': card => new PiPa(toSeed(card)),
  '长袖和服少女': card => new ChangXiuHeFuShaoNv(toSeed(card)),
  '营火专家': card => new YingHuoZhuanJia(toSeed(card)),
  '拉苯博士': card => new LaBenBoShi(toSeed(card)),
  '亚玄': card => new YaXuan(toSeed(card)),
  '查克洛': card => new ChaKeLuo(toSeed(card)),
  '黑连的关照': card => new HeiLianDeGuanZhao(toSeed(card)),
  '神代': card => new ShenDai(toSeed(card)),
  '米可利': card => new MiKeLi(toSeed(card)),
  '挖洞兄弟': card => new WaDongXiongDi(toSeed(card)),
  '短裤小子': card => new DuanKuXiaoZi(toSeed(card)),
  '莎莉娜': card => new ShaLiNa(toSeed(card)),
  '菜种的活力': card => new CaiZhongDeHuoLi(toSeed(card)),
  '坂木的领导力': card => new BanMuDeLingDaoLi(toSeed(card)),
  '莉佳的邀请': card => new LiJiaDeYaoQing(toSeed(card)),
  '凰檗': card => new HuangBo(toSeed(card)),
  '秋明': card => new QiuMing(toSeed(card)),
  '古鲁夏': card => new GuLuXia(toSeed(card)),
  '寇沙': card => new KouSha(toSeed(card)),
  '青木': card => new QingMu(toSeed(card)),
  '聂凯': card => new NieKai(toSeed(card)),
  '野贼三姐妹': card => new YeZeiSanJieMei(toSeed(card)),
  '阿枫': card => new AFeng(toSeed(card)),
  '天星队手下': card => new TianXingDuiShouXia(toSeed(card)),
  '皮拿': card => new PiNa(toSeed(card)),
  '奥尔迪加': card => new AoErDiJia(toSeed(card)),
  '辛俐': card => new XinLi(toSeed(card)),
  '奈奈美的协助': card => new NaiNaiMeiDeXieZhu(toSeed(card)),
  '阳伞姐姐': card => new YangSanJieJie(toSeed(card)),
  '蕾荷': card => new LeiHe(toSeed(card)),
  '波琵': card => new BoPi(toSeed(card)),
  '呐喊队的应援': card => new TeamYellsCheer(toSeed(card)),
  '玛俐的骄傲': card => new MarniesPride(toSeed(card)),
  '竹兰的霸气': card => new CynthiasAmbition(toSeed(card)),
  '珠贝': card => new Zisu(toSeed(card)),
  '晓白': card => new Xiaobai(toSeed(card)),
  '火夏': card => new HuoXia(toSeed(card)),
  '贝里菈': card => new BeiLiLa(toSeed(card)),
  '阿芒': card => new AMang(toSeed(card)),
  '刚石': card => new GangShi(toSeed(card)),
  '工人': card => new GongRen(toSeed(card)),
  '博士的研究': card => seedExisting(new ProfessorJuniper(), toSeed(card)),
  '派帕': card => seedExisting(new Arven(), toSeed(card)),
  '米莫莎': card => new Mimosa(toSeed(card)),
  '能量回收': card => seedExisting(new EnergyRetrieval(), toSeed(card)),
  '能量输送': card => seedExisting(new EnergySearch(), toSeed(card)),
  '能量转移': card => seedExisting(new EnergySwitch(), toSeed(card)),
  '能量签': card => new EnergySign(toSeed(card)),
  '能量贴纸': card => new EnergySticker(toSeed(card)),
  '大地容器': card => seedExisting(new EarthenVessel(), toSeed(card)),
  '电气发生器': card => new ElectricGenerator(toSeed(card)),
  '美味之水套装': card => new TastyWaterKit(toSeed(card)),
  '坚毅铁镐': card => new SturdyPickaxe(toSeed(card)),
  '甜甜蜜': card => new Honey(toSeed(card)),
  '工具箱': card => new Toolbox(toSeed(card)),
  '宝可装置3.0': card => new Pokegear30(toSeed(card)),
  '鼓励信': card => new EncouragementLetter(toSeed(card)),
  '胜利之印': card => new VictoryStamp(toSeed(card)),
  '野餐篮': card => new PicnicBasket(toSeed(card)),
  '送货无人机': card => new DeliveryDrone(toSeed(card)),
  '健行鞋': card => new TrekkingShoes(toSeed(card)),
  '大师球': card => new MasterBall(toSeed(card)),
  '粉碎之锤': card => seedExisting(new CrushingHammer(), toSeed(card)),
  '改造之锤': card => seedExisting(new EnhancedHammer(), toSeed(card)),
  '暗黑补丁': card => seedExisting(new DarkPatch(), toSeed(card)),
  '伤药': card => seedExisting(new Potion(), toSeed(card)),
  '加油牛奶': card => new MooMooMilk(toSeed(card)),
  '厉害钓竿': card => seedExisting(new SuperRod(), toSeed(card)),
  '超级能量回收': card => seedExisting(new SuperEnergyRetrieval(), toSeed(card)),
  '朋友手册': card => new PalPad(toSeed(card)),
  '高级香氛': card => new AdvancedAroma(toSeed(card)),
  '甜蜜球': card => new SweetBall(toSeed(card)),
  '黑暗球': card => new DarkBall(toSeed(card)),
  '飞羽球': card => new FeatherBall(toSeed(card)),
  '夜间担架': card => seedExisting(new NightStretcher(), toSeed(card)),
  '神奥神殿': card => seedExisting(new TempleOfSinnoh(), toSeed(card)),
  '老大的指令': card => seedExisting(new Lysandre(), toSeed(card)),
  '巢穴球': card => new NestBall(toSeed(card)),
  '反击捕捉器': card => new CounterCatcher(toSeed(card)),
  '顶尖捕捉器': card => new DingJianBuZhuoQi(toSeed(card)),
  '放逐吸尘器': card => new LostVacuum(toSeed(card)),
  '杜娟': card => new Roxanne(toSeed(card)),
  '梅洛可': card => new Mela(toSeed(card)),
  '森林封印石': card => new ForestSealStone(toSeed(card)),
  '洗翠的沉重球': card => new HisuianHeavyBall(toSeed(card)),
  '璀璨结晶': card => new SparklingCrystal(toSeed(card)),
  '活力头带': card => new VitalityBand(toSeed(card)),
  '勇气护符': card => new BraveryCharm(toSeed(card)),
  '不公印章': card => new UnfairStamp(toSeed(card)),
  '锅型头盔': card => new RockyHelmet(toSeed(card)),
  '岩石胸甲': card => new RockChestPlate(toSeed(card)),
  '吃剩的东西': card => new Leftovers(toSeed(card)),
  '坚硬束带': card => new BindingBand(toSeed(card)),
  '大气球': card => new BigAirBalloon(toSeed(card)),
  '不服输头带': card => new DefianceBand(toSeed(card)),
  '不服输背心': card => new DefianceVest(toSeed(card)),
  '讲究腰带': card => new ChoiceBelt(toSeed(card)),
  '幸运头盔': card => new LuckyHelmet(toSeed(card)),
  '安全护目镜': card => new SafetyGoggles(toSeed(card)),
  '学习装置': card => seedExisting(new ExpShare(), toSeed(card)),
  '睿智湖': card => new WisdomLake(toSeed(card)),
  '灾祸荒野': card => new DisasterWilderness(toSeed(card)),
  '崩塌的竞技场': card => new BengTaDeJingJiChang(toSeed(card)),
  '深钵镇': card => seedExisting(new Artazon(), toSeed(card)),
  '海滩场地': card => new BeachCourt(toSeed(card)),
  '桌台市': card => seedExisting(new Mesagoza(), toSeed(card)),
  '练习室': card => new PracticeStudio(toSeed(card)),
  '全金属实验室': card => new MetalLab(toSeed(card)),
  '阻碍之塔': card => new ZuAiZhiTa(toSeed(card)),
  '中立中心': card => new ZhongLiZhongXin(toSeed(card)),
  '丹瑜': card => new DanYu(toSeed(card)),
  '乌栗': card => new WuLi(toSeed(card)),
  '仙后': card => new XianHou(toSeed(card)),
  '冲浪手': card => new ChongLangShou(toSeed(card)),
  '千里': card => new QianLi(toSeed(card)),
  '也慈': card => new YeCi(toSeed(card)),
  '八朔': card => new BaShuo(toSeed(card)),
  '奥琳博士的气魄': card => new AoLinBoShiDeQiPo(toSeed(card)),
  '婉龙': card => new WanLong(toSeed(card)),
  '帕底亚的学生': card => new PaDiYaDeXueSheng(toSeed(card)),
  '库瑟洛斯奇的企图': card => new KuSuoLuoSiQiDeQiTu(toSeed(card)),
  '弗图博士的剧本': card => new FuTuBoShiDeJuBen(toSeed(card)),
  '捩木': card => new NieMu(toSeed(card)),
  '松叶的信心': card => new SongYeDeXinXin(toSeed(card)),
  '水莲的照顾': card => new ShuiLianDeZhaoGu(toSeed(card)),
  '沙俪': card => new ShaLi(toSeed(card)),
  '海岱': card => new HaiDai(toSeed(card)),
  '管理员': card => new GuanLiYuan(toSeed(card)),
  '莱姆': card => new LeiMu(toSeed(card)),
  '萨瓦罗': card => new SaWaLuo(toSeed(card)),
  '赛吉': card => new SaiJi(toSeed(card)),
  '阿克罗玛的实验': card => new AKeLuoMaDeShiYan(toSeed(card)),
  '阿克罗玛的执念': card => new AKeLuoMaDeZhiNian(toSeed(card)),
  '阿杏的秘招': card => new AXingDeMiZhao(toSeed(card)),
  '千香果': card => new QianXiangGuo(toSeed(card)),
  '巧可果': card => new QiaoKeGuo(toSeed(card)),
  '凸凸头盔': card => new TuTuTouKui(toSeed(card)),
  '力之沙漏': card => new LiZhiShaLou(toSeed(card)),
  '咒术掸子': card => new ZhouShuDanZi(toSeed(card)),
  '复仇拳箱': card => new FuChouQuanXiang(toSeed(card)),
  '幸存锻炼器': card => new XingCunDuanLianQi(toSeed(card)),
  '应急果冻': card => new YingJiGuoDong(toSeed(card)),
  '手持循环扇': card => new ShouChiXunHuanShan(toSeed(card)),
  '机关臂': card => new JiGuanBi(toSeed(card)),
  '招式学习器 临危一击': card => new LinWeiYiJi(toSeed(card)),
  '招式学习器 暗中奇袭': card => new AnZhongQiXi(toSeed(card)),
  '招式学习器 能量涡轮': card => new NengLiangWoLun(toSeed(card)),
  '招式学习器 进化': card => new JinHua(toSeed(card)),
  '招式学习器 退化': card => new TuiHua(toSeed(card)),
  '极限腰带': card => new JiXianYaoDai(toSeed(card)),
  '沉重接力棒': card => new ChenZhongJieLiBang(toSeed(card)),
  '灾祸箱': card => new ZaiHuoXiang(toSeed(card)),
  '福禄果': card => new FuLuGuo(toSeed(card)),
  '紧急滑板': card => new JinJiHuaBan(toSeed(card)),
  '英雄斗篷': card => new YingXiongDouPeng(toSeed(card)),
  '豪华斗篷': card => new HaoHuaDouPeng(toSeed(card)),
  '豪华炸弹': card => new HaoHuaZhaDan(toSeed(card)),
  '超群眼镜': card => new ChaoQunYanJing(toSeed(card)),
  '锁链粘糕': card => new SuoLianZhanGao(toSeed(card)),
  '大地封印石': card => new DaDiFengYinShi(toSeed(card)),
  '天空封印石': card => new TianKongFengYinShi(toSeed(card)),
  '恐慌面具': card => new KongHuangMianJu(toSeed(card)),
  '悟松': card => new WuSong(toSeed(card)),
  '暗码迷的解读': card => new AnMaMiDeJieDu(toSeed(card)),
  '望罗': card => new WangLuo(toSeed(card)),
  '梅丽莎': card => new MeiLiSha(toSeed(card)),
  '叶隐披风': card => new YeYinPiFeng(toSeed(card)),
  '巡逻帽': card => new XunLuoMao(toSeed(card)),
};

function toSeed(card: TrainerCardLike): VariantTrainerSeed {
  return {
    set: card.set,
    name: normalizeTrainerName(card.name),
    fullName: card.fullName,
    text: card.text,
    trainerType: card.trainerType,
    rawData: card.rawData,
    canUseOnFirstTurn: card.canUseOnFirstTurn,
    tags: card.tags
  };
}

const overriddenNames = new Set(Object.keys(overrideFactories));
const overriddenPokemonFullNames = new Set([
  '百变怪 168/151#11531',
  '毛崖蟹 080/128#15938',
  '嗡蝠 094/129#14602',
]);
const energyOverrideFactories: Record<string, (card: SeededCardLike) => Card> = {
  '双重涡轮能量': card => seedCard(new DoubleTurboEnergy(), card),
  '喷射能量': card => seedCard(new JetEnergy(), card),
  '馈赠能量': card => seedCard(new GiftEnergy(), card),
  '薄雾能量': card => seedCard(new MistEnergy(), card),
  'V防守能量': card => seedCard(new VGuardEnergy(), card),
  '回力镖能量': card => seedCard(new HuiLiBiaoEnergy(), card),
  '遗赠能量': card => seedCard(new LegacyEnergy(), card),
};
const overriddenEnergyNames = new Set(Object.keys(energyOverrideFactories));

export const setF: Card[] = [
  ...generatedSetF.filter(card => {
    if (overriddenPokemonFullNames.has(card.fullName)) {
      return false;
    }
    if (card instanceof TrainerCard) {
      return !overriddenNames.has(normalizeTrainerName(card.name));
    }
    if (card.superType === SuperType.ENERGY) {
      return !overriddenEnergyNames.has(card.name);
    }
    return true;
  }),
  ...generatedSetF
    .filter((card): card is SeededCardLike => card.superType === SuperType.ENERGY && overriddenEnergyNames.has(card.name))
    .map(card => energyOverrideFactories[card.name](card)),
  ...generatedSetF
    .filter((card): card is TrainerCardLike => card instanceof TrainerCard && overriddenNames.has(normalizeTrainerName(card.name)))
    .map(card => overrideFactories[normalizeTrainerName(card.name)](card)),
  new MewEx(),
  new GardevoirEx(),
  new Kirlia(),
  new KirliaCs5aC(),
  new KirliaCsv2C(),
  new Ralts(),
  new RaltsCs5aC(),
  new RaltsCs65C(),
  new Annihilape(),
  new Drifloon(),
  new HouJiaoWei(),
  new HouJiaoWei({
    id: 16519,
    collectionNumber: '107/204',
    rarityLabel: 'C☆★',
    commodityCode: 'CSV7C',
    collectionId: 324,
    collectionName: '补充包 利刃猛醒',
    specialCardLabel: '古代',
  }),
  new HouJiaoWei({
    id: 16273,
    collectionNumber: '107/204',
    rarityLabel: 'C',
    commodityCode: 'CSV7C',
    collectionId: 324,
    collectionName: '补充包 利刃猛醒',
    specialCardLabel: '古代',
  }),
  new HouJiaoWeiG(),
  new HouJiaoWeiG({
    id: 15809,
    collectionNumber: '065/128',
    rarityLabel: 'U☆★',
    commodityCode: 'CSV6C',
    collectionId: 311,
    collectionName: '补充包 真实玄虚',
    specialCardLabel: '古代',
  }),
  new HouJiaoWeiG({
    id: 15652,
    collectionNumber: '065/128',
    rarityLabel: 'U',
    commodityCode: 'CSV6C',
    collectionId: 311,
    collectionName: '补充包 真实玄虚',
    specialCardLabel: '古代',
  }),
  new HouJiaoWeiG({
    id: 16097,
    collectionNumber: '104/052',
    rarityLabel: '无标记',
    commodityCode: 'CSVL2C',
    collectionId: 314,
    collectionName: '游历专题包',
    specialCardLabel: '古代',
  }),
  new HouJiaoWeiG({
    id: 16908,
    collectionNumber: '011/033',
    rarityLabel: '无标记',
    commodityCode: 'CSVM1bC',
    collectionId: 329,
    collectionName: '大师战略卡组构筑套装 沙奈朵ex',
    specialCardLabel: null,
  }),
  new GuangHuiJiaHeRenWa(),
  new GuangHuiPenHuoLong(),
  new GuiJiaoLuV(),
  new HongMingYueEx(),
  new BoBo(),
  ...seedBoBoVariants(() => new BoBo(), [
    { id: 11700, collectionNumber: '016/151', rarityLabel: 'C★★★', commodityCode: '151C4' },
    { id: 11561, collectionNumber: '016/151', rarityLabel: 'C☆★', commodityCode: '151C4' },
    { id: 11379, collectionNumber: '016/151', rarityLabel: 'C', commodityCode: '151C4' },
    { id: 16938, collectionNumber: '008/033', rarityLabel: '无标记', commodityCode: 'CSVM1aC' },
  ]),
  new BoBoCsv4C(),
  ...seedBoBoCsv4CVariants(() => new BoBoCsv4C(), [
    { id: 14606, collectionNumber: '099/129', rarityLabel: 'C★★★', commodityCode: 'CSV4C' },
    { id: 14491, collectionNumber: '099/129', rarityLabel: 'C☆★', commodityCode: 'CSV4C' },
    { id: 14338, collectionNumber: '099/129', rarityLabel: 'C', commodityCode: 'CSV4C' },
  ]),
  new DaBiNiaoEx(),
  new DaBiNiaoV(),
  new DaWeiLi(),
  new DaWeiLiCs5aCRareSparkle(),
  new DaWeiLiCs5aC(),
  new DaWeiLiPromo3(),
  new DaWeiLiCszc(),
  new DaWeiLiCsve1C2(),
  new DaWeiLiCsve2pC2(),
  new DaWeiLiCs5bC(),
  new DaWeiLiCs5bCCommon(),
  new DaYaLi(),
  ...seedPokemonVariants(() => new DaYaLi(), [
    {
      id: 9615,
      collectionId: 182,
      collectionName: '补充包 勇魅群星 勇',
      commodityCode: 'CS5bC',
      collectionNumber: '111/128',
      rarityLabel: 'C',
      logicGroupKey: 'pokemon:P399:大牙狸:60:毫不在意:终结门牙',
      variantGroupKey: 'pokemon:P399:大牙狸:60:毫不在意:终结门牙',
      variantGroupSize: 5,
    },
    {
      id: 12565,
      collectionId: 258,
      collectionName: '对战派对 共梦 下',
      commodityCode: 'CSVE1C2',
      collectionNumber: '096/177',
      rarityLabel: '无标记',
      logicGroupKey: 'pokemon:P399:大牙狸:60:毫不在意:终结门牙',
      variantGroupKey: 'pokemon:P399:大牙狸:60:毫不在意:终结门牙',
      variantGroupSize: 5,
    },
    {
      id: 11109,
      collectionId: 224,
      collectionName: '收藏周边礼盒 百变宝盒',
      commodityCode: 'CSZC',
      collectionNumber: '022/066',
      rarityLabel: '无标记',
      logicGroupKey: 'pokemon:P399:大牙狸:60:毫不在意:终结门牙',
      variantGroupKey: 'pokemon:P399:大牙狸:60:毫不在意:终结门牙',
      variantGroupSize: 5,
    },
    {
      id: 11166,
      collectionId: 228,
      collectionName: '精灵球/等级球礼盒：宝可梦艺术插画庆典 聚',
      commodityCode: 'CSYC',
      collectionNumber: '004/011',
      rarityLabel: '无标记',
      logicGroupKey: 'pokemon:P399:大牙狸:60:毫不在意:终结门牙',
      variantGroupKey: 'pokemon:P399:大牙狸:60:毫不在意:终结门牙',
      variantGroupSize: 5,
    },
  ]),
  new DaYaLiCs5aC(),
  ...seedPokemonVariants(() => new DaYaLiCs5aC(), [
    {
      id: 9888,
      collectionId: 183,
      collectionName: '补充包 勇魅群星 魅',
      commodityCode: 'CS5aC',
      collectionNumber: '104/127',
      rarityLabel: 'C',
      logicGroupKey: 'pokemon:P399:大牙狸:70:滚动',
      variantGroupKey: 'pokemon:P399:大牙狸:70:滚动',
      variantGroupSize: 2,
    },
  ]),
  new HuoKongLong(),
  new HuaYanGuai(),
  new ZuZhouWaWaEx(),
  new YuanYingWaWa(),
  new ZuZhouWaWa(),
  new GuangHuiXiCuiDaNiuLa(),
  new KaBiShouF(),
  new KaBiShouBlock(),
  new KaBiShouG(),
  ...huoKongLongCs5aCVariants,
  ...huoKongLong151CVariants,
  ...huoKongLongCsv5cVariants,
  new IronHandsEx(),
  new LuoJiYaV(),
  new LuoJiYaVSTAR(),
  new MiraidonEx(),
  new PiBaoBao(),
  new GiratinaV(),
  new GiratinaVSTAR(),
  new RegidragoV(),
  new RegidragoVSTAR(),
  new SandyShocksG(),
  new NuYingGeEx(),
  new OranguruV(),
  new Ditto(),
  new Klawf(),
  new Noibat(),
  ...penHuoLongExVariants,
  new EnteiV(),
  new RaichuV(),
  new RaikouV(),
  new ShanDianNiao(),
  new ShiZuDaNiao(),
  new ShuaiJiaoYingRen(),
  ...xiaoHuoLongCards,
  new XiCuiNianMeiLongV(),
  new XiCuiNianMeiLongVSTAR(),
  new YueYueXiongHeYueEx(),
  new Zapdos(),
  new RotomV(),
  new LumineonV(),
  ...createAErZhouSiVVariants(),
  ...createAErZhouSiVStarVariants(),
  ...createQiYuanDiYaLuKaVVariants(),
  ...createQiYuanDiYaLuKaVStarVariants(),
  ...createYaoHuoHongHuVVariants(),
  new YaoQuanEr(),
  ...guaGuaPaoWaVariants,
  ...huPaExVariants,
  ...qiYuanPaLuQiYaVVariants,
  ...qiYuanPaLuQiYaVstarVariants,
  new ZhenYiFa(),
  new Manaphy(),
  new TaoDaiLangEx(),
  new RadiantAlakazam()
];

export * from './variant-trainer-card';
export * from './a-er-zhou-si-v';
export * from './a-er-zhou-si-vstar';
export * from './poke-ball';
export * from './buddy-buddy-poffin';
export * from './capturing-aroma';
export * from './bo-bo';
export * from './bo-bo-csv4c';
export * from './annihilape';
export * from './drifloon';
export * from './gardevoir-ex';
export * from './guang-hui-jia-he-ren-wa';
export * from './guang-hui-pen-huo-long';
export * from './gui-jiao-lu-v';
export * from './hong-ming-yue-ex';
export * from './hou-jiao-wei';
export * from './hou-jiao-wei-g';
export * from './huo-kong-long';
export * from './iron-hands-ex';
export * from './kirlia';
export * from './kirlia-cs5ac';
export * from './kirlia-csv2c';
export * from './luo-ji-ya-v';
export * from './luo-ji-ya-vstar';
export * from './qi-la-di-na-v';
export * from './rotom-v';
export * from './lumineon-v';
export * from './ralts';
export * from './ralts-cs5ac';
export * from './ralts-cs65c';
export * from './da-bi-niao-ex';
export * from './da-bi-niao-v';
export * from './da-wei-li';
export * from './da-wei-li-cs5bc';
export * from './da-wei-li-variants';
export * from './da-ya-li';
export * from './da-ya-li-cs5ac';
export * from './miraidon-ex';
export * from './pi-bao-bao';
export * from './nu-ying-ge-ex';
export * from './oranguru-v';
export * from './pen-huo-long-ex';
export * from './entei-v';
export * from './qi-yuan-di-ya-lu-ka-v';
export * from './qi-yuan-di-ya-lu-ka-vstar';
export * from './qi-la-di-na-vstar';
export * from './raichu-v';
export * from './raikou-v';
export * from './regidrago-v';
export * from './regidrago-vstar';
export * from './tao-dai-lang-ex';
export * from './shi-zu-da-niao';
export * from './shan-dian-niao';
export * from './shuai-jiao-ying-ren';
export * from './xiao-huo-long';
export * from './xi-cui-nian-mei-long-v';
export * from './xi-cui-nian-mei-long-vstar';
export * from './yue-yue-xiong-he-yue-ex';
export * from './yao-quan-er';
export * from './yao-huo-hong-hu-v';
export * from './zhen-yi-fa';
export * from './zapdos';
export * from './manaphy';
export * from './radiant-alakazam';
export * from './nest-ball';
export * from './artazon';
export * from './counter-catcher';
export * from './lost-vacuum';
export * from './roxanne';
export * from './mela';
export * from './mew-ex';
export * from './mesagoza';
export * from './sandy-shocks-g';
export * from './zhong-li-zhong-xin';
export * from './zu-ai-zhi-ta';
export * from './forest-seal-stone';
export * from './hisuian-heavy-ball';
export * from './sparkling-crystal';
export * from './double-turbo-energy';
export * from './gift-energy';
export * from './jet-energy';
export * from './mist-energy';
export * from './hui-li-biao-energy';
export * from './v-guard-energy';
export * from './judge';
export * from './great-ball';
export * from './unfair-stamp';
export * from './vitality-band';
export * from './bravery-charm';
export * from './pal-pad';
export * from './moo-moo-milk';
export * from './energy-sticker';
export * from './electric-generator';
export * from './advanced-aroma';
export * from './trekking-shoes';
export * from './switch-cart';
export * from './sweet-ball';
export * from './defiance-band';
export * from './choice-belt';
export * from './nemo';
export * from './axun';
export * from './mimosa';
export * from './xing-yue';
export * from './ma-jia-mu';
export * from './qian-jin-xiao-jie';
export * from './shen-ao-de-huo-ban';
export * from './xi-cui-de-huo-ban';
export * from './a-du';
export * from './ji-ni-ya';
export * from './ke-la-wei-er';
export * from './a-su';
export * from './ye-can-nv-hai';
export * from './bin-ming-de-hou-yuan';
export * from './xiao-song';
export * from './zheng-hui-de-chuan-shu';
export * from './mu-dan';
export * from './piao-tai';
export * from './li-pu';
export * from './tan-xian-jia-de-xiang-dao';
export * from './bai-lu-de-zhen-xin';
export * from './xi-can-chu-shi';
export * from './pi-pa';
export * from './chang-xiu-he-fu-shao-nv';
export * from './ying-huo-zhuan-jia';
export * from './la-ben-bo-shi';
export * from './ya-xuan';
export * from './cha-ke-luo';
export * from './hei-lian-de-guan-zhao';
export * from './shen-dai';
export * from './mi-ke-li';
export * from './wa-dong-xiong-di';
export * from './duan-ku-xiao-zi';
export * from './sha-li-na';
export * from './cai-zhong-de-huo-li';
export * from './ban-mu-de-ling-dao-li';
export * from './li-jia-de-yao-qing';
export * from './huang-bo';
export * from './qiu-ming';
export * from './gu-lu-xia';
export * from './kou-sha';
export * from './qing-mu';
export * from './nie-kai';
export * from './ye-zei-san-jie-mei';
export * from './a-feng';
export * from './tian-xing-dui-shou-xia';
export * from './pi-na';
export * from './ao-er-di-jia';
export * from './xin-li';
export * from './nai-nai-mei-de-xie-zhu';
export * from './yang-san-jie-jie';
export * from './lei-he';
export * from './bo-pi';
export * from './team-yells-cheer';
export * from './marnies-pride';
export * from './cynthias-ambition';
export * from './zisu';
export * from './xiaobai';
export * from './huo-xia';
export * from './bei-li-la';
export * from './a-mang';
export * from './gang-shi';
export * from './gong-ren';
export * from './lucky-helmet';
export * from './defiance-vest';
export * from './safety-goggles';
export * from './master-ball';
export * from './dark-ball';
export * from './feather-ball';
export * from './energy-sign';
export * from './tasty-water-kit';
export * from './sturdy-pickaxe';
export * from './honey';
export * from './toolbox';
export * from './pokegear-3-0';
export * from './encouragement-letter';
export * from './victory-stamp';
export * from './picnic-basket';
export * from './delivery-drone';
export * from './rocky-helmet';
export * from './rock-chest-plate';
export * from './leftovers';
export * from './binding-band';
export * from './big-air-balloon';
export * from './wisdom-lake';
export * from './disaster-wilderness';
export * from './beach-court';
export * from './beng-ta-de-jing-ji-chang';
export * from './practice-studio';
export * from './metal-lab';
export * from './dan-yu';
export * from './wu-li';
export * from './xian-hou';
export * from './chong-lang-shou';
export * from './qian-li';
export * from './ye-ci';
export * from './ba-shuo';
export * from './ao-lin-bo-shi-de-qi-po';
export * from './wan-long';
export * from './pa-di-ya-de-xue-sheng';
export * from './ku-suo-luo-si-qi-de-qi-tu';
export * from './fu-tu-bo-shi-de-ju-ben';
export * from './nie-mu';
export * from './song-ye-de-xin-xin';
export * from './shui-lian-de-zhao-gu';
export * from './sha-li';
export * from './hai-dai';
export * from './guan-li-yuan';
export * from './lei-mu';
export * from './sa-wa-luo';
export * from './sai-ji';
export * from './a-ke-luo-ma-de-shi-yan';
export * from './a-ke-luo-ma-de-zhi-nian';
export * from './a-xing-de-mi-zhao';
export * from './qian-xiang-guo';
export * from './qiao-ke-guo';
export * from './tu-tu-tou-kui';
export * from './li-zhi-sha-lou';
export * from './zhou-shu-dan-zi';
export * from './fu-chou-quan-xiang';
export * from './xing-cun-duan-lian-qi';
export * from './ying-ji-guo-dong';
export * from './shou-chi-xun-huan-shan';
export * from './ji-guan-bi';
export * from './tm-tool-utils';
export * from './lin-wei-yi-ji';
export * from './an-zhong-qi-xi';
export * from './neng-liang-wo-lun';
export * from './jin-hua';
export * from './tui-hua';
export * from './ji-xian-yao-dai';
export * from './chen-zhong-jie-li-bang';
export * from './zai-huo-xiang';
export * from './fu-lu-guo';
export * from './jin-ji-hua-ban';
export * from './ying-xiong-dou-peng';
export * from './hao-hua-dou-peng';
export * from './hao-hua-zha-dan';
export * from './chao-qun-yan-jing';
export * from './suo-lian-zhan-gao';
export * from './da-di-feng-yin-shi';
export * from './tian-kong-feng-yin-shi';
export * from './kong-huang-mian-ju';
export * from './wu-song';
export * from './an-ma-mi-de-jie-du';
export * from './wang-luo';
export * from './mei-li-sha';
export * from './ye-yin-pi-feng';
export * from './xun-luo-mao';
