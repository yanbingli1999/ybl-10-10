import { useState, useMemo } from "react";
import { BookOpen, FlaskConical, ScrollText, Leaf, Sparkles, X, ChevronRight, Clock, Users, Award, AlertCircle } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { ANCIENT_SCROLLS, HERBS, DISEASE_SYMPTOMS, ELEMENT_NAMES, ELEMENT_EMOJI, DISEASE_NAMES } from "@/data/gameData";
import type { Element } from "@/types/game";

const ALL_ELEMENTS: Element[] = ["fire", "water", "wood", "thunder", "earth", "light", "dark"];

const ALL_SYMPTOMS = Array.from(new Set(Object.values(DISEASE_SYMPTOMS).flat()));

export default function ResearchPage() {
  const scrollInventory = useGameStore(s => s.scrollInventory);
  const inventory = useGameStore(s => s.inventory);
  const staff = useGameStore(s => s.staff);
  const researchProjects = useGameStore(s => s.researchProjects);
  const recipeCanon = useGameStore(s => s.recipeCanon);
  const currentTime = useGameStore(s => s.currentTime);
  const currentDay = useGameStore(s => s.currentDay);
  const reputation = useGameStore(s => s.reputation);

  const startResearch = useGameStore(s => s.startResearch);
  const cancelResearch = useGameStore(s => s.cancelResearch);
  const collectResearchResult = useGameStore(s => s.collectResearchResult);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedHerbs, setSelectedHerbs] = useState<string[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [selectedScrollId, setSelectedScrollId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"research" | "canon" | "scrolls">("research");

  const availableScrolls = useMemo(() => {
    return ANCIENT_SCROLLS.filter(s => (scrollInventory[s.id] ?? 0) > 0);
  }, [scrollInventory]);

  const availableHerbs = useMemo(() => {
    return HERBS.filter(h => (inventory[h.id] ?? 0) > 0);
  }, [inventory]);

  const availableStaff = useMemo(() => {
    return staff.filter(s => s.status === "idle");
  }, [staff]);

  const activeResearch = researchProjects.find(p => p.status === "researching");
  const completedResearch = researchProjects.filter(p => p.status === "completed" || p.status === "failed");

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : prev.length < 5 ? [...prev, symptom] : prev
    );
  };

  const toggleHerb = (herbId: string) => {
    setSelectedHerbs(prev =>
      prev.includes(herbId)
        ? prev.filter(h => h !== herbId)
        : prev.length < 5 ? [...prev, herbId] : prev
    );
  };

  const canStartResearch = selectedSymptoms.length > 0 && selectedHerbs.length > 0 && selectedElement && selectedScrollId;

  const estimatedHours = 8 + (selectedSymptoms.length * 2) + (selectedHerbs.length * 2);

  const handleStartResearch = () => {
    startResearch(selectedSymptoms, selectedHerbs, selectedElement, selectedScrollId, selectedStaffId);
    setSelectedSymptoms([]);
    setSelectedHerbs([]);
    setSelectedElement(null);
    setSelectedScrollId(null);
    setSelectedStaffId(null);
  };

  const selectedScroll = selectedScrollId ? ANCIENT_SCROLLS.find(s => s.id === selectedScrollId) : null;

  return (
    <div className="container px-4 py-6 space-y-6 animate-fade">
      <div className="flex items-center gap-4 mb-2">
        <div className="text-4xl">🔬</div>
        <div>
          <h1 className="font-display text-2xl text-clinic-deep">古籍研究室</h1>
          <p className="text-sm text-gray-500">组合症状、药材、元素与残页，推演古方奥秘</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="tag bg-clinic-jade/20 text-clinic-jade border-clinic-jade/40">
            <Award className="w-3 h-3 mr-1" /> 声望 {reputation}
          </span>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: "research", label: "🧪 推演研究", icon: FlaskConical },
          { key: "canon", label: "📚 药方典籍", icon: BookOpen },
          { key: "scrolls", label: "📜 残页收藏", icon: ScrollText },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 font-medium transition-all border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === tab.key
                ? "border-clinic-jade text-clinic-jade"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "research" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {activeResearch && (
              <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-clinic-deep">研究进行中</h3>
                    <p className="text-sm text-gray-600">{activeResearch.name}</p>
                  </div>
                  <button
                    onClick={() => cancelResearch(activeResearch.id)}
                    className="px-3 py-1 text-sm bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors"
                  >
                    取消
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">研究进度</span>
                    <span className="font-medium text-amber-700 tabular-nums">
                      {Math.floor(activeResearch.progress)} / {activeResearch.totalHours} 小时
                    </span>
                  </div>
                  <div className="h-3 bg-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                      style={{ width: `${(activeResearch.progress / activeResearch.totalHours) * 100}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeResearch.selectedSymptoms.map((sym, i) => (
                      <span key={i} className="tag text-xs bg-blue-100 text-blue-700 border-blue-200">
                        {sym}
                      </span>
                    ))}
                    {activeResearch.selectedHerbs.map((hid, i) => {
                      const herb = HERBS.find(h => h.id === hid);
                      return herb ? (
                        <span key={i} className="tag text-xs bg-green-100 text-green-700 border-green-200">
                          {herb.emoji} {herb.name}
                        </span>
                      ) : null;
                    })}
                    {activeResearch.selectedElement && (
                      <span className="tag text-xs bg-purple-100 text-purple-700 border-purple-200">
                        {ELEMENT_EMOJI[activeResearch.selectedElement]} {ELEMENT_NAMES[activeResearch.selectedElement]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!activeResearch && (
              <>
                <div className="card p-5">
                  <h3 className="font-semibold text-clinic-deep flex items-center gap-2 mb-4">
                    <span>💊</span> 选择症状 <span className="text-xs text-gray-400 ml-auto">已选 {selectedSymptoms.length}/5</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SYMPTOMS.map(sym => (
                      <button
                        key={sym}
                        onClick={() => toggleSymptom(sym)}
                        className={`px-3 py-1.5 rounded-lg text-sm border-2 transition-all ${
                          selectedSymptoms.includes(sym)
                            ? "bg-blue-100 border-blue-400 text-blue-700 shadow-sm"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="font-semibold text-clinic-deep flex items-center gap-2 mb-4">
                    <Leaf className="w-5 h-5 text-green-600" /> 选择药材 <span className="text-xs text-gray-400 ml-auto">已选 {selectedHerbs.length}/5</span>
                  </h3>
                  {availableHerbs.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <div className="text-3xl mb-2">🌿</div>
                      <p className="text-sm">暂无可用药材，请先采购</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {availableHerbs.map(herb => (
                        <button
                          key={herb.id}
                          onClick={() => toggleHerb(herb.id)}
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            selectedHerbs.includes(herb.id)
                              ? "bg-green-100 border-green-400 shadow-sm"
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="text-2xl mb-1">{herb.emoji}</div>
                          <div className="text-sm font-medium text-gray-800">{herb.name}</div>
                          <div className="text-xs text-gray-500">库存: {inventory[herb.id] ?? 0}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card p-5">
                  <h3 className="font-semibold text-clinic-deep flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-600" /> 选择灵兽元素
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ALL_ELEMENTS.map(elem => (
                      <button
                        key={elem}
                        onClick={() => setSelectedElement(selectedElement === elem ? null : elem)}
                        className={`px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
                          selectedElement === elem
                            ? "bg-purple-100 border-purple-400 shadow-sm"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-xl">{ELEMENT_EMOJI[elem]}</span>
                        <span className={`font-medium ${selectedElement === elem ? "text-purple-700" : "text-gray-700"}`}>
                          {ELEMENT_NAMES[elem]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="font-semibold text-clinic-deep flex items-center gap-2 mb-4">
                    <ScrollText className="w-5 h-5 text-amber-600" /> 选择古籍残页
                  </h3>
                  {availableScrolls.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <div className="text-3xl mb-2">📜</div>
                      <p className="text-sm">暂无古籍残页，成功治愈灵兽有概率获得</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableScrolls.map(scroll => (
                        <button
                          key={scroll.id}
                          onClick={() => setSelectedScrollId(selectedScrollId === scroll.id ? null : scroll.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            selectedScrollId === scroll.id
                              ? "bg-amber-100 border-amber-400 shadow-md"
                              : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{scroll.emoji}</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 truncate">{scroll.name}</div>
                              <div className="text-sm text-amber-700 font-medium mt-1">
                                「{scroll.fragmentText}」
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{scroll.description}</div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-400">
                                  相关元素: {scroll.relatedElements.map(e => ELEMENT_EMOJI[e]).join(" ")}
                                </span>
                                <span className="ml-auto tag bg-amber-200/60 text-amber-800 text-xs">
                                  x{scrollInventory[scroll.id]}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card p-5">
                  <h3 className="font-semibold text-clinic-deep flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-gray-600" /> 指派研究员（可选）
                  </h3>
                  {availableStaff.length === 0 ? (
                    <div className="text-sm text-gray-400">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      暂无空闲护理员
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableStaff.map(st => (
                        <button
                          key={st.id}
                          onClick={() => setSelectedStaffId(selectedStaffId === st.id ? null : st.id)}
                          className={`px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
                            selectedStaffId === st.id
                              ? "bg-gray-100 border-gray-400 shadow-sm"
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-xl">{st.emoji}</span>
                          <div className="text-left">
                            <div className={`font-medium ${selectedStaffId === st.id ? "text-gray-800" : "text-gray-700"}`}>
                              {st.name}
                            </div>
                            <div className="text-xs text-gray-500">Lv.{st.skillLevel} {st.title}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {completedResearch.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-clinic-deep flex items-center gap-2 mb-4">
                  <span>📋</span> 研究记录
                </h3>
                <div className="space-y-2">
                  {completedResearch.map(project => (
                    <div
                      key={project.id}
                      className={`p-3 rounded-xl border-2 flex items-center gap-3 ${
                        project.status === "completed"
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-rose-50 border-rose-200"
                      }`}
                    >
                      <div className="text-2xl">
                        {project.status === "completed" ? "✅" : "❌"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">{project.name}</div>
                        <div className="text-xs text-gray-500">
                          {project.status === "completed" ? "研究成功" : "研究失败"}
                        </div>
                      </div>
                      <button
                        onClick={() => collectResearchResult(project.id)}
                        className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        确认
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {!activeResearch && (
              <div className="card p-5 bg-gradient-to-br from-clinic-jade/5 to-clinic-jade/10 sticky top-4">
                <h3 className="font-semibold text-clinic-deep flex items-center gap-2 mb-4">
                  <FlaskConical className="w-5 h-5 text-clinic-jade" /> 推演配置
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">已选症状</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedSymptoms.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">未选择</span>
                      ) : selectedSymptoms.map((sym, i) => (
                        <span key={i} className="tag text-xs bg-blue-100 text-blue-700 border-blue-200">
                          {sym} <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleSymptom(sym)} />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">已选药材</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedHerbs.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">未选择</span>
                      ) : selectedHerbs.map((hid, i) => {
                        const herb = HERBS.find(h => h.id === hid);
                        return herb ? (
                          <span key={i} className="tag text-xs bg-green-100 text-green-700 border-green-200">
                            {herb.emoji} {herb.name}
                            <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleHerb(hid)} />
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">灵兽元素</div>
                    <div>
                      {selectedElement ? (
                        <span className="tag text-xs bg-purple-100 text-purple-700 border-purple-200">
                          {ELEMENT_EMOJI[selectedElement]} {ELEMENT_NAMES[selectedElement]}
                          <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSelectedElement(null)} />
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">未选择</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">古籍残页</div>
                    <div>
                      {selectedScroll ? (
                        <div className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded-lg p-2">
                          <div className="font-medium">{selectedScroll.name}</div>
                          <div className="text-amber-600 mt-0.5">「{selectedScroll.fragmentText}」</div>
                          <X
                            className="w-3 h-3 ml-auto cursor-pointer"
                            onClick={() => setSelectedScrollId(null)}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">未选择</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">预计研究时间</span>
                      <span className="font-medium text-clinic-deep tabular-nums">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {estimatedHours} 小时
                      </span>
                    </div>
                    {selectedStaffId && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">研究员加成</span>
                        <span className="font-medium text-emerald-600">×1.5 速度</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleStartResearch}
                    disabled={!canStartResearch}
                    className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      canStartResearch
                        ? "bg-gradient-to-r from-clinic-jade to-emerald-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <FlaskConical className="w-5 h-5" />
                    开始推演研究
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {!canStartResearch && (
                    <p className="text-xs text-gray-400 text-center">
                      请至少选择：症状、药材、元素、古籍残页
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
              <h3 className="font-semibold text-clinic-deep flex items-center gap-2 mb-3">
                <span>💡</span> 研究提示
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  治疗成功有概率获得古籍残页，难度越高概率越大
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  残页文字包含关键线索，与症状、元素对应可发现隐藏病名
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  正确匹配药材组合可推演改良药方，提升疗效
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  研究消耗残页和时间，失败会损失声望
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  发现的成果会录入药方典籍，永久提升对应治疗效果
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === "canon" && (
        <div className="space-y-4">
          {recipeCanon.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="font-display text-xl text-gray-500 mb-2">药方典籍空空如也</h3>
              <p className="text-sm text-gray-400">通过研究推演发现的成果将收录于此</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipeCanon.map(entry => (
                <div
                  key={entry.id}
                  className={`card p-5 border-2 ${
                    entry.type === "hidden_disease"
                      ? "border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50"
                      : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl shadow-sm">
                      {entry.type === "hidden_disease" ? "🔮" : "✨"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="tag text-xs bg-white/80 text-gray-600 border-gray-200">
                          {entry.type === "hidden_disease" ? "隐藏病名" : "改良药方"}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">
                          第{entry.dayDiscovered}天发现
                        </span>
                      </div>
                      <h4 className="font-semibold text-lg text-clinic-deep mt-1">{entry.name}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">
                        对应病症：{DISEASE_NAMES[entry.disease]}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">{entry.description}</p>

                      {entry.herbIds && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 mb-1">所需药材</div>
                          <div className="flex flex-wrap gap-1">
                            {entry.herbIds.map((hid, i) => {
                              const herb = HERBS.find(h => h.id === hid);
                              return herb ? (
                                <span key={i} className="tag text-xs bg-white/80 text-emerald-700 border-emerald-200">
                                  {herb.emoji} {herb.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {entry.successRate && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">成功率：</span>
                          <span className="font-medium text-emerald-600">{entry.successRate}%</span>
                        </div>
                      )}

                      {entry.bonusEffect && (
                        <div className="mt-3 pt-3 border-t border-gray-200/50">
                          <div className="text-xs text-gray-500 mb-1">效果加成</div>
                          <div className="flex flex-wrap gap-2">
                            {entry.bonusEffect.revenueMultiplier && (
                              <span className="tag text-xs bg-amber-100 text-amber-700 border-amber-200">
                                💰 收入 ×{entry.bonusEffect.revenueMultiplier}
                              </span>
                            )}
                            {entry.bonusEffect.reputationBonus && (
                              <span className="tag text-xs bg-purple-100 text-purple-700 border-purple-200">
                                ⭐ 声望 +{entry.bonusEffect.reputationBonus}
                              </span>
                            )}
                            {entry.bonusEffect.speedBoost && (
                              <span className="tag text-xs bg-blue-100 text-blue-700 border-blue-200">
                                ⚡ 速度 +{Math.round(entry.bonusEffect.speedBoost * 100)}%
                              </span>
                            )}
                            {entry.bonusEffect.satisfactionBonus && (
                              <span className="tag text-xs bg-pink-100 text-pink-700 border-pink-200">
                                ❤️ 满意度 +{entry.bonusEffect.satisfactionBonus}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "scrolls" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ANCIENT_SCROLLS.map(scroll => {
              const owned = scrollInventory[scroll.id] ?? 0;
              const isLocked = owned === 0;
              return (
                <div
                  key={scroll.id}
                  className={`card p-5 border-2 transition-all ${
                    isLocked
                      ? "bg-gray-100/50 border-gray-200 opacity-60"
                      : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-4xl ${isLocked ? "grayscale" : ""}`}>
                      {isLocked ? "❓" : scroll.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">
                          {"⭐".repeat(scroll.rarity)}
                        </span>
                        <span className="ml-auto tag bg-amber-100/60 text-amber-700 text-xs">
                          x{owned}
                        </span>
                      </div>
                      <h4 className={`font-semibold mt-1 ${isLocked ? "text-gray-500" : "text-gray-800"}`}>
                        {isLocked ? "??? 未发现" : scroll.name}
                      </h4>
                      {!isLocked && (
                        <>
                          <div className="text-sm text-amber-700 font-medium mt-2">
                            「{scroll.fragmentText}」
                          </div>
                          <p className="text-xs text-gray-500 mt-2">{scroll.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-amber-200/50">
                            <div className="text-xs text-gray-500">
                              相关元素: {scroll.relatedElements.map(e => ELEMENT_EMOJI[e] + ELEMENT_NAMES[e]).join("、")}
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">相关症状：</div>
                            <div className="flex flex-wrap gap-1">
                              {scroll.relatedSymptoms.slice(0, 3).map((sym, i) => (
                                <span key={i} className="tag text-xs bg-white/60 text-gray-600 border-gray-200">
                                  {sym}
                                </span>
                              ))}
                              {scroll.relatedSymptoms.length > 3 && (
                                <span className="tag text-xs bg-white/60 text-gray-400 border-gray-200">
                                  +{scroll.relatedSymptoms.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      {isLocked && (
                        <p className="text-xs text-gray-400 mt-3 italic">
                          成功治疗对应元素的灵兽有概率获得此残页
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
