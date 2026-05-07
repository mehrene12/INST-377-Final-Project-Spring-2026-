const dotenv = require('dotenv');
dotenv.config();
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

// ENDPOINT 3 — GET jobs from USAJobs (US government job board)
app.get('/api/jobs', async (req, res) => {
  try {
    const keyword = req.query.keyword || 'technology';
    
    const jobsRes = await fetch(
      `https://data.usajobs.gov/api/search?Keyword=${keyword}&ResultsPerPage=20`,
      {
        headers: {
          'Host': 'data.usajobs.gov',
          'User-Agent': process.env.USAJOBS_EMAIL,
          'Authorization-Key': process.env.USAJOBS_KEY
        }
      }
    );
    const jobsData = await jobsRes.json();

    const jobs = jobsData.SearchResult.SearchResultItems.map(item => ({
      title: item.MatchedObjectDescriptor.PositionTitle,
      company: item.MatchedObjectDescriptor.OrganizationName,
      location: item.MatchedObjectDescriptor.PositionLocationDisplay,
      salary_min: item.MatchedObjectDescriptor.PositionRemuneration[0].MinimumRange,
      salary_max: item.MatchedObjectDescriptor.PositionRemuneration[0].MaximumRange,
      url: item.MatchedObjectDescriptor.PositionURI
    }));

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});
app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});