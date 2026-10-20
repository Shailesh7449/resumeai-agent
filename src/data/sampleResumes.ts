import { ParsedResume } from '../types';

export const SAMPLE_RESUMES: Record<string, ParsedResume> = {
  'ml-engineer': {
    id: 'resume-ml-alex',
    userId: 'demo-user-1',
    fileName: 'Alex_Morgan_ML_Engineer_Resume.pdf',
    fileSize: 142850,
    uploadedAt: '2026-10-20T10:30:00.000Z',
    rawText: `Alex Morgan
San Francisco, CA | alex.morgan@example.com | (555) 234-5678 | github.com/alexmorgan-ai

PROFESSIONAL SUMMARY
Machine Learning Engineer with 3+ years of experience designing, training, and deploying scalable deep learning models. Proficient in Python, PyTorch, Scikit-Learn, and Docker. Experience building recommendation systems, NLP pipelines, and FastAPI microservices serving over 2M requests daily.

TECHNICAL SKILLS
Languages: Python, SQL, C++, Bash
Frameworks & Libraries: PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, FastAPI, Flask
ML & Data: NLP, Large Language Models (LLMs), Computer Vision, MLOps, Weights & Biases
Cloud & DevOps: Docker, Kubernetes, AWS (EC2, S3), Git, CI/CD, Linux
Databases: PostgreSQL, Redis, MongoDB

EXPERIENCE
Machine Learning Engineer | Apex AI Technologies | 2024 - Present
- Architected and deployed a multi-stage recommendation ranking pipeline using PyTorch and Scikit-Learn, increasing user engagement by 24%.
- Developed high-throughput REST inference endpoints using FastAPI and Docker, reducing p99 latency from 180ms to 42ms.
- Implemented automated ML CI/CD pipelines with GitHub Actions and Kubernetes for continuous evaluation and drift monitoring.

Associate Data Scientist | Quantum Insights Corp | 2022 - 2024
- Built predictive customer churn models using XGBoost, Scikit-Learn, and Pandas on 500k+ user records.
- Extracted and preprocessed unstructured text data using NLP tokenization and TF-IDF representations.
- Optimized SQL queries and PostgreSQL database indexes to accelerate training data extraction by 40%.

EDUCATION
B.S. in Computer Science (Machine Learning Concentration)
University of California, Berkeley | 2018 - 2022

PROJECTS
OpenSource Vector Ranker: High-performance semantic similarity search library built with Python and PyTorch.
Course Project: Resume-to-job recommendation engine using hybrid scoring algorithms.`,
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '(555) 234-5678',
    location: 'San Francisco, CA',
    summary: 'Machine Learning Engineer with 3+ years of experience designing, training, and deploying scalable deep learning models. Proficient in Python, PyTorch, Scikit-Learn, and Docker.',
    skills: [
      { name: 'Python', category: 'Languages', confidence: 0.98, isExplicit: true },
      { name: 'SQL', category: 'Languages', confidence: 0.95, isExplicit: true },
      { name: 'C++', category: 'Languages', confidence: 0.85, isExplicit: true },
      { name: 'PyTorch', category: 'ML/AI', confidence: 0.96, isExplicit: true },
      { name: 'TensorFlow', category: 'ML/AI', confidence: 0.90, isExplicit: true },
      { name: 'Scikit-Learn', category: 'ML/AI', confidence: 0.94, isExplicit: true },
      { name: 'Machine Learning', category: 'ML/AI', confidence: 0.95, isExplicit: true },
      { name: 'NLP', category: 'ML/AI', confidence: 0.92, isExplicit: true },
      { name: 'LLMs', category: 'ML/AI', confidence: 0.88, isExplicit: true },
      { name: 'FastAPI', category: 'Frameworks', confidence: 0.92, isExplicit: true },
      { name: 'Docker', category: 'Cloud & DevOps', confidence: 0.93, isExplicit: true },
      { name: 'Kubernetes', category: 'Cloud & DevOps', confidence: 0.82, isExplicit: true },
      { name: 'PostgreSQL', category: 'Databases', confidence: 0.89, isExplicit: true },
      { name: 'Redis', category: 'Databases', confidence: 0.84, isExplicit: true },
      { name: 'AWS', category: 'Cloud & DevOps', confidence: 0.85, isExplicit: true },
      { name: 'Git', category: 'Tools & Other', confidence: 0.95, isExplicit: true },
      { name: 'CI/CD', category: 'Cloud & DevOps', confidence: 0.88, isExplicit: true }
    ],
    experience: [
      {
        company: 'Apex AI Technologies',
        role: 'Machine Learning Engineer',
        startDate: '2024',
        endDate: 'Present',
        current: true,
        highlights: [
          'Architected and deployed a multi-stage recommendation ranking pipeline using PyTorch and Scikit-Learn, increasing user engagement by 24%.',
          'Developed high-throughput REST inference endpoints using FastAPI and Docker, reducing p99 latency from 180ms to 42ms.',
          'Implemented automated ML CI/CD pipelines with GitHub Actions and Kubernetes for continuous evaluation.'
        ]
      },
      {
        company: 'Quantum Insights Corp',
        role: 'Associate Data Scientist',
        startDate: '2022',
        endDate: '2024',
        current: false,
        highlights: [
          'Built predictive customer churn models using XGBoost, Scikit-Learn, and Pandas on 500k+ records.',
          'Extracted and preprocessed unstructured text data using NLP tokenization and TF-IDF representations.',
          'Optimized SQL queries and PostgreSQL database indexes to accelerate training data extraction.'
        ]
      }
    ],
    education: [
      {
        institution: 'University of California, Berkeley',
        degree: 'B.S. in Computer Science',
        field: 'Machine Learning Concentration',
        graduationYear: '2022'
      }
    ],
    projects: [
      {
        title: 'OpenSource Vector Ranker',
        description: 'High-performance semantic similarity search library built with Python and PyTorch.',
        technologies: ['Python', 'PyTorch', 'FastAPI']
      },
      {
        title: 'Resume-to-Job Matching Engine',
        description: 'Machine Learning course project evaluating hybrid ranking vs TF-IDF baselines.',
        technologies: ['Scikit-Learn', 'NLP', 'Docker']
      }
    ],
    atsScore: 92,
    atsStrengths: [
      'Strong quantifiable metrics (e.g., 24% engagement increase, 42ms latency).',
      'Clear technical skills taxonomy categorized across languages, frameworks, and cloud.',
      'Active verbs (Architected, Developed, Implemented, Built).'
    ],
    atsImprovements: [
      'Include certifications (e.g. AWS Certified Machine Learning or GCP Professional Data Engineer).',
      'Elaborate on specific model architecture choices (e.g., Cross-encoder vs Bi-encoder).'
    ]
  },

  'full-stack': {
    id: 'resume-fs-sarah',
    userId: 'demo-user-2',
    fileName: 'Sarah_Chen_FullStack_Resume.pdf',
    fileSize: 138200,
    uploadedAt: '2026-10-19T14:15:00.000Z',
    rawText: `Sarah Chen
Seattle, WA | sarah.chen@example.com | (555) 987-6543 | github.com/sarahchen

SUMMARY
Versatile Full Stack Software Engineer with 4 years of experience building modern web applications, scalable REST/GraphQL APIs, and cloud services. Expert in TypeScript, React, Node.js, and PostgreSQL.

SKILLS
TypeScript, JavaScript, React, Next.js, Node.js, Express, HTML5, CSS3, Tailwind CSS, PostgreSQL, MongoDB, Docker, Git, CI/CD, AWS, Testing / TDD

EXPERIENCE
Senior Frontend & Full Stack Developer | Horizon Digital | 2023 - Present
- Led migration of legacy monolith to React & Next.js frontend with Node.js microservices.
- Built reusable UI component libraries styled with Tailwind CSS, improving developer velocity by 35%.
- Implemented real-time collaboration canvas using WebSockets and PostgreSQL.

Software Engineer | CloudScale Apps | 2021 - 2023
- Designed REST APIs with Express and TypeScript handling 50k active daily sessions.
- Integrated automated end-to-end testing with Jest and Cypress, maintaining 90%+ code coverage.

EDUCATION
B.S. in Software Engineering, University of Washington, 2021`,
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    phone: '(555) 987-6543',
    location: 'Seattle, WA',
    summary: 'Versatile Full Stack Software Engineer with 4 years of experience building modern web applications, scalable REST/GraphQL APIs, and cloud services.',
    skills: [
      { name: 'TypeScript', category: 'Languages', confidence: 0.98, isExplicit: true },
      { name: 'JavaScript', category: 'Languages', confidence: 0.98, isExplicit: true },
      { name: 'React', category: 'Frameworks', confidence: 0.97, isExplicit: true },
      { name: 'Next.js', category: 'Frameworks', confidence: 0.94, isExplicit: true },
      { name: 'Node.js', category: 'Frameworks', confidence: 0.95, isExplicit: true },
      { name: 'Express', category: 'Frameworks', confidence: 0.92, isExplicit: true },
      { name: 'Tailwind CSS', category: 'Frameworks', confidence: 0.96, isExplicit: true },
      { name: 'PostgreSQL', category: 'Databases', confidence: 0.91, isExplicit: true },
      { name: 'REST APIs', category: 'Tools & Other', confidence: 0.95, isExplicit: true },
      { name: 'Git', category: 'Tools & Other', confidence: 0.95, isExplicit: true },
      { name: 'Docker', category: 'Cloud & DevOps', confidence: 0.88, isExplicit: true },
      { name: 'AWS', category: 'Cloud & DevOps', confidence: 0.84, isExplicit: true }
    ],
    experience: [
      {
        company: 'Horizon Digital',
        role: 'Senior Frontend & Full Stack Developer',
        startDate: '2023',
        endDate: 'Present',
        current: true,
        highlights: [
          'Led migration of legacy monolith to React & Next.js frontend with Node.js microservices.',
          'Built reusable UI component libraries styled with Tailwind CSS, improving velocity by 35%.'
        ]
      }
    ],
    education: [
      {
        institution: 'University of Washington',
        degree: 'B.S. in Software Engineering',
        graduationYear: '2021'
      }
    ],
    projects: [],
    atsScore: 88,
    atsStrengths: ['Modern tech stack (React 19, TypeScript, Tailwind)', 'Clean project impacts'],
    atsImprovements: ['Add more metric figures in earlier role bullet points']
  }
};
