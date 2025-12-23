import { NextResponse } from 'next/server'
import { getUrlForApp } from '@dtsl/url-fetch/dist/getUrlForApp'

export async function middleware(request) {
	const requestHeaders = new Headers(request.headers)

	const cookies = requestHeaders.get('cookie') || {}
	const userAgent =
		requestHeaders.get('user-agent') ||
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'

	const data = await (
		await fetch('https://onboarding-api.brevo.com/authentication', {
			headers: {
				Cookie: cookies.toString(),
				'user-agent': userAgent,
			},
		})
	).json()

	const { result: { success } = {} } = data || {}

	if (success === 'Login_success') {
		const { APP_DOMAIN } = getUrlForApp(process.env.NEXT_PUBLIC_APP_ENV)
		return NextResponse.redirect(APP_DOMAIN)
	}

	const response = NextResponse.next()
	return response
}
