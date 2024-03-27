const SETTINGS_PREFIX = 'settings_';

class LocalStorage {

	constructor() {
		
		// Beállításokat törlő gomb
		const clearSettingsButton = document.getElementById('clearSettings');
	}

	get(key) {
		try {
			const value = localStorage.getItem(`${SETTINGS_PREFIX}${key}`);
			return value ? JSON.parse(value) : null;
		} catch (error) {
			console.error('Error parsing JSON from local storage:', error);
			return null;
		}
	}

    set(key, value) {
        try {
            localStorage.setItem(`${SETTINGS_PREFIX}${key}`, JSON.stringify(value));
        } catch (error) {
            console.error('Error stringifying value for local storage:', error);
        }
    }

	clearSettings(settings_group) {
		Object.keys(localStorage).forEach(key => {
			if (key.startsWith(`${SETTINGS_PREFIX}${settings_group}`)) {
				localStorage.removeItem(key);
			}
		});
	}
}



let localStorageInstance;
try {
	localStorageInstance = new LocalStorage();
} catch (error) {
	console.error('Error initializing LocalStorage:', error);
	throw new Error('Error initializing LocalStorage:', error);
}






//export { localStorageInstance };
