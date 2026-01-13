
import { Environment, Trait } from './types';

export const ENVIRONMENTS: Environment[] = [
  { id: 'rainforest', name: 'Tropical Rainforest', climate: 'Humid, high rainfall', temperature: '25°C - 30°C', resources: 'High biodiversity, abundant water', challenges: 'Dense competition, pathogens, low light at floor', accent: '#10b981', bgGradient: 'from-green-900 to-black' },
  { id: 'temperate', name: 'Temperate Forest', climate: 'Seasonal, moderate rain', temperature: '-5°C - 25°C', resources: 'Seasonal nuts, berries, prey', challenges: 'Cold winters, food scarcity in dormancy', accent: '#059669', bgGradient: 'from-emerald-900 to-black' },
  { id: 'desert', name: 'Desert', climate: 'Arid, minimal rainfall', temperature: '10°C - 45°C', resources: 'Scarce water, specialized flora', challenges: 'Dehydration, extreme heat, sandstorms', accent: '#f59e0b', bgGradient: 'from-amber-900 to-black' },
  { id: 'savanna', name: 'Savanna', climate: 'Wet and dry seasons', temperature: '20°C - 30°C', resources: 'Open grasslands, scattered trees', challenges: 'Predation, seasonal drought, fires', accent: '#fbbf24', bgGradient: 'from-yellow-900 to-black' },
  { id: 'tundra', name: 'Tundra', climate: 'Cold, windy, low rain', temperature: '-30°C - 10°C', resources: 'Lichens, mosses, seasonal insects', challenges: 'Permafrost, extreme cold, short growing season', accent: '#60a5fa', bgGradient: 'from-blue-900 to-black' },
  { id: 'arctic', name: 'Arctic Ice', climate: 'Polar, frozen', temperature: '-40°C - 0°C', resources: 'Marine-based food chain', challenges: 'Freezing water, total lack of vegetation', accent: '#93c5fd', bgGradient: 'from-sky-900 to-black' },
  { id: 'lake', name: 'Freshwater Lake', climate: 'Aquatic, variable flow', temperature: '4°C - 20°C', resources: 'Insects, aquatic plants, fish', challenges: 'Oxygen fluctuations, osmotic pressure', accent: '#2dd4bf', bgGradient: 'from-teal-900 to-black' },
  { id: 'ocean', name: 'Deep Ocean', climate: 'High pressure, aphotic', temperature: '2°C - 4°C', resources: 'Marine snow, hydrothermal vents', challenges: 'Crushing pressure, total darkness, cold', accent: '#1e40af', bgGradient: 'from-blue-950 to-black' },
  { id: 'coral', name: 'Coral Reef', climate: 'Tropical marine', temperature: '22°C - 28°C', resources: 'Diverse reef structures, fish', challenges: 'Ocean acidification, high predation', accent: '#ec4899', bgGradient: 'from-rose-900 to-black' },
  { id: 'mountain', name: 'Mountain / Alpine', climate: 'Thin air, high UV', temperature: '-10°C - 15°C', resources: 'Hardy shrubs, minerals', challenges: 'Low oxygen, steep terrain, rocky soil', accent: '#94a3b8', bgGradient: 'from-slate-800 to-black' }
];

