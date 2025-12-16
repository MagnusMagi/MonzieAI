/**
 * Subcategory mapping for organizing scenes by subcategories
 * Maps subcategory names to scene names within each category
 */

export interface SubcategoryMapping {
  [categoryId: string]: {
    [subcategoryName: string]: string[]; // Array of scene names
  };
}

export const subcategoryMapping: SubcategoryMapping = {
  professional: {
    'LinkedIn & Kariyer': [
      'Plaza Window',
      'Meeting Room',
      'Working Focus',
      'Corridor Walk',
      'Coffee Break',
      'Whiteboard Strategy',
      'Elevator Pitch',
      'Late Night Hustle',
      'The Handshake',
      'Reception Welcome',
    ],
    'Minimalist Studio': [
      'Dark Gray',
      'Pure White',
      'Textured Blue',
      'Warm Beige',
      'Black & White',
      'High Key White',
      'Silhouette Profile',
      'Textured Canvas',
      'Hands Framing',
      'Full Body Stool',
    ],
    'Leadership & Stage': [
      'The Speech',
      'Panel Discussion',
      'Award Winner',
      'Media Interview',
      'Office View Boss',
      'Boardroom Head',
      'Magazine Interview',
      'Backstage Prep',
      'Signing Ceremony',
      'Visionary Point',
    ],
  },
  travel: {
    'European Summer': [
      'Paris Cafe',
      'Italian Streets',
      'Santorini Blue',
      'London Calling',
      'Venice Gondola',
      'Rome Colosseum',
      'French Riviera Boat',
      'Spanish Steps',
      'Bicycle Flower',
      'Gelato Joy',
    ],
    'Tropical Paradise': [
      'Turquoise Water',
      'Jungle Pool',
      'Sunset Cocktail',
      'Palm Tree Shadow',
      'Yacht Life',
      'Underwater',
      'Waterfall Shower',
      'Floating Breakfast',
      'Night Tiki Bar',
      'Paddleboard',
    ],
    'Winter Escape': [
      'Ski Slope',
      'Cozy Cabin',
      'Snowy Forest',
      'Ice Skating',
      'Northern Lights',
      'Hot Tub Snow',
      'Dog Sledding',
      'Reindeer Friend',
      'Ski Lift View',
      'Snow Angel',
    ],
  },
  social_media: {
    'Coffee & Chill': [
      'Window Seat',
      'The Barista Shot',
      'Brunch Date',
      'Latte Art',
      'Laptop Work',
      'Reading Paper',
      'Pouring Shot',
      'To-Go Walk',
      'Bakery Counter',
      'Rooftop Coffee',
    ],
    'Urban Street Style': [
      'Graffiti Wall',
      'Neon Night',
      'Subway Motion',
      'Rooftop View',
      'Stairs & Symmetry',
      'Chain Link',
      'Crossing Walk',
      'Basketball Hoop',
      'Bridge View',
      'Fire Escape',
    ],
    'Cozy Home': [
      'Bed & Breakfast',
      'Kitchen Fun',
      'Plant Lover',
      'Mirror Selfie',
      'Pet Cuddle',
      'Painting Hobby',
      'Vinyl Record',
      'Gamer Couch',
      'Bath Time',
      'Balcony Garden',
    ],
  },
  nostalgia: {
    '90s Yearbook': [
      'Classic Blue',
      'The Varsity',
      'Grunge Style',
      'Library Nerd',
      'Prom Night',
      'Laser Purple',
      'Double Denim',
      'Walkman',
      'Mall Goth',
      'Skater Boy/Girl',
    ],
    'Vintage Film': [
      '70s Disco',
      '50s Diner',
      'Film Noir',
      '80s Aerobics',
      'Polaroid Party',
      'Hippie Flower Power',
      '20s Gangster',
      'Drive-In Cinema',
      'Gas Station',
      'Vinyl Store',
    ],
    'Historical Eras': [
      'The Great Gatsby',
      'Victorian Royalty',
      'Wild West',
      'Renaissance Painting',
      'Viking Warrior',
      'Roman Emperor',
      'Egyptian Pharaoh',
      'Pirate Captain',
      'Samurai',
      '1800s Explorer',
    ],
  },
  wedding: {
    'Classic Wedding': [
      'The Altar',
      'Sunset Veil/Tie',
      'Manor Steps',
      'Getting Ready',
      'Confetti Exit',
      'Cutting Cake',
      'First Dance',
      'Getting Ready Squad',
      'Ring Exchange',
      'Vintage Car Exit',
    ],
    'Red Carpet': [
      'Paparazzi Flash',
      'Limousine Arrival',
      'Award Stage',
      'Champagne Tower',
      'Magazine Cover',
      'Interview Grid',
      'Fan Selfie',
      'After Party',
      'Limo Interior',
      'Vanity Mirror',
    ],
    'Bohemian/Rustic': [
      'Forest Fairy',
      'Beach Vows',
      'Barn Lights',
      'Wheat Field',
      'Bonfire Night',
      'Flower Swing',
      'Barefoot Stream',
      'Lantern Festival',
      'Picnic Setup',
      'Greenhouse',
    ],
  },
  fantasy: {
    'Medieval Fantasy': [
      'The Knight',
      'The Elf Mage',
      'The Rogue',
      'The Royal',
      'The Tavern Keeper',
      'Archer Ranger',
      'Tavern Bard',
      'Alchemist',
      'Blacksmith',
      'Mounted Royal',
    ],
    Cyberpunk: [
      'Neon Rain',
      'The Hacker',
      'Cyborg',
      'Space Pilot',
      'Wasteland Survivor',
      'Motorcycle Helmet',
      'Bio-Hacker',
      'Hologram Map',
      'Drone Operator',
      'Ramen Stand',
    ],
    Superhero: [
      'Rooftop Watch',
      'Energy Power',
      'Secret Identity',
      'The Villain',
      'Flying',
      'Impact Landing',
      'Floating Meditation',
      'Forcefield',
      'Sidekick Team',
      'City Saviour',
    ],
  },
  sports: {
    'Gym & Workout': [
      'The Pump',
      'Cardio Run',
      'Yoga Zen',
      'Crossfit Battle',
      'Locker Room',
      'Stretching Mat',
      'Water Break',
      'Treadmill Sprint',
      'Chalk Hands',
      'Mirror Flex',
    ],
    'Extreme Sports': [
      'Surfing',
      'Snowboarding',
      'Rock Climbing',
      'Motocross/Biker',
      'Skydiving',
      'Skate Trick',
      'Parkour Jump',
      'Scuba Diver',
      'Rally Driver',
      'Bungee Jump',
    ],
    'Team Sports': [
      'Soccer Star',
      'Basketball Court',
      'Tennis Serve',
      'Boxing Ring',
      'The Medal',
      'Volleyball Spike',
      'Baseball Swing',
      'Rugby Scrum',
      'Ice Hockey',
      'Golf Swing',
    ],
  },
  fashion: {
    Editorial: [
      'Wind Machine',
      'Avant-Garde',
      'Monochrome',
      'The Runway',
      'Jewelry Focus',
      'Mirror Reflection',
      'Water Surface',
      'Color Block',
      'Shadow Play',
      'Fabric Toss',
    ],
    'Old Money': [
      'Tennis Club',
      'Equestrian',
      'Classic Convertible',
      'Yacht Deck',
      'Golf Course',
      'Polo Horse',
      'Library Reading',
      'Garden Party',
      'Vintage Watch',
      'Opera Box',
    ],
    Streetwear: [
      'Sneakerhead',
      'Industrial Alley',
      'Neon Mask/Glasses',
      'Skate Park',
      'Subway Fashion',
      'Hoodie Up',
      'Sneaker Wall',
      'Concrete Jungle',
      'Night Flash',
      'Subway Seat',
    ],
  },
  art: {
    'Classic Art': [
      'Van Gogh',
      'Marble Statue',
      'Renaissance',
      'Charcoal Sketch',
      'Watercolor',
      'Pop Art Warhol',
      'Surrealism Dali',
      'Cyber-Renaissance',
      'Pixel Art',
      'Graffiti Stencil',
    ],
    'Anime & Manga': [
      'Studio Ghibli',
      'Cyberpunk Anime',
      '90s Retro Anime',
      'Shonen Action',
      'Manga Page',
      'Mech Pilot',
      'Slice of Life School',
      'Magical Transformation',
      'Dark Fantasy Demon',
      'Sports Ace',
    ],
    '3D & Digital Art': [
      'Pixar Style',
      'Low Poly Retro',
      'Voxel/Minecraft',
      'Sims Character',
      'Claymation',
      'Fortnite Style',
      'Clay Icon',
      'Funko Pop',
      'Lego Figure',
      'VR Avatar',
    ],
  },
  funny: {
    'GTA Style': [
      'GTA V Loading Screen',
      'Vice City Neon',
      'San Andreas',
      'Heist Crew',
      'Wasted',
      'Helicopter Pilot',
      'Strip Club Neon',
      'Police Chase',
      'Gang Territory',
      'Safehouse Plan',
    ],
    Seasonal: [
      'Christmas',
      'Halloween',
      "Valentine's",
      'Summer Vibes',
      'New Year',
      'Easter Bunny',
      'Thanksgiving',
      "St Patrick's",
      'Birthday Blow',
      'Graduation',
    ],
    'Viral Memes': [
      'This is Fine',
      'Mugshot',
      'Distracted',
      'Disaster Girl',
      'Barbie Box',
      'Success Kid',
      'Roll Safe / Thinking',
      'Woman Yelling / Cat',
      'Stonks',
      'Gigachad',
    ],
  },
};

/**
 * Get subcategories for a category
 */
export function getSubcategoriesForCategory(categoryId: string): string[] {
  return Object.keys(subcategoryMapping[categoryId] || {});
}

/**
 * Get scenes for a subcategory within a category
 */
export function getScenesForSubcategory(categoryId: string, subcategoryName: string): string[] {
  return subcategoryMapping[categoryId]?.[subcategoryName] || [];
}

/**
 * Find subcategory for a scene name
 */
export function findSubcategoryForScene(categoryId: string, sceneName: string): string | null {
  const categoryMapping = subcategoryMapping[categoryId];
  if (!categoryMapping) return null;

  const subcategoryNames = Object.keys(categoryMapping);
  for (const subcategoryName of subcategoryNames) {
    const sceneNames = categoryMapping[subcategoryName];
    if (sceneNames.indexOf(sceneName) !== -1) {
      return subcategoryName;
    }
  }
  return null;
}
