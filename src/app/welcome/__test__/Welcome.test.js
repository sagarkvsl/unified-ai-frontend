import { render, waitFor } from '@testing-library/react'
import useIntl from '@/src/translations'
import Welcome from '../components/Welcome'
import WelcomeClientComponent from '../components/WelcomeClientComponent'
import IntlWrapper from '@/tests'

describe('Brevo banner component testing', () => {
	it('renders a heading', async () => {
		const intl = await useIntl('en')

		const tree = render(<Welcome intl={intl} />)

		await waitFor(() => {
			expect(tree).toMatchSnapshot()
		})
	})
})

// Testing Client component
describe('Brevo banner component testing', () => {
	it('renders a heading', async () => {
		const intl = await useIntl('en')

		const tree = render(
			<IntlWrapper intl={intl.locale} messages={intl.messages}>
				<WelcomeClientComponent />
			</IntlWrapper>
		)

		await waitFor(() => {
			expect(tree).toMatchSnapshot()
		})
	})
})
