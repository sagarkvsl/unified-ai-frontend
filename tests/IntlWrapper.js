import ServerIntlProvider from '@/src/app/components/ServerIntlProvider'

const IntlWrapper = ({ intl, children }) => {
	return (
		<ServerIntlProvider locale={intl.locale} messages={intl.messages}>
			{children}
		</ServerIntlProvider>
	)
}

export default IntlWrapper
