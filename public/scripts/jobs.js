// Initialize Leaflet map centered on USA
const map = L.map('map').setView([39.5, -98.35], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markers = [];

// FETCH 3 — Load jobs from our backend
async function loadJobs() {
  const keyword = document.getElementById('keyword').value || 'technology';
  const container = document.getElementById('jobsContainer');
  container.innerHTML = '<p class="empty">Loading jobs...</p>';

  // Clear old markers
  markers.forEach(m => map.removeLayer(m));
  markers.length = 0;

  try {
    const res = await fetch(`/api/jobs?keyword=${keyword}`);
    const jobs = await res.json();

    if (jobs.length === 0) {
      container.innerHTML = '<p class="empty">No jobs found. Try a different keyword.</p>';
      return;
    }

    container.innerHTML = jobs.map((job, i) => `
      <div class="card">
        <h3>${job.title}</h3>
        <p>🏢 ${job.company}</p>
        <p>📍 ${job.location}</p>
        <p class="salary">💵 $${parseInt(job.salary_min).toLocaleString()} — $${parseInt(job.salary_max).toLocaleString()}</p>
        <a href="${job.url}" target="_blank" class="btn" style="text-align:center; display:block; text-decoration:none;">View Job</a>
        <button class="btn btn-primary" onclick="saveCareer('${job.title.replace(/'/g, '')}', '${job.salary_max}', '${job.location}')">⭐ Save Career</button>
      </div>
    `).join('');

    // Add markers to map for each job
    jobs.forEach(job => {
      // Use random US coords offset since USAJobs doesn't return lat/lng
      const lat = 37 + (Math.random() * 10 - 5);
      const lng = -98 + (Math.random() * 30 - 15);
      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${job.title}</b><br>${job.company}<br>${job.location}`);
      markers.push(marker);
    });

  } catch (err) {
    console.error('Error loading jobs:', err);
    container.innerHTML = '<p class="empty">Error loading jobs. Please try again.</p>';
  }
}

// FETCH — POST save a career to Supabase via our backend
async function saveCareer(title, salary, location) {
  try {
    const res = await fetch('/api/careers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        avg_salary: '$' + parseInt(salary).toLocaleString(),
        country: location
      })
    });
    const data = await res.json();
    if (data) {
      alert(`✅ "${title}" saved to your careers!`);
    }
  } catch (err) {
    console.error('Error saving career:', err);
    alert('❌ Failed to save career.');
  }
}

// Load default jobs on page load
loadJobs();