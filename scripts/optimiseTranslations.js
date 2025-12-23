const { optimiseTranslations } = require('@dtsl/jsutils/dist/optimiseTranslations.js')

//Path to code so that we can extract all the translations keys being used in the project.
const codeBasePath = 'src/**/*.{js,jsx,ts,tsx}';

// Translations folder path
const translationFolder = 'src/translations/*.json';

//The skipKeys variable holds all the keys that we do not want to delete.
//These are the strings that we are not directly using and the keys can be dynamic.
//Place the main key here and its child key will be skipped.
const skipKeys = new Set([
]);

const masterFilePath = 'src/translations/translation-en.json';

optimiseTranslations(codeBasePath, translationFolder, skipKeys, masterFilePath);
