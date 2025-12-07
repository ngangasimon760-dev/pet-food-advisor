import React, { useState } from 'react';

export default function App() {
  const [species, setSpecies] = useState('dog');
  const [ageMonths, setAgeMonths] = useState('');
  const [health, setHealth] = useState('');
  const [results, setResults] = useState(null);

  async function search(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('species', species);
    if (ageMonths) params.set('ageMonths', ageMonths);
    if (health) params.set('health', health);
    const res = await fetch(`http://localhost:4000/api/recommendations?${params.toString()}`);
    const json = await res.json();
    setResults(json.recommendations || []);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Pet Food Advisor (demo)</h2>
      <form onSubmit={search}>
        <label>
          Species:
          <select value={species} onChange={e => setSpecies(e.target.value)}>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
          </select>
        </label>
        <br />
        <label>
          Age (months):
          <input type="number" value={ageMonths} onChange={e => setAgeMonths(e.target.value)} />
        </label>
        <br />
        <label>
          Health (comma-separated):
          <input value={health} onChange={e => setHealth(e.target.value)} placeholder="obesity,diabetes" />
        </label>
        <br />
        <button type="submit">Get recommendations</button>
      </form>

      <div style={{ marginTop: 20 }}>
        {results && results.length === 0 && <div>No matches found.</div>}
        {results && results.map(r => (
          <div key={r.id} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 10 }}>
            <h4>{r.name} — score {r.score}</h4>
            <div>Reasons:</div>
            <ul>
              {r.reasons.map((reason, idx) => <li key={idx}>{reason}</li>)}
            </ul>
            <div>Meta: calories {r.meta.caloriesPer100g} kcal/100g — protein {r.meta.proteinPercent}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
