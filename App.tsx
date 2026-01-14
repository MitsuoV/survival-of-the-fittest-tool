
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

  // Custom trait state
  const [customTraitName, setCustomTraitName] = useState('');
  const [customTraitDesc, setCustomTraitDesc] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

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

  const addCustomTrait = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTraitName.trim()) return;

    const newTrait: Trait = {
      id: Date.now(),
      name: customTraitName,
      description: customTraitDesc || 'Specially evolved unique adaptation.',
      category: 'Physiological',
      icon: 'fa-dna'
    };

    setSelectedTraits(prev => [...prev, newTrait]);
    setCustomTraitName('');
    setCustomTraitDesc('');
    setShowCustomForm(false);
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
    setShowCustomForm(false);
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
            <span className={step === GameStep.ENVIRONMENT ? 'text-white underline underline-offset-8' : ''}>1. Environment</span>
            <span className={step === GameStep.TRAITS ? 'text-white underline underline-offset-8' : ''}>2. Traits</span>
            <span className={step === GameStep.RESULT ? 'text-white underline underline-offset-8' : ''}>3. Synthesis</span>
            <span className={step === GameStep.EVALUATION ? 'text-white underline underline-offset-8' : ''}>4. Evaluation</span>
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
                <p className="text-white/60 mb-6">Select or define adaptations for the specimen (Min. 5 traits).</p>
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
              <div className={`p-5 rounded-2xl glass-panel border border-dashed transition-all duration-300 ${showCustomForm ? 'ring-2 ring-emerald-500 border-emerald-500/50' : 'border-white/10 hover:border-emerald-500/30'}`}>
                {!showCustomForm ? (
                  <button onClick={() => setShowCustomForm(true)} className="w-full h-full flex flex-col items-center justify-center gap-3 py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400"><i className="fa-solid fa-plus text-xl"></i></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Define Custom Trait</span>
                  </button>
                ) : (
                  <form onSubmit={addCustomTrait} className="flex flex-col gap-3">
                    <input autoFocus type="text" placeholder="Trait Name..." className="bg-black/50 border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-emerald-500" value={customTraitName} onChange={e => setCustomTraitName(e.target.value)} />
                    <textarea placeholder="Description..." className="bg-black/50 border border-white/10 rounded-lg p-2 text-[10px] outline-none focus:border-emerald-500 resize-none h-16" value={customTraitDesc} onChange={e => setCustomTraitDesc(e.target.value)} />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowCustomForm(false)} className="flex-1 py-1 text-[10px] font-bold uppercase tracking-widest bg-white/5 rounded border border-white/10">Cancel</button>
                      <button type="submit" className="flex-1 py-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-500 text-black rounded">Add</button>
                    </div>
                  </form>
                )}
              </div>

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
           <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full scale-150 blur-xl animate-pulse"></div>
              <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-4 flex items-center justify-center">
                <i className="fa-solid fa-helix text-3xl text-emerald-400 animate-bounce"></i>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-2 text-emerald-400 tracking-tight">Simulating Adaptive Pathways...</h3>
            <p className="text-white/40 animate-pulse text-center max-w-md uppercase tracking-widest text-[10px]">Processing selective pressures & genetic recombination</p>
            <div className="mt-8 flex gap-2">
               {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i*0.2}s` }}></div>)}
            </div>
          </div>
        )}

        {step === GameStep.RESULT && (
          <div className="animate-fade-in py-12 flex flex-col items-center gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block border border-emerald-500/30">Genetic Integrity Verified</span>
              <h2 className="text-5xl font-bold mb-2 uppercase tracking-tighter">New Specimen Catalogued</h2>
              <p className="text-white/40 uppercase text-xs tracking-[0.2em]">Team Double Helix • Bio-Synthesis Division</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full">
              <div className="lg:col-span-5 space-y-6">
                <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-3xl bg-black aspect-square">
                  {speciesImageUrl ? <img src={speciesImageUrl} alt="Scientific illustration" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><i className="fa-solid fa-dna text-6xl animate-pulse"></i></div>}
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Biological Plate v.2.5</p>
                    <p className="text-sm text-white/60 italic">Field Guide Visualization</p>
                  </div>
                </div>
                
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-4 pb-2 border-b border-white/5">Selected Genotype</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTraits.map(t => (
                      <div key={t.id} className="px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2 group hover:bg-emerald-500/20 transition-all cursor-help" title={t.description}>
                        <i className={`fa-solid ${t.icon} text-emerald-400 text-xs`}></i>
                        <span className="text-[11px] font-bold text-white/80">{t.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div className="glass-panel p-8 rounded-3xl border border-white/10 h-full relative overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-emerald-500">
                  <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-emerald-400">Official Field Report</h4>
                    <i className="fa-solid fa-file-medical text-white/20 text-xl"></i>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed space-y-4">
                    {speciesInfo.split('\n').map((line, idx) => (
                      <p key={idx} className={line.startsWith('#') ? 'text-emerald-400 font-bold uppercase tracking-tight text-lg mt-6' : ''}>
                        {line.replace(/#/g, '')}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-4 mt-8 max-w-3xl">
              <button onClick={() => setStep(GameStep.TRAITS)} className="flex-1 px-8 py-5 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition uppercase tracking-widest text-sm">Modify Genome</button>
              <button onClick={handleEvaluation} className="flex-1 px-8 py-5 rounded-2xl bg-white text-black font-bold hover:bg-emerald-400 transition uppercase tracking-widest text-sm shadow-xl flex items-center justify-center gap-3 group">
                Initiate Survival Test <i className="fa-solid fa-bolt group-hover:animate-pulse"></i>
              </button>
            </div>
          </div>
        )}

        {step === GameStep.EVALUATION && (
          <div className="animate-fade-in py-12 max-w-5xl mx-auto">
            {evaluating ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <div className="w-16 h-16 relative mb-6">
                  <div className="absolute inset-0 border-2 border-emerald-500/10 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">Aggregating Environmental Selective Factors...</p>
              </div>
            ) : viabilityData && (
              <div className="space-y-10">
                <div className="text-center space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400 mb-2 block">Evolutionary Stress Simulation</span>
                    <h2 className="text-5xl font-bold uppercase tracking-tighter">Viability Final Report</h2>
                  </div>
                  
                  <div className="glass-panel p-5 rounded-2xl border border-white/10 inline-flex flex-wrap justify-center gap-6 md:gap-12 items-center text-left">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Test Environment</span>
                      <span className="text-sm font-bold" style={{ color: selectedEnv?.accent }}>{selectedEnv?.name}</span>
                    </div>
                    <div className="hidden md:block w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Selective Pressure</span>
                      <span className="text-[11px] text-emerald-400 font-bold">{selectedEnv?.challenges}</span>
                    </div>
                    <div className="hidden md:block w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Sample Size</span>
                       <span className="text-[11px] text-white/60">10,000 Iterations</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 flex flex-col items-center justify-center text-center bg-emerald-500/5 relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-6">🧬 Genetic Longevity</p>
                      <div className="text-7xl font-bold text-emerald-400 mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                        {viabilityData.generations}
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Generations Before Extinction</p>
                      <div className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-xs font-black uppercase tracking-widest shadow-lg">
                        {viabilityData.classification}
                      </div>
                      <div className="mt-8 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                         <div 
                          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.8)] transition-all duration-1000" 
                          style={{ width: `${Math.min((viabilityData.generations / 200) * 100, 100)}%` }}
                         ></div>
                      </div>
                      <p className="mt-2 text-[9px] opacity-40 uppercase font-bold tracking-widest">Simulation Confidence: 99.4%</p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-chart-line text-emerald-400"></i> Outlook Projection
                      </h4>
                      <p className="text-sm text-white/80 leading-relaxed italic border-l-2 border-emerald-500/30 pl-4">{viabilityData.evolutionaryOutlook}</p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2">
                          <i className="fa-solid fa-circle-check"></i> Adaptive Advantages
                        </h4>
                        <ul className="space-y-4">
                          {viabilityData.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-white/70 flex gap-3 items-start group">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 group-hover:scale-150 transition-transform"></span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="glass-panel p-6 rounded-3xl border border-rose-500/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-6 flex items-center gap-2">
                          <i className="fa-solid fa-circle-exclamation"></i> Critical Vulnerabilities
                        </h4>
                        <ul className="space-y-4">
                          {viabilityData.limitations.map((l: string, i: number) => (
                            <li key={i} className="text-sm text-white/70 flex gap-3 items-start group">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 group-hover:scale-150 transition-transform"></span>
                              <span>{l}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-8 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20"></div>
                       <p className="text-[10px] text-emerald-400/40 uppercase tracking-[0.3em] font-bold mb-2">Researcher's Memo</p>
                       <p className="text-xs text-white/50 leading-loose">
                         The observed phenotype demonstrates a complex interplay between trait synergy and environmental constraints. 
                         While the {selectedTraits[0]?.name} provided initial survival buffers, the long-term simulation suggests that {viabilityData.limitations[0]} remains a significant barrier to post-extinction-event recovery. 
                         Recommend iterative mutation modeling in the next sequence.
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                  <button onClick={resetGame} className="px-16 py-5 rounded-full bg-white text-black font-extrabold uppercase tracking-widest text-sm hover:bg-emerald-400 transition-all shadow-2xl hover:-translate-y-1 active:scale-95">
                    Start New Mutation Sequence
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-24 py-16 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 text-emerald-500">
            <i className="fa-solid fa-dna text-2xl animate-spin [animation-duration:5s]"></i>
            <span className="text-sm font-bold uppercase tracking-[0.6em]">Team Double Helix</span>
          </div>
          <div className="flex gap-8 text-[9px] uppercase tracking-widest font-bold opacity-30">
            <span>Adaptive Engine v4.0</span>
            <span>Selective Pressure Module v2.1</span>
            <span>Genotype Mapper v1.8</span>
          </div>
          <p className="text-[10px] tracking-widest uppercase opacity-20 max-w-lg text-center leading-relaxed">
            Evolution Roulette is a strictly educational heuristic tool. It uses advanced modeling to simulate biological concepts. Natural selection is stochastic and results may vary based on environmental noise.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
