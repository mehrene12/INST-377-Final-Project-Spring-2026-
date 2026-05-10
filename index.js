const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

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

// ENDPOINT 3 — GET jobs from USAJobs
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

// ENDPOINT 4 — GET universities by major
app.get('/api/universities', async (req, res) => {
  const major = req.query.major?.toLowerCase() || 'computer science';
  const majorUniversities = {
    'computer science': [
      { name: 'MIT', country: 'United States', url: 'https://www.mit.edu' },
      { name: 'Stanford University', country: 'United States', url: 'https://www.stanford.edu' },
      { name: 'University of Toronto', country: 'Canada', url: 'https://www.utoronto.ca' },
      { name: 'ETH Zurich', country: 'Switzerland', url: 'https://ethz.ch' },
      { name: 'University of Cambridge', country: 'United Kingdom', url: 'https://www.cam.ac.uk' },
      { name: 'Technical University of Munich', country: 'Germany', url: 'https://www.tum.de' },
    ],
    'business': [
      { name: 'Harvard Business School', country: 'United States', url: 'https://www.hbs.edu' },
      { name: 'Wharton School', country: 'United States', url: 'https://www.wharton.upenn.edu' },
      { name: 'London Business School', country: 'United Kingdom', url: 'https://www.london.edu' },
      { name: 'INSEAD', country: 'France', url: 'https://www.insead.edu' },
      { name: 'University of Toronto Rotman', country: 'Canada', url: 'https://www.rotman.utoronto.ca' },
    ],
    'engineering': [
      { name: 'MIT', country: 'United States', url: 'https://www.mit.edu' },
      { name: 'Caltech', country: 'United States', url: 'https://www.caltech.edu' },
      { name: 'TU Munich', country: 'Germany', url: 'https://www.tum.de' },
      { name: 'University of Tokyo', country: 'Japan', url: 'https://www.u-tokyo.ac.jp' },
      { name: 'Imperial College London', country: 'United Kingdom', url: 'https://www.imperial.ac.uk' },
    ],
    'data science': [
      { name: 'Carnegie Mellon University', country: 'United States', url: 'https://www.cmu.edu' },
      { name: 'Stanford University', country: 'United States', url: 'https://www.stanford.edu' },
      { name: 'University of British Columbia', country: 'Canada', url: 'https://www.ubc.ca' },
      { name: 'University of Amsterdam', country: 'Netherlands', url: 'https://www.uva.nl' },
      { name: 'ETH Zurich', country: 'Switzerland', url: 'https://ethz.ch' },
    ],
    'medicine': [
      { name: 'Johns Hopkins University', country: 'United States', url: 'https://www.jhu.edu' },
      { name: 'Harvard Medical School', country: 'United States', url: 'https://hms.harvard.edu' },
      { name: 'University of Oxford', country: 'United Kingdom', url: 'https://www.ox.ac.uk' },
      { name: 'Karolinska Institute', country: 'Sweden', url: 'https://ki.se' },
      { name: 'University of Melbourne', country: 'Australia', url: 'https://www.unimelb.edu.au' },
    ],
    'law': [
      { name: 'Yale Law School', country: 'United States', url: 'https://law.yale.edu' },
      { name: 'Harvard Law School', country: 'United States', url: 'https://hls.harvard.edu' },
      { name: 'University of Oxford', country: 'United Kingdom', url: 'https://www.ox.ac.uk' },
      { name: 'London School of Economics', country: 'United Kingdom', url: 'https://www.lse.ac.uk' },
      { name: 'University of Toronto', country: 'Canada', url: 'https://www.utoronto.ca' },
    ],
    'psychology': [
      { name: 'Stanford University', country: 'United States', url: 'https://www.stanford.edu' },
      { name: 'Harvard University', country: 'United States', url: 'https://www.harvard.edu' },
      { name: 'University of Cambridge', country: 'United Kingdom', url: 'https://www.cam.ac.uk' },
      { name: 'University of Amsterdam', country: 'Netherlands', url: 'https://www.uva.nl' },
      { name: 'McGill University', country: 'Canada', url: 'https://www.mcgill.ca' },
    ],
  };

  const results = majorUniversities[major] || [
    { name: 'Harvard University', country: 'United States', url: 'https://www.harvard.edu' },
    { name: 'University of Oxford', country: 'United Kingdom', url: 'https://www.ox.ac.uk' },
    { name: 'University of Toronto', country: 'Canada', url: 'https://www.utoronto.ca' },
  ];

  res.json({ major, universities: results });
});

// app.listen MUST be last
app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});