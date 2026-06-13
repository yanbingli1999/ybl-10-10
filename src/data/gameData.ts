import type { Breed, Herb, Prescription, DiseaseType, Staff, AncientScroll, HiddenDisease, ImprovedPrescription, Element } from "@/types/game";

export const DISEASE_SYMPTOMS: Record<DiseaseType, string[]> = {
  fever: ["体温偏高", "无精打采", "食欲不振", "鼻子发干", "魔力发热"],
  cold: ["流鼻涕", "频繁打喷嚏", "身体发冷", "精神萎靡", "咳嗽"],
  poisoning: ["呕吐", "腹泻", "瞳孔异常", "皮毛变色", "口中异味"],
  fatigue: ["无力", "嗜睡", "反应迟缓", "魔力耗尽", "眼神空洞"],
  fracture: ["肢体肿胀", "行动不便", "触碰尖叫", "骨骼异响", "无法站立"],
  mana_disorder: ["魔力溢出", "无意识施法", "元素暴走", "光环混乱", "魔力失控"],
  curse: ["噩梦连连", "阴影缠身", "运气极差", "眼睛发黑", "体重骤降"],
  parasite: ["瘙痒难忍", "皮毛脱落", "食量暴增但消瘦", "粪便异常", "皮肤凸起"],
  dehydration: ["口干舌燥", "皮肤弹性差", "尿液深黄", "眼窝凹陷", "严重口渴"],
  allergy: ["皮肤红肿", "不停抓挠", "呼吸急促", "眼泪不止", "眼皮肿胀"],
};

export const DISEASE_NAMES: Record<DiseaseType, string> = {
  fever: "灵热症",
  cold: "风寒症",
  poisoning: "灵毒症",
  fatigue: "气虚症",
  fracture: "骨伤症",
  mana_disorder: "灵脉紊乱",
  curse: "咒怨症",
  parasite: "灵虫寄生",
  dehydration: "津液亏损",
  allergy: "灵兽过敏",
};

export const SEVERITY_NAMES = {
  mild: "轻度",
  moderate: "中度",
  severe: "重度",
  critical: "危重",
};

export const WEATHER_NAMES = {
  sunny: "晴",
  cloudy: "阴",
  rainy: "雨",
  stormy: "雷雨",
  misty: "雾",
};

export const SEVERITY_COLORS = {
  mild: "bg-clinic-jade/15 text-clinic-jade border-clinic-jade/30",
  moderate: "bg-clinic-amber/20 text-amber-700 border-clinic-amber/40",
  severe: "bg-clinic-warm/20 text-orange-700 border-clinic-warm/40",
  critical: "bg-clinic-crisis/20 text-clinic-crisis border-clinic-crisis/50",
};

export const SEVERITY_BORDER = {
  mild: "border-clinic-jade/50",
  moderate: "border-clinic-amber/60",
  severe: "border-clinic-warm/60",
  critical: "border-clinic-crisis",
};

export const ELEMENT_NAMES: Record<string, string> = {
  fire: "火",
  water: "水",
  wood: "木",
  thunder: "雷",
  earth: "土",
  light: "光",
  dark: "暗",
  neutral: "无",
};

export const ELEMENT_EMOJI: Record<string, string> = {
  fire: "🔥",
  water: "💧",
  wood: "🌿",
  thunder: "⚡",
  earth: "🪨",
  light: "✨",
  dark: "🌑",
  neutral: "⚪",
};

