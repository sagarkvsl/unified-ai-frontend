import ServerIntlProvider from '@/src/app/components/ServerIntlProvider'
import WelcomeClientComponent from './WelcomeClientComponent'

export default function Welcome({ intl }) {
	return (
		<div className='w-full px-1 text-gray-700 antialiased'>
			<div className='mx-auto max-w-screen-md'>
				<h2 className='text-2xl font-bold'>
					<div>
						{intl.formatMessage({
                            id: 'boilerplateMessage',
							defaultMessage:
								'Boilerplate code for your Nextjs project',
						})}
					</div>
				</h2>

				<p>
					<span aria-label='rocket' role='img'>
						🚀
					</span>{' '}
					Next.js Boilerplate is a starter code for your Next js
					project by putting developer experience first .{' '}
					<span aria-label='zap' role='img'>
						⚡️
					</span>{' '}
					Made with Next.js, ESLint, Prettier, Husky, Lint-Staged,
					VSCode, CF-Pages, PostCSS.
				</p>

				<h3 className='text-lg font-semibold pt-3'>
					Next js Boilerplate Features
				</h3>

				<p>Developer experience first:</p>
				<ul>
					<li>
						<span aria-label='fire' role='img'>
							🔥
						</span>{' '}
						<a href='https://nextjs.org' rel='nofollow'>
							Next.js
						</a>{' '}
						for Static Site Generator
					</li>
					<li>
						<span aria-label='nail_care' role='img'>
							💅
						</span>{' '}
						PostCSS
					</li>
					<li>
						<span aria-label='pencil2' role='img'>
							✏️
						</span>{' '}
						Linter with{' '}
						<a href='https://eslint.org' rel='nofollow'>
							ESLint
						</a>
					</li>
					<li>
						<span aria-label='hammer_and_wrench' role='img'>
							🛠
						</span>{' '}
						Code Formatter with{' '}
						<a href='https://prettier.io' rel='nofollow'>
							Prettier
						</a>
					</li>
					<li>
						<span aria-label='fox_face' role='img'>
							🦊
						</span>{' '}
						Husky for Git Hooks
					</li>
					<li>
						<span aria-label='no_entry_sign' role='img'>
							🚫
						</span>{' '}
						Lint-staged for running linters on Git staged files
					</li>
					<li>
						<span aria-label='no_entry_sign' role='img'>
							🗂
						</span>{' '}
						VSCode configuration: Debug, Settings, Tasks and
						extension for PostCSS, ESLint, Prettier, TypeScript
					</li>
					<li>
						<span aria-label='robot' role='img'>
							⚙️
						</span>{' '}
						<a
							href='https://www.npmjs.com/package/@next/bundle-analyzer'
							rel='nofollow'
						>
							Bundler Analyzer
						</a>
					</li>
					<li>
						<span aria-label='hundred' role='img'>
							💯
						</span>{' '}
						Maximize lighthouse score
					</li>
				</ul>

				<ServerIntlProvider
					locale={intl.locale}
					messages={intl.messages}
				>
					<WelcomeClientComponent />
				</ServerIntlProvider>
			</div>
		</div>
	)
}
