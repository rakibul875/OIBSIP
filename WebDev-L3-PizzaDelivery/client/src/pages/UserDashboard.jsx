import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Star,
  Plus,
  Search,
  ChefHat,
  Sparkles,
  Flame,
  Clock,
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

// Default artisan pizza presets matching menu catalog design specifications
const defaultArtisanCatalog = [
  {
    _id: 'pizza_farmhouse_01',
    id: 'pizza_farmhouse_01',
    name: 'Farmhouse Garden Extravaganza',
    price: 419,
    rating: '4.9',
    category: 'Bestsellers',
    description: 'Crisp bell peppers, sun-ripened cherry tomatoes, kalamata olives, red onions, and fresh buffalo mozzarella on a stone-baked sourdough crust.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    tags: ['Bestsellers', 'Veg']
  },
  {
    _id: 'pizza_pesto_02',
    id: 'pizza_pesto_02',
    name: 'Verde Pesto Genovese',
    price: 529,
    rating: '4.8',
    category: 'Chef Specials',
    description: 'Hand-pounded Ligurian basil pesto, fior di latte mozzarella, roasted pine nuts, charred artichoke hearts, and aged shaved Parmigiano-Reggiano.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
    tags: ['Chef Specials', 'Gourmet']
  },
  {
    _id: 'pizza_truffle_03',
    id: 'pizza_truffle_03',
    name: 'Truffle Woodland Mushroom',
    price: 589,
    rating: '4.9',
    category: 'Gourmet',
    description: 'Wild forest porcini and cremini mushrooms sautéed in garlic butter, white truffle cream sauce, smoked scamorza, and fresh rosemary sprigs.',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80',
    tags: ['Gourmet', 'Chef Specials']
  },
  {
    _id: 'pizza_diavola_04',
    id: 'pizza_diavola_04',
    name: 'Diavola Inferno Spice',
    price: 469,
    rating: '4.8',
    category: 'Spicy',
    description: 'San Marzano marinara, crushed Calabrian chili paste, sliced jalapeños, spicy paprika rings, hot honey drizzle, and fresh melted mozzarella.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80',
    tags: ['Spicy', 'Bestsellers']
  },
  {
    _id: 'pizza_formaggi_05',
    id: 'pizza_formaggi_05',
    name: 'Quattro Formaggi Rustica',
    price: 499,
    rating: '4.9',
    category: 'Gourmet',
    description: 'A rich four-cheese blend of aged Gorgonzola dolce, fresh buffalo mozzarella, sharp provolone, and 24-month aged Parmigiano.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
    tags: ['Gourmet', 'Bestsellers']
  },
  {
    _id: 'pizza_paneer_06',
    id: 'pizza_paneer_06',
    name: 'Fiery Peri-Peri Paneer Supreme',
    price: 449,
    rating: '4.7',
    category: 'Spicy',
    description: 'Char-grilled cottage paneer tossed in fiery African bird’s eye chili sauce, crunchy bell peppers, sweet golden corn, and herb oil.',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80',
    tags: ['Spicy']
  },
  {
    _id: 'pizza_burrata_07',
    id: 'pizza_burrata_07',
    name: 'Smoky BBQ Burrata Deluxe',
    price: 549,
    rating: '4.9',
    category: 'Chef Specials',
    description: 'Hickory-smoked barbecue glaze, caramelized balsamic shallots, baby spinach, finished post-bake with a tear of fresh Pugliese burrata.',
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800&auto=format&fit=crop&q=80',
    tags: ['Chef Specials', 'Gourmet']
  },
  {
    _id: 'pizza_margherita_08',
    id: 'pizza_margherita_08',
    name: 'Classic Margherita di Napoli',
    price: 389,
    rating: '4.8',
    category: 'Bestsellers',
    description: 'The authentic Queen of Naples: Sweet San Marzano plum tomatoes, creamy buffalo mozzarella, fragrant Genovese basil, and extra virgin olive oil.',
    image: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&auto=format&fit=crop&q=80',
    tags: ['Bestsellers']
  },
  {
    _id: 'pizza_garlic_09',
    id: 'pizza_garlic_09',
    name: 'Roasted Garlic Mediterranean Sunset',
    price: 479,
    rating: '4.8',
    category: 'Chef Specials',
    description: 'Slow-confit roasted garlic cloves, sun-dried cherry tomatoes, peppery baby arugula, crumbled Greek feta, and extra virgin cold-pressed olive oil.',
    image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800&auto=format&fit=crop&q=80',
    tags: ['Chef Specials']
  }
];

