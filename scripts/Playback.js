class Playback {
    constructor() {
        this.playbackInterval = null;
        this.playButton = document.getElementById('playButton');
        this.playButton.addEventListener('click', () => this.playback());
		this.stopButton = document.getElementById('stopButton');
		this.clearFramesButton = document.getElementById('clearFrames');

		this.clearSettingsButton = document.getElementById('clearSettings');
		this.clearCalibrationButton = document.getElementById('clearCalibrationButton');

		this.secondarySelected = null;
		this.selected = null;
		this.frameNumber = null;

		// Megállítjuk a lejátszást, ha a stop gombra kattintunk
        this.stopButton.addEventListener('click', () => {
            if (this.playbackInterval) {
                clearInterval(this.playbackInterval);
                this.playbackInterval = null;
                this.resetFrameIndex();
            }
        });

        // Figyeljük a timeline gyermek elemeinek számát
        const timeline = document.getElementById('timeline');
        new MutationObserver(() => {
            // Ha van legalább egy kép, engedélyezzük a lejátszás gombot
            this.playButton.disabled = timeline.children.length === 0;

			// Ha van legalább egy kép, engedélyezzük a képkocka törlés gombot
			this.clearFramesButton.disabled = timeline.children.length === 0;
			
			// Ha van legalább egy elem, letiltjuk a clearSettings gombot
			this.clearSettingsButton.disabled = timeline.children.length !== 0;

			// Ha van legalább egy elem, letiltjuk a clearThreshold gombot
			this.clearCalibrationButton.disabled = timeline.children.length !== 0;

        }).observe(timeline, { childList: true });

        // Kijelölés kezelése
        timeline.addEventListener('click', (event) => {
            if (!event.shiftKey && event.target.tagName === 'IMG') {
                const selected = timeline.querySelector('.selected');
                if (selected) {
                    selected.classList.remove('selected');
                }
                event.target.classList.add('selected');
            }
        });

		// Másodlagos kijelölés kezelése
        timeline.addEventListener('click', (event) => {
            if (event.shiftKey && event.target.tagName === 'IMG') {
                this.secondarySelected = timeline.querySelector('.secondary-selected');
                if (this.secondarySelected) {
                    this.secondarySelected.classList.remove('secondary-selected');
                    this.clearOverlay();
					this.secondarySelected = null;
					this.frameNumber = null;
                }
                if (this.secondarySelected !== event.target) {
                    event.target.classList.add('secondary-selected');
                    this.setOverlay(event.target.src);
					
					// Képkocka sorszámának meghatározása
					const frames = Array.from(timeline.children);
					this.frameNumber = frames.findIndex(frame => frame === event.target);

                }
            }
        });

		// Képkockák törlése
		this.clearFramesButton.addEventListener('click', () => {
			this.clearFrames(this.frameNumber);
		});



    }

	playback() {
        const timeline = document.getElementById('timeline');
        const frames = Array.from(timeline.children);
        const canvasTarget = document.getElementById('canvas-target');
        let canvas = canvasTarget.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvasTarget.appendChild(canvas);
        }
        const context = canvas.getContext('2d');
        const fps = document.getElementById('fps').value;
        const frameDuration = 1000 / fps;

        // Kezdjük a kijelölt képkockától, ha van ilyen
        let frameIndex = frames.findIndex(frame => frame.classList.contains('selected'));
        if (frameIndex === -1) {
            frameIndex = 0;
        }

		if (this.playbackInterval) {
			clearInterval(this.playbackInterval);
			this.playbackInterval = null;
			this.playButton.textContent = 'Lejátszás';
			this.stopButton.setAttribute('disabled', 'disabled');
			return;
		}
	
		this.playButton.textContent = 'Szünet';

		// Stop gomb engedélyezése
		this.stopButton.removeAttribute('disabled');
	

		this.playbackInterval = setInterval(() => {
			if (frameIndex >= frames.length) {
				clearInterval(this.playbackInterval);
				this.playbackInterval = null;
				return;
			}
			const frame = frames[frameIndex];
			const image = new Image();
			image.onload = () => {
				canvas.width = image.width;
				canvas.height = image.height;
				context.drawImage(image, 0, 0);
			};
			image.src = frame.src;

			// Eltávolítjuk az 'active' osztályt az előző képkockáról
			if (frameIndex > 0) {
				frames[frameIndex - 1].classList.remove('active');
			}

			// Hozzáadjuk az 'active' osztályt az aktuális képkockához
			frame.classList.add('active');

			// Görgetjük a timeline divet, hogy az aktuális képkocka látható legyen
			//timeline.scrollLeft = frame.offsetLeft - timeline.offsetLeft;

			// Görgetjük a timeline divet, hogy az aktuális képkocka középen legyen
			timeline.scrollLeft = frame.offsetLeft - timeline.offsetLeft + frame.offsetWidth / 2 - timeline.offsetWidth / 2;


			frameIndex++;
			if (frameIndex >= frames.length) {
				clearInterval(this.playbackInterval);
				this.playbackInterval = null;
				this.playButton.textContent = 'Lejátszás';
				this.stopButton.setAttribute('disabled', 'disabled');
				frames[frameIndex - 1].classList.remove('active');		
			}
		}, frameDuration);
	}

	setOverlay(src) {
        const canvasTarget = document.getElementById('canvas-target');
        let overlay = canvasTarget.querySelector('.overlay');
        if (!overlay) {
            overlay = document.createElement('canvas');
            overlay.classList.add('overlay');
            canvasTarget.appendChild(overlay);
        }
        const context = overlay.getContext('2d');
        const image = new Image();
        image.onload = () => {
            overlay.width = image.width;
            overlay.height = image.height;
            context.drawImage(image, 0, 0);
        };
        image.src = src;
    }

    clearOverlay() {
        const canvasTarget = document.getElementById('canvas-target');
        const overlay = canvasTarget.querySelector('.overlay');
        if (overlay) {
            const context = overlay.getContext('2d');
            context.clearRect(0, 0, overlay.width, overlay.height);
        }
    }

	resetFrameIndex() {
        const timeline = document.getElementById('timeline');
        const frames = Array.from(timeline.children);
        this.frameIndex = frames.findIndex(frame => frame.classList.contains('selected'));
        if (this.frameIndex === -1) {
            this.frameIndex = 0;
        }
    }

	clearFrames(selected) {
		const timeline = document.getElementById('timeline');
		if (selected !== undefined && selected !== null && Number.isInteger(selected)) {
			if (selected >= 0 && selected < timeline.children.length) {
				timeline.children[selected].remove();
			}
		} else {
			timeline.innerHTML = '';
		}
	}

}

const playback = new Playback();