export const BREEDS: Breed[] = [
  {
    id: "fox_fire",
    name: "赤焰灵狐",
    emoji: "🦊",
    element: "fire",
    rarity: 2,
    description: "毛色火红，尾尖常有火焰跃动。喜温热，耐寒力差。",
    evolutionEmojis: ["🦊", "🦊🔥", "🐺🔥"],
    evolvesAt: 4,
    baseFees: 80,
  },
  {
    id: "dragon_water",
    name: "青鳞幼龙",
    emoji: "🐉",
    element: "water",
    rarity: 4,
    description: "古老龙族后裔，鳞片呈青色，善用水系法术。",
    evolutionEmojis: ["🐉", "🐲", "🐲💧"],
    evolvesAt: 5,
    baseFees: 200,
  },
  {
    id: "cat_wood",
    name: "林间雾猫",
    emoji: "🐱",
    element: "wood",
    rarity: 1,
    description: "栖息于森林深处的神秘猫科灵兽，行踪飘渺。",
    evolutionEmojis: ["🐱", "🐈", "🐈‍⬛🌿"],
    evolvesAt: 3,
    baseFees: 50,
  },
  {
    id: "bird_thunder",
    name: "雷羽雀",
    emoji: "🐦",
    element: "thunder",
    rarity: 2,
    description: "羽翼间常含雷电电流，鸣叫声似雷鸣。",
    evolutionEmojis: ["🐦", "🐦⚡", "🦅⚡"],
    evolvesAt: 4,
    baseFees: 90,
  },
  {
    id: "turtle_earth",
    name: "磐甲玄龟",
    emoji: "🐢",
    element: "earth",
    rarity: 3,
    description: "龟壳坚硬如磐山，寿命极长，行动迟缓但稳如泰山。",
    evolutionEmojis: ["🐢", "🐢🪨", "🐢⛰️"],
    evolvesAt: 5,
    baseFees: 150,
  },
  {
    id: "rabbit_light",
    name: "月光玉兔",
    emoji: "🐰",
    element: "light",
    rarity: 3,
    description: "毛发在月光下会发出柔和光晕，性情温顺。",
    evolutionEmojis: ["🐰", "🐇✨", "🐇🌙"],
    evolvesAt: 4,
    baseFees: 120,
  },
  {
    id: "wolf_dark",
    name: "幽影夜狼",
    emoji: "🐺",
    element: "dark",
    rarity: 4,
    description: "融入黑暗中的神秘狼族灵兽，双眼发出幽蓝光芒。",
    evolutionEmojis: ["🐺", "🐺🌑", "🐕‍🦺🌒"],
    evolvesAt: 5,
    baseFees: 180,
  },
  {
    id: "bear_earth",
    name: "巨力棕熊",
    emoji: "🐻",
    element: "earth",
    rarity: 2,
    description: "体型庞大，力大无穷，平时温和但发怒时极危险。",
    evolutionEmojis: ["🐻", "🐻🪨", "🦍⛰️"],
    evolvesAt: 4,
    baseFees: 110,
  },
  {
    id: "snake_fire",
    name: "赤纹火蟒",
    emoji: "🐍",
    element: "fire",
    rarity: 3,
    description: "身带赤色纹路，体温极高，所过之处草木枯萎。",
    evolutionEmojis: ["🐍", "🐍🔥", "🐲🔥"],
    evolvesAt: 5,
    baseFees: 140,
  },
  {
    id: "frog_water",
    name: "碧潭灵蛙",
    emoji: "🐸",
    element: "water",
    rarity: 1,
    description: "深潭中常见的小灵兽，跳跃能力惊人且皮肤可分泌粘液。",
    evolutionEmojis: ["🐸", "🐸💧", "🦎💧"],
    evolvesAt: 3,
    baseFees: 45,
  },
  {
    id: "butterfly_light",
    name: "幻光蝶",
    emoji: "🦋",
    element: "light",
    rarity: 2,
    description: "翅膀散发梦幻光泽，鳞粉有微弱治愈效果。",
    evolutionEmojis: ["🦋", "🦋✨", "🦋🌈"],
    evolvesAt: 4,
    baseFees: 75,
  },
  {
    id: "pig_light",
    name: "福气金豚",
    emoji: "🐷",
    element: "light",
    rarity: 1,
    description: "金色皮毛胖嘟嘟的小灵兽，据说能带来好运。",
    evolutionEmojis: ["🐷", "🐖✨", "🐗💰"],
    evolvesAt: 3,
    baseFees: 60,
  },
];

