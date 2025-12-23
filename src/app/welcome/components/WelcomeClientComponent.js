'use client'
import { useIntl } from 'react-intl'

export default function ExampleClientComponent() {
	const intl = useIntl()

	return (
		<>
			<p>Built-in feature from Next.js:</p>
			<ul>
				<li>
					<span aria-label='coffee' role='img'>
						☕
					</span>{' '}
					{intl.formatMessage({
            id: 'minifyHTML',
						defaultMessage: 'Minify HTML',
					})}{' '}
					&amp;{' '}
					{intl.formatMessage({
            id: 'css',
						defaultMessage: 'CSS',
					})}
				</li>
				<li>
					<span aria-label='dash' role='img'>
						💨
					</span>{' '}
					{intl.formatMessage({
            id: 'liveReload',
						defaultMessage: 'Live reload',
					})}
				</li>
				<li>
					<span aria-label='white_check_mark' role='img'>
						✅
					</span>{' '}
					{intl.formatMessage({
            id: 'cacheBusting',
						defaultMessage: 'Cache busting',
					})}
				</li>
			</ul>
		</>
	)
}
