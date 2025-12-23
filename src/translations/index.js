import { createIntl } from '@formatjs/intl'

export const TRANSLATIONS_MAPPING = {
	en: 'translation-en.json',
	fr: 'translation-fr.json',
	de: 'translation-de.json',
	es: 'translation-es.json',
	it: 'translation-it.json',
	pt: 'translation-pt.json',
}

export async function getTranslations(locale) {
	const jsonfile = await import(`./${TRANSLATIONS_MAPPING[locale]}`)
	if (locale !== 'en') {
		const jsonEnfile = await import(`./${TRANSLATIONS_MAPPING.en}`)
		return {
			...jsonEnfile.default,
			...jsonfile.default,
		}
	}
	return jsonfile.default
}

export default async function useIntl(locale) {
	return createIntl({
		locale,
		messages: await getTranslations(locale),
	})
}