export const HERBS: Herb[] = [
  {
    id: "herb_cold",
    name: "冰霜草",
    emoji: "❄️",
    element: "water",
    price: 15,
    description: "生于极寒之地，有清热退火之效。",
  },
  {
    id: "herb_fire",
    name: "赤炎花",
    emoji: "🌺",
    element: "fire",
    price: 18,
    description: "花瓣如火，可温中散寒。",
  },
  {
    id: "herb_wood",
    name: "生命藤",
    emoji: "🌿",
    element: "wood",
    price: 22,
    description: "蕴含强韧生命力，可修补骨骼经脉。",
  },
  {
    id: "herb_pure",
    name: "净灵花",
    emoji: "🌸",
    element: "neutral",
    price: 35,
    description: "稀有药花，可净化毒素与诅咒。",
  },
  {
    id: "herb_energy",
    name: "聚灵果",
    emoji: "🍇",
    element: "light",
    price: 28,
    description: "果实可快速补充魔力与体力。",
  },
  {
    id: "herb_stable",
    name: "定根石粉",
    emoji: "🪨",
    element: "earth",
    price: 20,
    description: "磨粉入药可稳定紊乱的灵脉。",
  },
  {
    id: "herb_light",
    name: "圣光草",
    emoji: "✨",
    element: "light",
    price: 40,
    description: "闪耀着神圣光芒，可驱散邪祟寄生虫。",
  },
  {
    id: "herb_water",
    name: "玉泉露",
    emoji: "💧",
    element: "water",
    price: 12,
    description: "清晨收集的玉泉之水，滋补津液。",
  },
  {
    id: "herb_antidote",
    name: "千毒散",
    emoji: "🍃",
    element: "wood",
    price: 30,
    description: "可解百毒的解毒良药。",
  },
  {
    id: "herb_immune",
    name: "玄黄根",
    emoji: "🥕",
    element: "earth",
    price: 25,
    description: "固本培元，增强灵兽免疫力。",
  },
];

export const PRESCRIPTIONS: Prescription[] = [
  {
    id: "presc_fever",
    disease: "fever",
    name: "退热方",
    herbIds: ["herb_cold", "herb_water", "herb_pure"],
    successRate: 85,
  },
  {
    id: "presc_cold",
    disease: "cold",
    name: "驱寒方",
    herbIds: ["herb_fire", "herb_wood", "herb_water"],
    successRate: 88,
  },
  {
    id: "presc_poisoning",
    disease: "poisoning",
    name: "解毒方",
    herbIds: ["herb_antidote", "herb_pure", "herb_water"],
    successRate: 80,
  },
  {
    id: "presc_fatigue",
    disease: "fatigue",
    name: "补气方",
    herbIds: ["herb_energy", "herb_wood", "herb_light"],
    successRate: 90,
  },
  {
    id: "presc_fracture",
    disease: "fracture",
    name: "接骨方",
    herbIds: ["herb_wood", "herb_immune", "herb_energy"],
    successRate: 82,
  },
  {
    id: "presc_mana",
    disease: "mana_disorder",
    name: "稳脉方",
    herbIds: ["herb_stable", "herb_energy", "herb_pure"],
    successRate: 78,
  },
  {
    id: "presc_curse",
    disease: "curse",
    name: "破咒方",
    herbIds: ["herb_light", "herb_pure", "herb_fire"],
    successRate: 75,
  },
  {
    id: "presc_parasite",
    disease: "parasite",
    name: "驱虫方",
    herbIds: ["herb_light", "herb_antidote", "herb_immune"],
    successRate: 83,
  },
  {
    id: "presc_dehydration",
    disease: "dehydration",
    name: "生津方",
    herbIds: ["herb_water", "herb_wood", "herb_energy"],
    successRate: 92,
  },
  {
    id: "presc_allergy",
    disease: "allergy",
    name: "消敏方",
    herbIds: ["herb_immune", "herb_water", "herb_pure"],
    successRate: 86,
  },
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: "staff_1",
    name: "青鸢",
    title: "初级护理员",
    emoji: "👩‍⚕️",
    skillLevel: 1,
    status: "idle",
    assignedBedId: null,
    dailyWage: 30,
  },
  {
    id: "staff_2",
    name: "白术",
    title: "资深护理员",
    emoji: "👨‍⚕️",
    skillLevel: 2,
    status: "idle",
    assignedBedId: null,
    dailyWage: 50,
  },
];

export const INITIAL_BEDS = [
  { id: "bed_1", name: "一号病床" },
  { id: "bed_2", name: "二号病床" },
  { id: "bed_3", name: "三号病床" },
  { id: "bed_4", name: "四号病床" },
];

