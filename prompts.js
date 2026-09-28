// 30 anime-themed daily draw prompts
// Loaded as a plain script so index.html works via file:// (no build step).
const PROMPTS = [
  {
    title: "Mythic in the Modern",
    anime: "Cyberpunk Edgerunners",
    difficulty: "Easy",
    timeMinutes: 30,
    description: "A samurai wearing neon lights and cybernetic armor walking a busy city street."
  },
  {
    title: "Ethereal Forest",
    anime: "Mushishi",
    difficulty: "Easy",
    timeMinutes: 30,
    description: "Spirit foxes and glowing mushrooms in a sunlit forest clearing."
  },
  {
    title: "Sky Pirate Captain",
    anime: "One Piece",
    difficulty: "Medium",
    timeMinutes: 45,
    description: "An eccentric pirate captain flying a steampunk airship over ocean islands."
  },
  {
    title: "Cybernetic Cat",
    anime: "Ghost in the Shell",
    difficulty: "Medium",
    timeMinutes: 30,
    description: "A sleek robot feline on a repair crew fixing a neon-lit factory machine."
  },
  {
    title: "Ninja in the Rain",
    anime: "Naruto",
    difficulty: "Easy",
    timeMinutes: 30,
    description: "A stealthy ninja in traditional gear crossing a puddle-filled alley in a rainy city."
  },
  {
    title: "Mecha Garden",
    anime: "Neon Genesis Evangelion",
    difficulty: "Medium",
    timeMinutes: 45,
    description: "Giant robotic arms watering mechanical flowers in a greenhouse of metal plants."
  },
  {
    title: "Space Lighthouse Keeper",
    anime: "Cowboy Bebop",
    difficulty: "Hard",
    timeMinutes: 60,
    description: "A lone keeper tending an ancient lighthouse at the centre of a deep-space vortex."
  },
  {
    title: "Gift Shop Doorway",
    anime: "Little Witch Academia",
    difficulty: "Easy",
    timeMinutes: 30,
    description: "A glowing doorway opening into a room packed with magical artifacts."
  },
  {
    title: "Roadside Food Vendor",
    anime: "Food Wars",
    difficulty: "Easy",
    timeMinutes: 30,
    description: "A smiling oden vendor cooking at a roadside stand with travellers passing by."
  },
  {
    title: "Laboratory Droid",
    anime: "Dr Stone",
    difficulty: "Medium",
    timeMinutes: 30,
    description: "A friendly lab robot painting a colourful masterpiece on an easel."
  },
  {
    title: "Giant Slumbering Titan",
    anime: "Attack on Titan",
    difficulty: "Hard",
    timeMinutes: 60,
    description: "A colossal dragon sleeping among the rooftops of a sleeping human city."
  },
  {
    title: "Fantasy Library",
    anime: "Ascendance of a Bookworm",
    difficulty: "Medium",
    timeMinutes: 45,
    description: "A hidden magical library with floating books and ancient stone shelves."
  },
  {
    title: "Musicians in the Park",
    anime: "Your Lie in April",
    difficulty: "Easy",
    timeMinutes: 30,
    description: "A street musician playing a flute while a crowd of animals listens."
  },
  {
    title: "Shadowy Chasm",
    anime: "Made in Abyss",
    difficulty: "Medium",
    timeMinutes: 45,
    description: "A lone adventurer balancing on a rope bridge above a bottomless chasm."
  },
  {
    title: "Monster Hunter Gear",
    anime: "Goblin Slayer",
    difficulty: "Medium",
    timeMinutes: 45,
    description: "A close-up of a monster hunter's armour, weapons and utility belt."
  },
  {
    title: "Ocean Surface",
    anime: "Ponyo",
    difficulty: "Easy",
    timeMinutes: 30,
    description: "A calm ocean at sunrise with a lone fishing boat melting into the horizon."
  },
  {
    title: "Desert Outpost",
    anime: "Trigun",
    difficulty: "Hard",
    timeMinutes: 60,
    description: "A smuggler's outpost in a sandstorm, with camouflaged vehicles and distant stars."
  },
  {
    title: "Elemental Flowers",
    anime: "Frieren",
    difficulty: "Medium",
    timeMinutes: 45,
    description: "Flowers made of flame, ice, vines and earth swirling together in one pot."
  },
  {
    title: "Science Fair Project",
    anime: "Steins Gate",
    difficulty: "Easy",
    timeMinutes: 30,
    description: "A quirky science fair poster explaining how to teleport cats using ancient stones."
  },
  {
    title: "Enchanted Cafe",
    anime: "Restaurant to Another World",
    difficulty: "Medium",
    timeMinutes: 45,
    description: "A warm cafe where the tables float and the servers are animals."
  },
  {
    title: "Skyscraper Rooftop Date",
    anime: "Your Name",
    difficulty: "Easy",
    timeMinutes: 30,
    description: "A quiet rooftop at night, two characters looking down at the city lights."
  },
  {
    title: "Time Travel Shopfront",
    anime: "Erased",
    difficulty: "Medium",
    timeMinutes: 45,
    description: "A doorway leading to a shop where you can buy items from different eras."
  },
  {
    title: "Magical Delivery",
    anime: "Kiki's Delivery Service",
    difficulty: "Easy",
    timeMinutes: 30,
    description: "A magi-penguin delivering parcels on a scooter through a snowy village."
  },
  {
    title: "Mechanical Toy Workshop",
    anime: "Howl's Moving Castle",
    difficulty: "Medium",
    timeMinutes: 45,
    description: "A child playing with a complicated new toy in a cluttered inventor's room."
  },
  {
    title: "Geomancer's Altar",
    anime: "Princess Mononoke",
    difficulty: "Hard",
    timeMinutes: 60,
    description: "A ritual site where streams of energy reshape mountains and valleys."
  },
  {
    title: "Neon Festival Tents",
    anime: "Anohana",
    difficulty: "Easy",
    timeMinutes: 30,
    description: "A festival in a digital world where traditional tents glow with electric strips."
  },
  {
    title: "Hydra School Outing",
    anime: "Miss Kobayashi's Dragon Maid",
    difficulty: "Easy",
    timeMinutes: 30,
    description: "Baby hydras having a picnic while a parent lectures them about eating salad."
  },
  {
    title: "Metal Alchemist Forge",
    anime: "Fullmetal Alchemist Brotherhood",
    difficulty: "Medium",
    timeMinutes: 45,
    description: "A forge on a floating sky island where an alchemist shapes metal limbs."
  },
  {
    title: "Sky Train Station",
    anime: "Spirited Away",
    difficulty: "Medium",
    timeMinutes: 45,
    description: "A futuristic station where passengers from different floating islands arrive."
  },
  {
    title: "Sea Serpent Passage",
    anime: "Children of the Sea",
    difficulty: "Hard",
    timeMinutes: 60,
    description: "A pirate ship sailing through a sea serpent migration."
  }
];
