// FETCH 1 — Load saved careers from Supabase via our backend
async function loadSavedCareers() {
  try {
    const res = await fetch('/api/careers');
    const data = await res.json();
    const container = document.getElementById('savedCareers');

    if (data.length === 0) {
      container.innerHTML = '<p class="empty">No saved careers yet. Browse jobs and save some!</p>';
    } else {
      container.innerHTML = data.map(c => `
        <div class="card">
          <h3>${c.title}</h3>
          <p>📍 ${c.country}</p>
          <p class="salary"> ${c.avg_salary}</p>
          <button class="btn" onclick="deleteCareer(${c.id})">🗑️ Remove</button>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading careers:', err);
  }
}

async function deleteCareer(id) {
  try {
    await fetch(`/api/careers/${id}`, { method: 'DELETE' });
    loadSavedCareers(); // refresh the list
  } catch (err) {
    console.error('Error deleting career:', err);
  }
}
// FETCH 2 — Load jobs and build salary chart using Chart.js
async function loadSalaryChart() {
  try {
    const res = await fetch('/api/jobs?keyword=technology');
    const jobs = await res.json();
    const top6 = jobs.slice(0, 6);

    const labels = top6.map(j => j.title.substring(0, 25) + '...');
    const salaries = top6.map(j => parseInt(j.salary_max));

    new Chart(document.getElementById('salaryChart'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Max Salary (USD)',
          data: salaries,
          backgroundColor: '#6B2737',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  } catch (err) {
    console.error('Error loading chart:', err);
  }
}

loadSavedCareers();
loadSalaryChart();