export const TRAITS: Trait[] = [
  // Physical / Structural
  { id: 1, name: 'Thick fur', description: 'Insulates against freezing temperatures.', category: 'Physical', icon: 'fa-paw' },
  { id: 2, name: 'Thin fur', description: 'Allows heat to escape in warm climates.', category: 'Physical', icon: 'fa-wind' },
  { id: 3, name: 'Scales', description: 'Provides armor and prevents water loss.', category: 'Physical', icon: 'fa-shield-halved' },
  { id: 4, name: 'Feathers', description: 'Enables flight and complex insulation.', category: 'Physical', icon: 'fa-feather' },
  { id: 5, name: 'Camouflage coloration', description: 'Blending into the environment to hide.', category: 'Physical', icon: 'fa-eye-slash' },
  { id: 6, name: 'Bright warning coloration', description: 'Signals toxicity to predators.', category: 'Physical', icon: 'fa-palette' },
  { id: 7, name: 'Large body size', description: 'Deters predators and retains heat.', category: 'Physical', icon: 'fa-up-right-and-down-left-from-center' },
  { id: 8, name: 'Small body size', description: 'Requires less food and allows hiding.', category: 'Physical', icon: 'fa-down-left-and-up-right-to-center' },
  { id: 9, name: 'Long limbs', description: 'Increases stride and aids heat loss.', category: 'Physical', icon: 'fa-arrows-left-right' },
  { id: 10, name: 'Short limbs', description: 'Conserves heat and aids burrowing.', category: 'Physical', icon: 'fa-compress' },
  { id: 11, name: 'Webbed feet', description: 'Increases swimming efficiency.', category: 'Physical', icon: 'fa-water' },
  { id: 12, name: 'Sharp claws', description: 'Tools for digging, climbing, or killing.', category: 'Physical', icon: 'fa-hand-back-fist' },
  { id: 13, name: 'Hooves', description: 'Durable structures for running on hard ground.', category: 'Physical', icon: 'fa-shoe-prints' },
  { id: 14, name: 'Streamlined body', description: 'Reduces drag in water or air.', category: 'Physical', icon: 'fa-person-swimming' },
  { id: 15, name: 'Spines or quills', description: 'Passive defense against attackers.', category: 'Physical', icon: 'fa-braille' },
  
  // Physiological
  { id: 16, name: 'Cold-blooded metabolism', description: 'Saves energy but requires external heat.', category: 'Physiological', icon: 'fa-temperature-low' },
  { id: 17, name: 'Warm-blooded metabolism', description: 'Active in all temps but high energy cost.', category: 'Physiological', icon: 'fa-temperature-high' },
  { id: 18, name: 'Fat storage (blubber)', description: 'Long-term energy and insulation.', category: 'Physiological', icon: 'fa-layer-group' },
  { id: 19, name: 'Water retention ability', description: 'Surviving long periods without drinking.', category: 'Physiological', icon: 'fa-droplet-slash' },
  { id: 20, name: 'Salt excretion glands', description: 'Drinking saltwater without dehydration.', category: 'Physiological', icon: 'fa-vial' },
  { id: 21, name: 'Efficient lungs', description: 'Maximizes oxygen intake from air.', category: 'Physiological', icon: 'fa-lungs' },
  { id: 22, name: 'Oxygen-binding blood', description: 'Survival in low-oxygen high altitudes.', category: 'Physiological', icon: 'fa-heart' },
  { id: 23, name: 'Antifreeze proteins', description: 'Prevents blood from freezing in subzero.', category: 'Physiological', icon: 'fa-snowflake' },
  { id: 24, name: 'Heat-resistant enzymes', description: 'Proteins function at extreme temperatures.', category: 'Physiological', icon: 'fa-fire' },
  { id: 25, name: 'Slow metabolism', description: 'Surviving on very little food intake.', category: 'Physiological', icon: 'fa-battery-half' },
  
  // Behavioral
  { id: 26, name: 'Nocturnal behavior', description: 'Active at night to avoid heat or predators.', category: 'Behavioral', icon: 'fa-moon' },
  { id: 27, name: 'Diurnal behavior', description: 'Active during the day.', category: 'Behavioral', icon: 'fa-sun' },
  { id: 28, name: 'Burrowing behavior', description: 'Hiding underground from elements.', category: 'Behavioral', icon: 'fa-trowel' },
  { id: 29, name: 'Tree-climbing behavior', description: 'Utilizing the canopy for food/safety.', category: 'Behavioral', icon: 'fa-tree' },
  { id: 30, name: 'Migratory behavior', description: 'Traveling to find better resources.', category: 'Behavioral', icon: 'fa-route' },
  { id: 31, name: 'Territorial behavior', description: 'Defending area for exclusive resources.', category: 'Behavioral', icon: 'fa-map-location' },
  { id: 32, name: 'Pack / social behavior', description: 'Cooperating for hunting and defense.', category: 'Behavioral', icon: 'fa-users' },
  { id: 33, name: 'Solitary behavior', description: 'Minimizing competition with others.', category: 'Behavioral', icon: 'fa-user' },
  { id: 34, name: 'Tool use', description: 'Manipulating objects to solve problems.', category: 'Behavioral', icon: 'fa-wrench' },
  { id: 35, name: 'Ambush hunting', description: 'Conserving energy until prey is close.', category: 'Behavioral', icon: 'fa-ghost' },
  
  // Feeding
  { id: 36, name: 'Carnivorous diet', description: 'Eating other animals for energy.', category: 'Feeding', icon: 'fa-bone' },
  { id: 37, name: 'Herbivorous diet', description: 'Consuming plant matter.', category: 'Feeding', icon: 'fa-leaf' },
  { id: 38, name: 'Omnivorous diet', description: 'Flexible diet of plants and animals.', category: 'Feeding', icon: 'fa-utensils' },
  { id: 39, name: 'Filter feeding', description: 'Straining tiny organisms from water.', category: 'Feeding', icon: 'fa-filter' },
  { id: 40, name: 'Scavenging behavior', description: 'Eating remains left by others.', category: 'Feeding', icon: 'fa-skull' },
  { id: 41, name: 'Long digestive tract', description: 'Breaks down tough fibrous plants.', category: 'Feeding', icon: 'fa-link' },
  { id: 42, name: 'Specialized teeth', description: 'Evolved for specific food sources.', category: 'Feeding', icon: 'fa-teeth' },
  { id: 43, name: 'Venom production', description: 'Chemical attack to subdue prey.', category: 'Feeding', icon: 'fa-vial-circle-check' },
  { id: 44, name: 'Toxin resistance', description: 'Eating poisonous plants or animals safely.', category: 'Feeding', icon: 'fa-biohazard' },
  { id: 45, name: 'Fast sprint speed', description: 'Burst of speed for chase or escape.', category: 'Feeding', icon: 'fa-bolt' },
  
  // Reproductive
  { id: 46, name: 'High reproductive rate', description: 'Producing many offspring rapidly.', category: 'Reproductive', icon: 'fa-users-rectangle' },
  { id: 47, name: 'Low reproductive rate', description: 'Fewer offspring but high parental care.', category: 'Reproductive', icon: 'fa-baby' },
  { id: 48, name: 'Seasonal breeding', description: 'Reproduction timed with resource peaks.', category: 'Reproductive', icon: 'fa-calendar' },
  { id: 49, name: 'Rapid mutation rate', description: 'Faster adaptation over generations.', category: 'Reproductive', icon: 'fa-dna' },
  { id: 50, name: 'Long lifespan', description: 'Allows for learning and many breeding cycles.', category: 'Reproductive', icon: 'fa-hourglass-end' }
];
