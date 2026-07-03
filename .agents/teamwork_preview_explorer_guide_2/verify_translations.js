import fs from 'fs';
import path from 'path';

// Note: To avoid parsing JS via complex regex, we can read the files,
// clean up the export statement and module declaration, and parse as JSON.
// Or we can just import them in a simple Node script.
// Since node --experimental-json-modules works, we can use it.
// Alternatively, let's write a script that reads and cleans src/translations.js to make it JSON, then compares.

const jsPath = 'c:/Users/USER/Wilfredo-Caro-Marca/src/translations.js';
const jsonPath = 'c:/Users/USER/Wilfredo-Caro-Marca/translations.json';

const jsContent = fs.readFileSync(jsPath, 'utf8');
const jsonContent = fs.readFileSync(jsonPath, 'utf8');

// Strip "const translations = " and ";\n\nexport default translations;" from JS content to get JSON
let cleanedJs = jsContent.trim();
if (cleanedJs.startsWith('const translations =')) {
  cleanedJs = cleanedJs.substring('const translations ='.length).trim();
}
if (cleanedJs.endsWith('export default translations;')) {
  cleanedJs = cleanedJs.substring(0, cleanedJs.length - 'export default translations;'.length).trim();
}
// If there is a trailing semicolon, remove it
if (cleanedJs.endsWith(';')) {
  cleanedJs = cleanedJs.substring(0, cleanedJs.length - 1).trim();
}

// Now cleanedJs is hopefully valid JS object, which we can parse with a dynamic eval or JSON.parse
// Since JS object keys might not have double quotes, JSON.parse might fail. Let's use Function wrapper to parse it.
let jsData;
try {
  jsData = Function(`return (${cleanedJs})`)();
} catch (err) {
  console.error('Failed to parse translations.js as object:', err);
  process.exit(1);
}

let jsonData;
try {
  jsonData = JSON.parse(jsonContent);
} catch (err) {
  console.error('Failed to parse translations.json:', err);
  process.exit(1);
}

const jsLangs = Object.keys(jsData);
const jsonLangs = Object.keys(jsonData);

console.log('JS Languages:', jsLangs);
console.log('JSON Languages:', jsonLangs);

let hasErrors = false;

// Check languages
if (jsLangs.length !== jsonLangs.length || !jsLangs.every(l => jsonLangs.includes(l))) {
  console.error('ERROR: Languages list mismatch between JS and JSON.');
  hasErrors = true;
}

jsLangs.forEach(lang => {
  if (!jsonData[lang]) return;
  const jsKeys = Object.keys(jsData[lang]);
  const jsonKeys = Object.keys(jsonData[lang]);

  const onlyInJs = jsKeys.filter(k => !jsonKeys.includes(k));
  const onlyInJson = jsonKeys.filter(k => !jsKeys.includes(k));

  if (onlyInJs.length > 0) {
    console.error(`ERROR [Lang: ${lang}]: Keys found only in translations.js:`, onlyInJs);
    hasErrors = true;
  }
  if (onlyInJson.length > 0) {
    console.error(`ERROR [Lang: ${lang}]: Keys found only in translations.json:`, onlyInJson);
    hasErrors = true;
  }

  // Check matching values
  let valMismatchCount = 0;
  jsKeys.forEach(k => {
    if (jsonKeys.includes(k)) {
      if (jsData[lang][k] !== jsonData[lang][k]) {
        console.warn(`WARNING [Lang: ${lang}, Key: ${k}]: Value mismatch.\nJS:   "${jsData[lang][k]}"\nJSON: "${jsonData[lang][k]}"`);
        valMismatchCount++;
      }
    }
  });
  if (valMismatchCount > 0) {
    console.log(`[Lang: ${lang}] Total value mismatches: ${valMismatchCount}`);
  }
});

// Also check cross-language key consistency
console.log('\n--- Cross-Language Key Consistency Check ---');
const baseLang = 'en';
const baseKeys = Object.keys(jsonData[baseLang]);

jsonLangs.forEach(lang => {
  if (lang === baseLang) return;
  const langKeys = Object.keys(jsonData[lang]);
  const missingInLang = baseKeys.filter(k => !langKeys.includes(k));
  const extraInLang = langKeys.filter(k => !baseKeys.includes(k));

  if (missingInLang.length > 0) {
    console.error(`ERROR [Lang: ${lang}]: Missing keys present in ${baseLang}:`, missingInLang);
    hasErrors = true;
  }
  if (extraInLang.length > 0) {
    console.error(`ERROR [Lang: ${lang}]: Extra keys not present in ${baseLang}:`, extraInLang);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.log('\n❌ VERIFICATION FAILED.');
  process.exit(1);
} else {
  console.log('\n✅ VERIFICATION SUCCESSFUL. All files are in sync.');
}
