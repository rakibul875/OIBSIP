import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Flame,
  Layers,
  ShoppingBag,
  Info,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';

export default function CustomPizzaBuilder() {
  const { bases, sauces, cheeses, vegetables, inventoryLoading, addToCart } = useApp();
  const navigate = useNavigate();

  // Active Wizard Step (1: Base, 2: Sauce, 3: Cheese, 4: Vegetables)
  const [currentStep, setCurrentStep] = useState(1);

  // Custom Pizza Selections
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedVegetables, setSelectedVegetables] = useState([]);
  const [pizzaCustomName, setPizzaCustomName] = useState("My Signature Artisan Pie");

  // Synchronize selections once live inventory loads
  React.useEffect(() => {
    if (!selectedBase && bases.length > 0) setSelectedBase(bases[0]);
    if (!selectedSauce && sauces.length > 0) setSelectedSauce(sauces[0]);
    if (!selectedCheese && cheeses.length > 0) setSelectedCheese(cheeses[0]);
  }, [bases, sauces, cheeses, selectedBase, selectedSauce, selectedCheese]);

  // Step config
  const steps = [
    { number: 1, title: 'Artisan Crust', subtitle: '5 Hand-Crafted Bases', icon: '🍞' },
    { number: 2, title: 'Slow Sauce', subtitle: '5 Simmered Sauces', icon: '🍅' },
    { number: 3, title: 'Melted Cheese', subtitle: '5 Gourmet Cheeses', icon: '🧀' },
    { number: 4, title: 'Farm Veggies', subtitle: 'Multi-Select Toppings', icon: '🫑' },
  ];

  // Dynamic Price Calculation
  const basePrice = selectedBase ? selectedBase.unitPrice : 0;
  const saucePrice = selectedSauce ? selectedSauce.unitPrice : 0;
  const cheesePrice = selectedCheese ? selectedCheese.unitPrice : 0;
  const veggiesPrice = selectedVegetables.reduce((sum, veg) => sum + veg.unitPrice, 0);
  const totalCustomPrice = basePrice + saucePrice + cheesePrice + veggiesPrice;

  // Vegetable toggle logic
  const handleToggleVegetable = (veg) => {
    if (veg.stock <= 0) return;
    const vegId = veg._id || veg.id;
    const exists = selectedVegetables.some((v) => (v._id || v.id) === vegId);
    if (exists) {
      setSelectedVegetables(selectedVegetables.filter((v) => (v._id || v.id) !== vegId));
    } else {
      setSelectedVegetables([...selectedVegetables, veg]);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) return;

    const customPizzaItem = {
      id: `custom_${Date.now()}`,
      type: 'custom',
      pizzaType: 'custom',
      name: pizzaCustomName.trim() || 'Custom Artisan Pizza',
      price: totalCustomPrice,
      quantity: 1,
      customDetails: {
        base: {
          id: selectedBase._id || selectedBase.id,
          name: selectedBase.name,
        },
        sauce: {
          id: selectedSauce._id || selectedSauce.id,
          name: selectedSauce.name,
        },
        cheese: {
          id: selectedCheese._id || selectedCheese.id,
          name: selectedCheese.name,
        },
        vegetables: selectedVegetables.map((v) => ({
          id: v._id || v.id,
          name: v.name,
        })),
        priceBreakdown: {
          basePrice,
          saucePrice,
          cheesePrice,
          veggiesPrice,
        },
      },
    };

    addToCart(customPizzaItem);
    navigate('/order-summary');
  };

  const handleReset = () => {
    setSelectedBase(bases[0] || null);
    setSelectedSauce(sauces[0] || null);
    setSelectedCheese(cheeses[0] || null);
    setSelectedVegetables([]);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-stone-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 4-Step Builder</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
            Custom Pizza Studio
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Build your personalized artisan pizza step by step with real-time visual layering and pricing.
          </p>
        </div>

        {/* Live Price Tag & Reset */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Recipe</span>
          </button>

          <div className="px-5 py-2.5 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-right">
            <span className="text-[10px] text-orange-400 uppercase font-bold tracking-wider block">
              Calculated Price
            </span>
            <span className="text-2xl font-black text-white font-display">
              ₹{totalCustomPrice}
            </span>
          </div>
        </div>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {steps.map((st) => {
          const isDone = currentStep > st.number;
          const isCurrent = currentStep === st.number;
          return (
            <button
              key={st.number}
              onClick={() => setCurrentStep(st.number)}
              className={`text-left p-3.5 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                  : isDone
                  ? 'bg-stone-900/90 border-emerald-500/40 text-stone-300'
                  : 'bg-stone-900/40 border-stone-800/80 text-stone-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-lg">{st.icon}</span>
                {isDone ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                ) : (
                  <span className={`text-xs font-mono font-bold ${isCurrent ? 'text-orange-400' : 'text-stone-600'}`}>
                    0{st.number}
                  </span>
                )}
              </div>
              <p className={`text-xs font-bold truncate ${isCurrent ? 'text-orange-400' : 'text-stone-200'}`}>
                {st.title}
              </p>
              <p className="text-[10px] text-stone-400 truncate">{st.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Studio Workspace Layout: 2 Columns (Left: Step Selector, Right: Live Interactive Pizza Visualizer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Step Content (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: DOUGH BASE (5 Options) */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-crust">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white font-display">Step 1: Choose Your Dough Base</h3>
                  <p className="text-xs text-stone-400">Select 1 of 5 handcrafted artisan pizza crusts</p>
                </div>
                <span className="text-xs font-mono text-orange-400 font-semibold">1 / 4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {bases.map((base) => {
                  const isSelected = (selectedBase?._id || selectedBase?.id) === (base._id || base.id);
                  const isOutOfStock = base.stock <= 0;
                  return (
                    <div
                      key={base._id || base.id}
                      onClick={() => !isOutOfStock && setSelectedBase(base)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500/15 border-orange-500 shadow-md shadow-orange-500/10'
                          : isOutOfStock
                          ? 'bg-stone-900/30 border-stone-800/40 opacity-50 cursor-not-allowed'
                          : 'bg-stone-900/80 border-stone-800 hover:border-stone-700 hover:bg-stone-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white">{base.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                          </div>
                          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                            {base.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-800/60 flex items-center justify-between">
                        <span className="text-base font-extrabold text-orange-400 font-display">
                          ₹{base.unitPrice}
                        </span>
                        <div className="flex items-center gap-2">
                          {base.stock <= (base.threshold || 20) && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Low Stock ({base.stock})
                            </span>
                          )}
                          <span className="text-[10px] text-stone-400">
                            {isOutOfStock ? 'Sold Out' : `${base.stock} left`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: GOURMET SAUCE (5 Options) */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-crust">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white font-display">Step 2: Select Gourmet Sauce</h3>
                  <p className="text-xs text-stone-400">Select 1 of 5 slow-simmered sauces</p>
                </div>
                <span className="text-xs font-mono text-orange-400 font-semibold">2 / 4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {sauces.map((sauce) => {
                  const isSelected = (selectedSauce?._id || selectedSauce?.id) === (sauce._id || sauce.id);
                  const isOutOfStock = sauce.stock <= 0;
                  return (
                    <div
                      key={sauce._id || sauce.id}
                      onClick={() => !isOutOfStock && setSelectedSauce(sauce)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500/15 border-orange-500 shadow-md shadow-orange-500/10'
                          : isOutOfStock
                          ? 'bg-stone-900/30 border-stone-800/40 opacity-50 cursor-not-allowed'
                          : 'bg-stone-900/80 border-stone-800 hover:border-stone-700 hover:bg-stone-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: sauce.color || '#ef4444' }}
                            />
                            <span className="text-sm font-bold text-white">{sauce.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                          </div>
                          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                            {sauce.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-800/60 flex items-center justify-between">
                        <span className="text-base font-extrabold text-orange-400 font-display">
                          ₹{sauce.unitPrice}
                        </span>
                        <div className="flex items-center gap-2">
                          {sauce.stock <= (sauce.threshold || 20) && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Low Stock ({sauce.stock})
                            </span>
                          )}
                          <span className="text-[10px] text-stone-400">
                            {isOutOfStock ? 'Sold Out' : `${sauce.stock} units`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: ARTISANAL CHEESE (5 Options) */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-crust">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white font-display">Step 3: Choose Melted Cheese</h3>
                  <p className="text-xs text-stone-400">Select 1 cheese or gourmet dairy blend</p>
                </div>
                <span className="text-xs font-mono text-orange-400 font-semibold">3 / 4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {cheeses.map((cheese) => {
                  const isSelected = (selectedCheese?._id || selectedCheese?.id) === (cheese._id || cheese.id);
                  const isOutOfStock = cheese.stock <= 0;
                  return (
                    <div
                      key={cheese._id || cheese.id}
                      onClick={() => !isOutOfStock && setSelectedCheese(cheese)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500/15 border-orange-500 shadow-md shadow-orange-500/10'
                          : isOutOfStock
                          ? 'bg-stone-900/30 border-stone-800/40 opacity-50 cursor-not-allowed'
                          : 'bg-stone-900/80 border-stone-800 hover:border-stone-700 hover:bg-stone-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: cheese.color || '#facc15' }}
                            />
                            <span className="text-sm font-bold text-white">{cheese.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                          </div>
                          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                            {cheese.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-800/60 flex items-center justify-between">
                        <span className="text-base font-extrabold text-orange-400 font-display">
                          ₹{cheese.unitPrice}
                        </span>
                        <div className="flex items-center gap-2">
                          {cheese.stock <= (cheese.threshold || 20) && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Low Stock ({cheese.stock})
                            </span>
                          )}
                          <span className="text-[10px] text-stone-400">
                            {isOutOfStock ? 'Sold Out' : `${cheese.stock} in kitchen`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: FRESH VEGETABLES (Multi-Select, 8 Options) */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-crust">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white font-display">Step 4: Pick Farm Fresh Vegetables</h3>
                  <p className="text-xs text-stone-400">Multi-select toppings (choose as many as you like!)</p>
                </div>
                <span className="text-xs font-mono text-orange-400 font-semibold">4 / 4</span>
              </div>

              {/* Pizza Nickname input */}
              <div className="p-4 rounded-2xl glass-panel border border-stone-800 mb-2">
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Name Your Pizza Masterpiece:
                </label>
                <input
                  type="text"
                  value={pizzaCustomName}
                  onChange={(e) => setPizzaCustomName(e.target.value)}
                  placeholder="e.g. Aryan's Truffle Fiesta"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {vegetables.map((veg) => {
                  const vegId = veg._id || veg.id;
                  const isChecked = selectedVegetables.some((v) => (v._id || v.id) === vegId);
                  const isOutOfStock = veg.stock <= 0;
                  return (
                    <div
                      key={vegId}
                      onClick={() => handleToggleVegetable(veg)}
                      className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-500/15 border-emerald-500 shadow-md shadow-emerald-500/10'
                          : isOutOfStock
                          ? 'bg-stone-900/30 border-stone-800/40 opacity-50 cursor-not-allowed'
                          : 'bg-stone-900/80 border-stone-800 hover:border-stone-700 hover:bg-stone-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-500 text-stone-950 font-bold'
                                : 'border-stone-700 bg-stone-950 text-transparent'
                            }`}
                          >
                            ✓
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{veg.name}</span>
                            <span className="text-[10px] text-stone-400 block line-clamp-1">
                              {veg.description}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-orange-400 block font-display">
                            +₹{veg.unitPrice}
                          </span>
                          {veg.stock <= veg.threshold && (
                            <span className="text-[9px] font-bold text-amber-400">
                              {veg.stock} left
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wizard Step Navigation Buttons */}
          <div className="pt-6 border-t border-stone-800/80 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold text-sm flex items-center gap-2 border border-stone-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-stone-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                id="add-custom-pizza-to-cart-btn"
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-stone-950 font-extrabold text-sm flex items-center gap-2.5 shadow-xl shadow-orange-600/30 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Confirm & Add Custom Pizza (₹{totalCustomPrice})</span>
              </button>
            )}
          </div>

        </div>

        {/* Right Column: Live Interactive Pizza Visualizer & Recipe Summary (5 cols) */}
        <div className="lg:col-span-5 sticky top-28 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-stone-800/90 shadow-2xl relative overflow-hidden">
            
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-orange-400" />
              <span>Real-Time Layer Visualizer</span>
            </h3>

            {/* Interactive Pizza Visual Diagram */}
            <div className="relative w-64 h-64 mx-auto my-4 flex items-center justify-center">
              
              {/* Outer Golden Crust Rim */}
              <div className="absolute inset-0 rounded-full border-8 border-amber-700/80 bg-gradient-to-tr from-amber-800 via-amber-600 to-amber-700 shadow-2xl flex items-center justify-center p-3 animate-pulse-slow">
                
                {/* Sauce Layer */}
                <div
                  className="w-full h-full rounded-full transition-colors duration-500 flex items-center justify-center p-2.5 shadow-inner"
                  style={{
                    backgroundColor: selectedSauce?.color || '#ef4444',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                  }}
                >
                  {/* Cheese Melt Layer */}
                  <div
                    className="w-full h-full rounded-full transition-colors duration-500 relative flex items-center justify-center overflow-hidden opacity-90"
                    style={{
                      backgroundColor: selectedCheese?.color || '#facc15',
                      boxShadow: 'inset 0 0 15px rgba(217, 119, 6, 0.4)'
                    }}
                  >
                    {/* Char spots & Herbs */}
                    <div className="absolute top-4 left-6 w-2.5 h-2.5 rounded-full bg-amber-900/60" />
                    <div className="absolute bottom-6 right-8 w-3 h-3 rounded-full bg-amber-900/60" />
                    <div className="absolute top-1/2 left-4 w-2 h-2 rounded-full bg-amber-900/50" />
                    <div className="absolute top-8 right-6 w-2 h-2 rounded-full bg-amber-900/50" />

                    {/* Render Selected Veggie Dots/Icons visually */}
                    {selectedVegetables.map((v, i) => {
                      const angles = [20, 65, 110, 155, 200, 245, 290, 335];
                      const angle = angles[i % angles.length];
                      const radius = 55; // pixels from center
                      const rad = (angle * Math.PI) / 180;
                      const x = Math.round(radius * Math.cos(rad));
                      const y = Math.round(radius * Math.sin(rad));

                      return (
                        <div
                          key={v._id || v.id}
                          className="absolute w-5 h-5 rounded-full bg-stone-900/80 border border-white/20 flex items-center justify-center text-[10px] shadow"
                          style={{
                            transform: `translate(${x}px, ${y}px)`,
                            backgroundColor:
                              v.name.includes('Olive') ? '#1c1917' :
                              v.name.includes('Pepper') ? '#dc2626' :
                              v.name.includes('Mushroom') ? '#78716c' :
                              v.name.includes('Corn') ? '#eab308' :
                              v.name.includes('Jalape') ? '#15803d' : '#059669'
                          }}
                          title={v.name}
                        >
                          🥗
                        </div>
                      );
                    })}

                    <span className="text-stone-950/60 font-black text-xs uppercase tracking-widest font-display select-none">
                      Woodfired
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Recipe Breakdown List */}
            <div className="mt-6 pt-5 border-t border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-300">
                <span className="text-stone-400">1. Crust:</span>
                <span className="font-semibold text-white">{selectedBase?.name} (₹{basePrice})</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span className="text-stone-400">2. Sauce:</span>
                <span className="font-semibold text-white">{selectedSauce?.name} (₹{saucePrice})</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span className="text-stone-400">3. Cheese:</span>
                <span className="font-semibold text-white">{selectedCheese?.name} (₹{cheesePrice})</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span className="text-stone-400">4. Veggies ({selectedVegetables.length}):</span>
                <span className="font-semibold text-white">
                  {selectedVegetables.length > 0
                    ? `+₹${veggiesPrice}`
                    : 'None chosen'}
                </span>
              </div>

              {selectedVegetables.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedVegetables.map((v) => (
                    <span
                      key={v._id || v.id}
                      className="text-[10px] px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-800"
                    >
                      {v.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Total Row */}
            <div className="mt-4 pt-4 border-t border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 block">Total Unit Price:</span>
                <span className="text-2xl font-black text-orange-400 font-display">
                  ₹{totalCustomPrice}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-stone-950 font-bold text-xs shadow-md shadow-orange-500/20"
              >
                Add to Cart
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
