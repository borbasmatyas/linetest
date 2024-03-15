// Kamera elem kiválasztása
const videoElement = document.getElementById('videoElement');

// Gombok kiválasztása
const captureButton = document.getElementById('captureButton');
const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');
const clearButton = document.getElementById('clearButton');
const cameraButton = document.getElementById('cameraButton');

// Canvas és context létrehozása
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

// Képkockák tárolása
let frames = [];

// FPS beállítása
let fps = 15;

// FPS váltó és érték elemek lekérése
const fpsRange = document.getElementById('fpsRange');
const fpsValue = document.getElementById('fpsValue');

// Csúszka és FPS érték alapértelmezett értékének beállítása
fpsRange.value = fps;
fpsValue.textContent = fps;

// Eseménykezelő hozzáadása az FPS váltóhoz
fpsRange.addEventListener('input', function () {
	fps = parseInt(this.value);
	fpsValue.textContent = this.value; // Frissítjük az FPS értékét
});

let isCameraOn = false; // Flag a kamera állapotának követésére

// Eseménykezelő hozzáadása a document objektumhoz
document.addEventListener('keydown', function(event) {
    if (event.code === 'Enter') {
        // Enter lenyomásakor aktiválja a captureButton gombot
        captureButton.click();
    } else if (event.code === 'Space') {
        // Space lenyomásakor aktiválja a playButton gombot
        event.preventDefault(); // Megakadályozza a lapozás eseményt
        playButton.click();
    }
});


// Kamera gomb eseménykezelő
cameraButton.addEventListener('click', function () {
	if (!isCameraOn) {
		// Média engedély kérése a kamera hozzáféréséhez
		navigator.mediaDevices.getUserMedia({ video: true })
			.then(function (stream) {
				// Sikeresen megkaptuk a média streamet
				// Beállítjuk a streamet a videó elem forrásaként
				videoElement.srcObject = stream;
				videoElement.play(); // A videó lejátszása

				// Gombok engedélyezése a controls diven belül
				const controlsDiv = document.getElementById('controls');
				const buttons = controlsDiv.getElementsByTagName('button');
				for (let i = 0; i < buttons.length; i++) {
					buttons[i].disabled = false;
				}

				// Kamera gomb szövegének frissítése
				cameraButton.textContent = 'Leállítás';
				isCameraOn = true; // Kamera bekapcsolva
			})
			.catch(function (error) {
				console.error('Error accessing media devices:', error);

				// Gombok letiltása
				captureButton.disabled = true;
				playButton.disabled = true;
			});
	} else {
		// Kamera leállítása
		const stream = videoElement.srcObject;
		const tracks = stream.getTracks();

		tracks.forEach(function(track) {
			track.stop();
		});

		videoElement.srcObject = null;

		// Kamera gomb szövegének frissítése
		cameraButton.textContent = 'Indítás';
		isCameraOn = false; // Kamera leállítva
	}
});

let selectedFrameIndex = 0; // Változó a kiválasztott képkocka indexének tárolására
let selectedFrame; // Változó a kiválasztott képkocka tárolására

captureButton.addEventListener('click', function () {
	canvas.width = videoElement.videoWidth;
	canvas.height = videoElement.videoHeight;
	context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
	const capturedFrame = canvas.toDataURL('image/jpeg', 1);

	// Képkocka hozzáadása a frames tömbhöz
	frames.push(capturedFrame);

	// Képkocka hozzáadása a DOM-hoz
	const img = document.createElement('img');
	img.src = capturedFrame;
    img.addEventListener('click', function () {
        // Kiválasztott képkocka kiemelésének eltávolítása
        if (selectedFrame) {
            selectedFrame.classList.remove('selected');
        }
        // Kiválasztott képkocka indexének beállítása
        selectedFrameIndex = frames.indexOf(capturedFrame);
        // Kiválasztott képkocka kiemelése
        selectedFrame = framesDiv.children[selectedFrameIndex];
        selectedFrame.classList.add('selected');
    });
	const framesDiv = document.getElementById('frames');
	framesDiv.appendChild(img);

	// Görgessünk a frames (idővonal) végére
	setTimeout(() => {
		framesDiv.scrollLeft = framesDiv.scrollWidth - framesDiv.clientWidth;
	}, 3);

});

const framesDiv = document.getElementById('frames');
let playFrames; // Változó a setInterval visszatérési értékének tárolására
let previousFrame; // Változó az előző képkocka tárolására

