'use client'

import { IntlProvider } from 'react-intl'

export default function ServerIntlProvider({ messages, locale, children }) {
	return (
		<IntlProvider locale={locale} messages={messages}>
			{children}
		</IntlProvider>
	)
}
