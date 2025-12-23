// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'

jest.mock('next/dynamic', () => ({
	__esModule: true,
	default: (...props) => {
		const dynamicModule = jest.requireActual('next/dynamic')
		const dynamicActualComp = dynamicModule.default
		const RequiredComponent = dynamicActualComp(props[0])
		RequiredComponent.preload
			? RequiredComponent.preload()
			: RequiredComponent.render.preload()
		return RequiredComponent
	},
}))

/**
 * JSDOM does not implement global "open" & "scrollTo" function & execCommand
 */
window.open = jest.fn()
window.scrollTo = jest.fn()
document.execCommand = jest.fn()
