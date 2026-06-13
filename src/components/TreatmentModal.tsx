import { useMemo, useState, useEffect } from "react";
import { X, Stethoscope, Pill, Users, ArrowRight, AlertCircle, Sparkles, Brain, ChevronDown, BookOpen, ScrollText } from "lucide-react";
import { useGameStore, guessDiseaseFromSymptoms } from "@/store/gameStore";
import {
  BREEDS, HERBS, PRESCRIPTIONS, HIDDEN_DISEASES, IMPROVED_PRESCRIPTIONS,
  SEVERITY_NAMES, SEVERITY_COLORS, DISEASE_NAMES,
  ELEMENT_EMOJI, ELEMENT_NAMES,
} from "@/data/gameData";
import type { Bed, DiseaseType, RecipeCanonEntry } from "@/types/game";

interface TreatmentModalProps {
  open: boolean;
  onClose: () => void;
  targetBed: Bed | null;
}

const SEVERITY_ORDER = ["mild", "moderate", "severe", "critical"];

function getMatchLabel(rate: number): { text: string; color: string } {
  if (rate >= 80) return { text: "高度疑似", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  if (rate >= 50) return { text: "中度疑似", color: "text-amber-600 bg-amber-50 border-amber-200" };
  return { text: "不排除", color: "text-gray-500 bg-gray-50 border-gray-200" };
}

export function TreatmentModal({ open, onClose, targetBed }: TreatmentModalProps) {
  const selectedBeastId = useGameStore(s => s.selectedBeastId);
  const queue = useGameStore(s => s.waitingQueue);
  const inventory = useGameStore(s => s.inventory);
  const staff = useGameStore(s => s.staff);
  const recipeCanon = useGameStore(s => s.recipeCanon);
  const assignBedAndTreat = useGameStore(s => s.assignBedAndTreat);

  const [selectedHerbs, setSelectedHerbs] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [playerDiagnosis, setPlayerDiagnosis] = useState<DiseaseType | null>(null);
  const [showAllDiseases, setShowAllDiseases] = useState(false);
  const [maxHerbs, setMaxHerbs] = useState(3);

  const beast = useMemo(() => queue.find(b => b.id === selectedBeastId), [queue, selectedBeastId]);
  const breed = beast ? BREEDS.find(b => b.id === beast.breedId) : null;
  const idleStaff = useMemo(() => staff.filter(s => s.status === "idle"), [staff]);

  const suspectedDiseases = useMemo(() => {
    if (!beast) return [];
    return guessDiseaseFromSymptoms(beast.symptoms);
  }, [beast]);

  const topSuspects = useMemo(() => showAllDiseases ? suspectedDiseases : suspectedDiseases.slice(0, 3), [suspectedDiseases, showAllDiseases]);

  const recommendedPrescription = useMemo(() => {
    if (!playerDiagnosis) return null;
    return PRESCRIPTIONS.find(p => p.disease === playerDiagnosis) || null;
  }, [playerDiagnosis]);

  useEffect(() => {
    if (open) {
      setSelectedHerbs([]);
      setSelectedStaff(null);
      setPlayerDiagnosis(null);
      setShowAllDiseases(false);
      setMaxHerbs(3);
    }
  }, [open, selectedBeastId]);

  if (!open || !beast || !breed) return null;

  const toggleHerb = (herbId: string) => {
    setSelectedHerbs(prev => {
      if (prev.includes(herbId)) return prev.filter(id => id !== herbId);
      if (prev.length >= maxHerbs) return prev;
      if ((inventory[herbId] ?? 0) < 1) return prev;
      return [...prev, herbId];
    });
  };

  const improvedPrescriptions = useMemo(() => {
    return IMPROVED_PRESCRIPTIONS.filter(ip =>
      recipeCanon.some(c => c.type === "improved_prescription" && c.herbIds && JSON.stringify([...c.herbIds].sort()) === JSON.stringify([...ip.herbIds].sort()))
    );
  }, [recipeCanon]);

  const discoveredHiddenDiseases = useMemo(() => {
    return recipeCanon.filter(c => c.type === "hidden_disease");
  }, [recipeCanon]);

  const applyPrescription = (presc: { herbIds: string[] }, isImproved = false) => {
    const canAfford = presc.herbIds.every(id => (inventory[id] ?? 0) >= 1);
    if (!canAfford) return;
    setSelectedHerbs([...presc.herbIds]);
    if (isImproved) {
      setMaxHerbs(presc.herbIds.length);
    } else {
      setMaxHerbs(3);
    }
  };

  const selectDiagnosis = (disease: DiseaseType) => {
    setPlayerDiagnosis(prev => prev === disease ? null : disease);
  };

  const herbsTotal = selectedHerbs.reduce((sum, id) => {
    const h = HERBS.find(x => x.id === id);
    return sum + (h?.price ?? 0);
  }, 0);

  const canSubmit = targetBed && selectedHerbs.length >= 1;

  const handleSubmit = () => {
    if (!canSubmit || !targetBed) return;
    assignBedAndTreat(beast.id, targetBed.id, selectedStaff, selectedHerbs, playerDiagnosis);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-lg bg-clinic-card shadow-2xl h-full flex flex-col border-l-2 border-clinic-border/60 animate-slide-in-right"
      >
        <div className="flex items-start gap-3 p-4 border-b border-clinic-border/40 bg-gradient-to-r from-clinic-jade/10 via-white to-clinic-amber/10 flex-shrink-0">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-inner border border-clinic-border/50 flex items-center justify-center text-3xl flex-shrink-0">
            {breed.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg text-clinic-deep">{beast.name}</h3>
              <span className="text-[11px] text-gray-500">{breed.name}</span>
              <span className="text-[11px]">{ELEMENT_EMOJI[breed.element]} {ELEMENT_NAMES[breed.element]}系</span>
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap text-xs">
              <span className={`tag border ${SEVERITY_COLORS[beast.severity]}`}>
                {SEVERITY_NAMES[beast.severity]}
              </span>
              <span className="text-gray-500">💝 {beast.satisfaction}</span>
              <span className="text-gray-500">⏳ 等{beast.waitHours}h</span>
              {targetBed && (
                <span className="tag bg-clinic-amber/20 text-clinic-deep border border-clinic-amber/40 ml-auto">
                  🛏️ {targetBed.name}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-clinic-crisis hover:bg-red-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!targetBed && (
          <div className="mx-4 mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            请先点击一张空闲的床位，再为这位灵兽安排诊断和治疗。
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 症状 + 诊断推测 */}
          <div className="card p-3 border-clinic-jade/20">
            <div className="font-display text-sm text-clinic-deep flex items-center gap-1.5 mb-2">
              <Stethoscope className="w-4 h-4 text-clinic-jade" />
              望闻问切 — 症状观察
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {beast.symptoms.map(s => (
                <span key={s} className="tag bg-white border border-clinic-jade/30 text-clinic-deep text-xs shadow-sm">
                  {s}
                </span>
              ))}
            </div>

            <div className="border-t border-clinic-border/30 pt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Brain className="w-4 h-4 text-clinic-amber" />
                <span className="text-xs font-semibold text-clinic-deep">初步推测</span>
                <span className="text-[10px] text-gray-400 ml-auto">点击选择你的诊断</span>
              </div>
              <div className="space-y-1.5">
                {topSuspects.map(({ disease, matchRate }) => {
                  const label = getMatchLabel(matchRate);
                  const selected = playerDiagnosis === disease;
                  const presc = PRESCRIPTIONS.find(p => p.disease === disease);
                  const hiddenDisease = discoveredHiddenDiseases.find(h => h.disease === disease);
                  return (
                    <button
                      key={disease}
                      onClick={() => selectDiagnosis(disease)}
                      disabled={!targetBed}
                      className={`w-full text-left p-2 rounded-lg border transition-all disabled:opacity-50 ${
                        selected
                          ? "border-clinic-jade bg-clinic-jade/10 shadow-sm"
                          : "border-gray-200 bg-white hover:border-clinic-jade/50 hover:bg-gray-50"
                      } ${hiddenDisease ? "ring-1 ring-purple-200" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${label.color}`}>
                          {label.text}
                        </span>
                        <span className="text-sm font-medium text-clinic-deep">{DISEASE_NAMES[disease]}</span>
                        {hiddenDisease && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-0.5">
                            <BookOpen className="w-3 h-3" />
                            {hiddenDisease.name}
                          </span>
                        )}
                        {selected && <Sparkles className="w-3.5 h-3.5 text-clinic-amber ml-auto" />}
                        <span className="text-[10px] text-gray-400 ml-auto tabular-nums">匹配 {matchRate}%</span>
                      </div>
                      {selected && presc && (
                        <div className="mt-2 pt-2 border-t border-clinic-border/30 flex items-center gap-2 text-[11px]">
                          <span className="text-gray-500">推荐药方：</span>
                          <span className="font-medium text-clinic-deep">{presc.name}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); applyPrescription(presc); }}
                            className="ml-auto px-2 py-0.5 rounded bg-clinic-amber/20 text-clinic-deep text-[10px] font-medium hover:bg-clinic-amber/30 transition-colors"
                          >
                            一键填入
                          </button>
                        </div>
                      )}
                      {selected && hiddenDisease && (
                        <div className="mt-2 pt-2 border-t border-purple-200/50 text-[11px] text-purple-700 bg-purple-50/50 rounded p-1.5">
                          <span className="font-medium">📖 {hiddenDisease.name}：</span>
                          {hiddenDisease.description}
                          {hiddenDisease.bonusEffect && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {hiddenDisease.bonusEffect.revenueMultiplier && (
                                <span className="text-[10px] px-1 py-0.5 bg-purple-200/50 rounded">
                                  💰收入×{hiddenDisease.bonusEffect.revenueMultiplier}
                                </span>
                              )}
                              {hiddenDisease.bonusEffect.reputationBonus && (
                                <span className="text-[10px] px-1 py-0.5 bg-purple-200/50 rounded">
                                  ⭐声望+{hiddenDisease.bonusEffect.reputationBonus}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setShowAllDiseases(!showAllDiseases)}
                className="w-full mt-2 text-[11px] text-gray-500 flex items-center justify-center gap-1 hover:text-clinic-deep transition-colors"
              >
                {showAllDiseases ? "收起" : "查看更多可能"}
                <ChevronDown className={`w-3 h-3 transition-transform ${showAllDiseases ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {improvedPrescriptions.length > 0 && (
            <div className="card p-3 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="font-display text-sm text-clinic-deep flex items-center gap-1.5 mb-2">
                <ScrollText className="w-4 h-4 text-purple-600" />
                改良古方
                <span className="ml-auto text-[10px] text-purple-500">共 {improvedPrescriptions.length} 方</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {improvedPrescriptions.map(p => {
                  const canUse = p.herbIds.every(id => (inventory[id] ?? 0) >= 1);
                  const isSelected = JSON.stringify([...selectedHerbs].sort()) === JSON.stringify([...p.herbIds].sort());
                  return (
                    <button
                      key={p.id}
                      onClick={() => canUse && targetBed && applyPrescription(p, true)}
                      disabled={!canUse || !targetBed}
                      className={`text-left p-2 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? "border-purple-400 bg-purple-100 shadow-sm"
                          : canUse
                          ? "border-purple-200 bg-white/80 hover:border-purple-300 hover:bg-purple-50"
                          : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-purple-800">{p.name}</span>
                        <span className="text-[10px] text-purple-500 ml-auto">成功率{p.successRate}%</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {p.herbIds.map(id => HERBS.find(h => h.id === id)?.emoji).join(" ")}
                        <span className="ml-1 text-purple-500">
                          💰×{p.bonusEffect.revenueMultiplier} ⚡+{Math.round(p.bonusEffect.speedBoost * 100)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 标准药方快速参考 */}
          <div className="card p-3 border-clinic-amber/20">
            <div className="font-display text-sm text-clinic-deep flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-clinic-amber" />
              常用药方
              <span className="ml-auto text-[10px] text-gray-400">共 {PRESCRIPTIONS.length} 方</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
              {PRESCRIPTIONS.map(p => {
                const canUse = p.herbIds.every(id => (inventory[id] ?? 0) >= 1);
                const isSelected = JSON.stringify([...selectedHerbs].sort()) === JSON.stringify([...p.herbIds].sort());
                return (
                  <button
                    key={p.id}
                    onClick={() => canUse && targetBed && applyPrescription(p)}
                    disabled={!canUse || !targetBed}
                    className={`text-left p-1.5 rounded-lg border text-[11px] transition-all ${
                      isSelected
                        ? "border-clinic-jade bg-clinic-jade/10"
                        : canUse
                        ? "border-gray-200 bg-white hover:border-clinic-amber/50 hover:bg-amber-50"
                        : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="font-medium text-clinic-deep">{p.name}</div>
                    <div className="text-[10px] text-gray-500">
                      {p.herbIds.map(id => HERBS.find(h => h.id === id)?.emoji).join(" ")}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 药材选择 */}
          <div className="card p-3 border-clinic-amber/20">
            <div className="font-display text-sm text-clinic-deep flex items-center gap-1.5 mb-2">
              <Pill className="w-4 h-4 text-clinic-amber" />
              处方笺 — 选择药材
              <span className="ml-auto text-[11px] text-gray-500">
                已选 <span className="text-clinic-deep font-semibold">{selectedHerbs.length}</span>/{maxHerbs}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {HERBS.map(h => {
                const count = inventory[h.id] ?? 0;
                const selected = selectedHerbs.includes(h.id);
                const disabled = (!selected && (count < 1 || selectedHerbs.length >= maxHerbs)) || !targetBed;
                return (
                  <button
                    key={h.id}
                    onClick={() => toggleHerb(h.id)}
                    disabled={disabled}
                    className={`relative p-1.5 rounded-lg border text-center transition-all ${
                      selected
                        ? "border-clinic-jade bg-clinic-jade/10 shadow-sm"
                        : count > 0
                        ? "border-clinic-border/50 bg-white hover:border-clinic-jade/50"
                        : "border-gray-200 bg-gray-50 opacity-50"
                    } ${disabled && !selected ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  >
                    <div className="text-xl">{h.emoji}</div>
                    <div className="text-[10px] font-medium text-clinic-deep truncate">{h.name}</div>
                    <div className="text-[9px] text-gray-400">💰{h.price}</div>
                    <div className="absolute top-0.5 right-0.5 text-[9px] px-1 rounded-full bg-black/5 text-gray-500 tabular-nums">
                      {count}
                    </div>
                    {selected && (
                      <div className="absolute -top-1 -left-1 w-4 h-4 bg-clinic-jade text-white text-[10px] rounded-full flex items-center justify-center shadow-sm">
                        {selectedHerbs.indexOf(h.id) + 1}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 护理员 */}
          <div className="card p-3 border-clinic-light-jade/20">
            <div className="font-display text-sm text-clinic-deep flex items-center gap-1.5 mb-2">
              <Users className="w-4 h-4 text-clinic-light-jade" />
              护理员安排
              <span className="ml-auto text-[10px] text-gray-500">
                加速 30% · 成功率 +5~10%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {idleStaff.length === 0 && (
                <div className="col-span-full text-center py-2 text-gray-400 text-xs italic">
                  暂无空闲护理员，可直接开始治疗
                </div>
              )}
              {idleStaff.map(s => {
                const sel = selectedStaff === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStaff(sel ? null : s.id)}
                    disabled={!targetBed}
                    className={`p-2 rounded-lg border text-left transition-all disabled:opacity-50 ${
                      sel
                        ? "border-clinic-light-jade bg-clinic-light-jade/10 shadow-sm"
                        : "border-clinic-border/50 bg-white hover:border-clinic-light-jade/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">{s.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-clinic-deep truncate">{s.name}</div>
                        <div className="text-[9px] text-gray-500">Lv.{s.skillLevel}</div>
                      </div>
                    </div>
                    <div className="mt-1 text-[9px] text-gray-500">
                      成功率 +{s.skillLevel * 5}% · 日薪 {s.dailyWage}
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => setSelectedStaff(null)}
                disabled={!targetBed}
                className={`p-2 rounded-lg border border-dashed transition-all disabled:opacity-50 ${
                  selectedStaff === null
                    ? "border-gray-400 bg-gray-50"
                    : "border-clinic-border/50 bg-white hover:border-gray-400"
                } flex flex-col items-center justify-center text-[10px] text-gray-500 hover:text-clinic-deep`}
              >
                <span className="text-lg mb-0.5">🙅</span>
                不分配
              </button>
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="p-3 border-t border-clinic-border/40 bg-gradient-to-r from-clinic-amber/10 via-white to-clinic-jade/10 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs mb-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Pill className="w-3.5 h-3.5 text-clinic-amber" />
              <span className="text-gray-600">
                {selectedHerbs.length > 0
                  ? selectedHerbs.map(id => HERBS.find(h => h.id === id)?.emoji || "?").join("+")
                  : "未选药"}
              </span>
            </div>
            <span className="text-clinic-deep font-semibold tabular-nums ml-auto">
              💊 {herbsTotal} 金
            </span>
            {selectedStaff && (
              <>
                <span className="text-gray-300">·</span>
                <div className="text-gray-600 text-[11px]">
                  👩‍⚕️ {staff.find(s => s.id === selectedStaff)?.name}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border-2 border-clinic-border/60 text-gray-600 hover:bg-white/80 transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="btn-primary flex-1 flex items-center justify-center gap-1.5 disabled:!bg-gray-300 text-sm"
            >
              开始治疗
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
