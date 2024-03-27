class Camera {

    constructor() {
        this.videoStream = null;
        this.cameraInitButton = document.getElementById('cameraInit');
        this.videoSourceDropdown = document.getElementById('videoSource');
        this.cameraButton = document.getElementById('cameraButton');
        this.captureButton = document.getElementById('captureButton');
        this.calibrateButton = document.getElementById('calibrateButton');
        this.videoTarget = document.getElementById('video-target');
        this.bwModeCheckbox = document.getElementById('bwMode');
        this.upperThreshold = document.getElementById('upperThreshold');
        this.lowerThreshold = document.getElementById('lowerThreshold');
        this.canvas = document.getElementById('canvas');
        this.fpsInput = document.getElementById('fps');
        this.loadFps();
        this.timeLine = document.getElementById('timeline');

    }

    /**
     * Kamera hozzáférést kér
     * 
     * @returns {Promise<void>}
     * @throws {Error} Dob hibát, ha nem sikerül hozzáférni a kamerához
     */
    async requestCameraAccess() {
        try {
            this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            await this.getVideoSources();
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
            // Ellenőrizzük vannak-e kamerák
            if (this.videoSourceDropdown.options.length === 0) {
                console.error('No camera devices found');
                throw new Error('No camera devices found');
            }
            setTimeout(() => {
                this.cameraButton.removeAttribute('disabled');
                this.fpsInput.removeAttribute('disabled');
                this.videoSourceDropdown.removeAttribute('disabled');
            }, 3000);
            this.cameraInitButton.setAttribute('disabled', 'disabled');
        } catch (error) {
            console.error('Error accessing the camera:', error);
            throw new Error('Error accessing the camera:', error);
        }
    }

    /**
     * Lekéri a kamera eszközöket
     * 
     * @returns {Promise<void>}
     * @throws {Error} Dob hibát, ha nem sikerül lekérni a kamera eszközöket
     */
    async getVideoSources() {
        try {
            this.videoSourceDropdown.innerHTML = '';
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            videoDevices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Kamera ${this.videoSourceDropdown.options.length + 1}`;
                this.videoSourceDropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error accessing camera devices:', error);
            throw new Error('Error accessing camera devices:', error);
        }
    }

    /**
     * Elindítja a kamerát
     * 
     * @param {string} deviceId - A kamera eszköz azonosítója
     * @returns {Promise<void>}
     * @throws {Error} - Ha nem sikerül elindítani a kamerát
     * @throws {TypeError} - Ha a deviceId paraméter hiányzik
     */

    async startCamera(deviceId) {
        if (!deviceId) {
            console.error('The deviceId parameter is missing');
            throw new TypeError('A deviceId paraméter hiányzik');
        }

        try {
            const constraints = {
                video: {
                    deviceId: { exact: deviceId },
                    //width: { min: 480, ideal: 1920 },
                    //height: { min: 360, ideal: 1080 },
                    //aspectRatio: 1.333333333, // 4:3 arány
                    //frameRate: 30, // 30 képkocka másodpercenként
                    //facingMode: 'user', // az előlapi kamera használata
                    //resizeMode: 'crop-and-scale' // a videó átméretezése a crop-and-scale módszerrel
                }
            };
            this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        
            this.videoElement = document.createElement('video');
            this.videoElement.autoplay = true;
            this.videoElement.srcObject = this.videoStream;
            this.videoTarget.appendChild(this.videoElement);
            setTimeout(() => {
                this.captureButton.removeAttribute('disabled');
                this.calibrateButton.removeAttribute('disabled');
                this.upperThreshold.removeAttribute('disabled');
                this.lowerThreshold.removeAttribute('disabled');
                this.bwModeCheckbox.removeAttribute('disabled');
            }, 3000);

            this.videoElement.addEventListener('loadeddata', function() {
                // A videókeret lekérése és kirajzolása a canvasra
                const ctx = this.canvas.getContext('2d');
                ctx.drawImage(this.videoElement, 0, 0);

                // A videókeret lekérése
                const frame = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

                // A videókeret feldolgozása és a módosított kép kirajzolása a canvasra
                this.processFrame(frame, 50, 200); // Alkalmazza a szürkeárnyalatos konverziót és a határérték-szűrést a keretre
            }.bind(this));

        } catch (error) {
            console.error('Error accessing the camera:', error);
            throw new Error('Error accessing the camera:', error);
        }
    }



    /**
     * Leállítja a kamerát
     * 
     * @returns {Promise<void>}
     * @throws {Error} Dob hibát, ha a kamera nem fut
     */
    async stopCamera() {
        if (!this.videoStream) {
            console.error('The camera is not running.');
            throw new Error('The camera is not running.');
        }

        try {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
            const videoElement = document.querySelector('video');
            if (videoElement) {
                videoElement.remove();
            }
            this.captureButton.setAttribute('disabled', 'disabled');
            this.calibrateButton.setAttribute('disabled', 'disabled');
            this.upperThreshold.setAttribute('disabled', 'disabled');
            this.lowerThreshold.setAttribute('disabled', 'disabled');
            this.bwModeCheckbox.setAttribute('disabled', 'disabled');
        } catch (error) {
            console.error('Error stopping the camera:', error);
            throw new Error('Error stopping the camera:', error);
        }
    }

    /**
     * Beállítja a fps értéket
     * 
     * @param {number} fps - A képkocka per másodperc értéke
     * @returns {Promise<void>}
     * @throws {Error} Dob hibát, ha nem sikerül beállítani az fps értéket
     */
    async setFps(fps) {
        try {
            // Eltároljuk a beállítást a megfelelő előtaggal
            localStorageInstance.set('fps', fps);
        } catch (error) {
            console.error('Error setting FPS:', error);
            throw new Error('Error setting FPS:', error);
        }
    }

    /**
     * Betölti a local storage-ban tárolt fps értéket
     * 
     * @returns {Promise<void>}
     * @throws {Error} Dob hibát, ha nem sikerül betölteni az fps értéket
     */
    async loadFps() {
        try {
            const fps = localStorageInstance.get('fps') || this.fpsInput.value;
            this.fpsInput.value = fps;
        } catch (error) {
            console.error('Error loading FPS:', error);
            throw new Error('Error loading FPS:', error);
        }
    }



    async captureImage(blackAndWhite = false, calibrate = false) {
        if (!this.videoStream) {
            console.error('The camera is not running.');
            throw new Error('The camera is not running.');
        }

        try {
            const videoElement = document.querySelector('video');
            this.canvas.width = videoElement.videoWidth;
            this.canvas.height = videoElement.videoHeight;
            const context = this.canvas.getContext('2d');
            context.drawImage(videoElement, 0, 0, this.canvas.width, this.canvas.height);

            // Ha a blackAndWhite paraméter true, akkor módosítjuk a képet
            if (blackAndWhite) {
                const frame = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
                const threshold = localStorageInstance.get('threshold') || { lowerThreshold: 180, upperThreshold: 150 };
                const modifiedFrame = this.processFrame(frame, threshold.lowerThreshold, threshold.upperThreshold, true);
                context.putImageData(modifiedFrame, 0, 0);
            }

            const imageUrl = this.canvas.toDataURL('image/png');
            const img = document.createElement('img');
            img.src = imageUrl;

            // Ha a calibrate paraméter true, akkor nem adjuk hozzá a képkockát a timeline-hoz, csak a canvas-ra rajzoljuk ki
            if (!calibrate) {
                // Megkeressük az utolsó képkocka sorszámát
                const lastFrameNumber = Math.max(...Array.from(this.timeLine.children).map(child => Number(child.dataset.frame)), 0);

                // Hozzáadjuk a data-frame attribútumot az img elemhez
                img.dataset.frame = lastFrameNumber + 1;

                this.timeLine.appendChild(img);
            }
        } catch (error) {
            console.error('Error capturing image:', error);
            throw new Error('Error capturing image:', error);
        }
    }

    /**
     * Fekete-fehér kép létrehozása
     *
     */
    processFrame(frame, lowerThreshold, upperThreshold, white_to_alpha = false) {
        const data = frame.data;
        for (let i = 0; i < data.length; i += 4) {
            // Szürkeárnyalatos konverzió
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const v = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            // Határérték-szűrés
            if (v >= Math.min(lowerThreshold, upperThreshold) && v <= Math.max(lowerThreshold, upperThreshold)) {
                data[i] = data[i + 1] = data[i + 2] = 0; // Fekete pixelek feketévé tétele
                if (white_to_alpha) {
                    data[i + 3] = 255; 
                }
            } else {
                data[i] = data[i + 1] = data[i + 2] = 255; // Fehér pixelek fehérré tétele
                if (white_to_alpha) {
                    data[i + 3] = 0; // Fehér pixelek átlátszóvá tétele
                }
            }
        }
        return frame;
    }



}

// Inicializálás

try {
    const camera = new Camera();

    camera.cameraInitButton.addEventListener('click', () => {
        if (camera.videoStream) {
            camera.stopCamera();
        } else {
            camera.requestCameraAccess();
        }
    });

    camera.cameraButton.addEventListener('click', async () => {
        const deviceId = camera.videoSourceDropdown.value;
        if (deviceId) {
            if (camera.videoStream) {
                camera.cameraButton.innerText = 'Indítás';
                await camera.stopCamera();
            } else {
                camera.cameraButton.innerText = 'Leállítás';
                await camera.startCamera(deviceId);
            }
        }
    });

    camera.fpsInput.addEventListener('change', async function () {
        const fps = this.value;
        await camera.setFps(fps);
    });

    document.getElementById('bwMode').addEventListener('change', function () {
        camera.bwMode = this.checked;
    });

    // Definiáljuk a captureImage metódust hívó függvényt
    const triggerCaptureImage = async (event) => {
        if (event.type === 'click' || event.key === 'Enter' || event.key.toLowerCase() === 'c') {
            await camera.captureImage(camera.bwMode);
        }
    };

    // Hozzárendeljük a függvényt a captureButton click eseményéhez
    camera.captureButton.addEventListener('click', triggerCaptureImage);

    // Hozzárendeljük a függvényt a document keydown eseményéhez
    document.addEventListener('keydown', triggerCaptureImage);

    camera.calibrateButton.addEventListener('click', async () => {
        await camera.captureImage(true, true);
    }
    );



}
catch (error) {
    console.error('Error initializing camera:', error);
}