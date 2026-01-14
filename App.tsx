
import React, { useState } from 'react';
import { Environment, Trait, GameStep } from './types';
import { ENVIRONMENTS, TRAITS } from './constants';
import { generateSpeciesData, generateSpeciesImage, analyzeEvolutionaryViability } from './services/geminiService';

// Ensure the window object is aware of AI Studio key selection methods
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio: AIStudio;
  }
}

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
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);

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

  const handleKeySelection = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setShowKeyPrompt(false);
      // Immediately try to re-trigger generation after key selection
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    if (selectedTraits.length < 5 || !selectedEnv) return;

    // Pro models like gemini-3-pro-image-preview require a selected API key
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setShowKeyPrompt(true);
        return;
      }
    }

    setStep(GameStep.GENERATION);
    setLoading(true);
    setSpeciesImageUrl(null); // Reset image state

    try {
      const [data, image] = await Promise.all([
        generateSpeciesData(selectedEnv, selectedTraits),
        generateSpeciesImage(selectedEnv, selectedTraits)
      ]);
      setSpeciesInfo(data || '');
      setSpeciesImageUrl(image);
    } catch (err: any) {
      if (err.message === "KEY_REQUIRED") {
        setShowKeyPrompt(true);
        setStep(GameStep.TRAITS);
      }
      console.error(err);
    } finally {
      setLoading(false);
      setStep(GameStep.RESULT);
    }
  };

  const toggleTrait = (trait: Trait) => {
    setSelectedTraits(prev => {
      if (prev.find(t => t.id === trait.id)) return prev.filter(t => t.id !== trait.id);
      return [...prev, trait];
    });
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
  };

  const filteredTraits = activeCategory === 'All' ? TRAITS : TRAITS.filter(t => t.category === activeCategory);

  return (
    <div className={`min-h-screen transition-colors duration-1000 bg-gradient-to-b ${selectedEnv ? selectedEnv.bgGradient : 'from-slate-900 to-black'}`}>
      {/* API Key Modal for Pro Content */}
      {showKeyPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
          <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center border border-emerald-500/30 animate-fade-in">
            <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-key text-emerald-400 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold mb-4">4K High-Quality Synthesis</h2>
            <p className="text-white/60 mb-8 text-sm leading-relaxed">
              Generating 4K-quality Pro biological illustrations requires a user-selected API key from a 
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-emerald-400 underline mx-1">paid GCP project</a>. 
              Please authenticate to proceed.
            </p>
            <button onClick={handleKeySelection} className="w-full py-4 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
              Authenticate API Key
            </button>
            <button onClick={() => setShowKeyPrompt(false)} className="mt-4 text-xs opacity-50 hover:opacity-100 transition">Cancel and return</button>
          </div>
        </div>
      )}

      <nav className="p-6 flex justify-between items-center border-b border-white/10 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 w-10 h-10 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-dna text-white"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Evolution Roulette</h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden md:flex gap-8 text-sm font-medium opacity-70">
            <span className={step === GameStep.ENVIRONMENT ? 'text-white underline' : ''}>1. Environment</span>
            <span className={step === GameStep.TRAITS ? 'text-white underline' : ''}>2. Traits</span>
            <span className={step === GameStep.RESULT ? 'text-white underline' : ''}>3. Synthesis</span>
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
                    <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/10 mb-4 inline-block">Habitat Selected</span>
                    <h3 className="text-4xl font-bold mb-4" style={{ color: selectedEnv.accent }}>{selectedEnv.name}</h3>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div><p className="opacity-50 mb-1 uppercase text-[10px] tracking-widest font-bold">Climate</p><p>{selectedEnv.climate}</p></div>
                      <div><p className="opacity-50 mb-1 uppercase text-[10px] tracking-widest font-bold">Temperature</p><p>{selectedEnv.temperature}</p></div>
                      <div className="col-span-2"><p className="opacity-50 mb-1 uppercase text-[10px] tracking-widest font-bold">Selective Pressures</p><p className="text-emerald-300">{selectedEnv.challenges}</p></div>
                    </div>
                  </div>
                  <div className="w-full md:w-auto self-end">
                    <button onClick={() => setStep(GameStep.TRAITS)} className="w-full md:w-auto px-8 py-4 rounded-xl bg-white text-black font-bold hover:bg-emerald-400 transition transform hover:-translate-y-1">CHOOSE TRAITS <i className="fa-solid fa-arrow-right ml-2"></i></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === GameStep.TRAITS && (
          <div className="animate-fade-in space-y-8 pb-32">
            <div className="glass-panel p-6 rounded-3xl border-t-4 shadow-2xl relative overflow-hidden" style={{ borderColor: selectedEnv?.accent }}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div className="md:border-r border-white/10 pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1">Target Habitat</span>
                  <h3 className="text-2xl font-bold" style={{ color: selectedEnv?.accent }}>{selectedEnv?.name}</h3>
                </div>
                <div className="text-xs space-y-1 col-span-3">
                  <p className="opacity-50 uppercase font-bold tracking-widest text-[9px]">Environmental Challenges</p>
                  <p className="text-emerald-400 font-bold">{selectedEnv?.challenges}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <h2 className="text-4xl font-bold mb-2 tracking-tight uppercase">Genetic Blueprint</h2>
                <div className="flex flex-col gap-2 max-w-xs mt-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-1">Filter Biological Systems</label>
                  <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="bg-neutral-800 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer shadow-xl appearance-none">
                    {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className="text-sm font-bold mb-2 uppercase tracking-widest">
                  Selected Traits: <span className={selectedTraits.length >= 5 ? 'text-emerald-400' : 'text-amber-400'}>{selectedTraits.length} / 5+</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTraits.map(trait => {
                const isSelected = selectedTraits.some(t => t.id === trait.id);
                return (
                  <button key={trait.id} onClick={() => toggleTrait(trait)} className={`text-left p-5 rounded-2xl glass-panel border transition-all duration-300 group hover:-translate-y-1 ${isSelected ? 'glow-trait ring-1 ring-emerald-400/50 scale-105 bg-emerald-950/20' : 'border-white/5 hover:border-white/20'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40 group-hover:bg-white/10'}`}><i className={`fa-solid ${trait.icon} text-xl`}></i></div>
                    <h4 className={`font-bold mb-1 transition-colors ${isSelected ? 'text-emerald-400' : 'text-white/90'}`}>{trait.name}</h4>
                    <