playButton.addEventListener('click', function () {
	let frameIndex = typeof selectedFrameIndex !== 'undefined' ? selectedFrameIndex : 0;


	// Képkockák lejátszása
	playFrames = setInterval(function () {
		if (frameIndex >= frames.length) {
			clearInterval(playFrames); // Leállítjuk a lejátszást, ha az összes képkockát lejátszottuk
		} else {
			const img = document.createElement('img');
			img.src = frames[frameIndex];
			const playbackDiv = document.getElementById('playbackView');
			playbackDiv.innerHTML = ''; // Eltávolítjuk az előző képkockát
			playbackDiv.appendChild(img); // Hozzáadjuk az új képkockát

			// Az aktív képkocka kiemelése
			if (previousFrame) {
				previousFrame.classList.remove('active');
			}
			previousFrame = framesDiv.children[frameIndex];
			previousFrame.classList.add('active');

			// Görgessünk az aktív képkockához
			framesDiv.scrollLeft = previousFrame.offsetLeft - framesDiv.clientWidth / 2 + previousFrame.clientWidth / 2;

			frameIndex++;
		}
	}, 1000 / fps); // Az intervallumot az FPS alapján számoljuk ki
});

// Stop gomb eseménykezelő
stopButton.addEventListener('click', function () {
	clearInterval(playFrames); // Megállítjuk a lejátszást
	if (previousFrame) {
		previousFrame.classList.remove('active');
	}
});

// Clear gomb eseménykezelő
clearButton.addEventListener('click', function () {
	frames = []; // Töröljük a képkockákat
	framesDiv.innerHTML = ''; // Töröljük a képkockákat a DOM-ból
	playbackView.innerHTML = ''; // Töröljük a lejátszást
});

// Visszajelző elemek lekérése
const xValueDisplay = document.getElementById('xValueDisplay');
const yValueDisplay = document.getElementById('yValueDisplay');

// Vezérlő elemek lekérése
const xControl = document.getElementById('xControl');
const yControl = document.getElementById('yControl');

// Kör elemek lekérése
const captureCircleLeft = document.getElementById('captureCircle_left');
const captureCircleRight = document.getElementById('captureCircle_right');
const playbackCircleLeft = document.getElementById('playbackCircle_left');
const playbackCircleRight = document.getElementById('playbackCircle_right');

// Eseménykezelők hozzáadása a vezérlő elemekhez
xControl.addEventListener('input', updateCirclePositions);
yControl.addEventListener('input', updateCirclePositions);

function updateCirclePositions() {
	// Vezérlő elemek értékeinek lekérése
	const xValue = xControl.value;
	const yValue = yControl.value;

	// Visszajelző elemek frissítése
	xValueDisplay.textContent = xValue;
	yValueDisplay.textContent = yValue;

	// Kör elemek pozíciójának frissítése
	captureCircleLeft.style.left = xValue + '%';
	captureCircleRight.style.right = xValue + '%';
	playbackCircleLeft.style.left = xValue + '%';
	playbackCircleRight.style.right = xValue + '%';

	captureCircleLeft.style.top = yValue + '%';
	captureCircleRight.style.top = yValue + '%';
	playbackCircleLeft.style.top = yValue + '%';
	playbackCircleRight.style.top = yValue + '%';
}


// Méretvezérlő elem lekérése
const sizeControl = document.getElementById('sizeControl');

// Visszajelző elem lekérése
const sizeValueDisplay = document.getElementById('sizeValueDisplay');

// Eseménykezelő hozzáadása a méretvezérlőhöz
sizeControl.addEventListener('input', updateCirclePositions);

function updateCirclePositions() {
	// Vezérlő elemek értékeinek lekérése
	const xValue = xControl.value;
	const yValue = yControl.value;
	const sizeValue = sizeControl.value;

	// Visszajelző elemek frissítése
	xValueDisplay.textContent = xValue;
	yValueDisplay.textContent = yValue;
	sizeValueDisplay.textContent = sizeValue;

	// Kör elemek pozíciójának frissítése
	captureCircleLeft.style.left = xValue + '%';
	captureCircleRight.style.right = xValue + '%';
	playbackCircleLeft.style.left = xValue + '%';
	playbackCircleRight.style.right = xValue + '%';

	captureCircleLeft.style.top = yValue + '%';
	captureCircleRight.style.top = yValue + '%';
	playbackCircleLeft.style.top = yValue + '%';
	playbackCircleRight.style.top = yValue + '%';

	// Kör elemek méretének frissítése
	captureCircleLeft.style.width = sizeValue + 'px';
	captureCircleLeft.style.height = sizeValue + 'px';
	captureCircleRight.style.width = sizeValue + 'px';
	captureCircleRight.style.height = sizeValue + 'px';
	playbackCircleLeft.style.width = sizeValue + 'px';
	playbackCircleLeft.style.height = sizeValue + 'px';
	playbackCircleRight.style.width = sizeValue + 'px';
	playbackCircleRight.style.height = sizeValue + 'px';
}