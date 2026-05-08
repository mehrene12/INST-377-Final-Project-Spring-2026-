const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markers = [];

// Major to country suggestions mapping
const majorCountries = {
  'computer science': ['United States', 'Canada', 'Germany', 'United Kingdom', 'Australia'],
  'engineering': ['Germany', 'United States', 'Japan', 'Canada', 'Singapore'],
  'business': ['United States', 'United Kingdom', 'France', 'Switzerland', 'Canada'],
  'medicine': ['United States', 'United Kingdom', 'Australia', 'Germany', 'Netherlands'],
  'data science': ['United States', 'Canada', 'United Kingdom', 'Netherlands', 'Australia'],
  'law': ['United States', 'United Kingdom', 'Australia', 'Canada', 'Germany'],
  'psychology': ['United States', 'United Kingdom', 'Canada', 'Australia', 'Netherlands'],
  'education': ['Finland', 'Canada', 'United States', 'Australia', 'United Kingdom'],
};

async function searchUniversities() {
  const major = document.getElementById('majorInput').value.trim().toLowerCase();
  const container = document.getElementById('countryContainer');
  container.innerHTML = '<p class="empty">Loading universities...</p>';

  // Clear old markers
  markers.forEach(m => map.removeLayer(m));
  markers.length = 0;

  // Find best countries for this major
  let countries = majorCountries[major];
  if (!countries) {
    // default fallback
    countries = ['United States', 'Canada', 'United Kingdom'];
  }

  try {
    // Fetch universities for each country
    const allResults = [];

    for (const country of countries.slice(0, 3)) {
      const res = await fetch(`https://universities.hipolabs.com/search?name=&country=${encodeURIComponent(country)}`);
      const unis = await res.json();
      // take top 2 unis per country
      unis.slice(0, 2).forEach(u => {
        allResults.push({ ...u, country });
      });
    }

    if (allResults.length === 0) {
      container.innerHTML = '<p class="empty">No universities found.</p>';
      return;
    }

    container.innerHTML = allResults.map(u => `
      <div class="card">
        <h3>🏛️ ${u.name}</h3>
        <p>🌍 Country: ${u.country}</p>
        <p>🎓 Best for: ${major || 'General Studies'}</p>
        <p>🌐 <a href="${u.web_pages?.[0]}" target="_blank" style="color:#00d4aa;">Visit Website</a></p>
      </div>
    `).join('');

    // Add map markers using country data
    for (const country of countries.slice(0, 3)) {
      const geoRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`);
      const geoData = await geoRes.json();
      if (Array.isArray(geoData) && geoData[0]?.latlng) {
        const [lat, lng] = geoData[0].latlng;
        const marker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`<b>${country}</b><br>Top destination for ${major}`);
        markers.push(marker);
        map.setView([lat, lng], 2);
      }
    }

  } catch (err) {
    console.error('Error:', err);
    container.innerHTML = '<p class="empty">Error loading data. Please try again.</p>';
  }
}