export default function UserDashboard() {
  const { pizzas, addToCart } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Bestsellers', 'Chef Specials', 'Spicy', 'Gourmet'];

  // Combine backend pizzas with default catalog if backend empty
  const catalogList = pizzas && pizzas.length > 0 ? pizzas : defaultArtisanCatalog;

  // Category & Search dynamic filtering
  const filteredPizzas = catalogList.filter((pizza) => {
    const pizzaTags = pizza.tags || [];
    const pizzaCategory = pizza.category || '';

    const matchesCategory =
      selectedCategory === 'All' ||
      selectedCategory === pizzaCategory ||
      pizzaTags.includes(selectedCategory) ||
      (selectedCategory === 'Bestsellers' && (pizza.isPopular || pizzaCategory === 'Bestsellers' || pizzaTags.includes('Bestsellers'))) ||
      (selectedCategory === 'Chef Specials' && (pizza.isChefSpecial || pizzaCategory === 'Chef Specials' || pizzaTags.includes('Chef Specials'))) ||
      (selectedCategory === 'Spicy' && (pizzaCategory === 'Spicy' || pizzaTags.includes('Spicy'))) ||
      (selectedCategory === 'Gourmet' && (pizzaCategory === 'Gourmet' || pizzaTags.includes('Gourmet')));

    const matchesSearch =
      searchQuery.trim() === '' ||
      pizza.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (pizza.description && pizza.description.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (pizza) => {
    addToCart({
      ...pizza,
      id: pizza._id || pizza.id
    });
  };

  const scrollToMenu = () => {
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      
      {/* =========================================================================
          1. TOP HERO SECTION
          ========================================================================= */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-neutral-800/80">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-72 bg-gradient-to-b from-orange-600/20 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-amber-500 text-xs font-bold tracking-wider uppercase shadow-sm">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>AUTHENTIC WOOD-FIRED CRAFTSMANSHIP</span>
          </div>

          {/* Catchy Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-display tracking-tight leading-[1.15]">
            Handcrafted Wood-Fired{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-rose-500">
              Artisanal Pizzas
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl">
            Freshly baked dough, organic ingredients, and authentic wood-fired flavors delivered hot to your doorstep.
          </p>

          {/* Two CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 w-full sm:w-auto">
            {/* "Explore Artisan Menu" (Primary orange button with smooth scroll) */}
            <button
              type="button"
              onClick={scrollToMenu}
              id="hero-explore-menu-btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-xl shadow-orange-600/30 transition-all hover:scale-102 active:scale-95 cursor-pointer"
            >
              <span>Explore Artisan Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* "Build Custom Pizza" (Secondary outlined button) */}
            <Link
              to="/custom-pizza"
              id="hero-build-custom-btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/80 font-bold text-sm transition-all hover:scale-102 active:scale-95 shadow-md shadow-neutral-950/50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Build Custom Pizza</span>
            </Link>
          </div>

          {/* Stat Counters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 w-full">
            <div className="flex items-center justify-center sm:justify-start gap-3 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-lg font-black text-white font-mono">100%</p>
                <p className="text-xs text-neutral-400 font-medium">Fresh Dough</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-lg font-black text-white font-mono">30 Min</p>
                <p className="text-xs text-neutral-400 font-medium">Delivery</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-left">
                <p className="text-lg font-black text-white font-mono">4.9 ★</p>
                <p className="text-xs text-neutral-400 font-medium">Top Rated</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. MAIN MENU SECTION (Category Filters, Search Bar & Pizza Grid)
          ========================================================================= */}
      <section id="menu-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-6">
        
        {/* Category Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          
          {/* Category Pill Filter Buttons on Left */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  id={`filter-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-600/30 scale-102'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Input Box on Right */}
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              id="search-pizzas-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pizzas by name..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Responsive Pizza Card Grid (3-Column Grid) */}
        {filteredPizzas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPizzas.map((pizza) => {
              const pid = pizza._id || pizza.id;

              return (
                <div
                  key={pid}
                  id={`pizza-card-${pid}`}
                  className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl hover:border-neutral-700/80 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* High-Quality Pizza Image with Top-Right Star Rating Badge */}
                    <div className="h-48 sm:h-52 rounded-2xl bg-neutral-950 border border-neutral-800/80 overflow-hidden relative mb-4">
                      <img
                        src={
                          pizza.image ||
                          pizza.imageUrl ||
                          'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80'
                        }
                        alt={pizza.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Rating Badge (e.g., "★ 4.9") */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-neutral-950/85 backdrop-blur-md text-amber-400 border border-neutral-800 text-xs font-extrabold flex items-center gap-1 shadow-md">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{pizza.rating || '4.9'}</span>
                      </div>
                    </div>

                    {/* Pizza Title */}
                    <h3 className="text-lg font-bold text-white font-display tracking-tight group-hover:text-amber-400 transition-colors">
                      {pizza.name}
                    </h3>

                    {/* Short Ingredient Description Text with Text Truncation */}
                    <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {pizza.description}
                    </p>
                  </div>

                  {/* Bottom Bar: Price in INR and Orange "+ Add to Cart" Button */}
                  <div className="pt-4 border-t border-neutral-800/80 mt-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider block">
                        Price
                      </span>
                      <span className="text-xl font-black text-amber-500 font-mono">
                        ₹{pizza.price}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(pizza)}
                      id={`add-to-cart-btn-${pid}`}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition-all hover:scale-102 active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>+ Add to Cart</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
            <ChefHat className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Pizzas Found</h3>
            <p className="text-xs text-neutral-400">
              No handcrafted pizzas match "{searchQuery}" in category "{selectedCategory}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-semibold hover:bg-neutral-700 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </section>

      {/* =========================================================================
          3. BOTTOM FEATURE SECTION 1: "Why Choose SliceCraft"
          ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-amber-500 text-xs font-bold tracking-wider uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
            <span>UNCOMPROMISING CULINARY EXCELLENCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
            Why Choose SliceCraft
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            Crafted by master pizzaiolos using traditional fermentation techniques and Italian stone ovens.
          </p>
        </div>

        {/* 3-Card USP Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Wood-Fired Perfection */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 hover:border-neutral-700 transition-all duration-300 relative group overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/25 text-amber-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-2 flex items-center gap-2">
              <span>🪵 Wood-Fired Perfection</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Baked at 450°C in traditional Italian wood-fired ovens, producing an airy sourdough crust with charred leopard spotting.
            </p>
          </div>

          {/* Card 2: 100% Authentic Mozzarella & Artisanal Sauces */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 hover:border-neutral-700 transition-all duration-300 relative group overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/25 text-amber-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ChefHat className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-2 flex items-center gap-2">
              <span>🧀 100% Authentic Mozzarella</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Hand-stretched fior di latte mozzarella, fresh Pugliese burrata, and slow-simmered San Marzano tomato sauce made daily from scratch.
            </p>
          </div>

          {/* Card 3: Lightning Fast & Live Tracked Delivery */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 hover:border-neutral-700 transition-all duration-300 relative group overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/25 text-amber-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-2 flex items-center gap-2">
              <span>⚡ Lightning Fast & Live Tracked</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Dispatched in specialized thermal-insulated carriers with live WebSocket order tracking from our kitchen to your dining table.
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. BOTTOM FEATURE SECTION 2: "Special Offer Banner"
          ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-950/50 via-neutral-900 to-neutral-900 border-2 border-orange-500/40 shadow-2xl shadow-orange-950/40 p-8 sm:p-12">
          
          {/* Background Ambient Glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INTERACTIVE 4-STEP PIZZA CREATOR</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display tracking-tight">
                Craving a Custom Creation? Design Your Own Pizza Step-by-Step!
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Choose your artisanal crust, secret simmered sauce, artisan cheese blend, and fresh organic toppings with real-time price & nutrition feedback.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to="/custom-pizza"
                id="cta-open-pizza-studio-btn"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-xl shadow-orange-600/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open Pizza Studio Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