export const OWNER_NAMES = [
  "灵溪村的王婶",
  "云渺城的李少侠",
  "翠竹林的老道士",
  "百花谷的花仙子",
  "飞鹰寨的大当家",
  "青云宗的内门弟子",
  "四海商会的少主",
  "山间隐居的药师",
  "灵兽山庄的驯兽师",
  "蓬莱岛的散仙",
  "明月楼的歌姬",
  "镇北关的将军",
  "西湖畔的书生",
  "南疆的蛊婆",
  "东海的渔翁",
];

export const BEAST_NAMES = [
  "小红", "豆豆", "阿毛", "雪球", "团子", "琥珀", "黑炭",
  "灵灵", "月月", "辰辰", "小玄", "青璃", "赤炎", "阿土",
  "花花", "金儿", "银角", "小羽", "萌萌", "糖糖", "布丁",
  "果冻", "毛毛", "白泽", "麒麟", "阿凤", "小龙", "圆圆",
];

export const NOTES_SUCCESS = [
  "恢复得很好，蹦蹦跳跳地离开了。",
  "临别时还回头看了一眼，似乎有些不舍。",
  "痊愈后精神百倍，主人非常感激。",
  "临走时叼来了一束野花送给护理员。",
  "健康出院，还在院子里打了几个滚。",
];

export const NOTES_FAIL = [
  "病情恶化，主人抱走时叹息不已。",
  "治疗效果不佳，灵兽虚弱地离去。",
  "因误诊延误了病情，主人面露愠色。",
  "只得转往大城市的高级诊所求治。",
  "灵兽对这里产生了阴影，不愿再踏入半步。",
];

export const ANCIENT_SCROLLS: AncientScroll[] = [
  {
    id: "scroll_fire_1",
    name: "炎灵秘典·残页一",
    emoji: "📜",
    fragmentText: "赤炎焚邪，热病得解",
    description: "出自上古炎灵族的秘典，记载着与火元素相关的治疗秘术。",
    rarity: 2,
    relatedElements: ["fire"],
    relatedSymptoms: ["体温偏高", "魔力发热", "精神萎靡"],
  },
  {
    id: "scroll_water_1",
    name: "水神经·残页一",
    emoji: "📜",
    fragmentText: "水善利万物，润物细无声",
    description: "水神共工所传经文，讲述了津液滋补的奥妙。",
    rarity: 2,
    relatedElements: ["water"],
    relatedSymptoms: ["口干舌燥", "尿液深黄", "皮肤弹性差"],
  },
  {
    id: "scroll_wood_1",
    name: "青囊草木经·残页一",
    emoji: "📜",
    fragmentText: "生生不息，木气养骨",
    description: "神医华佗所著的草木要籍，讲述以木气修补损伤。",
    rarity: 3,
    relatedElements: ["wood"],
    relatedSymptoms: ["肢体肿胀", "行动不便", "无法站立"],
  },
  {
    id: "scroll_thunder_1",
    name: "雷帝素问·残页一",
    emoji: "📜",
    fragmentText: "雷霆万钧，涤荡邪祟",
    description: "雷部天君所传，以雷元素净化灵脉紊乱之法。",
    rarity: 3,
    relatedElements: ["thunder"],
    relatedSymptoms: ["魔力溢出", "元素暴走", "魔力失控"],
  },
  {
    id: "scroll_earth_1",
    name: "地母经·残页一",
    emoji: "📜",
    fragmentText: "厚德载物，固本培元",
    description: "地母娘娘所传，讲述土元素稳固根本的法门。",
    rarity: 2,
    relatedElements: ["earth"],
    relatedSymptoms: ["无力", "嗜睡", "反应迟缓"],
  },
  {
    id: "scroll_light_1",
    name: "光明渡厄经·残页一",
    emoji: "📜",
    fragmentText: "圣光普照，邪祟消散",
    description: "光明神殿的神圣典籍，记载净化诅咒与寄生虫之法。",
    rarity: 4,
    relatedElements: ["light"],
    relatedSymptoms: ["噩梦连连", "阴影缠身", "眼睛发黑", "瘙痒难忍"],
  },
  {
    id: "scroll_dark_1",
    name: "幽冥药典·残页一",
    emoji: "📜",
    fragmentText: "以毒攻毒，以暗治暗",
    description: "幽冥界的神秘药典，记载着非常人的解毒之法。",
    rarity: 4,
    relatedElements: ["dark"],
    relatedSymptoms: ["呕吐", "腹泻", "瞳孔异常", "口中异味"],
  },
  {
    id: "scroll_wood_2",
    name: "青囊草木经·残页二",
    emoji: "📜",
    fragmentText: "草木有灵，消敏固本",
    description: "记载着应对过敏症状的草木配伍之法。",
    rarity: 3,
    relatedElements: ["wood"],
    relatedSymptoms: ["皮肤红肿", "不停抓挠", "呼吸急促"],
  },
];

