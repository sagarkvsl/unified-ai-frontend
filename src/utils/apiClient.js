async function apiClient(
	API_URL,
	endpoint,
	{ data, headers: customHeaders, ...customConfig } = {}
) {
	const { ...restData } = data || {}

	const config = {
		method: Object.keys(restData).length ? 'POST' : 'GET',
		credentials: 'include',
		body: Object.keys(restData).length
			? JSON.stringify(restData)
			: undefined,
		headers: {
			'Content-Type': 'application/json',
			...customHeaders,
		},
		...customConfig,
	}
	return fetch(`${API_URL}/${endpoint}`, config).then(async (response) => {
		if (response.status >= 200 && response.status <= 299) {
			if (response.status === 204) {
				return {}
			}
			const data = await response.json()
			return { data }
		}

		return Promise.resolve({
			isError: true,
			status: response.status,
			message: response.statusText,
			error: (await response.json()) || {},
		})
	})
}

export { apiClient }
