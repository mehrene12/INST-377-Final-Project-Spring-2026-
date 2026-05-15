const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markers = [];

async function searchUniversities() {
  const major = document.getElementById('majorInput').value.trim().toLowerCase();
  if (!major) return;

  const container = document.getElementById('countryContainer');
  container.innerHTML = '<p class="empty">Loading universities...</p>';

  markers.forEach(m => map.removeLayer(m));
  markers.length = 0;

  try {
    const res = await fetch(`/api/universities?major=${encodeURIComponent(major)}`);
    const data = await res.json();
    const unis = data.universities;

    container.innerHTML = unis.map(u => `
      <div class="card">
        <h3> ${u.name}</h3>
        <p> ${u.country}</p>
        <p>Best for: ${data.major}</p>
        <p> <a href="${u.url}" target="_blank" style="color:#800000;">Visit Website</a></p>
      </div>
    `).join('');

    const uniqueCountries = [...new Set(unis.map(u => u.country))];

    for (const country of uniqueCountries) {
      try {
        const geoRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`);
        if (!geoRes.ok) continue; // skip if bad response, don't crash
        const geoData = await geoRes.json();
        if (Array.isArray(geoData) && geoData[0]?.latlng) {
          const [lat, lng] = geoData[0].latlng;
          const marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`<b>${country}</b><br>Top destination for ${major}`);
          markers.push(marker);
        }
      } catch (geoErr) {
        // Map pin failed for this country — log it but keep going
        console.warn(`Could not load map pin for ${country}:`, geoErr);
      }
    }

    map.setView([20, 0], 2);

  } catch (err) {
    console.error('Error loading universities:', err);
    container.innerHTML = '<p class="empty">Error loading data. Please try again.</p>';
  }
}