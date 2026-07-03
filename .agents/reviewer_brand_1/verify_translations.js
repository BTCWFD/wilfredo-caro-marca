import fs from 'fs';
import path from 'path';
import translations from '../../src/translations.js';

const jsonPath = path.resolve('../../translations.json');
const translationsJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Check 7 languages exist
const expectedLangs = ['en', 'es', 'ja', 'zh', 'ko', 'ru', 'ar'];
const jsLangs = Object.keys(translations);
const jsonLangs = Object.keys(translationsJson);

console.log('JS Languages:', jsLangs);
console.log('JSON Languages:', jsonLangs);

let hasErrors = false;

expectedLangs.forEach(lang => {
  if (!jsLangs.includes(lang)) {
    console.error(`Error: JS translations is missing language: ${lang}`);
    hasErrors = true;
  }
  if (!jsonLangs.includes(lang)) {
    console.error(`Error: JSON translations is missing language: ${lang}`);
    hasErrors = true;
  }
});

if (hasErrors) {
  process.exit(1);
}

// Compare keys between languages in JS
const keysPerLang = {};
expectedLangs.forEach(lang => {
  keysPerLang[lang] = Object.keys(translations[lang]).sort();
});

const enKeys = keysPerLang['en'];
expectedLangs.forEach(lang => {
  const currentKeys = keysPerLang[lang];
  const missingInLang = enKeys.filter(k => !currentKeys.includes(k));
  const extraInLang = currentKeys.filter(k => !enKeys.includes(k));
  
  if (missingInLang.length > 0) {
    console.error(`Error: Language ${lang} in JS is missing keys present in 'en':`, missingInLang);
    hasErrors = true;
  }
  if (extraInLang.length > 0) {
    console.error(`Error: Language ${lang} in JS has extra keys not present in 'en':`, extraInLang);
    hasErrors = true;
  }
});

// Compare JS and JSON keys and content
expectedLangs.forEach(lang => {
  const jsKeys = Object.keys(translations[lang]).sort();
  const jsonKeys = Object.keys(translationsJson[lang]).sort();
  
  const missingInJson = jsKeys.filter(k => !jsonKeys.includes(k));
  const extraInJson = jsonKeys.filter(k => !jsKeys.includes(k));
  
  if (missingInJson.length > 0) {
    console.error(`Error: JSON for language ${lang} is missing keys present in JS:`, missingInJson);
    hasErrors = true;
  }
  if (extraInJson.length > 0) {
    console.error(`Error: JSON for language ${lang} has extra keys not present in JS:`, extraInJson);
    hasErrors = true;
  }
  
  // Verify contents match
  jsKeys.forEach(key => {
    if (translations[lang][key] !== translationsJson[lang][key]) {
      console.error(`Error: Mismatch for [${lang}][${key}]:`);
      console.error(`  JS:   "${translations[lang][key]}"`);
      console.error(`  JSON: "${translationsJson[lang][key]}"`);
      hasErrors = true;
    }
  });
});

if (hasErrors) {
  console.log('Validation FAILED!');
  process.exit(1);
} else {
  console.log('SUCCESS: JS and JSON translations are perfectly aligned and cover all 7 languages!');
}
