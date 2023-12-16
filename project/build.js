const fs = require('fs-extra');
const path = require('path');
const markdownIt = require('markdown-it')();
const attrs = require('markdown-it-attrs');

// Add the attrs plugin to the markdownIt instance
markdownIt.use(attrs);

const matter = require('gray-matter');

const projectDirectory = __dirname;
const sourceDirectory = path.join(projectDirectory, 'src');
const buildDirectory = path.join(projectDirectory, 'build');

// Ensure build directory exists
fs.ensureDirSync(buildDirectory);

// Copy assets and JavaScript
fs.copySync(path.join(sourceDirectory, 'assets'), path.join(buildDirectory, 'assets'));

const languages = ['en', 'it'];

// Generate pages for each language
languages.forEach(language => {
  const languagePagesDir = path.join(sourceDirectory, 'pages', language);
  
  // Check if language pages directory exists
  if (fs.existsSync(languagePagesDir)) {
    // Get markdown files in the language directory
    const markdownFiles = fs.readdirSync(languagePagesDir).filter(file => file.endsWith('.md'));
    
    markdownFiles.forEach(file => {
      const markdownFilePath = path.join(languagePagesDir, file);
      const markdownContent = fs.readFileSync(markdownFilePath, 'utf-8');
      const { content, data: { title } } = matter(markdownContent);
      
      // Labels for navigation
      const labels = {
        en: { homeLabel: 'Home', researchLabel: 'Research', notebookLabel: 'Notebook' },
        it: { homeLabel: 'Inizio', researchLabel: 'Ricerca', notebookLabel: 'Quaderno' }
      };
      
      // Determine layout template and read it
      const layoutTemplatePath = file === 'index.md' ? 'index-template.html' : 'page-template.html';
      const layoutTemplate = fs.readFileSync(path.join(sourceDirectory, 'templates', layoutTemplatePath), 'utf-8');
      
      // Construct request paths and localization paths
      const requestPath = `/${language}/${file.replace('.md', '.html')}`;
      const enPath = getCurrentPathWithLanguage(requestPath, 'en');
      const itPath = getCurrentPathWithLanguage(requestPath, 'it');
      
      const existsItPath = getExistsPath(itPath);
      const existsEnPath = getExistsPath(enPath);
      
      // Render the Markdown content
      const renderedHtmlContent = markdownIt.render(content);
      
      // Replace placeholders with content
      const placeholders = {
        language,
        enPath,
        itPath,
        existsEnPath,
        existsItPath,
        title,
        renderedContent: renderedHtmlContent,
        ...labels[language]
      };
      const processedHtml = layoutTemplate.replace(/{{(.*?)}}/g, (_, p1) => placeholders[p1] || '');
      
      // Write processed HTML to file
      const htmlFilePath = path.join(buildDirectory, language, file.replace('.md', '.html'));
      fs.ensureDirSync(path.dirname(htmlFilePath));
      fs.writeFileSync(htmlFilePath, processedHtml);
    });
  }
});

// Helper function to construct URLs with language prefix
function getCurrentPathWithLanguage(path, language) {
  const segments = path.split('/');
  segments[1] = language;
  return segments.join('/');
}

function getExistsPath(relativePath) {
  const absolutePath = path.join(buildDirectory, relativePath);
  return fs.existsSync(absolutePath) ? '' : 'style="display:none;"';
}
