// Simple recommendation engine: loads sample data and scores foods
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'pet_foods.json');
const DATA = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

/**
 * Convert ageMonths or ageGroup to canonical ageGroup (puppy/kitten | adult | senior)
 */
function determineAgeGroup(pet) {
  if (pet.ageGroup) return pet.ageGroup;
  if (typeof pet.ageMonths === 'number') {
    const m = pet.ageMonths;
    if (m < 12) return pet.species === 'cat' ? 'kitten' : 'puppy';
    if (m < 84) return 'adult';
    return 'senior';
  }
  return 'adult';
}

function scoreFood(food, pet) {
  let score = 0;
  const reasons = [];

  // Must match species
  if (!food.species.includes(pet.species)) return null;

  // Age match
  const petAgeGroup = determineAgeGroup(pet);
  if (!food.ageGroups.includes(petAgeGroup)) return null;
  score += 30;
  reasons.push(`Matches age group: ${petAgeGroup}`);

  // Health conditions adjustments
  (pet.health || []).forEach(cond => {
    if (cond === 'obesity') {
      // Prefer lower caloriesPer100g
      if (food.caloriesPer100g <= 340) {
        score += 20;
        reasons.push('Lower calories suitable for weight management');
      } else {
        score -= 10;
        reasons.push('High calories — not ideal for obesity');
      }
    }
    if (cond === 'diabetes') {
      // Prefer higher protein, lower carbs (we lack carbs field, use protein heuristic)
      if ((food.proteinPercent || 0) >= 28) {
        score += 15;
        reasons.push('Higher protein good for diabetes management');
      } else {
        score -= 5;
      }
    }
    if (cond === 'kidney') {
      // Prefer moderate-to-low protein
      if ((food.proteinPercent || 0) <= 24) {
        score += 10;
        reasons.push('Lower protein for kidney support');
      } else {
        score -= 10;
        reasons.push('High protein — avoid in advanced kidney disease');
      }
    }
    if (cond === 'allergies') {
      // If any ingredient in food matches reported allergens, skip (we expect user to additionally provide allergens in future)
      if (food.allergenIngredients && food.allergenIngredients.length > 0) {
        // For now, demote foods with common allergens like 'chicken' and 'beef'
        score -= 20;
        reasons.push('Contains common allergens — check detailed ingredient list');
      } else {
        score += 5;
        reasons.push('Limited common allergens');
      }
    }
    if (cond === 'sensitive_stomach') {
      if (food.isGentle) {
        score += 10;
        reasons.push('Gentle formula suitable for sensitive stomach');
      } else {
        score -= 5;
      }
    }
  });

  // Weight-specific (very light heuristic)
  if (pet.weightKg && pet.weightKg > 0 && pet.species === 'dog') {
    if (pet.weightKg > 35 && food.kibbleSize && food.kibbleSize === 'large') {
      score += 5;
      reasons.push('Appropriate kibble size for larger dog');
    }
  }

  // Base preference: high protein better for active pets
  score += (food.proteinPercent || 0) * 0.5;

  // Normalize score to 0..100 roughly
  if (score < 0) score = Math.max(0, 50 + score); // reduce but not negative
  if (score > 100) score = 100;

  return {
    id: food.id,
    name: food.name,
    score: Math.round(score),
    reasons,
    meta: {
      caloriesPer100g: food.caloriesPer100g,
      proteinPercent: food.proteinPercent
    }
  };
}

function getRecommendations(pet) {
  const scored = DATA.map(food => scoreFood(food, pet)).filter(Boolean);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 10);
}

module.exports = {
  getRecommendations
};
