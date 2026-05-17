#CareerPath

## Description

CareerPath is a web application designed to help students explore career options, compare salaries, and research graduate school opportunities around the world. Users of this application can search U.S government job listings by keyword (such as engineer, lawyer, doctor,etc.), save desired career options, and review a salary comparison chart built from live job data. They may also explore the best universities around the world that align with their desired major.

The objective of this project is to ensure that students feel confident in their decisions post-graduation; whether they pursue higher education or careers that align with their experience, each student should have the ability to access proper guidance for their career. This application is built as a final project for INST 377 at the University of Maryland.

## Target Browsers

CareerPath is designed primarily for **desktop browsers** but is accessible on mobile devices as well.

Supported browsers include:

- Google Chrome (recommended)
- Mozilla Firefox
- Apple Safari
- Microsoft Edge

Mobile support:

- iOS Safari (iPhone/iPad)
- Android Chrome

---

## Link to Developer Manual

See the [Developer Manual](#developer-manual) below.

---

# Developer Manual

# Audience

This manual is intended for future developers who will take over and continue development of CareerPath. It assumes familiarity with web development concepts, Node.js, and REST APIs, but does not assume prior knowledge of this specific system.

---

## Installation

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- A Supabase account and project

### Steps

1. **Clone the repository**

```bash
git clone https://github.com/Malaika1712137/INST-377-Final-Project-Spring-2026-.git
cd INST-377-Final-Project-Spring-2026-
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root of the project with the following:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
USAJOBS_EMAIL=your_email_registered_with_usajobs
USAJOBS_KEY=your_usajobs_api_key
```

- Retrieve your Supabase URL and key from your [Supabase dashboard](https://supabase.com) under Project Settings → API
- Retrieve your USAJobs API key by registering at [developer.usajobs.gov](https://developer.usajobs.gov)

4. **Set up the Supabase database**
   Run the following SQL in your Supabase SQL Editor to create the required table:

```sql
CREATE TABLE careers (
  id SERIAL PRIMARY KEY,
  title TEXT,
  avg_salary TEXT,
  country TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE careers DISABLE ROW LEVEL SECURITY;
```

---

## Running the Application

Start the server from the project root directory:

```bash
node index.js
```

The app will run at:

```
http://localhost:3000
```

Open this URL in your browser to use the application.

---

## Running Tests

There are currently no automated tests written for this project. Manual testing can be performed by:

1. Starting the server with `node index.js`
2. Opening `http://localhost:3000` in a browser
3. Testing each page and feature:
   - Search jobs by keyword on the Jobs page
   - Save a career and verify it appears on the Home page
   - Search universities by major on the Grad School page
   - Verify the salary chart loads on the Home page
     Future developers are encouraged to add automated tests using a framework such as [Jest](https://jestjs.io/) or [Mocha](https://mochajs.org/).

---

## API Endpoints

### `GET /api/careers`

Retrieves all saved careers from the Supabase database.

- **Response:** Array of career objects

```json
[
  {
    "id": 1,
    "title": "IT Specialist",
    "avg_salary": "$106,437",
    "country": "Washington, DC",
    "created_at": "2026-05-14T00:00:00"
  }
]
```

---

### `POST /api/careers`

Saves a new career to the Supabase database.

- **Request Body:**

```json
{
  "title": "IT Specialist",
  "avg_salary": "$106,437",
  "country": "Washington DC, U.S.A"
}
```

- **Response:** The newly inserted career object

---

### `DELETE /api/careers/:id`
Deletes a saved career by ID.

**Example:** `DELETE /api/careers/3`

**Response:**
```json
{ "message": "Career deleted" }
```

### `GET /api/jobs`

Fetches job listings from the USAJobs external API.

- **Query Parameters:** `keyword` (e.g. `?keyword=engineering`)
- **Response:** Array of job objects

```json
[
  {
    "title": "IT Specialist",
    "company": "Dept. of Defense",
    "location": "Washington DC, U.S.A",
    "salary_min": "106437",
    "salary_max": "138370",
    "url": "https://www.usajobs.gov/..."
  }
]
```

---

### `GET /api/universities`

Returns a curated list of top universities for a given major.

- **Query Parameters:** `major` (e.g. `?major=computer science`)
- **Supported majors:** computer science, business, engineering, data science, medicine, law, psychology
- **Response:**

```json
{
  "major": "computer science",
  "universities": [
    {
      "name": "MIT",
      "country": "United States",
      "url": "https://www.mit.edu"
    }
  ]
}
```

---

## Known Bugs

- **Map pins on Grad School page:** The REST Countries API (`restcountries.com`) is occasionally unavailable. When this happens, map pins will not appear on the map, but university cards will still display correctly. This is handled gracefully with a try/catch so it does not crash the page.
- **Supabase RLS:** The `careers` table requires Row Level Security to be disabled for write operations to work. If careers are not saving, verify that RLS is disabled on the `careers` table in the Supabase dashboard.
- **No duplicate prevention:** Saving the same job multiple times adds multiple entries to the database with no warning to the user.

---

## Roadmap for Future Development

- **User authentication:** Add login functionality so saved careers are tied to individual user accounts rather than a shared database
- **Expanded university data:** Add more majors and pull university data from a live external API rather than a hardcoded list
- **Job filtering:** Allow users to filter job listings by salary range, location, or agency
- **Mobile responsiveness:** Further improve the layout and usability on smaller screen sizes


