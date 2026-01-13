
import React, { useState } from 'react';
import { Environment, Trait, GameStep } from './types';
import { ENVIRONMENTS, TRAITS } from './constants';
import { generateSpeciesData, generateSpeciesImage, analyzeEvolutionaryViability } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<GameStep>(GameStep.ENVIRONMENT);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<Trait[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [speciesInfo, setSpeciesInfo] = useState<string>('');
  const [speciesImageUrl, setSpeciesImageUrl] = useState<string | null>(null);
  const [viabilityData, setViabilityData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const categories = ['All', 'Physical', 'Physiological', 'Behavioral', 'Feeding', 'Reproductive'];

  const spinRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const spins = 5 + Math.random() * 5;
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = rotation + (spins * 360) + extraDegrees;
    setRotation(totalRotation);
    setTimeout(() => {
      setIsSpinning(false);
      const normalizedDegrees = (360 - (totalRotation % 360)) % 360;
      const index = Math.floor(normalizedDegrees / (360 / ENVIRONMENTS.length));
      setSelectedEnv(ENVIRONMENTS[index]);
    }, 4000);
  };

  const toggleTrait = (trait: Trait) => {
    setSelectedTraits(prev => {
      if (prev.find(t => t.id === trait.id)) return prev.filter(t => t.id !== trait.id);
      return [...prev, trait];
    });
  };

  const handleGenerate = async () => {
    if (selectedTraits.length < 5 || !selectedEnv) return;
    setStep(GameStep.GENERATION);
    setLoading(true);
    try {
      const [data, image] = await Promise.all([
        generateSpeciesData(selectedEnv, selectedTraits),
        generateSpeciesImage(selectedEnv, selectedTraits)
      ]);
      setSpeciesInfo(data || '');
      setSpeciesImageUrl(image);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setStep(GameStep.RESULT);
    }
  };

  const handleEvaluation = async () => {
    if (!selectedEnv || selectedTraits.length === 0) return;
    setEvaluating(true);
    setStep(GameStep.EVALUATION);
    try {
      const analysis = await analyzeEvolutionaryViability(selectedEnv, selectedTraits);
      setViabilityData(analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const resetGame = () => {
    setStep(GameStep.ENVIRONMENT);
    setSelectedEnv(null);
    setSelectedTraits([]);
    setSpeciesImageUrl(null);
    setSpeciesInfo('');
    setViabilityData(null);
    setActiveCategory('All');
  };

  const filteredTraits = activeCategory === 'All' ? TRAITS : TRAITS.filter(t => t.category === activeCategory);

  return (
    <div className={`min-h-screen transition-colors duration-1000 bg-gradient-to-b ${selectedEnv ? selectedEnv.bgGradient : 'from-slate-900 to-black'}`}>
      <nav className="p-6 flex justify-between items-center border-b border-white/10 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 w-10 h-10 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-dna text-white"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Survival of the Fittest Tool</h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden md:flex gap-8 text-sm font-medium opacity-70">
            <span className={step === GameStep.ENVIRONMENT ? 'text-white underline' : ''}>1. Environment</span>
            <span className={step === GameStep.TRAITS ? 'text-white underline' : ''}>2. Traits</span>
            <span className={step === GameStep.RESULT ? 'text-white underline' : ''}>3. Synthesis</span>
            <span className={step === GameStep.EVALUATION ? 'text-white underline' : ''}>4. Evaluation</span>
          </div>
          {step !== GameStep.ENVIRONMENT && (
            <button onClick={resetGame} className="px-4 py-2 rounded-full border border-white/20 text-xs hover:bg-white/10 transition">Restart</button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        {step === GameStep.ENVIRONMENT && (
          <div className="flex flex-col items-center py-12 animate-fade-in">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 block">Powered by Team Double Helix</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Assign Environment</h2>
              <p className="text-white/60 max-w-lg mx-auto">Every evolutionary journey begins with habitat selection. Spin to determine the selective pressures of your ecosystem.</p>
            </div>
            <div className="relative w-72 h-72 md:w-[500px] md:h-[500px] roulette-container">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-40 text-emerald-400 text-4xl drop-shadow-lg"><i className="fa-solid fa-caret-down"></i></div>
              <div className="w-full h-full rounded-full border-8 border-white/10 relative overflow-hidden roulette-wheel shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-neutral-900" style={{ transform: `rotate(${rotation}deg)` }}>
                {ENVIRONMENTS.map((env, i) => {
                  const angle = 360 / ENVIRONMENTS.length;
                  const rotationAngle = angle * i;
                  return (
                    <div key={env.id} className="absolute top-0 left-0 w-full h-full origin-center flex justify-center border-l border-white/5" style={{ transform: `rotate(${rotationAngle}deg)`, backgroundColor: i % 2 === 0 ? 'rgba(40, 40, 40, 0.9)' : 'rgba(20, 20, 20, 0.9)', clipPath: `polygon(50% 50%, ${50 - 50 * Math.tan((angle / 2) * Math.PI / 180)}% 0%, ${50 + 50 * Math.tan((angle / 2) * Math.PI / 180)}% 0%)` }}>
                      <div className="mt-12 text-[10px] md:text-sm font-bold uppercase tracking-widest text-white/80 text-center px-2" style={{ width: '120px' }}>{env.name}</div>
                    </div>
                  );
                })}
              </div>
              <button onClick={spinRoulette} disabled={isSpinning || !!selectedEnv} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full glass-panel border-4 border-white/20 flex flex-col items-center justify-center z-50 group hover:scale-110 transition active:scale-95 disabled:opacity-50 ${isSpinning ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <i className={`fa-solid fa-dharmachakra text-3xl mb-1 text-emerald-400 ${isSpinning ? 'animate-spin' : ''}`}></i>
                <span className="text-[10px] font-bold uppercase tracking-widest">SPIN</span>
              </button>
            </div>
            {selectedEnv && !isSpinning && (
              <div className="mt-16 w-full max-w-3xl glass-panel p-8 rounded-3xl animate-fade-in border-t-4" style={{ borderColor: selectedEnv.accent }}>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1">
                    <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/10 mb-4 inline-block">Destination Locked</span>
                    <h3 className="text-4xl font-bold mb-4" style={{ color: selectedEnv.accent }}>{selectedEnv.name}</h3>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div><p className="opacity-50 mb-1 uppercase text-[10px] tracking-widest font-bold">Climate</p><p>{selectedEnv.climate}</p></div>
                      <div><p className="opacity-50 mb-1 uppercase text-[10px] tracking-widest font-bold">Temperature</p><p>{selectedEnv.temperature}</p></div>
                      <div className="col-span-2"><p className="opacity-50 mb-1 uppercase text-[10px] tracking-widest font-bold">Resources</p><p>{selectedEnv.resources}</p></div>
                      <div className="col-span-2"><p className="opacity-50 mb-1 uppercase text-[10px] tracking-widest font-bold">Survival Challenges</p><p className="text-emerald-300">{selectedEnv.challenges}</p></div>
                    </div>
                  </div>
                  <div className="w-full md:w-auto self-end">
                    <button onClick={() => setStep(GameStep.TRAITS)} className="w-full md:w-auto px-8 py-4 rounded-xl bg-white text-black font-bold hover:bg-emerald-400 transition transform hover:-translate-y-1">PROCEED TO TRAITS <i className="fa-solid fa-arrow-right ml-2"></i></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === GameStep.TRAITS && (
          <div className="animate-fade-in space-y-8">
            <div className="glass-panel p-6 rounded-3xl border-t-4 shadow-2xl relative overflow-hidden" style={{ borderColor: selectedEnv?.accent }}>
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <i className="fa-solid fa-dna text-8xl"></i>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div className="md:border-r border-white/10 pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1">Target Habitat</span>
                  <h3 className="text-2xl font-bold" style={{ color: selectedEnv?.accent }}>{selectedEnv?.name}</h3>
                </div>
                <div className="text-xs space-y-1">
                  <p className="opacity-50 uppercase font-bold tracking-widest text-[9px]">Climate & Geography</p>
                  <p className="text-white/90">{selectedEnv?.climate}</p>
                </div>
                <div className="text-xs space-y-1">
                  <p className="opacity-50 uppercase font-bold tracking-widest text-[9px]">Thermal Conditions</p>
                  <p className="text-white/90">{selectedEnv?.temperature}</p>
                </div>
                <div className="text-xs space-y-1">
                  <p className="opacity-50 uppercase font-bold tracking-widest text-[9px]">Environmental Challenges</p>
                  <p className="text-emerald-400 font-bold">{selectedEnv?.challenges}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <h2 className="text-4xl font-bold mb-2 tracking-tight">Genetic Blueprint</h2>
                <p className="text-white/60 mb-6">Select adaptations to configure the specimen for its environment (Min. 5 traits).</p>
                <div className="flex flex-col gap-2 max-w-xs">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-1">Filter by Biological System</label>
                  <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="bg-neutral-800 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer appearance-none shadow-xl">
                    {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className="text-sm font-bold mb-2 uppercase tracking-widest">
                  Total Active Traits: <span className={selectedTraits.length >= 5 ? 'text-emerald-400' : 'text-amber-400'}>{selectedTraits.length}</span>
                </div>
                {selectedTraits.length > 0 && (
                  <div className="flex flex-wrap justify-end gap-1 max-w-sm mt-2">
                     {selectedTraits.map(t => (
                       <span key={t.id} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase border border-emerald-500/20">
                         {t.name}
                       </span>
                     ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTraits.map(trait => {
                const isSelected = selectedTraits.some(t => t.id === trait.id);
                return (
                  <button key={trait.id} onClick={() => toggleTrait(trait)} className={`text-left p-5 rounded-2xl glass-panel border transition-all duration-300 group hover:-translate-y-1 ${isSelected ? 'glow-trait ring-1 ring-emerald-400/50 scale-105 bg-emerald-950/20' : 'border-white/5 hover:border-white/20'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40 group-hover:bg-white/10'}`}><i className={`fa-solid ${trait.icon} text-xl`}></i></div>
                    <h4 className={`font-bold mb-1 transition-colors ${isSelected ? 'text-emerald-400' : 'text-white/90'}`}>{trait.name}</h4>
                    <p className="text-[10px] uppercase opacity-40 font-bold tracking-widest mb-2">{trait.category}</p>
                    <p className="text-xs text-white/50 leading-relaxed h-12 overflow-hidden">{trait.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="fixed bottom-0 left-0 w-full p-6 glass-panel border-t border-white/10 flex justify-center z-40">
              <button disabled={selectedTraits.length < 5} onClick={handleGenerate} className={`px-12 py-4 rounded-full font-bold text-lg shadow-2xl transition-all ${selectedTraits.length >= 5 ? 'bg-emerald-500 text-white hover:bg-emerald-400 scale-105 active:scale-95' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}>
                {selectedTraits.length < 5 ? `Select ${5 - selectedTraits.length} more traits` : 'SYNTHESIZE SPECIES'}
              </button>
            </div>
            <div className="h-24"></div>
          </div>
        )}

        {step === GameStep.GENERATION && (
           <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-emerald-400">Simulating Natural Selection...</h3>
            <p className="text-white/40 animate-pulse text-center max-w-md uppercase tracking-widest text-[10px]">Team Double Helix Protocol Active</p>
          </div>
        )}

        {step === GameStep.RESULT && (
          <div className="animate-fade-in py-12 flex flex-col items-center gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block border border-emerald-500/30">Synthesis Complete</span>
              <h2 className="text-5xl font-bold mb-2 uppercase tracking-tighter">Specimen Identified</h2>
              <p className="text-white/40 uppercase text-xs tracking-[0.2em]">Verified by Team Double Helix</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-center">
              <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-3xl bg-black aspect-square">
                {speciesImageUrl ? <img src={speciesImageUrl} alt="Scientific illustration" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><i className="fa-solid fa-triangle-exclamation text-4xl"></i></div>}
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Biological Plate</p>
                  <p className="text-sm text-white/60 italic">Textbook visualization</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-6 border-b border-white/5 pb-2">Genetic Profile Summary</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedTraits.map(t => (
                      <div key={t.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group hover:bg-emerald-500/10 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400"><i className={`fa-solid ${t.icon}`}></i></div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{t.name}</p>
                          <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">{t.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col sm:flex-row gap-4 mt-8">
              <button onClick={() => setStep(GameStep.TRAITS)} className="flex-1 px-8 py-5 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition uppercase tracking-widest text-sm">REDESIGN SPECIES</button>
              <button onClick={handleEvaluation} className="flex-1 px-8 py-5 rounded-2xl bg-white text-black font-bold hover:bg-emerald-400 transition uppercase tracking-widest text-sm shadow-xl">PROCEED TO SURVIVAL EVALUATION</button>
            </div>
          </div>
        )}

        {step === GameStep.EVALUATION && (
          <div className="animate-fade-in py-12 max-w-4xl mx-auto">
            {evaluating ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">Initiating Viability Module...</p>
              </div>
            ) : viabilityData && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400 mb-2 block">Evolutionary Viability Analysis</span>
                    <h2 className="text-4xl font-bold uppercase tracking-tighter">Simulation Report</h2>
                  </div>
                  
                  {/* Environment Detail Bar below Report Title */}
                  <div className="glass-panel p-4 rounded-2xl border border-white/10 inline-flex flex-col md:flex-row gap-4 md:gap-12 items-center text-left">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Environment</span>
                      <span className="text-sm font-bold" style={{ color: selectedEnv?.accent }}>{selectedEnv?.name}</span>
                    </div>
                    <div className="hidden md:block w-px h-6 bg-white/10"></div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Conditions</span>
                      <span className="text-[11px] text-white/80">{selectedEnv?.climate}</span>
                    </div>
                    <div className="hidden md:block w-px h-6 bg-white/10"></div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Challenge Profile</span>
                      <span className="text-[11px] text-emerald-400/80 italic">{selectedEnv?.challenges}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                  <div className="md:col-span-1 glass-panel p-8 rounded-3xl border border-emerald-500/20 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4">🧬 Survival Outcome</p>
                    <div className="text-6xl font-bold text-emerald-400 mb-2 tracking-tighter">{viabilityData.generations}</div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Generations Survived</p>
                    <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">{viabilityData.classification}</div>
                  </div>

                  <div className="md:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                          <i className="fa-solid fa-circle-check"></i> Key Strengths
                        </h4>
                        <ul className="space-y-2">
                          {viabilityData.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-white/70 flex gap-2"><span className="text-emerald-500">•</span> {s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
                          <i className="fa-solid fa-circle-exclamation"></i> Major Limitations
                        </h4>
                        <ul className="space-y-2">
                          {viabilityData.limitations.map((l: string, i: number) => (
                            <li key={i} className="text-sm text-white/70 flex gap-2"><span className="text-amber-500">•</span> {l}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-arrows-rotate"></i> Evolutionary Outlook
                      </h4>
                      <p className="text-sm text-white/80 leading-relaxed italic">{viabilityData.evolutionaryOutlook}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Scientific Constraint Reminder</p>
                  <p className="text-xs text-white/30 mt-1 italic">"Survival depends on environment, not intention or design."</p>
                </div>

                <div className="flex justify-center pt-8">
                  <button onClick={resetGame} className="px-12 py-4 rounded-full bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition shadow-2xl">New Selection Sequence</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-24 py-12 border-t border-white/5 opacity-50 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-500">
            <i className="fa-solid fa-helix animate-pulse"></i>
            <span className="text-xs font-bold uppercase tracking-[0.4em]">Team Double Helix</span>
          </div>
          <p className="text-[10px] tracking-widest uppercase opacity-40">Survival of the Fittest Engine • Strictly Educational Research Tool</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
