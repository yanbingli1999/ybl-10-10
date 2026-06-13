import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Beast,
  Bed,
  Staff,
  MedicalRecord,
  Transaction,
  BeastRelationship,
  Notification,
  DiseaseType,
  Severity,
  WeatherType,
  Prescription,
  TreatmentResult,
  ResearchProject,
  RecipeCanonEntry,
  Element,
  ResearchResultType,
  AncientScroll,
} from "@/types/game";
import {
  BREEDS,
  HERBS,
  PRESCRIPTIONS,
  INITIAL_STAFF,
  INITIAL_BEDS,
  DISEASE_SYMPTOMS,
  OWNER_NAMES,
  BEAST_NAMES,
  NOTES_SUCCESS,
  NOTES_FAIL,
  DISEASE_NAMES,
  ANCIENT_SCROLLS,
  HIDDEN_DISEASES,
  IMPROVED_PRESCRIPTIONS,
  getScrollDropChance,
  getRandomScroll,
  validateResearch,
} from "@/data/gameData";

const DISEASE_TYPES: DiseaseType[] = [
  "fever", "cold", "poisoning", "fatigue", "fracture",
  "mana_disorder", "curse", "parasite", "dehydration", "allergy",
];

const SEVERITIES: { sev: Severity; hours: number }[] = [
  { sev: "mild", hours: 6 },
  { sev: "moderate", hours: 9 },
  { sev: "severe", hours: 12 },
  { sev: "critical", hours: 14 },
];

const WEATHERS: WeatherType[] = ["sunny", "cloudy", "rainy", "stormy", "misty"];

function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomBeast(day: number, time: number): Beast {
  const breed = rand(BREEDS.filter(b => b.rarity <= Math.min(5, 2 + Math.floor(day / 5))));
  const disease = rand(DISEASE_TYPES);
  const sevIdx = Math.min(3, Math.floor(Math.random() * Math.min(4, 1 + Math.floor(day / 4))));
  const severity = SEVERITIES[sevIdx].sev;
  const allSyms = DISEASE_SYMPTOMS[disease];
  const symCount = randomInt(2, 4);
  const picked: string[] = [];
  while (picked.length < symCount) {
    const s = rand(allSyms);
    if (!picked.includes(s)) picked.push(s);
  }
  return {
    id: uid("beast"),
    breedId: breed.id,
    name: rand(BEAST_NAMES),
    age: randomInt(1, 10),
    stage: 0,
    disease,
    severity,
    symptoms: picked,
    trustLevel: randomInt(0, 20),
    waitHours: 0,
    satisfaction: 100,
    ownerName: rand(OWNER_NAMES),
    arrivedAt: time,
  };
}

function calcTreatmentHours(severity: Severity, staffBoost: boolean, speedBoost: number = 0): number {
  const base = SEVERITIES.find(s => s.sev === severity)?.hours ?? 8;
  const staffMult = staffBoost ? 0.7 : 1;
  const totalMult = Math.max(0.3, staffMult * (1 - speedBoost));
  return Math.ceil(base * totalMult);
}

export function guessDiseaseFromSymptoms(symptoms: string[]): { disease: DiseaseType; matchRate: number }[] {
  const results: { disease: DiseaseType; matchRate: number }[] = [];
  for (const disease of DISEASE_TYPES) {
    const diseaseSyms = DISEASE_SYMPTOMS[disease];
    const matched = symptoms.filter(s => diseaseSyms.includes(s)).length;
    const matchRate = Math.floor((matched / symptoms.length) * 100);
    results.push({ disease, matchRate });
  }
  return results.sort((a, b) => b.matchRate - a.matchRate);
}

export interface GameState {
  money: number;
  reputation: number;
  currentDay: number;
  currentTime: number;
  weather: WeatherType;
  isPaused: boolean;
  speed: number;
  waitingQueue: Beast[];
  beds: Bed[];
  inventory: Record<string, number>;
  scrollInventory: Record<string, number>;
  staff: Staff[];
  discoveredBreeds: string[];
  medicalRecords: MedicalRecord[];
  beastRelationships: Record<string, BeastRelationship>;
  transactions: Transaction[];
  notifications: Notification[];
  selectedBeastId: string | null;
  selectedBedId: string | null;
  lastBeastSpawn: number;
  researchProjects: ResearchProject[];
  recipeCanon: RecipeCanonEntry[];
  researchingStaffId: string | null;