export const HIDDEN_DISEASES: HiddenDisease[] = [
  {
    id: "hidden_fire_syndrome",
    diseaseType: "fever",
    hiddenName: "九阳焚心症",
    description: "火元素灵兽体内阳气过盛，普通退热无效，需以火攻火方能化解。",
    requiredSymptoms: ["体温偏高", "魔力发热", "无精打采"],
    requiredElement: "fire",
    requiredScrollText: "赤炎焚邪",
    successBonus: {
      successRate: 10,
      revenueMultiplier: 1.5,
      reputationBonus: 5,
    },
  },
  {
    id: "hidden_water_depletion",
    diseaseType: "dehydration",
    hiddenName: "真水枯竭症",
    description: "水元素灵兽本源真水耗损，普通补水无效，需用玉泉配合火元素药材激活。",
    requiredSymptoms: ["口干舌燥", "眼窝凹陷", "严重口渴"],
    requiredElement: "water",
    requiredScrollText: "水善利万物",
    successBonus: {
      successRate: 12,
      revenueMultiplier: 1.6,
      reputationBonus: 6,
    },
  },
  {
    id: "hidden_bone_spirit",
    diseaseType: "fracture",
    hiddenName: "碎髓断骨症",
    description: "木元素灵兽骨骼精髓受损，普通接骨无法愈合，需木气涵养。",
    requiredSymptoms: ["肢体肿胀", "触碰尖叫", "无法站立"],
    requiredElement: "wood",
    requiredScrollText: "生生不息",
    successBonus: {
      successRate: 10,
      revenueMultiplier: 1.5,
      reputationBonus: 5,
    },
  },
  {
    id: "hidden_mana_storm",
    diseaseType: "mana_disorder",
    hiddenName: "灵脉风暴症",
    description: "雷元素灵兽灵脉紊乱如风暴，普通稳脉无效，需以雷制雷。",
    requiredSymptoms: ["魔力溢出", "元素暴走", "光环混乱"],
    requiredElement: "thunder",
    requiredScrollText: "雷霆万钧",
    successBonus: {
      successRate: 12,
      revenueMultiplier: 1.7,
      reputationBonus: 7,
    },
  },
];

export const IMPROVED_PRESCRIPTIONS: ImprovedPrescription[] = [
  {
    id: "improved_curse_breaking",
    baseDisease: "curse",
    name: "九转破咒方",
    herbIds: ["herb_light", "herb_pure", "herb_fire", "herb_energy"],
    successRate: 90,
    bonusDescription: "在破咒方基础上加入聚灵果，增强灵力循环，大幅提升治愈率。",
    requiredElement: "light",
    requiredScrollText: "圣光普照",
    requiredSymptoms: ["噩梦连连", "阴影缠身", "眼睛发黑"],
    bonusEffect: {
      revenueMultiplier: 1.4,
      speedBoost: 0.2,
      satisfactionBonus: 15,
    },
  },
  {
    id: "improved_poison_antidote",
    baseDisease: "poisoning",
    name: "阴阳解毒丹",
    herbIds: ["herb_antidote", "herb_pure", "herb_water", "herb_light"],
    successRate: 92,
    bonusDescription: "以阴阳调和之法，解毒同时净化灵脉，效果远超普通解毒方。",
    requiredElement: "dark",
    requiredScrollText: "以毒攻毒",
    requiredSymptoms: ["呕吐", "腹泻", "瞳孔异常"],
    bonusEffect: {
      revenueMultiplier: 1.5,
      speedBoost: 0.25,
      satisfactionBonus: 18,
    },
  },
  {
    id: "improved_allergy_relief",
    baseDisease: "allergy",
    name: "草木归元方",
    herbIds: ["herb_immune", "herb_water", "herb_pure", "herb_wood"],
    successRate: 94,
    bonusDescription: "加入生命藤，从根本上改善灵兽体质，消除过敏根源。",
    requiredElement: "wood",
    requiredScrollText: "草木有灵",
    requiredSymptoms: ["皮肤红肿", "不停抓挠", "呼吸急促"],
    bonusEffect: {
      revenueMultiplier: 1.4,
      speedBoost: 0.15,
      satisfactionBonus: 12,
    },
  },
  {
    id: "improved_qi_replenish",
    baseDisease: "fatigue",
    name: "大补元气汤",
    herbIds: ["herb_energy", "herb_wood", "herb_light", "herb_immune"],
    successRate: 96,
    bonusDescription: "固本培元与补充灵力相结合，恢复效果显著且持久。",
    requiredElement: "earth",
    requiredScrollText: "厚德载物",
    requiredSymptoms: ["无力", "嗜睡", "反应迟缓"],
    bonusEffect: {
      revenueMultiplier: 1.3,
      speedBoost: 0.3,
      satisfactionBonus: 20,
    },
  },
];

