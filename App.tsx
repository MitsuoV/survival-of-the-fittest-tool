
import React, { useState } from 'react';
import { Environment, Trait, GameStep } from './types';
import { ENVIRONMENTS, TRAITS } from './constants';
import { generateSpeciesImage, analyzeEvolutionaryViability } from './services/geminiService';

// Extending GameStep to include TITLE
enum ExtendedGameStep {
  TITLE = 'TITLE',
  ENVIRONMENT = 'ENVIRONMENT',
  TRAITS = 'TRAITS',
  GENERATION = 'GENERATION',
  RESULT = 'RESULT',
  EVALUATION = 'EVALUATION'
}

const App: React.FC = () => {
  const [step, setStep] = useState<ExtendedGameStep | string>(ExtendedGameStep.TITLE);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<Trait[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [speciesImageUrl, setSpeciesImageUrl] = useState<string | null>(null);
  const [viabilityData, setViabilityData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

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
      category: 'Physiological' as any,
      icon: 'fa-dna'
    };

    setSelectedTraits(prev => [...prev, newTrait]);
    setCustomTraitName('');
    setCustomTraitDesc('');
    setShowCustomForm(false);
  };

  const handleGenerate = async () => {
    if (selectedTraits.length < 5 || !selectedEnv) return;
    setStep(ExtendedGameStep.GENERATION);
    setLoading(true);
    setSpeciesImageUrl(null);
    try {
      const imageUrl = await generateSpeciesImage(selectedEnv, selectedTraits);
      if (imageUrl) {
        setSpeciesImageUrl(imageUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setStep(ExtendedGameStep.RESULT);
    }
  };

  const handleEvaluation = async () => {
    if (!selectedEnv || selectedTraits.length === 0) return;
    setEvaluating(true);
    setStep(ExtendedGameStep.EVALUATION);
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
    setStep(ExtendedGameStep.ENVIRONMENT);
    setSelectedEnv(null);
    setSelectedTraits([]);
    setSpeciesImageUrl(null);
    setViabilityData(null);
    setActiveCategory('All');
    setShowCustomForm(false);
    setRotation(0);
    setShowInfo(false);
  };

  const filteredTraits = activeCategory === 'All' ? TRAITS : TRAITS.filter(t => t.category === activeCategory);

  const DNABrand = ({ className = "" }: { className?: string }) => (
    <div className={`logo-3d-container flex items-center justify-center text-emerald-400 ${className}`}>
      <i className="fa-solid fa-dna logo-rotate"></i>
    </div>
  );

  // Title Screen Component
  if (step === ExtendedGameStep.TITLE) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full"></div>
          <DNABrand className="text-6xl md:text-8xl relative z-10" />
        </div>
        
        <div className="space-y-4 mb-12 relative z-10">
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Survival of the Fittest
          </h1>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] text-emerald-500/80">
            Powered by Team Double Helix
          </p>
        </div>

        <button 
          onClick={() => setStep(ExtendedGameStep.ENVIRONMENT)}
          className="group relative px-10 py-4 md:px-14 md:py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs md:text-sm rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          <span className="relative z-10">Start Game</span>
          <div className="absolute inset-0 bg-emerald-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>

        <div className="fixed bottom-10 opacity-20 text-[8px] md:text-[10px] uppercase tracking-widest font-medium">
          Simulating Evolutionary Pathways
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-1000 bg-gradient-to-b ${selectedEnv ? selectedEnv.bgGradient : 'from-slate-900 to-black'}`}>
      <nav className="p-4 md:p-6 flex justify-between items-center border-b border-white/10 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <DNABrand className="text-xl md:text-2xl" />
          <h1 className="text-sm md:text-xl font-bold tracking-tight uppercase">Survival of the Fittest</h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden lg:flex gap-8 text-sm font-medium opacity-70">
            <span className={step === ExtendedGameStep.ENVIRONMENT ? 'text-white underline underline-offset-8' : ''}>1. Habitat</span>
            <span className={step === ExtendedGameStep.TRAITS ? 'text-white underline underline-offset-8' : ''}>2. Genome</span>
            <span className={step === ExtendedGameStep.RESULT ? 'text-white underline underline-offset-8' : ''}>3. Specimen</span>
            <span className={step === ExtendedGameStep.EVALUATION ? 'text-white underline underline-offset-8' : ''}>4. Survival</span>
          </div>
          {step !== ExtendedGameStep.ENVIRONMENT && (
            <button onClick={resetGame} className="px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/20 text-[10px] md:text-xs hover:bg-white/10 transition">Restart</button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-12">
        {step === ExtendedGameStep.ENVIRONMENT && (
          <div className="flex flex-col items-center py-6 md:py-12 animate-fade-in">
            <div className="text-center mb-8">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 block">Powered by Team Double Helix</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Select Environment</h2>
              <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base">The habitat determines the selective pressures. Spin the roulette to find your species' birthplace.</p>
            </div>
            <div className="relative w-72 h-72 md:w-[500px] md:h-[500px] roulette-container">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-40 text-emerald-400 text-3xl md:text-4xl drop-shadow-lg"><i className="fa-solid fa-caret-down"></i></div>
              <div className="w-full h-full rounded-full border-8 border-white/10 relative overflow-hidden roulette-wheel shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-neutral-900" style={{ transform: `rotate(${rotation}deg)` }}>
                {ENVIRONMENTS.map((env, i) => {
                  const angle = 360 / ENVIRONMENTS.length;
                  const rotationAngle = angle * i;
                  return (
                    <div key={env.id} className="absolute top-0 left-0 w-full h-full origin-center flex justify-center border-l border-white/5" style={{ transform: `rotate(${rotationAngle}deg)`, backgroundColor: i % 2 === 0 ? 'rgba(40, 40, 40, 0.9)' : 'rgba(20, 20, 20, 0.9)', clipPath: `polygon(50% 50%, ${50 - 50 * Math.tan((angle / 2) * Math.PI / 180)}% 0%, ${50 + 50 * Math.tan((angle / 2) * Math.PI / 180)}% 0%)` }}>
                      <div className="mt-8 md:mt-12 text-[8px] md:text-sm font-bold uppercase tracking-widest text-white/80 text-center px-2" style={{ width: '120px' }}>{env.name}</div>
                    </div>
                  );
                })}
              </div>
              <button onClick={spinRoulette} disabled={isSpinning || !!selectedEnv} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-32 md:h-32 rounded-full glass-panel border-4 border-white/20 flex flex-col items-center justify-center z-50 group hover:scale-110 transition active:scale-95 disabled:opacity-50 ${isSpinning ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <i className={`fa-solid fa-dharmachakra text-2xl md:text-3xl mb-1 text-emerald-400 ${isSpinning ? 'animate-spin' : ''}`}></i>
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">SPIN</span>
              </button>
            </div>
            {selectedEnv && !isSpinning && (
              <div className="mt-8 md:mt-16 w-full max-w-3xl glass-panel p-6 md:p-8 rounded-3xl animate-fade-in border-t-4" style={{ borderColor: selectedEnv.accent }}>
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  <div className="flex-1">
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/10 mb-4 inline-block">Selective Pressure Locked</span>
                    <h3 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: selectedEnv.accent }}>{selectedEnv.name}</h3>
                    <div className="grid grid-cols-2 gap-4 md:gap-6 text-xs md:text-sm">
                      <div><p className="opacity-50 mb-1 uppercase text-[10px] tracking-widest font-bold">Climate</p><p>{selectedEnv.climate}</p></div>
                      <div><p className="opacity-50 mb-1 uppercase text-[10px] tracking-widest font-bold">Temperature</p><p>{selectedEnv.temperature}</p></div>
                      <div className="col-span-2"><p className="opacity-50 mb-1 uppercase text-[10px] tracking-widest font-bold">Resources</p><p>{selectedEnv.resources}</p></div>
                      <div className="col-span-2"><p className="opacity-50 mb-1 uppercase text-[10px] tracking-widest font-bold">Survival Challenges</p><p className="text-emerald-300">{selectedEnv.challenges}</p></div>
                    </div>
                  </div>
                  <div className="w-full md:w-auto self-end">
                    <button onClick={() => setStep(ExtendedGameStep.TRAITS)} className="w-full md:w-auto px-6 py-3 md:px-8 md:py-4 rounded-xl bg-white text-black font-bold hover:bg-emerald-400 transition transform hover:-translate-y-1 text-sm md:text-base">CHOOSE TRAITS <i className="fa-solid fa-arrow-right ml-2"></i></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === ExtendedGameStep.TRAITS && (
          <div className="animate-fade-in space-y-6 md:space-y-8">
            <div className="glass-panel p-4 md:p-6 rounded-3xl border-t-4 shadow-2xl relative overflow-hidden" style={{ borderColor: selectedEnv?.accent }}>
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <i className="fa-solid fa-dna text-6xl md:text-8xl"></i>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-center">
                <div className="col-span-2 md:col-span-1 md:border-r border-white/10 pr-4">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1">Target Habitat</span>
                  <h3 className="text-xl md:text-2xl font-bold" style={{ color: selectedEnv?.accent }}>{selectedEnv?.name}</h3>
                </div>
                <div className="text-[10px] md:text-xs space-y-1">
                  <p className="opacity-50 uppercase font-bold tracking-widest text-[8px] md:text-[9px]">Climate</p>
                  <p className="text-white/90">{selectedEnv?.climate}</p>
                </div>
                <div className="text-[10px] md:text-xs space-y-1">
                  <p className="opacity-50 uppercase font-bold tracking-widest text-[8px] md:text-[9px]">Thermal</p>
                  <p className="text-white/90">{selectedEnv?.temperature}</p>
                </div>
                <div className="text-[10px] md:text-xs space-y-1">
                  <p className="opacity-50 uppercase font-bold tracking-widest text-[8px] md:text-[9px]">Challenges</p>
                  <p className="text-emerald-400 font-bold">{selectedEnv?.challenges}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
              <div className="flex-1">
                <h2 className="text-2xl md:text-4xl font-bold mb-2 tracking-tight">Genetic Blueprint</h2>
                <p className="text-white/60 mb-4 text-sm md:text-base">Assign 5 or more traits to survive the environment.</p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-50 ml-1">Biological System</label>
                  <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="bg-neutral-800 border border-white/10 text-white rounded-xl px-4 py-2 md:py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer text-sm">
                    {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 w-full md:w-auto">
                <div className="text-[10px] md:text-sm font-bold mb-2 uppercase tracking-widest">
                  Active Alleles: <span className={selectedTraits.length >= 5 ? 'text-emerald-400' : 'text-amber-400'}>{selectedTraits.length}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              <div className={`p-4 md:p-5 rounded-2xl glass-panel border border-dashed transition-all duration-300 ${showCustomForm ? 'ring-2 ring-emerald-500 border-emerald-500/50' : 'border-white/10 hover:border-emerald-500/30'}`}>
                {!showCustomForm ? (
                  <button onClick={() => setShowCustomForm(true)} className="w-full h-full flex flex-col items-center justify-center gap-3 py-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400"><i className="fa-solid fa-plus text-lg md:text-xl"></i></div>
                    <span className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-emerald-400">Add Mutation</span>
                  </button>
                ) : (
                  <form onSubmit={addCustomTrait} className="flex flex-col gap-3">
                    <input autoFocus type="text" placeholder="Trait Name..." className="bg-black/50 border border-white/10 rounded-lg p-2 text-xs md:text-sm outline-none focus:border-emerald-500" value={customTraitName} onChange={e => setCustomTraitName(e.target.value)} />
                    <textarea placeholder="Description..." className="bg-black/50 border border-white/10 rounded-lg p-2 text-[9px] md:text-[10px] outline-none focus:border-emerald-500 resize-none h-16" value={customTraitDesc} onChange={e => setCustomTraitDesc(e.target.value)} />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowCustomForm(false)} className="flex-1 py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-widest bg-white/5 rounded border border-white/10">Cancel</button>
                      <button type="submit" className="flex-1 py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-widest bg-emerald-500 text-black rounded">Bind</button>
                    </div>
                  </form>
                )}
              </div>

              {filteredTraits.map(trait => {
                const isSelected = selectedTraits.some(t => t.id === trait.id);
                return (
                  <button key={trait.id} onClick={() => toggleTrait(trait)} className={`text-left p-4 md:p-5 rounded-2xl glass-panel border transition-all duration-300 group ${isSelected ? 'glow-trait ring-1 ring-emerald-400/50 scale-105 bg-emerald-950/20' : 'border-white/5 hover:border-white/20'}`}>
                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4 transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40 group-hover:bg-white/10'}`}><i className={`fa-solid ${trait.icon} text-sm md:text-xl`}></i></div>
                    <h4 className={`font-bold text-xs md:text-base mb-1 transition-colors ${isSelected ? 'text-emerald-400' : 'text-white/90'}`}>{trait.name}</h4>
                    <p className="text-[8px] md:text-[10px] uppercase opacity-40 font-bold tracking-widest mb-2">{trait.category}</p>
                    <p className="text-[10px] md:text-xs text-white/50 leading-relaxed line-clamp-2 md:line-clamp-none h-10 md:h-12">{trait.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="fixed bottom-0 left-0 w-full p-4 md:p-6 glass-panel border-t border-white/10 flex justify-center z-40">
              <button disabled={selectedTraits.length < 5} onClick={handleGenerate} className={`w-full md:w-auto px-8 md:px-12 py-3 md:py-4 rounded-full font-bold text-sm md:text-lg shadow-2xl transition-all ${selectedTraits.length >= 5 ? 'bg-emerald-500 text-white hover:bg-emerald-400 scale-105 active:scale-95' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}>
                {selectedTraits.length < 5 ? `NEED ${5 - selectedTraits.length} MORE TRAITS` : 'SYNTHESIZE SPECIES'}
              </button>
            </div>
            <div className="h-24"></div>
          </div>
        )}

        {step === ExtendedGameStep.GENERATION && (
           <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center px-6">
            <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8">
              <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full scale-150 blur-xl animate-pulse"></div>
              <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-4 flex items-center justify-center">
                <i className="fa-solid fa-helix text-2xl md:text-3xl text-emerald-400 animate-bounce"></i>
              </div>
            </div>
            <h3 className="text-xl md:text-3xl font-bold mb-2 text-emerald-400 tracking-tight">Sequencing Phenotype...</h3>
            <p className="text-white/40 animate-pulse text-center max-w-md uppercase tracking-widest text-[9px] md:text-[10px]">Processing genetic instructions and rendering habitat integration</p>
          </div>
        )}

        {step === ExtendedGameStep.RESULT && (
          <div className="animate-fade-in py-6 md:py-12 flex flex-col items-center gap-8 md:gap-12 max-w-5xl mx-auto">
            <div className="text-center px-4">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block border border-emerald-500/30">Phenotype Synthesis Complete</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-2 uppercase tracking-tighter">Specimen Profile</h2>
              <p className="text-white/40 uppercase text-[10px] tracking-[0.2em]">Bio-Lab Verification: Stable</p>
            </div>
            
            <div className="w-full max-w-2xl px-4">
              <div className="relative group rounded-2xl md:rounded-3xl overflow-hidden border-2 border-white/10 shadow-3xl bg-neutral-900 aspect-square flex items-center justify-center">
                {speciesImageUrl ? (
                  <img 
                    src={speciesImageUrl} 
                    alt="Synthesized Species" 
                    className="w-full h-full object-cover animate-fade-in block" 
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-white/20 p-8 text-center">
                    <i className="fa-solid fa-microscope text-5xl md:text-6xl animate-pulse"></i>
                    <p className="text-[10px] md:text-sm uppercase tracking-widest">Constructing visual representation...</p>
                  </div>
                )}
                <div className="absolute top-0 left-0 w-full p-3 md:p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                   <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-400">Status: Visualized</div>
                   <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/50">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Genotypic Specimen v.1</p>
                  <p className="text-xs text-white/60 italic">Interactive Natural Selection Simulation</p>
                </div>
              </div>
            </div>

            <div className="w-full max-w-2xl glass-panel p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 mx-4">
               <h4 className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-4 md:mb-6 pb-2 border-b border-white/5 text-center">Active Adaptations</h4>
               <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                  {selectedTraits.map(t => (
                    <div key={t.id} className="px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
                      <i className={`fa-solid ${t.icon} text-emerald-400 text-[10px] md:text-xs`}></i>
                      <span className="text-[9px] md:text-[11px] font-bold text-white/80 whitespace-nowrap">{t.name}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-4 mt-4 md:mt-8 max-w-xl px-4">
              <button onClick={() => setStep(ExtendedGameStep.TRAITS)} className="flex-1 px-6 py-4 md:px-8 md:py-5 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition uppercase tracking-widest text-[10px] md:text-sm">Modify Genome</button>
              <button onClick={handleEvaluation} className="flex-1 px-6 py-4 md:px-8 md:py-5 rounded-2xl bg-white text-black font-bold hover:bg-emerald-400 transition uppercase tracking-widest text-[10px] md:text-sm shadow-xl flex items-center justify-center gap-3 group">
                Simulate Survival <i className="fa-solid fa-flask group-hover:animate-pulse"></i>
              </button>
            </div>
          </div>
        )}

        {step === ExtendedGameStep.EVALUATION && (
          <div className="animate-fade-in py-6 md:py-12 max-w-5xl mx-auto px-4 relative">
            {evaluating ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <div className="w-12 h-12 md:w-16 md:h-16 relative mb-6">
                  <div className="absolute inset-0 border-2 border-emerald-500/10 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40">Calculating Evolutionary Viability...</p>
              </div>
            ) : viabilityData && (
              <div className="space-y-8 md:space-y-10">
                <div className="text-center space-y-2 md:space-y-4 relative">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-emerald-400 mb-2 block">Post-Simulation Analysis</span>
                  <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">Outcome</h2>
                  <button 
                    onClick={() => setShowInfo(!showInfo)}
                    className="absolute top-0 right-0 p-2 text-white/30 hover:text-emerald-400 transition-colors"
                    title="Simulation Parameters"
                  >
                    <i className="fa-solid fa-circle-info text-xl"></i>
                  </button>
                </div>

                {showInfo && (
                  <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 animate-fade-in mb-8 bg-emerald-500/5">
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Simulation Logic Parameters</h4>
                      <button onClick={() => setShowInfo(false)} className="text-white/40 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "Synergy between selected phenotype and environment",
                        "Metabolic efficiency in specific thermal zones",
                        "Resource acquisition vs predatory pressure",
                        "Reproductive stability across generational cycles",
                        "Adaptability to stochastic environmental shifts"
                      ].map((item, i) => (
                        <li key={i} className="flex gap-2 text-[10px] md:text-xs text-white/60 items-start">
                          <i className="fa-solid fa-microchip text-emerald-500/50 mt-1"></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  <div className="lg:col-span-1">
                    <div className="glass-panel p-6 md:p-8 rounded-2xl md:rounded-3xl border border-emerald-500/30 flex flex-col items-center justify-center text-center bg-emerald-500/5 h-full relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><i className="fa-solid fa-dna text-4xl"></i></div>
                      <div className="text-6xl md:text-7xl font-bold text-emerald-400 mb-2 tracking-tighter">
                        {viabilityData.generations}
                      </div>
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-70 mb-4 md:mb-6">Generations Observed</p>
                      <div className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest">
                        {viabilityData.classification}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="glass-panel p-4 md:p-6 rounded-2xl md:rounded-3xl border border-emerald-500/10">
                        <h4 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-4 md:mb-6 flex items-center gap-2">
                          <i className="fa-solid fa-circle-check text-xs"></i> Competitive Advantages
                        </h4>
                        <ul className="space-y-3">
                          {viabilityData.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-xs md:text-sm text-white/70 flex gap-3 items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="glass-panel p-4 md:p-6 rounded-2xl md:rounded-3xl border border-rose-500/10">
                        <h4 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-4 md:mb-6 flex items-center gap-2">
                          <i className="fa-solid fa-circle-exclamation text-xs"></i> Selective Pressures
                        </h4>
                        <ul className="space-y-3">
                          {viabilityData.limitations.map((l: string, i: number) => (
                            <li key={i} className="text-xs md:text-sm text-white/70 flex gap-3 items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                              <span>{l}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="glass-panel p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                      <h4 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 md:mb-3">Adaptive Forecast</h4>
                      <p className="text-xs md:text-sm text-white/80 leading-relaxed italic">{viabilityData.evolutionaryOutlook}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4 md:pt-8">
                  <button onClick={resetGame} className="w-full sm:w-auto px-10 py-4 md:px-16 md:py-5 rounded-full bg-white text-black font-extrabold uppercase tracking-widest text-xs md:text-sm hover:bg-emerald-400 transition-all shadow-2xl">
                    Begin New Life Sequence
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-12 md:mt-24 py-8 md:py-16 border-t border-white/5 bg-black/20 text-center px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 text-emerald-500">
            <DNABrand className="text-lg md:text-xl" />
            <span className="text-[10px] md:text-sm font-bold uppercase tracking-[0.4em] md:tracking-[0.6em]">Team Double Helix</span>
          </div>
          <p className="text-[8px] md:text-[10px] opacity-30 uppercase tracking-widest">Made by Justin and Foo</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