  // Actions
  togglePause: () => void;
  setSpeed: (s: number) => void;
  selectBeast: (id: string | null) => void;
  selectBed: (id: string | null) => void;
  dismissBeast: (id: string) => void;
  assignBedAndTreat: (beastId: string, bedId: string, staffId: string | null, herbIds: string[], playerDiagnosis: DiseaseType | null) => void;
  purchaseHerb: (herbId: string, qty: number) => void;
  collectFromBed: (bedId: string) => void;
  addNotification: (type: Notification["type"], message: string) => void;
  clearNotification: (id: string) => void;
  resetGame: () => void;
  tickGame: (steps?: number) => void;
  _spawnInitialBeasts: () => void;
  _addTransaction: (type: Transaction["type"], category: string, amount: number, description: string) => void;
  _dailySettlement: () => void;

  // Research actions
  startResearch: (symptoms: string[], herbs: string[], element: Element | null, scrollId: string | null, staffId: string | null) => void;
  cancelResearch: (projectId: string) => void;
  collectResearchResult: (projectId: string) => void;
  _processResearch: () => void;
}

function createInitialBeds(): Bed[] {
  return INITIAL_BEDS.map(b => ({
    id: b.id,
    name: b.name,
    status: "empty",
    assignedBeastId: null,
    assignedStaffId: null,
    treatmentProgress: 0,
    treatmentTotal: 0,
    result: "pending",
    currentPrescriptionHerbs: [],
    playerDiagnosis: null,
    startedAt: null,
    beastSnapshot: null,
  }));
}

function createInitialInventory(): Record<string, number> {
  const inv: Record<string, number> = {};
  HERBS.forEach(h => { inv[h.id] = 5; });
  return inv;
}

