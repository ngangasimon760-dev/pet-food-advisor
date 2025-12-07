const express = require('express');
const cors = require('cors');
const recommendations = require('./recommendations');

const app = express();
app.use(cors());
app.use(express.json());

// Simple health
app.get('/', (req, res) => res.json({ msg: 'Pet Food Advisor API' }));

// GET /api/recommendations?species=dog&ageMonths=8&weightKg=12&health=obesity,allergies
app.get('/api/recommendations', (req, res) => {
  try {
    const { species, ageMonths, ageGroup, weightKg, health } = req.query;
    if (!species) return res.status(400).json({ error: 'species is required' });

    const healthList = health ? health.split(',').map(h => h.trim()).filter(Boolean) : [];
    const ageMonthsNum = ageMonths ? Number(ageMonths) : undefined;

    const pet = { species, ageMonths: ageMonthsNum, ageGroup, weightKg: weightKg ? Number(weightKg) : undefined, health: healthList };

    const recs = recommendations.getRecommendations(pet);

    return res.json({ pet, recommendations: recs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