export function getScrollDropChance(severity: string, day: number): number {
  const baseChance = severity === "critical" ? 0.25 : severity === "severe" ? 0.18 : severity === "moderate" ? 0.12 : 0.06;
  const dayBonus = Math.min(0.15, day * 0.005);
  return Math.min(0.4, baseChance + dayBonus);
}

export function getRandomScroll(element?: Element, symptoms?: string[]): AncientScroll {
  let candidates = [...ANCIENT_SCROLLS];
  if (element) {
    candidates = candidates.filter(s => s.relatedElements.includes(element));
  }
  if (symptoms && symptoms.length > 0) {
    candidates = candidates.filter(s =>
      s.relatedSymptoms.some(sym => symptoms.includes(sym))
    );
  }
  if (candidates.length === 0) {
    candidates = [...ANCIENT_SCROLLS];
  }
  const weighted: AncientScroll[] = [];
  candidates.forEach(s => {
    const weight = (6 - s.rarity) * (6 - s.rarity);
    for (let i = 0; i < weight; i++) weighted.push(s);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}

export function validateResearch(
  symptoms: string[],
  herbs: string[],
  element: Element | null,
  scroll: AncientScroll | null
): { valid: boolean; matchType?: "hidden_disease" | "improved_prescription"; matchId?: string; score: number } {
  if (!element || !scroll) {
    return { valid: false, score: 0 };
  }

  let bestScore = 0;
  let bestMatch: { type: "hidden_disease" | "improved_prescription"; id: string } | null = null;

  for (const hd of HIDDEN_DISEASES) {
    const symptomMatch = hd.requiredSymptoms.filter(s => symptoms.includes(s)).length;
    const symptomRatio = symptomMatch / hd.requiredSymptoms.length;
    const elementMatch = hd.requiredElement === element ? 1 : 0;
    const textMatch = scroll.fragmentText.includes(hd.requiredScrollText) ? 1 : 0;
    const herbMatch = herbs.length >= 3 ? 0.2 : 0;
    const score = (symptomRatio * 0.4 + elementMatch * 0.3 + textMatch * 0.3 + herbMatch) * 100;
    if (score > bestScore && score >= 70) {
      bestScore = score;
      bestMatch = { type: "hidden_disease", id: hd.id };
    }
  }

  for (const ip of IMPROVED_PRESCRIPTIONS) {
    const symptomMatch = ip.requiredSymptoms.filter(s => symptoms.includes(s)).length;
    const symptomRatio = symptomMatch / ip.requiredSymptoms.length;
    const elementMatch = ip.requiredElement === element ? 1 : 0;
    const textMatch = scroll.fragmentText.includes(ip.requiredScrollText) ? 1 : 0;
    const herbMatch = ip.herbIds.filter(h => herbs.includes(h)).length / ip.herbIds.length;
    const score = (symptomRatio * 0.3 + elementMatch * 0.25 + textMatch * 0.25 + herbMatch * 0.2) * 100;
    if (score > bestScore && score >= 70) {
      bestScore = score;
      bestMatch = { type: "improved_prescription", id: ip.id };
    }
  }

  if (bestMatch) {
    return { valid: true, matchType: bestMatch.type, matchId: bestMatch.id, score: Math.floor(bestScore) };
  }

  return { valid: false, score: Math.floor(bestScore) };
}
