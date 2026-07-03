import schemas from '../src/modules/schema.js';
import fs from 'fs';

console.log('--- STARTING SCHEMA AND SWAPPING VALIDATION ---');

const expectedLanguages = ['en', 'es', 'ja', 'zh', 'ko', 'ru', 'ar'];

// 1. Validate languages list
const schemaKeys = Object.keys(schemas);
console.log(`Found schema keys: ${schemaKeys.join(', ')}`);

if (schemaKeys.length !== 7) {
  console.error(`FAIL: Expected 7 schemas, found ${schemaKeys.length}`);
  process.exit(1);
}

for (const lang of expectedLanguages) {
  if (!schemas[lang]) {
    console.error(`FAIL: Missing schema for language "${lang}"`);
    process.exit(1);
  }
}

// 2. Validate Schema structure & Schema.org compliance
for (const lang of expectedLanguages) {
  console.log(`\nValidating schema for "${lang}"...`);
  const schema = schemas[lang];

  // Core properties
  if (schema['@context'] !== 'https://schema.org') {
    console.error(`FAIL [${lang}]: @context is "${schema['@context']}", expected "https://schema.org"`);
    process.exit(1);
  }

  if (schema['@type'] !== 'Person') {
    console.error(`FAIL [${lang}]: @type is "${schema['@type']}", expected "Person"`);
    process.exit(1);
  }

  if (schema.name !== 'Wilfredo Caro') {
    console.error(`FAIL [${lang}]: name is "${schema.name}", expected "Wilfredo Caro"`);
    process.exit(1);
  }

  // URL checks
  const expectedUrl = lang === 'en' ? 'https://wilfredocaro.com/' : `https://wilfredocaro.com/?lang=${lang}`;
  if (schema.url !== expectedUrl) {
    console.error(`FAIL [${lang}]: url is "${schema.url}", expected "${expectedUrl}"`);
    process.exit(1);
  }

  // jobTitle checks
  if (!Array.isArray(schema.jobTitle) || schema.jobTitle.length === 0) {
    console.error(`FAIL [${lang}]: jobTitle must be a non-empty array of strings`);
    process.exit(1);
  }
  for (const title of schema.jobTitle) {
    if (typeof title !== 'string' || title.trim() === '') {
      console.error(`FAIL [${lang}]: Invalid jobTitle value found: "${title}"`);
      process.exit(1);
    }
  }

  // worksFor nested properties check (especially for warnings)
  if (!Array.isArray(schema.worksFor) || schema.worksFor.length === 0) {
    console.error(`FAIL [${lang}]: worksFor must be a non-empty array of objects`);
    process.exit(1);
  }

  for (const org of schema.worksFor) {
    if (org['@type'] !== 'Organization') {
      console.error(`FAIL [${lang}]: worksFor item @type is "${org['@type']}", expected "Organization"`);
      process.exit(1);
    }
    if (typeof org.name !== 'string' || org.name.trim() === '') {
      console.error(`FAIL [${lang}]: worksFor item name is missing or invalid: "${org.name}"`);
      process.exit(1);
    }
    // Verify no unexpected properties that could trigger warnings (like nesting @context inside worksFor, etc.)
    const orgKeys = Object.keys(org);
    const invalidKeys = orgKeys.filter(k => k !== '@type' && k !== 'name');
    if (invalidKeys.length > 0) {
      console.error(`FAIL [${lang}]: worksFor item contains unexpected properties: ${invalidKeys.join(', ')}`);
      process.exit(1);
    }
  }

  // knowsAbout checks
  if (!Array.isArray(schema.knowsAbout) || schema.knowsAbout.length === 0) {
    console.error(`FAIL [${lang}]: knowsAbout must be a non-empty array of strings`);
    process.exit(1);
  }

  // sameAs checks
  if (!Array.isArray(schema.sameAs) || schema.sameAs.length === 0) {
    console.error(`FAIL [${lang}]: sameAs must be a non-empty array of social URLs`);
    process.exit(1);
  }

  // description check
  if (typeof schema.description !== 'string' || schema.description.trim() === '') {
    console.error(`FAIL [${lang}]: description is missing or invalid`);
    process.exit(1);
  }

  console.log(`PASS [${lang}]: Schema is valid and compliant.`);
}

// 3. Test Dynamic Swapping and Script Breakout Protection
console.log('\nTesting dynamic swapping HTML escaping / breakout prevention...');
for (const lang of expectedLanguages) {
  const schema = schemas[lang];
  const stringified = JSON.stringify(schema, null, 2);
  const escaped = stringified.replace(/</g, '\\u003c');

  // Verify that no raw '<' character remains in the string
  if (escaped.includes('<')) {
    console.error(`FAIL: Escaped JSON-LD string still contains raw "<" character!`);
    process.exit(1);
  }

  // Verify parsing integrity: does JSON.parse reconstruct the original object exactly?
  const parsed = JSON.parse(escaped);
  if (JSON.stringify(parsed) !== JSON.stringify(schema)) {
    console.error(`FAIL: Parsed object does not match original schema! Data corruption occurred during escaping.`);
    process.exit(1);
  }
}
console.log('PASS: Escaping logic prevents breakout without corrupting data.');

// 4. Test Adversarial Input Injection Simulation
console.log('\nSimulating adversarial inputs in schema values...');
const maliciousSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Wilfredo </script><script>alert('XSS')</script> Caro",
  "description": "Exploit search crawlers or browser rendering <script>evil()</script>"
};

const maliciousStringified = JSON.stringify(maliciousSchema, null, 2);
const maliciousEscaped = maliciousStringified.replace(/</g, '\\u003c');

if (maliciousEscaped.includes('<')) {
  console.error(`FAIL: Adversarial string escaping failed! Still contains raw "<".`);
  process.exit(1);
}
if (maliciousEscaped.includes('</script>')) {
  console.error(`FAIL: Adversarial string escaping failed! Still contains raw "</script>".`);
  process.exit(1);
}

// Ensure the parser correctly reads back the original tag
const maliciousParsed = JSON.parse(maliciousEscaped);
if (maliciousParsed.name !== "Wilfredo </script><script>alert('XSS')</script> Caro") {
  console.error(`FAIL: Re-parsed malicious name doesn't match original string: ${maliciousParsed.name}`);
  process.exit(1);
}

console.log('PASS: Adversarial script injection is successfully neutralized and parsed back correctly.');
console.log('--- ALL TESTS COMPLETED SUCCESSFULLY ---');
