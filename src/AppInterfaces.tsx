export enum RODataLang {
  english = "EN",
  chinese = "CN",
  indonesian = "ID",
  thai = "TH"
}

export enum RuneType {
  special = 2,
  start = 0,
  basic = 1
}

export enum StatTextCN {
  Dex = "灵巧",
  MAtk = "魔法攻击",
  CastSpd = "吟唱速度",
  Int = "智力",
  Agi = "敏捷",
  Str = "力量",
  VIT = "体质",
  Hit = "命中",
  Luk = "幸运",
  Critical = "暴击",
  Flee = "闪避",
  AttackSpd = "攻击速度",
  Def = "物理防御",
  MaxHP = "生命上限",
  MaxSP = "魔法上限",
  MaxHPPerc = "生命上限%",
  SpellCrit = "法术暴击",
  Res = "抗魔",
  Atk = "物理攻击",
  Element = "元素",
  RefDmgReduc = "精炼物免",
  RefMagicReduc = "精炼魔免",
  RefineAtk = "精炼物攻",
  IgnoreDef = "忽视物理防御",
  CritChance = "暴击概率",
  CastDuration = "吟唱时间",
  HealingEffect = "治疗效果",
  CritDmg = "暴击伤害",
  RefineMAtk = "精炼魔攻",
  HPincreases = "HP增加",
  PhysicalDefenseincreases = "物防增加",
  CritRes = "暴击防护",
  HPRegen = "HP恢复",
  SPRegen = "SP恢复",
  HealingReceived = "受治疗加成",
  SPCost = "SP消耗",
  MoveSpd = "移动速度",
  SPincreases = "SP增加"
}

export enum RuneCostType {
  Step = 0,
  Medal = 1,
  Contribution = 2
}

export interface AstrolabeData {
  Evo: number;
  Id: number;
  Link: any;
  X: number;
  Y: number;
  Z: number;
}

export interface RunePosition {
  x: number;
  y: number;
}

export interface RuneBoardData {
  data_astrolabe?: object;
  data_rune?: object;
  data_runeByTypeBranch?: object;
  data_runeSpecial?: object;
  data_runeSpecialDesc?: object;
}

export interface Rune {
  id: number;
  link: number[];
  tier: number;
  x: number;
  y: number;
  cost: RuneCost;
  active: boolean;
}
export interface RuneCost {
  medal: number;
  contribution: number;
}

export enum JobName {
  Knight = "knight",
  Crusader = "crusader",
  Wizard = "wizard",
  Sage = "sage",
  Assassin = "assassin",
  Rogue = "rogue",
  Hunter = "hunter",
  Bard = "bard",
  Dancer = "dancer",
  Priest = "priest",
  Monk = "monk",
  Blacksmith = "blacksmith",
  Alchemist = "alchemist"
}
export enum JobID {
  Knight = 11,
  Crusader = 12,
  Wizard = 21,
  Sage = 22,
  Assassin = 31,
  Rogue = 32,
  Hunter = 41,
  Poet = 42,
  Dancer = 43,
  Priest = 51,
  Monk = 52,
  Blacksmith = 61,
  Alchemist = 62
}

export enum Tier {
  t1 = 20000,
  t2 = 30000,
  t3 = 40000,
  t4 = 45003
}

export class GameClasses {
  static Knight = ["Swordsman", "Knight", "Lord Knight", "Rune Knight"];
  static Crusader = ["Swordsman", "Crusader", "Paladin", "Royal Guard"];
  static Wizard = ["Mage", "Wizard", "High Wizard", "Warlock"];
  static Sage = ["Mage", "Sage", "Professor", "Sorcerer"];
  static Assassin = ["Thief", "Assassin", "Assassin Cross", "Guillotine Cross"];
  static Rogue = ["Thief", "Rogue", "Stalker", "Shadow Chaser"];
  static Hunter = ["Archer", "Hunter", "Sniper", "Ranger"];
  static Bard = ["Archer", "Poet", "Clown", "Minstrel"];
  static Dancer = ["Archer", "Dancer", "Gypsy", "Wanderer"];
  static Priest = ["Acolyte", "Priest", "High Priest", "Archbishop"];
  static Monk = ["Acolyte", "Monk", "Champion", "Shura"];
  static Blacksmith = ["Merchant", "Blacksmith", "Whitesmith", "Mechanic"];
  static Alchemist = ["Merchant", "Alchemist", "Creator", "Genetic"];

  static classToId = {
    Knight: 11,
    Crusader: 12,
    Wizard: 21,
    Sage: 22,
    Assassin: 31,
    Rogue: 32,
    Hunter: 41,
    Poet: 42,
    Dancer: 43,
    Priest: 51,
    Monk: 52,
    Blacksmith: 61,
    Alchemist: 62
  };

  static classTree = {
    Knight: [...GameClasses.Knight],
    Crusader: [...GameClasses.Crusader],
    Wizard: [...GameClasses.Wizard],
    //Sage: [...GameClasses.Sage],
    Assassin: [...GameClasses.Assassin],
    Rogue: [...GameClasses.Rogue],
    Hunter: [...GameClasses.Hunter],
    //Bard: [...GameClasses.Bard],
    //Dancer: [...GameClasses.Dancer],
    Priest: [...GameClasses.Priest],
    Monk: [...GameClasses.Monk],
    Blacksmith: [...GameClasses.Blacksmith],
    Alchemist: [...GameClasses.Alchemist]
  };

  static classesID: any = {
    Job_11: "Knight",
    Job_12: "Crusader",
    Job_21: "Wizard",
    Job_22: "Sage",
    Job_31: "Assassin",
    Job_32: "Rogue",
    Job_41: "Hunter",
    Job_42: "Bard",
    Job_43: "Dancer",
    Job_51: "Priest",
    Job_52: "Monk",
    Job_61: "Blacksmith",
    Job_62: "Alchemist"
  };

  static getClassTree = () => {
    let classTree: any = {};
    Object.keys(GameClasses.classTree).forEach(eachJob => {
      let rawClassTree: any = GameClasses.classTree;
      if (classTree[rawClassTree[eachJob][0]] === undefined) {
        classTree[rawClassTree[eachJob][0]] = [rawClassTree[eachJob]];
      } else {
        classTree[rawClassTree[eachJob][0]].push(rawClassTree[eachJob]);
      }
    });
    return classTree;
  };

  static getIdByName = (name: string): number =>
    (GameClasses.classToId as any)[name];

  static getById = (id: number) => {
    let _id: any = `Job_${id}`;
    let _className: any = GameClasses.classesID[_id];
    let _this: any = GameClasses;
    return _this[_className];
  };
}
