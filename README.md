# ResumeAI Agent — AI Career Assistance & ML Job Recommendation System

**Course Project:** Machine Learning & Intelligent Agents  
**Product Name:** ResumeAI Agent  
**Original GitHub Repository:** [https://github.com/Shailesh7449/ResumeAI-Course-Project](https://github.com/Shailesh7449/ResumeAI-Course-Project)  
**Deployed Applet:** [https://resumeaicourseproject.vercel.app/](https://resumeaicourseproject.vercel.app/)  

---

## 1. System Overview & Architecture

ResumeAI Agent is an end-to-end full-stack intelligent career assistant that transforms standard resume text into structured technical embeddings, evaluates candidate-to-job compatibility using an explainable **Hybrid Machine Learning Ranking Engine**, and orchestrates natural language career workflows via an **Autonomous Career Agent**.

### Core Architecture Layers:
1. **Resume Intelligence & Parser:** Normalizes uploaded PDF, DOCX, and TXT documents, extracts candidate contact information, categorizes skills across standardized canonical taxonomies with alias resolution, and scores documents against Applicant Tracking System (ATS) heuristics.
2. **Machine Learning Recommendation Engine:**
   - **Baseline Model:** Term Frequency - Inverse Document Frequency (TF-IDF) feature extraction with sub-linear frequency scaling and vector space cosine similarity:
     $$\cos(v_r, v_j) = \frac{v_r \cdot v_j}{\|v_r\|_2 \|v_j\|_2}$$
   - **Proposed Multi-Stage Hybrid Ranker:**
     $$\text{HybridScore} = \alpha \cdot \text{SemanticScore} + \beta \cdot \text{SkillCoverage} + \gamma \cdot \text{PreferenceScore}$$
     $$\text{subject to } \alpha \ge 0, \beta \ge 0, \gamma \ge 0, \quad \alpha + \beta + \gamma = 1.0$$
3. **ML Evaluation Pipeline:** Computes reproducible ranking metrics against human-labeled ground truth judgments:
   - **Precision@5 (P@5)**
   - **Recall@5**
   - **Normalized Discounted Cumulative Gain (NDCG@5)**
   - **Inference Latency (ms)**
4. **Autonomous Career Agent:** Natural-language agent capable of interpreting candidate intent and executing real application tools (`search_jobs`, `get_job_details`, `explain_job_match`, `identify_skill_gaps`, `draft_resume_summary`, `draft_cover_letter`, `save_job`, `update_application_status`, `get_application_tracker`).
5. **Application Pipeline Tracker:** Kanban board and structured table with full user-isolated CRUD persistence.
6. **Authentication & Security:** Supabase Auth and Google OAuth integration with Row-Level Security (RLS) policies and safe offline demo fallback mode.

---

## 2. Authentication, Supabase, and Google OAuth Setup

The application supports **Supabase Auth** with email/password and **Google OAuth**. When environment variables are not yet provided, it seamlessly activates an isolated **Demo Mode** with two pre-configured candidate profiles (`Alex Morgan - ML Engineer` and `Sarah Chen - Full Stack`) so evaluators can test all features without configuration blockers.

### Step-by-Step Setup Guide:

#### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings → API**, copy:
   - **Project URL**
   - **anon public key**
   - **service_role secret key** (for backend operations only)

#### Step 2: Configure Google Cloud Console OAuth
1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Click **Create Credentials → OAuth client ID**.
3. Select **Web application**.
4. In **Authorized redirect URIs**, add your Supabase project callback URL:
   ```
   https://<your-supabase-project-id>.supabase.co/auth/v1/callback
   ```
5. In **Authorized JavaScript origins**, add:
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
6. Copy the generated **Client ID** and **Client Secret**.

#### Step 3: Enable Google Provider in Supabase
1. In your Supabase Dashboard, navigate to **Authentication → Providers → Google**.
2. Toggle **Enable Google provider**.
3. Paste your **Client ID** and **Client Secret** from Google Cloud Console.
4. Save the configuration.

#### Step 4: Run Database Migrations
Open the **SQL Editor** in your Supabase dashboard and execute the SQL script in `supabase/schema.sql`. This sets up:
- `profiles` table with automatic signup trigger
- `resumes` table
- `saved_jobs` table
- `applications` table
- `agent_tasks` table
- Strict Row-Level Security (RLS) policies enforcing `auth.uid() = user_id`.

#### Step 5: Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL="https://<your-project-id>.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GEMINI_API_KEY="your-gemini-api-key"
```

---

## 3. Machine Learning Methodology & Mathematical Formulas

### 3.1 Baseline Model (TF-IDF Cosine Similarity)
- **Tokenization:** Text is lowercased, punctuation stripped, and filtered using standard English stopwords.
- **Inverse Document Frequency:**
  $$\text{IDF}(t, D) = \ln\left(\frac{1 + |D|}{1 + \text{DF}(t)}\right) + 1.0$$
- **Term Weighting:** Sub-linear term frequency scaling:
  $$\text{TF}(t, d) = 1 + \ln(\text{count}(t, d)) \quad \text{for count} > 0$$
- **Cosine Metric:** Vectors are $L_2$ normalized and evaluated via dot product.

### 3.2 Proposed Hybrid Ranking Model
The proposed system addresses the limitation of pure text similarity (which ignores whether a candidate actually possesses specific mandatory technical qualifications) by combining three orthogonal signals:

1. **Semantic Text Similarity ($\text{SemanticScore}$):** Vector space overlap between resume experience narratives and job descriptions.
2. **Explicit Skill Coverage ($\text{SkillCoverage}$):**
   $$\text{SkillCoverage} = \min\left(1.0, \frac{|\text{MatchedRequired}| + 0.15 \cdot |\text{MatchedPreferred}|}{\max(1, |\text{RequiredSkills}|)}\right)$$
   Normalized using a comprehensive alias dictionary (e.g. `py` $\to$ `Python`, `k8s` $\to$ `Kubernetes`, `psql` $\to$ `PostgreSQL`, `torch` $\to$ `PyTorch`).
3. **Preference Alignment ($\text{PreferenceScore}$):** Multi-attribute scoring matching work arrangement (Remote/Hybrid/On-site), target experience tier (Entry/Mid/Senior/Lead), and role keywords.

**Default Calibrated Weights:**
- $\alpha = 0.45$ (Semantic Similarity)
- $\beta = 0.40$ (Hard Skill Coverage)
- $\gamma = 0.15$ (Preference Alignment)

---

## 4. Evaluation Benchmark Results

Evaluated over ground-truth relevance pairs:

| Metric | TF-IDF Baseline | Proposed Hybrid Ranker | Relative Gain |
| :--- | :---: | :---: | :---: |
| **NDCG@5** | **0.672** | **0.884** | **+31.5%** |
| **Precision@5 (P@5)** | **0.500** | **0.700** | **+40.0%** |
| **Recall@5** | **0.625** | **0.875** | **+40.0%** |
| **Average Latency** | **1.2ms** | **2.4ms** | Real-time |
| **Skill Extraction F1** | — | **0.932** | — |

---

## 5. Automated Verification Test Suite

The application includes an in-app automated test suite executing **13 test specifications** across 6 critical operational categories:
1. `PARSE-1`: Accepts valid PDF and DOCX file extensions.
2. `PARSE-2`: Rejects unsupported/malicious file extensions (`.exe`, `.png`).
3. `PARSE-3`: Rejects empty 0-byte files.
4. `PARSE-4`: Extracts skills and computes ATS scores accurately.
5. `ML-1`: Baseline TF-IDF cosine similarity bounded in $[0, 1]$.
6. `ML-2`: Hybrid ranking honors $\alpha + \beta + \gamma = 1.0$ constraint.
7. `ML-3`: Domain differentiation (ML candidate scores higher on ML role vs Frontend role).
8. `EVAL-1`: Reproducible NDCG@5 and Precision@5 calculation.
9. `AGENT-1`: Agent `search_jobs` returns validated matches.
10. `AGENT-2`: Agent `identify_skill_gaps` accurately identifies missing skills.
11. `AGENT-3`: Agent `draft_cover_letter` references verified candidate skills.
12. `TRACK-1`: Application tracker CRUD operations and persistence.
13. `AUTH-1`: User-to-user data isolation (User A cannot read User B records).

All tests execute in the **Test Suite** tab with live green status badges.

---

## 6. How to Run Locally

```bash
# 1. Clone repository
git clone https://github.com/Shailesh7449/ResumeAI-Course-Project.git
cd ResumeAI-Course-Project

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in browser:
http://localhost:3000
```

---

## 7. Step-by-Step Demonstration for Course Evaluator

1. **Dashboard Overview:** Notice candidate **Alex Morgan** (ML Engineer) pre-loaded with an ATS score of **92/100**, 17 extracted skills, and current application pipeline statistics.
2. **Resume Intelligence Tab:**
   - View categorized skills (Languages, Frameworks, ML/AI, Databases, Cloud & DevOps).
   - Inspect ATS strengths and improvements.
   - Click **Load Full Stack** to observe dynamic re-indexing of skills and ATS recalculation.
3. **Job Discovery & Matching Tab:**
   - Observe real-time match scores calculated by the Hybrid Ranker (e.g. **Nexus AI Labs - 94% Match** for ML profile vs **42% Match** for Entry Frontend).
   - Click **Explain Match** to inspect the mathematical breakdown of Semantic TF-IDF vs Skill Coverage vs Preference Fit.
4. **Autonomous Career Agent Tab:**
   - Click any suggestion pill (e.g. *"Explain why Nexus AI Labs matches my skills"* or *"Identify the skills I am missing for Senior Backend Engineer"*).
   - Observe the agent invoking backend functions and rendering structured outputs.
5. **Application Tracker Tab:**
   - Switch between **Board** (Kanban) and **Table** views.
   - Drag/change an application's status from *Interested* to *Interview*.
   - Add notes or add a new job opportunity.
6. **ML Benchmark Tab:**
   - Review live calculated **NDCG@5**, **Precision@5**, and **Recall@5** comparing the Baseline vs Hybrid model.
   - Move the weight sliders ($\alpha, \beta, \gamma$) and click **Run Benchmark** to view the empirical impact of weight calibration.
   - Click **Export Report (JSON)** to download the evaluation file for grading.
7. **Test Suite Tab:**
   - Click **Re-Run All Tests** to verify that all 13 unit, ML, and security isolation tests pass.
