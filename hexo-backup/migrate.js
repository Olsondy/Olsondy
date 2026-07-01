const fs = require('fs');
const path = require('path');

const hexoPostsDir = path.join(__dirname, 'source', '_posts');
const astroBlogDir = path.join(__dirname, 'astro-temp', 'src', 'content', 'blog');

function migrateFile(filePath, relPath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;

  // Simple string replacements for the frontmatter
  // We match between the first --- and the second ---
  const match = newContent.match(/^---\n([\s\S]*?)\n---/);
  if (match) {
    let fm = match[1];
    
    // Replace date -> pubDate
    fm = fm.replace(/^date:/gm, 'pubDate:');
    // Replace updated -> lastModDate
    fm = fm.replace(/^updated:/gm, 'lastModDate:');
    
    // If the schema requires tags to be array, and if categories exist, we could merge them into tags
    // Or we just leave categories (we might need to add it to schema)
    
    newContent = newContent.replace(match[1], fm);
  }

  // Create target directory
  const targetPath = path.join(astroBlogDir, relPath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, newContent, 'utf-8');
  console.log(`Migrated: ${relPath}`);
}

function walkDir(dir, baseDir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, baseDir);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      const relPath = path.relative(baseDir, fullPath);
      migrateFile(fullPath, relPath);
    }
  }
}

if (fs.existsSync(hexoPostsDir)) {
  walkDir(hexoPostsDir, hexoPostsDir);
  console.log('Migration complete!');
} else {
  console.log('Hexo posts directory not found.');
}
