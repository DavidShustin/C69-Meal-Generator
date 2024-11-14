const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			token: localStorage.getItem("token") || null,
			user: JSON.parse(localStorage.getItem("currentUser")) || null,
			userRestrictions: JSON.parse(localStorage.getItem("userRestrictions")) || null,
			userPreferences: JSON.parse(localStorage.getItem("userPreferences")) || null,
		},
		actions: {
			signup: async (email, password, firstName, lastName) => {
				try {
					const response = await fetch(process.env.BACKEND_URL + '/signup', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							email: email.toLowerCase(),
							password: password,
							first_name: firstName,
							last_name: lastName,
						})
					})
					const data = await response.json();
					console.log(data);
					return data;
				} catch (error) {
					console.log('There was an error at sign-up.', error);
					throw error
				}
			},
			login: async (email, password) => {
				try {
					const response = await fetch(process.env.BACKEND_URL + '/login', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							email: email.toLowerCase(),
							password: password

						})
					})
					const data = await response.json();
					localStorage.setItem('jwt-token', data.token);
					if (response.status === 200) {
						localStorage.setItem('token', data.token);
						localStorage.setItem("currentUser", JSON.stringify(data.user))
						console.log("currentUser from flux:", JSON.stringify(data.user))
						return true;
					} else if (response.status === 401) {
						alert(data.msg)
						return false;
					} else {
						console.log('Unexpected error occured at login.', response.status);
						return false;
					}
				} catch (error) {
					throw error;
				}
			},

			userProfile: async () => {
				try {
					const token = localStorage.getItem('jwt-token');

					const resp = await fetch(process.env.BACKEND_URL + '/private', {
						method: 'GET',
						headers: {
							"Content-Type": 'application/json',
							'Authorization': 'Bearer' + token
						}
					});

					if (!resp.ok) {
						throw Error('There was a problem at login')
					} else if (resp.status === 403) {
						throw Error('Missing or invalid token');
					} else {
						throw Error('Unknown error');
					}
				} catch (error) {
					console.log('There was an error fining your account', error)
				}

				const data = await resp.json();
				console.log('This is the data you requested', data);
				return data
			},

			getUserRestrictions: async () => {
				const store = getStore();
				if (!store.token) return;
				try {
					const resp = await fetch(`${process.env.BACKEND_URL}/get-user-restrictions`, {
						headers: { "Authorization": `Bearer ${store.token}`}
					});
					if(resp.ok) {
						const data = await resp.json();

						const formattedRestrictions = {};
						Object.entries(data).forEach(([key, value]) => {
							if (key !== "id" && key !== "user_id") {
								const formattedKey = key.split('_')
									.map(word => word.charAt(0).toUpperCase() + word.slice(1))
									.join(' ');
								formattedRestrictions[formattedKey] = value;
							}
						});

						localStorage.setItem("userRestrictions", JSON.stringify(formattedRestrictions));
						setStore({ userRestrictions: formattedRestrictions});
						return formattedRestrictions;
					}
				} catch (error) {
					console.error("error fetching user restrictions:", error)
				}
			},
			updateUserRestrictions: async (restrictions) => {
				const store = getStore();
				if (!store.token) return;

				const apiRestrictions = {};
				Object.entries(restrictions).forEach(([key, value]) => {
					const snakeKey = key.toLowerCase().replace(/ /g, '_');
					apiRestrictions[snakeKey] = value;
				});

				try {
					const resp = await fetch(`${process.env.BACKEND_URL}/edit-user-restrictions`, {
						method: 'PUT',
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${store.token}`
						},
						body: JSON.stringify(apiRestrictions)
					});

					if (resp.ok) {
						localStorage.setItem("userRestrictions", JSON.stringify(restrictions));
						setStore({ userRestrictions: restrictions});
						return {success: true};
					}
					return { success: false, error: "failed to update restrictions"};
				} catch (error) {
					console.error("error updating user restrictions:", error);
					return {success: false, error: "error updating restrictions"}
				}
			},

			getUserPreferences: async () => {
				const store = getStore();
				if (!store.token) return;
				try {
					const resp = await fetch(`${process.env.BACKEND_URL}/get-user-preferences`, {
						headers: { "Authorization": `Bearer ${store.token}`}
					});
					if(resp.ok) {
						const data = await resp.json();

						const formattedPreferences = {};
						Object.entries(data).forEach(([key, value]) => {
							if (key !== "id" && key !== "user_id") {
								const formattedKey = key.split('_')
									.map(word => word.charAt(0).toUpperCase() + word.slice(1))
									.join(' ');
								formattedPreferences[formattedKey] = value;
							}
						});

						localStorage.setItem("userPreferences", JSON.stringify(formattedPreferences));
						setStore({ userPreferences: formattedPreferences});
						return formattedPreferences;
					}
				} catch (error) {
					console.error("error fetching user preferences:", error)
				}
			},
			updateUserPreferences: async (preferences) => {
				const store = getStore();
				if (!store.token) return;

				const apiPreferences = {};
				Object.entries(preferences).forEach(([key, value]) => {
					const snakeKey = key.toLowerCase().replace(/ /g, '_');
					apiPreferences[snakeKey] = value;
				});

				try {
					const resp = await fetch(`${process.env.BACKEND_URL}/edit-user-preferences`, {
						method: 'PUT',
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${store.token}`
						},
						body: JSON.stringify(apiPreferences)
					});

					if (resp.ok) {
						localStorage.setItem("userPreferences", JSON.stringify(preferences));
						setStore({ userPreferences: preferences});
						return {success: true};
					}
					return { success: false, error: "failed to update preferences"};
				} catch (error) {
					console.error("error updating user preferences:", error);
					return {success: false, error: "error updating preferences"}
				}
			},

			
			logout: () => {
				localStorage.removeItem("token");
				localStorage.removeItem("currentUser");
				localStorage.removeItem("userRestrictions");
				setStore({ token: null, user: null, userRestrictions: null});
			},
		},
	};
}

export default getState