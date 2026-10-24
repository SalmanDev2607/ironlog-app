// Build script to bundle IronLog into a single self-contained HTML file
// for zero-dependency offline usage (double-clickable via file://)

const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const cssPath = path.join(rootDir, 'css', 'styles.css');
const iconPath = path.join(rootDir, 'icons', 'icon.svg');

// Read files
const cssContent = fs.readFileSync(cssPath, 'utf8');
const iconContent = fs.readFileSync(iconPath, 'utf8');

// Clean imports and exports
function stripModules(content) {
  return content
    .replace(/import[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
    .replace(/import\s+['"][^'"]+['"];?/g, '')
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s+let\s+/g, 'let ')
    .replace(/export\s+\{[\s\S]*?\};?/g, '');
}

const exercisesJs = stripModules(fs.readFileSync(path.join(rootDir, 'js', 'exercises.js'), 'utf8'));
const stateJs = stripModules(fs.readFileSync(path.join(rootDir, 'js', 'state.js'), 'utf8'));
const timerJs = stripModules(fs.readFileSync(path.join(rootDir, 'js', 'timer.js'), 'utf8'));
const iconsJs = stripModules(fs.readFileSync(path.join(rootDir, 'js', 'icons.js'), 'utf8'));
const appJs = stripModules(fs.readFileSync(path.join(rootDir, 'js', 'app.js'), 'utf8'))
  .replace(/if \('serviceWorker' in navigator\) \{[\s\S]*?\n  \}/g, '// Service worker omitted in file:// standalone mode');

const iconDataUri = `data:image/svg+xml;base64,${Buffer.from(iconContent).toString('base64')}`;

const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no">
  <title>IronLog – Gym & Hypertrophy Tracker</title>
  
  <meta name="description" content="Adaptive Push-Pull-Legs gym tracker with golden-era proportion targets, muscle recovery tracking, and smart progressive overload.">
  <meta name="theme-color" content="#12151a" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f4f6f3" media="(prefers-color-scheme: light)">
  
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="IronLog">
  
  <link rel="icon" type="image/svg+xml" href="${iconDataUri}">
  <link rel="apple-touch-icon" href="${iconDataUri}">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="app"></div>
  <nav id="nv"></nav>
  <div id="md" onclick="if(event.target===this)IronLog.closeModal()">
    <div id="mb"></div>
  </div>

  <script>
// --- exercises.js ---
${exercisesJs}

// --- state.js ---
${stateJs}

// --- timer.js ---
${timerJs}

// --- icons.js ---
${iconsJs}

// --- app.js ---
${appJs}
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(rootDir, 'standalone.html'), standaloneHtml);
console.log('Successfully generated standalone.html (size: ' + Math.round(standaloneHtml.length / 1024) + ' KB)');
