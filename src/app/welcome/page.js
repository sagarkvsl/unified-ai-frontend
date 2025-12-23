import { cookies } from 'next/headers'
import useIntl from '@/src/translations'
import Welcome from './components/Welcome'

/*
// Below code shows an example for data fetching in server components.

import { headers } from 'next/headers'
import { apiClient } from '@/src/utils/apiClient'

async function getData() {
	const headersList = headers()
	const userAgent =
		headersList.get('user-agent') ||
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'

	return apiClient('https://onboarding-api.brevo.com', 'authentication', {
		headers: {
			Cookie: cookies().toString(),
			'user-agent': userAgent,
		},
	})
}
*/

export default async function LoginPage() {
	const cookieStore = cookies()
	/*
    // Below code shows an example for data fetching in server components.
	const { data, isError } = await getData()

    if(isError) {
        return <div>Something went wrong</div>
    }
    */

	const { value: locale = 'en' } = cookieStore.get('tmpl_lang') || {}
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const intl = await useIntl(locale)

	return <Welcome intl={intl} />
}

export const runtime = 'edge'
