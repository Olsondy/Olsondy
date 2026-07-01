import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_USERNAME = 'Olsondy';
const DATA_FILE_PATH = path.resolve(__dirname, '../src/content/projects/data.json');

// Map GitHub languages to UnoCSS icons and categories
const LANGUAGE_MAP = {
  JavaScript: { icon: 'i-logos-javascript', category: 'JavaScript Projects' },
  TypeScript: { icon: 'i-logos-typescript-icon', category: 'TypeScript Projects' },
  Python: { icon: 'i-logos-python', category: 'Python Projects' },
  HTML: { icon: 'i-logos-html-5', category: 'Web Projects' },
  CSS: { icon: 'i-logos-css-3', category: 'Web Projects' },
  Vue: { icon: 'i-logos-vue', category: 'Vue Projects' },
  Astro: { icon: 'i-devicon-astro', category: 'Astro Projects' },
  Java: { icon: 'i-logos-java', category: 'Java Projects' },
  C: { icon: 'i-logos-c', category: 'C/C++ Projects' },
  'C++': { icon: 'i-logos-c-plusplus', category: 'C/C++ Projects' },
  'C#': { icon: 'i-logos-c-sharp', category: 'C# Projects' },
  Go: { icon: 'i-logos-go', category: 'Go Projects' },
  Rust: { icon: 'i-logos-rust', category: 'Rust Projects' },
  Ruby: { icon: 'i-logos-ruby', category: 'Ruby Projects' },
  PHP: { icon: 'i-logos-php', category: 'PHP Projects' },
  Swift: { icon: 'i-logos-swift', category: 'Swift Projects' },
  Kotlin: { icon: 'i-logos-kotlin', category: 'Kotlin Projects' },
  Shell: { icon: 'i-logos-bash-icon', category: 'Shell Scripts' },
  Dockerfile: { icon: 'i-logos-docker-icon', category: 'DevOps' },
  // Fallback
  default: { icon: 'i-carbon-code', category: 'Other Projects' },
};

async function fetchProjects() {
  console.log(`Fetching repositories for GitHub user: ${GITHUB_USERNAME}...`);
  
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&type=owner&sort=updated`);
    
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
    }
    
    const repos = await response.json();
    console.log(`Found ${repos.length} total repositories.`);
    
    // Filter out forks if desired (keeping originals only)
    const originalRepos = repos.filter(repo => !repo.fork);
    console.log(`Found ${originalRepos.length} original repositories (excluding forks).`);
    
    // Format to match the schema
    const formattedProjects = originalRepos.map(repo => {
      const langConfig = LANGUAGE_MAP[repo.language] || LANGUAGE_MAP.default;
      
      return {
        id: repo.name,
        link: repo.html_url,
        desc: repo.description || 'No description provided.',
        icon: langConfig.icon,
        category: langConfig.category
      };
    });
    
    // Sort projects by category for better grouping
    formattedProjects.sort((a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id));
    
    // Write to data.json
    await fs.writeFile(
      DATA_FILE_PATH, 
      JSON.stringify(formattedProjects, null, 2),
      'utf-8'
    );
    
    console.log(`✅ Successfully wrote ${formattedProjects.length} projects to ${DATA_FILE_PATH}`);
  } catch (error) {
    console.error('❌ Failed to fetch or write projects:', error);
    process.exit(1);
  }
}

fetchProjects();
