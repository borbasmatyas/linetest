class Capture extends Camera {
	constructor() {
		super();
		this.frameNumber = 0;
        this.initEventHandlers();
    
	}

	initEventHandlers() {
        // Eseménykezelő a gombra kattintásra
        this.captureButton.addEventListener('click', () => this.addImageToTimeline());

        // Eseménykezelő a billentyűleütésekre
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === 'c') {
                this.addImageToTimeline();
            }
        });
    }

	async captureImage() {
		if (!this.videoStream) {
			console.error('The video stream is not set');
			throw new Error('The video stream is not set');
		}

		
		
		return photoBlob;
	}

	async addImageToTimeline() {
		// Elkészítjük a képet
		const photoBlob = await this.captureImage();
		// Létrehozunk egy URL-t a Blob objektumból
		const url = URL.createObjectURL(photoBlob);
		// Létrehozunk egy új img elemet
		const img = document.createElement('img');
		// Beállítjuk az img elem src attribútumát az URL-re
		img.src = url;

		// Lekérdezzük az összes img elemet a timeline-ban
		const images = this.timeLine.querySelectorAll('img');
		// Ha van kép a timeline-ban, akkor az utolsó sorszámától folytatjuk
		if (images.length > 0) {
			const lastImage = images[images.length - 1];
			this.frameNumber = Number(lastImage.dataset.frame) + 1;
		} else {
			this.frameNumber = 0;
		}

		// Beállítjuk a data-frame attribútumot a számláló aktuális értékére
		img.dataset.frame = this.frameNumber;
		// Hozzáadjuk az img elemet a timeline elemhez
		this.timeLine.appendChild(img);
	}
}

// Inicializálás
try {
	const capture = new Capture();
	//capture.loadFps();
} catch (error) {
	console.error('Error initializing camera:', error);
}

