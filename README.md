# Pet Food Advisor

A starter app that recommends pet foods based on species, age, weight and health conditions.

Goals
- Allow consumers to get food recommendations for their pet by specifying species (dog/cat), age, weight and any health conditions (e.g., obesity, kidney disease, diabetes, allergies).
- Provide an API endpoint that returns ranked recommendations and reasons.
- Provide a tiny frontend demo to try the API quickly.

Quick start (local)
1. Backend
   - cd backend
   - npm install
   - npm start
   - Server will run on http://localhost:4000

2. Frontend (development)
   - cd frontend
   - npm install
   - npm start
   - Open http://localhost:3000

API
- GET /api/recommendations
  Query parameters:
  - species (required): dog | cat
  - ageMonths (optional): number (pet age in months). If omitted, ageGroup may be used.
  - ageGroup (optional): puppy/kitten | adult | senior
  - weightKg (optional): number
  - health (optional): comma-separated list of health conditions. Supported: obesity, diabetes, kidney, allergies, sensitive_stomach

Examples:
- /api/recommendations?species=dog&ageMonths=8
- /api/recommendations?species=cat&ageGroup=senior&health=diabetes,allergies

Response (200)
{
  "pet": { "species": "dog", "ageMonths": 8, "health": ["obesity"] },
  "recommendations": [
    {
      "id": "food-1",
      "name": "LeanDog Adult Formula",
      "score": 87,
      "reasons": [
         "Lower calorie count for weight management",
         "High fiber to increase satiety"
      ],
      "meta": { "caloriesPer100g": 320, "proteinPercent": 26 }
    },
    ...
  ]
}

Notes & next steps
- The sample dataset is small; for real use you should ingest a catalog (CSV/DB) containing ingredient lists, guaranteed analysis, kcal, fiber, fat, carbohydrate breakdown)
- We built the scoring engine as an extensible function in backend/src/recommendations.js — add more rules (e.g., nutrient thresholds) there.
