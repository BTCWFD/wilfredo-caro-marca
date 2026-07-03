import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = 'c:\\Users\\USER\\Wilfredo-Caro-Marca';

const translationsJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'translations.json'), 'utf8'));
const indexHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');

const i18nRegex = /data-i18n="([^"]+)"/g;
const htmlKeys = new Set();
let match;
while ((match = i18nRegex.exec(indexHtml)) !== null) {
  htmlKeys.add(match[1]);
}

const languages = ['en', 'es', 'ja', 'zh', 'ko', 'ru', 'ar'];
const missingKeysByLang = {};

languages.forEach(lang => {
  missingKeysByLang[lang] = [];
  const langObject = translationsJson[lang] || {};
  htmlKeys.forEach(key => {
    if (!(key in langObject)) {
      missingKeysByLang[lang].push(key);
    }
  });
});

console.log('--- Translation Verification Report ---');
console.log(`Total data-i18n keys found in HTML: ${htmlKeys.size}`);
console.log('HTML Keys:', Array.from(htmlKeys).sort());
console.log('\nMissing keys per language:');
let hasMissing = false;
languages.forEach(lang => {
  const missing = missingKeysByLang[lang];
  console.log(`- ${lang.toUpperCase()}: ${missing.length} missing keys`);
  if (missing.length > 0) {
    hasMissing = true;
    console.log('  Missing:', missing);
  }
});

if (!hasMissing) {
  console.log('\nSUCCESS: All data-i18n keys are present in all languages!');
} else {
  console.log('\nWARNING: Some keys are missing in the translation files.');
}