function buildInitialState() {
  return {
    money: 500,
    reputation: 50,
    currentDay: 1,
    currentTime: 8,
    weather: "sunny" as WeatherType,
    isPaused: false,
    speed: 1,
    waitingQueue: [] as Beast[],
    beds: createInitialBeds(),
    inventory: createInitialInventory(),
    scrollInventory: {} as Record<string, number>,
    staff: JSON.parse(JSON.stringify(INITIAL_STAFF)),
    discoveredBreeds: [] as string[],
    medicalRecords: [] as MedicalRecord[],
    beastRelationships: {} as Record<string, BeastRelationship>,
    transactions: [] as Transaction[],
    notifications: [] as Notification[],
    selectedBeastId: null,
    selectedBedId: null,
    lastBeastSpawn: 8,
    researchProjects: [] as ResearchProject[],
    recipeCanon: [] as RecipeCanonEntry[],
    researchingStaffId: null as string | null,
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),

      togglePause: () => set(s => ({ isPaused: !s.isPaused })),
      setSpeed: (s: number) => set({ speed: s }),
      selectBeast: (id) => set({ selectedBeastId: id, selectedBedId: null }),
      selectBed: (id) => set({ selectedBedId: id, selectedBeastId: null }),

      addNotification: (type, message) => set(s => ({
        notifications: [{
          id: uid("notif"),
          type, message, timestamp: Date.now(),
        }, ...s.notifications].slice(0, 30),
      })),
      clearNotification: (id) => set(s => ({
        notifications: s.notifications.filter(n => n.id !== id),
      })),

      _addTransaction: (type, category, amount, description) => {
        const { currentDay, currentTime } = get();
        set(s => ({
          transactions: [...s.transactions, {
            id: uid("tx"),
            date: `第${currentDay}天 ${Math.floor(currentTime).toString().padStart(2, "0")}:${(Math.floor(currentTime % 1 * 60)).toString().padStart(2, "0")}`,
            day: currentDay,
            type, category, amount, description,
          }],
        }));
      },

      _spawnInitialBeasts: () => {
        const { currentDay, currentTime } = get();
        const initial: Beast[] = [];
        const count = randomInt(1, 2);
        for (let i = 0; i < count; i++) initial.push(generateRandomBeast(currentDay, currentTime));
        set({ waitingQueue: initial });
      },

      dismissBeast: (id) => {
        const s = get();
        const beast = s.waitingQueue.find(b => b.id === id);
        if (!beast) return;
        const breed = BREEDS.find(b => b.id === beast.breedId);
        const loss = Math.min(s.reputation, 5 + Math.ceil(beast.satisfaction / 50));
        set(st => ({
          waitingQueue: st.waitingQueue.filter(b => b.id !== id),
          reputation: Math.max(0, st.reputation - loss),
          selectedBeastId: st.selectedBeastId === id ? null : st.selectedBeastId,
        }));
        get().addNotification("warning", `拒绝治疗${breed?.name || "灵兽"}(名：${beast.name})，声望-${loss}`);
      },

      purchaseHerb: (herbId, qty) => {
        const herb = HERBS.find(h => h.id === herbId);
        if (!herb) return;
        const totalCost = herb.price * qty;
        const s = get();
        if (s.money < totalCost) {
          s.addNotification("error", "金钱不足，无法采购药材");
          return;
        }
        set(st => ({
          money: st.money - totalCost,
          inventory: { ...st.inventory, [herbId]: (st.inventory[herbId] ?? 0) + qty },
        }));
        get()._addTransaction("expense", "药材采购", totalCost, `采购 ${herb.name} x${qty}`);
        get().addNotification("success", `采购 ${herb.name} x${qty}，花费${totalCost}金`);
      },

      assignBedAndTreat: (beastId, bedId, staffId, herbIds, playerDiagnosis) => {
        const s = get();
        const beast = s.waitingQueue.find(b => b.id === beastId);
        const bed = s.beds.find(b => b.id === bedId);
        if (!beast || !bed || bed.status !== "empty") {
          s.addNotification("error", "分配失败：灵兽或床位不可用");
          return;
        }
        for (const hid of herbIds) {
          if ((s.inventory[hid] ?? 0) < 1) {
            s.addNotification("error", `药材不足`);
            return;
          }
        }
        if (staffId) {
          const st = s.staff.find(x => x.id === staffId);
          if (!st || st.status !== "idle") {
            s.addNotification("error", "该护理员当前不可用");
            return;
          }
        }

        const newInventory = { ...s.inventory };
        herbIds.forEach(hid => { newInventory[hid] = (newInventory[hid] ?? 0) - 1; });
        const herbsCost = herbIds.reduce((sum, hid) => {
          const h = HERBS.find(x => x.id === hid);
          return sum + (h?.price ?? 0);
        }, 0);

        const hasStaff = !!staffId;
        const staffSkillBonus = staffId ? (s.staff.find(x => x.id === staffId)?.skillLevel ?? 1) * 5 : 0;
        void staffSkillBonus;

        const improvedPresc = IMPROVED_PRESCRIPTIONS.find(p =>
          JSON.stringify([...p.herbIds].sort()) === JSON.stringify([...herbIds].sort()) &&
          s.recipeCanon.some(c => c.type === "improved_prescription" && c.herbIds && JSON.stringify([...c.herbIds].sort()) === JSON.stringify([...herbIds].sort()))
        );
        const speedBoost = improvedPresc?.bonusEffect.speedBoost ?? 0;

        const totalHours = calcTreatmentHours(beast.severity, hasStaff, speedBoost);

        const newBeds = s.beds.map(b => b.id === bedId ? {
          ...b,
          status: "occupied" as const,
          assignedBeastId: beastId,
          assignedStaffId: staffId,
          treatmentProgress: 0,
          treatmentTotal: totalHours,
          result: "pending" as const,
          currentPrescriptionHerbs: [...herbIds],
          playerDiagnosis,
          startedAt: s.currentTime,
          beastSnapshot: {
            id: beast.id,
            breedId: beast.breedId,
            name: beast.name,
            disease: beast.disease,
            severity: beast.severity,
            satisfaction: beast.satisfaction,
            symptoms: beast.symptoms,
          },
        } : b);

        const newStaff = s.staff.map(st => st.id === staffId ? { ...st, status: "working" as const, assignedBedId: bedId } : st);

        const newDiscovered = s.discoveredBreeds.includes(beast.breedId)
          ? s.discoveredBreeds : [...s.discoveredBreeds, beast.breedId];

        set(st => ({
          waitingQueue: st.waitingQueue.filter(b => b.id !== beastId),
          beds: newBeds,
          staff: newStaff,
          inventory: newInventory,
          money: st.money - herbsCost,
          discoveredBreeds: newDiscovered,
          selectedBeastId: null,
        }));
        get()._addTransaction("expense", "药材消耗", herbsCost, `${beast.name} 治疗消耗药材`);
        let bonusMsg = "";
        if (improvedPresc) {
          bonusMsg = `（改良药方「${improvedPresc.name}」生效，速度+${Math.round(speedBoost * 100)}%）`;
        }
        get().addNotification("info", `${beast.name} 已入住 ${bed.name}，预计${totalHours}小时治疗${bonusMsg}`);
      },

      collectFromBed: (bedId) => {
        const s = get();
        const bed = s.beds.find(b => b.id === bedId);
        if (!bed || bed.result === "pending" || !bed.beastSnapshot) return;
        const beast = bed.beastSnapshot;

        const bedBeastId = bed.assignedBeastId;
        const treatmentHerbs = bed.currentPrescriptionHerbs;
        const matchedPresc = PRESCRIPTIONS.find(p =>
          JSON.stringify([...p.herbIds].sort()) === JSON.stringify([...treatmentHerbs].sort())
        );

        const improvedPresc = IMPROVED_PRESCRIPTIONS.find(p =>
          JSON.stringify([...p.herbIds].sort()) === JSON.stringify([...treatmentHerbs].sort()) &&
          s.recipeCanon.some(c => c.type === "improved_prescription" && c.herbIds && JSON.stringify([...c.herbIds].sort()) === JSON.stringify([...p.herbIds].sort()))
        );

        const usedPrescNames = improvedPresc ? improvedPresc.name : (matchedPresc ? matchedPresc.name : "自拟方");
        void usedPrescNames;

        const breed = BREEDS.find(b => b.id === (beast?.breedId || ""));

        if (bed.result === "success" && beast && breed) {
          const severityMult = { mild: 1, moderate: 1.4, severe: 1.8, critical: 2.3 }[beast.severity] || 1;
          let satMult = beast.satisfaction / 100;
          const reputationBonus = s.reputation / 100;

          let revenueMultiplier = 1;
          let extraRepGain = 0;
          let extraSatisfactionBonus = 0;
          let hiddenDiseaseName: string | null = null;
          let improvedPrescName: string | null = null;

          if (improvedPresc) {
            revenueMultiplier *= improvedPresc.bonusEffect.revenueMultiplier;
            extraSatisfactionBonus += improvedPresc.bonusEffect.satisfactionBonus;
            improvedPrescName = improvedPresc.name;
          }

          const diagnosisCorrect = bed.playerDiagnosis === beast.disease;
          if (diagnosisCorrect) {
            const hiddenDisease = s.recipeCanon.find(c =>
              c.type === "hidden_disease" && c.disease === beast.disease
            );
            if (hiddenDisease && hiddenDisease.bonusEffect) {
              if (hiddenDisease.bonusEffect.revenueMultiplier) {
                revenueMultiplier *= hiddenDisease.bonusEffect.revenueMultiplier;
              }
              extraRepGain += hiddenDisease.bonusEffect.reputationBonus || 0;
              hiddenDiseaseName = hiddenDisease.name;
            }
          }

          if (extraSatisfactionBonus > 0) {
            satMult = Math.min(1, satMult + extraSatisfactionBonus / 100);
          }

          const baseRevenue = Math.floor(breed.baseFees * severityMult * (0.8 + 0.4 * satMult) * (1 + reputationBonus * 0.3));
          const revenue = Math.floor(baseRevenue * revenueMultiplier);
          let repGain = Math.ceil(3 * severityMult * satMult) + extraRepGain;
          const trustGain = Math.ceil(10 * severityMult * satMult);

          if (diagnosisCorrect) {
            repGain += 2;
          }

          let evolved = false;
          let newStage = 0;
          const prevRel = s.beastRelationships[breed.id];
          const prevVisits = prevRel?.visits ?? 0;
          const prevTrust = prevRel?.trust ?? 0;
          const newVisits = prevVisits + 1;
          const newTrust = prevTrust + trustGain;
          const nextStage = Math.floor(newTrust / 25);
          if (nextStage > (prevRel?.highestStage ?? 0) && breed.evolutionEmojis[nextStage]) {
            evolved = true;
            newStage = nextStage;
          }
          void newStage;

          let notes = rand(NOTES_SUCCESS);
          if (improvedPrescName) {
            notes = `使用「${improvedPrescName}」疗效显著！${notes}`;
          }
          if (hiddenDiseaseName) {
            notes = `确认为「${hiddenDiseaseName}」。${notes}`;
          }
          const days = 1;
          const daysToHeal = days;

          const record: MedicalRecord = {
            id: uid("rec"),
            beastId: bedBeastId!,
            breedId: breed.id,
            beastName: beast.name,
            date: `第${s.currentDay}天`,
            disease: beast.disease,
            severity: beast.severity,
            prescriptions: treatmentHerbs,
            success: true,
            revenue,
            daysToHeal,
            evolved,
            notes: evolved ? `${notes} 灵兽发生了进化！` : notes,
          };

          const newRel: BeastRelationship = {
            breedId: breed.id,
            trust: newTrust,
            visits: newVisits,
            evolved: evolved || prevRel?.evolved || false,
            highestStage: Math.max(nextStage, prevRel?.highestStage ?? 0),
          };

          let scrollDropMsg = "";
          let newScrollInventory = { ...s.scrollInventory };
          const scrollChance = getScrollDropChance(beast.severity, s.currentDay);
          if (Math.random() <= scrollChance) {
            const droppedScroll = getRandomScroll(breed.element, beast.symptoms);
            newScrollInventory[droppedScroll.id] = (newScrollInventory[droppedScroll.id] ?? 0) + 1;
            scrollDropMsg = ` 📜获得「${droppedScroll.name}」残页！`;
          }

          set(st => ({
            money: st.money + revenue,
            reputation: Math.min(100, st.reputation + repGain),
            beastRelationships: { ...st.beastRelationships, [breed.id]: newRel },
            medicalRecords: [record, ...st.medicalRecords],
            scrollInventory: newScrollInventory,
          }));
          get()._addTransaction("income", "诊金收入", revenue, `治愈 ${breed.name}·${beast.name}${evolved ? "(进化加成)" : ""}${improvedPrescName ? `(使用${improvedPrescName})` : ""}${hiddenDiseaseName ? `(确诊${hiddenDiseaseName})` : ""}`);
          const evolveMsg = evolved ? " 🎉灵兽发生进化！额外获得加成！" : "";
          const diagMsg = diagnosisCorrect ? " 🔍诊断正确！" : "";
          const improvedMsg = improvedPrescName ? ` ✨「${improvedPrescName}」效果拔群！` : "";
          const hiddenMsg = hiddenDiseaseName ? ` 📖发现「${hiddenDiseaseName}」！` : "";
          get().addNotification("success", `治愈成功！获得 ${revenue} 金，声望+${repGain}，亲密度+${trustGain}${diagMsg}${improvedMsg}${hiddenMsg}${evolveMsg}${scrollDropMsg}`);
        } else if (bed.result === "fail" && beast) {
          const penaltyMoney = Math.floor(s.money * 0.05) + 20;
          const penaltyRep = 5;
          const breedName = breed?.name || "灵兽";

          const notes = rand(NOTES_FAIL);
          const record: MedicalRecord = {
            id: uid("rec"),
            beastId: bedBeastId!,
            breedId: beast.breedId,
            beastName: beast.name,
            date: `第${s.currentDay}天`,
            disease: beast.disease,
            severity: beast.severity,
            prescriptions: treatmentHerbs,
            success: false,
            revenue: -penaltyMoney,
            daysToHeal: Math.max(1, Math.ceil((s.currentTime - (bed.startedAt ?? s.currentTime)) / 24) || 1),
            evolved: false,
            notes,
          };

          set(st => ({
            money: Math.max(0, st.money - penaltyMoney),
            reputation: Math.max(0, st.reputation - penaltyRep),
            medicalRecords: [record, ...st.medicalRecords],
          }));
          get()._addTransaction("expense", "误诊赔偿", penaltyMoney, `${breedName}·${beast.name} 治疗失败赔偿`);
          const realDiseaseName = DISEASE_NAMES[beast.disease];
          get().addNotification("error", `治疗失败！确诊为「${realDiseaseName}」。赔偿 ${penaltyMoney} 金，声望-${penaltyRep}`);
        }

        // Release staff & bed
        const newBeds = s.beds.map(b => b.id === bedId ? {
          ...b,
          status: "empty" as const,
          assignedBeastId: null,
          assignedStaffId: null,
          treatmentProgress: 0,
          treatmentTotal: 0,
          result: "pending" as const,
          currentPrescriptionHerbs: [],
          playerDiagnosis: null,
          startedAt: null,
          beastSnapshot: null,
        } : b);
        const staffToRelease = bed.assignedStaffId;
        const newStaff = s.staff.map(st => st.id === staffToRelease ? {
          ...st, status: "idle" as const, assignedBedId: null,
        } : st);

        set({ beds: newBeds, staff: newStaff, selectedBedId: null });
      },

      _dailySettlement: () => {
        const s = get();
        const totalWage = s.staff.reduce((sum, st) => sum + st.dailyWage, 0);
        const day = s.currentDay;
        const newWeather = rand(WEATHERS);

        // 天气事件
        let eventMsg = "";
        let bonusMoney = 0;
        if (newWeather === "misty") { bonusMoney = -20; eventMsg = "大雾天气，客人稀少。"; }
        else if (newWeather === "stormy") { bonusMoney = -30; eventMsg = "雷暴天气，采购运输受阻。"; }
        else if (newWeather === "sunny") { bonusMoney = 10; eventMsg = "晴朗天气，心情舒畅。"; }

        const newRelStaff = s.staff.map(st => {
          const isAssignedToActiveBed = s.beds.some(b =>
            b.status === "occupied" && b.result === "pending" && b.assignedStaffId === st.id
          );
          if (isAssignedToActiveBed) return st;
          return { ...st, status: "idle" as const, assignedBedId: null };
        });

        set(st => ({
          currentDay: day + 1,
          currentTime: 8,
          weather: newWeather,
          staff: newRelStaff,
          money: Math.max(0, st.money - totalWage + bonusMoney),
          lastBeastSpawn: 8,
        }));
        get()._addTransaction("expense", "员工工资", totalWage, `第${day}天员工薪资`);
        if (bonusMoney !== 0) {
          get()._addTransaction(
            bonusMoney >= 0 ? "income" : "expense",
            "天气事件",
            Math.abs(bonusMoney),
            `第${day}天结算：${eventMsg} (${bonusMoney >= 0 ? "+" : ""}${bonusMoney}金)`
          );
        }
        get().addNotification("info", `=== 第${day}天结算 === 支付薪资${totalWage}金。${eventMsg} 新的一天开始啦！`);
      },

      resetGame: () => {
        set(buildInitialState());
        setTimeout(() => get()._spawnInitialBeasts(), 100);
      },

      tickGame: (steps = 1) => {
        for (let i = 0; i < steps; i++) {
          const s = get();
          if (s.isPaused) return;

          let newTime = s.currentTime + 1;
          let dayPassed = false;
          if (newTime >= 24) { dayPassed = true; }

          let state = { ...s };

          // 1. 队列恶化
          const newQueue: Beast[] = state.waitingQueue.map(b => {
            const waited = b.waitHours + 1;
            let sev = b.severity;
            let sat = Math.max(0, b.satisfaction - randomInt(2, 5));
            if (waited > 4 && sev === "mild") sev = "moderate";
            else if (waited > 7 && sev === "moderate") sev = "severe";
            else if (waited > 10 && sev === "severe") sev = "critical";
            return { ...b, waitHours: waited, severity: sev, satisfaction: sat };
          });
          const stillWaiting: Beast[] = [];
          let repLossQueue = 0;
          for (const b of newQueue) {
            if (b.waitHours > 14) {
              repLossQueue += 8;
              const breedName = BREEDS.find(x => x.id === b.breedId)?.name || "灵兽";
              get().addNotification("warning", `${breedName}·${b.name} 等待太久，失望离去。声望-8`);
            } else stillWaiting.push(b);
          }
          state.waitingQueue = stillWaiting;
          state.reputation = Math.max(0, state.reputation - repLossQueue);

          // 2. 治疗进度
          const newBeds = state.beds.map(b => {
            if (b.status !== "occupied" || b.result !== "pending") return b;
            const staffBonus = b.assignedStaffId ? 1.3 : 1;
            const newProgress = b.treatmentProgress + staffBonus;
            let result: TreatmentResult = b.result;
            if (newProgress >= b.treatmentTotal) {
              // 判定
              const herbs = b.currentPrescriptionHerbs;
              const matchedPresc = PRESCRIPTIONS.find(p =>
                JSON.stringify([...p.herbIds].sort()) === JSON.stringify([...herbs].sort())
              );
              let finalRate = matchedPresc ? matchedPresc.successRate : 30;
              let revenueMultiplier = 1;
              let repBonus = 0;

              // 检查改良药方
              const improvedMatch = IMPROVED_PRESCRIPTIONS.find(p =>
                JSON.stringify([...p.herbIds].sort()) === JSON.stringify([...herbs].sort()) &&
                state.recipeCanon.some(c => c.type === "improved_prescription" && c.herbIds && JSON.stringify([...c.herbIds].sort()) === JSON.stringify([...herbs].sort()))
              );
              if (improvedMatch) {
                finalRate = improvedMatch.successRate;
                revenueMultiplier = improvedMatch.bonusEffect.revenueMultiplier;
              }

              // 检查隐藏病名匹配
              if (b.beastSnapshot && b.playerDiagnosis) {
                const hiddenMatch = state.recipeCanon.find(c =>
                  c.type === "hidden_disease" &&
                  c.disease === b.beastSnapshot?.disease &&
                  b.playerDiagnosis === b.beastSnapshot?.disease
                );
                if (hiddenMatch && hiddenMatch.bonusEffect) {
                  finalRate += hiddenMatch.bonusEffect.reputationBonus || 0;
                  if (hiddenMatch.bonusEffect.revenueMultiplier) {
                    revenueMultiplier *= hiddenMatch.bonusEffect.revenueMultiplier;
                  }
                  repBonus = hiddenMatch.bonusEffect.reputationBonus || 0;
                }
              }

              // 员工加成
              if (b.assignedStaffId) {
                const stf = state.staff.find(x => x.id === b.assignedStaffId);
                finalRate += (stf?.skillLevel ?? 1) * 5;
              }
              // 疾病严重度减成
              const sev = b.beastSnapshot?.severity ?? "mild";
              const sevDebuff = { mild: 0, moderate: -5, severe: -10, critical: -15 }[sev] || 0;
              finalRate = Math.max(5, Math.min(98, finalRate + sevDebuff));
              result = Math.random() * 100 <= finalRate ? "success" : "fail";
            }
            return { ...b, treatmentProgress: Math.min(newProgress, b.treatmentTotal), result };
          });
          state.beds = newBeds;

          // 3. 新灵兽生成
          if (!dayPassed && newTime >= 8 && newTime < 21) {
            const chance = 0.25 + Math.min(0.3, state.currentDay * 0.015);
            if (newTime - state.lastBeastSpawn >= randomInt(1, 2) && Math.random() <= chance && state.waitingQueue.length < 6) {
              const nb = generateRandomBeast(state.currentDay, newTime);
              state.waitingQueue = [...state.waitingQueue, nb];
              state.lastBeastSpawn = newTime;
              const breed = BREEDS.find(b => b.id === nb.breedId);
              get().addNotification("info", `新客人：${breed?.name || "灵兽"}·${nb.name} 前来就诊`);
            }
          }

          state.currentTime = dayPassed ? 8 : newTime;

          set(state);
          if (dayPassed) get()._dailySettlement();
          get()._processResearch();
        }
      },

      _processResearch: () => {
        const s = get();
        const researching = s.researchProjects.find(p => p.status === "researching");
        if (!researching) return;

        const staffBonus = s.researchingStaffId ? 1.5 : 1;
        const newProgress = researching.progress + staffBonus;
        let newStatus = researching.status;
        let resultType: ResearchResultType | null = researching.resultType;
        let resultId: string | null = researching.resultId;

        if (newProgress >= researching.totalHours) {
          const scroll = researching.scrollId ? ANCIENT_SCROLLS.find(sc => sc.id === researching.scrollId) : null;
          const validation = validateResearch(
            researching.selectedSymptoms,
            researching.selectedHerbs,
            researching.selectedElement,
            scroll
          );

          if (validation.valid && validation.matchType && validation.matchId) {
            newStatus = "completed";
            resultType = validation.matchType;
            resultId = validation.matchId;

            let canonEntry: RecipeCanonEntry | null = null;
            if (validation.matchType === "hidden_disease") {
              const hd = HIDDEN_DISEASES.find(h => h.id === validation.matchId);
              if (hd && !s.recipeCanon.some(c => c.type === "hidden_disease" && c.disease === hd.diseaseType)) {
                canonEntry = {
                  id: uid("canon"),
                  name: hd.hiddenName,
                  type: "hidden_disease",
                  disease: hd.diseaseType,
                  description: hd.description,
                  bonusEffect: {
                    revenueMultiplier: hd.successBonus.revenueMultiplier,
                    reputationBonus: hd.successBonus.reputationBonus,
                  },
                  discoveredAt: s.currentTime,
                  dayDiscovered: s.currentDay,
                };
              }
            } else if (validation.matchType === "improved_prescription") {
              const ip = IMPROVED_PRESCRIPTIONS.find(p => p.id === validation.matchId);
              if (ip && !s.recipeCanon.some(c => c.type === "improved_prescription" && c.herbIds && JSON.stringify([...c.herbIds].sort()) === JSON.stringify([...ip.herbIds].sort()))) {
                canonEntry = {
                  id: uid("canon"),
                  name: ip.name,
                  type: "improved_prescription",
                  disease: ip.baseDisease,
                  description: ip.bonusDescription,
                  herbIds: ip.herbIds,
                  successRate: ip.successRate,
                  bonusEffect: {
                    revenueMultiplier: ip.bonusEffect.revenueMultiplier,
                    speedBoost: ip.bonusEffect.speedBoost,
                    satisfactionBonus: ip.bonusEffect.satisfactionBonus,
                  },
                  discoveredAt: s.currentTime,
                  dayDiscovered: s.currentDay,
                };
              }
            }

            if (canonEntry) {
              set(st => ({
                recipeCanon: [...st.recipeCanon, canonEntry!],
                reputation: Math.min(100, st.reputation + 10),
              }));
              get().addNotification("success", `🎉 研究成功！发现「${canonEntry.name}」已录入药方典籍！声望+10`);
            } else {
              set(st => ({
                reputation: Math.max(0, st.reputation - 2),
              }));
              get().addNotification("warning", "研究结果已知，没有新发现。声望-2");
            }
          } else {
            newStatus = "failed";
            set(st => ({
              reputation: Math.max(0, st.reputation - 3),
            }));
            get().addNotification("error", `研究失败！组合不匹配，匹配度${validation.score}%。声望-3`);
          }
        }

        const updatedProjects = s.researchProjects.map(p =>
          p.id === researching.id
            ? { ...p, progress: Math.min(newProgress, researching.totalHours), status: newStatus, resultType, resultId }
            : p
        );

        const staffToRelease = s.researchingStaffId;
        const newStaff = s.staff.map(st =>
          st.id === staffToRelease && (newStatus === "completed" || newStatus === "failed")
            ? { ...st, status: "idle" as const, assignedBedId: null }
            : st
        );

        set({
          researchProjects: updatedProjects,
          staff: newStaff,
          researchingStaffId: (newStatus === "completed" || newStatus === "failed") ? null : s.researchingStaffId,
        });
      },

      startResearch: (symptoms, herbs, element, scrollId, staffId) => {
        const s = get();

        if (s.researchProjects.some(p => p.status === "researching")) {
          s.addNotification("error", "已有研究项目进行中，请先完成或取消当前研究");
          return;
        }

        if (symptoms.length === 0 || herbs.length === 0 || !element || !scrollId) {
          s.addNotification("error", "请选择症状、药材、元素和古籍残页");
          return;
        }

        if ((s.scrollInventory[scrollId] ?? 0) < 1) {
          s.addNotification("error", "古籍残页数量不足");
          return;
        }

        if (staffId) {
          const st = s.staff.find(x => x.id === staffId);
          if (!st || st.status !== "idle") {
            s.addNotification("error", "该护理员当前不可用");
            return;
          }
        }

        const scroll = ANCIENT_SCROLLS.find(sc => sc.id === scrollId);
        if (!scroll) return;

        const totalHours = 8 + (symptoms.length * 2) + (herbs.length * 2);
        const staffName = staffId ? s.staff.find(st => st.id === staffId)?.name : "无";

        const newProject: ResearchProject = {
          id: uid("research"),
          name: `「${scroll.fragmentText}」研究`,
          status: "researching",
          progress: 0,
          totalHours,
          selectedSymptoms: symptoms,
          selectedHerbs: herbs,
          selectedElement: element,
          scrollId,
          resultType: null,
          resultId: null,
          startedAt: s.currentTime,
          createdAt: Date.now(),
        };

        const newScrollInventory = { ...s.scrollInventory };
        newScrollInventory[scrollId] = (newScrollInventory[scrollId] ?? 0) - 1;

        const newStaff = s.staff.map(st =>
          st.id === staffId ? { ...st, status: "working" as const, assignedBedId: null } : st
        );

        set(st => ({
          researchProjects: [...st.researchProjects, newProject],
          scrollInventory: newScrollInventory,
          staff: newStaff,
          researchingStaffId: staffId,
        }));

        get().addNotification("info", `开始研究「${scroll.name}」，预计${totalHours}小时。研究员：${staffName}`);
      },

      cancelResearch: (projectId) => {
        const s = get();
        const project = s.researchProjects.find(p => p.id === projectId);
        if (!project || project.status !== "researching") return;

        const staffToRelease = s.researchingStaffId;
        const newStaff = s.staff.map(st =>
          st.id === staffToRelease ? { ...st, status: "idle" as const, assignedBedId: null } : st
        );

        set(st => ({
          researchProjects: st.researchProjects.filter(p => p.id !== projectId),
          staff: newStaff,
          researchingStaffId: null,
        }));

        get().addNotification("warning", `已取消研究「${project.name}」`);
      },

      collectResearchResult: (projectId) => {
        const s = get();
        const project = s.researchProjects.find(p => p.id === projectId);
        if (!project || (project.status !== "completed" && project.status !== "failed")) return;

        set(st => ({
          researchProjects: st.researchProjects.filter(p => p.id !== projectId),
        }));
      },
    }),
    {
      name: "beast-clinic-save",
      version: 1,
      merge: (persisted, current) => ({ ...current, ...(persisted as object) }),
      onRehydrateStorage: () => (state) => {
        if (state && state.waitingQueue.length === 0 && state.medicalRecords.length === 0) {
          // 全新存档
          setTimeout(() => state._spawnInitialBeasts(), 100);
        }
      },
    }
  )
);
