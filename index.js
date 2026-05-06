require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // serves your HTML pages

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

// ENDPOINT 1 — GET all saved careers from Supabase
app.get('/api/careers', async (req, res) => {
  const { data, error } = await supabase.from('careers').select();
  if (error) { res.status(500).send(error); }
  else { res.json(data); }
});

// ENDPOINT 2 — POST save a career to Supabase
app.post('/api/careers', async (req, res) => {
  const { title, avg_salary, country } = req.body;
  const { data, error } = await supabase
    .from('careers')
    .insert({ title, avg_salary, country })
    .select();
  if (error) { res.status(500).send(error); }
  else { res.json(data); }
});

// ENDPOINT 3 — GET jobs from Arbeitnow + exchange rate
app.get('/api/jobs', async (req, res) => {
  try {
    const jobsRes = await fetch('https://www.arbeitnow.com/api/job-board-api');
    const jobsData = await jobsRes.json();

    const ratesRes = await fetch('https://open.er-api.com/v6/latest/USD');
    const ratesData = await ratesRes.json();

    const jobs = jobsData.data.slice(0, 20).map(job => ({
      title: job.title,
      company: job.company_name,
      location: job.location,
      tags: job.tags,
      url: job.url,
      eur_rate: ratesData.rates.EUR
    }));

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});