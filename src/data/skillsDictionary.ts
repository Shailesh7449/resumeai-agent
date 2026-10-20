import { ExtractedSkill } from '../types';

export interface SkillDefinition {
  canonical: string;
  category: ExtractedSkill['category'];
  aliases: string[];
}

export const SKILLS_TAXONOMY: SkillDefinition[] = [
  // Languages
  { canonical: 'Python', category: 'Languages', aliases: ['py', 'python3', 'python2'] },
  { canonical: 'JavaScript', category: 'Languages', aliases: ['js', 'ecmascript', 'es6', 'es2020'] },
  { canonical: 'TypeScript', category: 'Languages', aliases: ['ts'] },
  { canonical: 'Java', category: 'Languages', aliases: ['jvm', 'java8', 'java11', 'java17'] },
  { canonical: 'C++', category: 'Languages', aliases: ['cpp', 'c/c++'] },
  { canonical: 'C#', category: 'Languages', aliases: ['csharp', '.net'] },
  { canonical: 'Go', category: 'Languages', aliases: ['golang'] },
  { canonical: 'Rust', category: 'Languages', aliases: ['rustlang'] },
  { canonical: 'SQL', category: 'Languages', aliases: ['structured query language', 'ansi sql'] },
  { canonical: 'R', category: 'Languages', aliases: ['r-project', 'rlang'] },
  { canonical: 'Ruby', category: 'Languages', aliases: ['ruby on rails', 'rb'] },
  { canonical: 'PHP', category: 'Languages', aliases: ['php7', 'php8'] },
  { canonical: 'HTML5', category: 'Languages', aliases: ['html'] },
  { canonical: 'CSS3', category: 'Languages', aliases: ['css', 'sass', 'scss'] },

  // Frameworks
  { canonical: 'React', category: 'Frameworks', aliases: ['reactjs', 'react.js', 'react-native'] },
  { canonical: 'Node.js', category: 'Frameworks', aliases: ['nodejs', 'node'] },
  { canonical: 'Express', category: 'Frameworks', aliases: ['express.js', 'expressjs'] },
  { canonical: 'Next.js', category: 'Frameworks', aliases: ['nextjs', 'next'] },
  { canonical: 'Vue.js', category: 'Frameworks', aliases: ['vue', 'vuejs'] },
  { canonical: 'Angular', category: 'Frameworks', aliases: ['angularjs', 'angular2+'] },
  { canonical: 'FastAPI', category: 'Frameworks', aliases: ['fast api'] },
  { canonical: 'Flask', category: 'Frameworks', aliases: ['flask-app'] },
  { canonical: 'Django', category: 'Frameworks', aliases: ['django-rest-framework', 'drf'] },
  { canonical: 'Spring Boot', category: 'Frameworks', aliases: ['spring', 'springboot'] },
  { canonical: 'Tailwind CSS', category: 'Frameworks', aliases: ['tailwind', 'tailwindcss'] },

  // ML / AI
  { canonical: 'PyTorch', category: 'ML/AI', aliases: ['torch', 'pytorch-lightning'] },
  { canonical: 'TensorFlow', category: 'ML/AI', aliases: ['tf', 'tensorflow2', 'keras'] },
  { canonical: 'Scikit-Learn', category: 'ML/AI', aliases: ['sklearn', 'scikit learn'] },
  { canonical: 'Pandas', category: 'ML/AI', aliases: ['dataframe'] },
  { canonical: 'NumPy', category: 'ML/AI', aliases: ['numpy arrays'] },
  { canonical: 'NLP', category: 'ML/AI', aliases: ['natural language processing', 'spacy', 'nltk', 'huggingface', 'transformers'] },
  { canonical: 'Computer Vision', category: 'ML/AI', aliases: ['opencv', 'cv', 'yolo', 'image segmentation'] },
  { canonical: 'LLMs', category: 'ML/AI', aliases: ['large language models', 'langchain', 'llamaindex', 'rag', 'vector database'] },
  { canonical: 'Deep Learning', category: 'ML/AI', aliases: ['neural networks', 'ann', 'cnn', 'rnn', 'transformer architecture'] },
  { canonical: 'Machine Learning', category: 'ML/AI', aliases: ['ml', 'supervised learning', 'unsupervised learning', 'xgboost', 'lightgbm'] },
  { canonical: 'MLOps', category: 'ML/AI', aliases: ['mlflow', 'kubeflow', 'wandb', 'weights and biases', 'model deployment'] },

  // Databases
  { canonical: 'PostgreSQL', category: 'Databases', aliases: ['postgres', 'psql'] },
  { canonical: 'MySQL', category: 'Databases', aliases: ['mariadb'] },
  { canonical: 'MongoDB', category: 'Databases', aliases: ['mongo', 'nosql document store'] },
  { canonical: 'Redis', category: 'Databases', aliases: ['redis cache'] },
  { canonical: 'Elasticsearch', category: 'Databases', aliases: ['elastic search', 'opensearch'] },
  { canonical: 'Supabase', category: 'Databases', aliases: ['supabase auth', 'supabase db'] },
  { canonical: 'DynamoDB', category: 'Databases', aliases: ['aws dynamodb'] },
  { canonical: 'Snowflake', category: 'Databases', aliases: ['snowflake dw'] },

  // Cloud & DevOps
  { canonical: 'Docker', category: 'Cloud & DevOps', aliases: ['containerization', 'containers'] },
  { canonical: 'Kubernetes', category: 'Cloud & DevOps', aliases: ['k8s'] },
  { canonical: 'AWS', category: 'Cloud & DevOps', aliases: ['amazon web services', 'ec2', 's3', 'lambda'] },
  { canonical: 'GCP', category: 'Cloud & DevOps', aliases: ['google cloud platform', 'google cloud', 'gcs', 'cloud run'] },
  { canonical: 'Azure', category: 'Cloud & DevOps', aliases: ['microsoft azure'] },
  { canonical: 'CI/CD', category: 'Cloud & DevOps', aliases: ['github actions', 'jenkins', 'gitlab ci', 'continuous integration'] },
  { canonical: 'Terraform', category: 'Cloud & DevOps', aliases: ['iac', 'infrastructure as code'] },
  { canonical: 'Linux', category: 'Cloud & DevOps', aliases: ['bash', 'shell scripting', 'unix'] },

  // Tools & Other
  { canonical: 'Git', category: 'Tools & Other', aliases: ['github', 'gitlab', 'version control'] },
  { canonical: 'REST APIs', category: 'Tools & Other', aliases: ['restful', 'api design', 'rest'] },
  { canonical: 'GraphQL', category: 'Tools & Other', aliases: ['apollo', 'graphql schema'] },
  { canonical: 'Microservices', category: 'Tools & Other', aliases: ['distributed systems', 'soa'] },
  { canonical: 'Agile / Scrum', category: 'Tools & Other', aliases: ['scrum', 'kanban', 'jira', 'sprints'] },
  { canonical: 'System Design', category: 'Tools & Other', aliases: ['software architecture', 'scalability'] },
  { canonical: 'Testing / TDD', category: 'Tools & Other', aliases: ['unit testing', 'jest', 'pytest', 'cypress'] }
];

// Fast lookup maps
export const ALIAS_MAP: Record<string, SkillDefinition> = {};
export const CANONICAL_MAP: Record<string, SkillDefinition> = {};

SKILLS_TAXONOMY.forEach((skill) => {
  const normCanonical = skill.canonical.toLowerCase();
  CANONICAL_MAP[normCanonical] = skill;
  ALIAS_MAP[normCanonical] = skill;
  skill.aliases.forEach((alias) => {
    ALIAS_MAP[alias.toLowerCase()] = skill;
  });
});

export function normalizeSkill(input: string): string | null {
  const cleaned = input.toLowerCase().trim().replace(/[.,;:]/g, '');
  if (ALIAS_MAP[cleaned]) {
    return ALIAS_MAP[cleaned].canonical;
  }
  return null;
}
