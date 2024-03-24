// Kamera elem kiválasztása
const videoElement = document.getElementById('videoElement');

// Gombok kiválasztása
const captureButton = document.getElementById('captureButton');
const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');
const clearButton = document.getElementById('clearButton');
const cameraButton = document.getElementById('cameraButton');

const controlsDiv = document.getElementById('controls');
const buttons = controlsDiv.getElementsByTagName('button');

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

let currentDeviceId;

// Kamera választó elem lekérése
const cameraSelect = document.getElementById('cameraSelect');

cameraSelect.addEventListener('change', function() {
	currentDeviceId = this.value;
});

// Médiaeszközök listázása
navigator.mediaDevices.getUserMedia({ video: true })
	.then(function(stream) {
		// Leállítjuk a streamet, mert csak a kamera nevére van szükségünk
		stream.getTracks().forEach(track => track.stop());

		return navigator.mediaDevices.enumerateDevices();
	})
	.then(function(devices) {
		devices.forEach(function(device) {
			// Ha a device egy kamera
			if (device.kind === 'videoinput') {
				// Új option elem létrehozása a kamera számára
				const option = document.createElement('option');
				option.value = device.deviceId;
				option.text = device.label || 'Kamera ' + (cameraSelect.length + 1);
				cameraSelect.appendChild(option);
			}
		});
	})
	.catch(function(err) {
		console.error('Hiba a médiaeszközök listázása közben:', err);
	});


// Várunk 3 másodpercet, és megnézzük, hány option eleme van a kamera választó selectnek
setTimeout(function() {
	if (cameraSelect.length > 1) {
		// Ha több, mint 1 option elem van, akkor megjelenítjük a cameraSelector div-et
		document.getElementById('cameraSelector').style.display = 'block';
	}
}, 3000);

// Kamera gomb eseménykezelő
cameraButton.addEventListener('click', function () {
	if (!isCameraOn) {
		// Média engedély kérése a kamera hozzáféréséhez
		navigator.mediaDevices.getUserMedia({ video: { deviceId: currentDeviceId } })
			.then(function (stream) {
				// Sikeresen megkaptuk a média streamet
				// Beállítjuk a streamet a videó elem forrásaként
				videoElement.srcObject = stream;
				videoElement.play(); // A videó lejátszása

				// Gombok engedélyezése a controls diven belül 3 másodperc késleltetéssel
				setTimeout(function() {
					for (let i = 1; i < buttons.length; i++) {
						buttons[i].disabled = false;
					}
				}, 3000);

				// Kamera gomb szövegének frissítése
				cameraButton.textContent = 'Leállítás';
				isCameraOn = true; // Kamera bekapcsolva

				// Kameraváltó elem letiltása
				cameraSelect.disabled = true;

			})
			.catch(function (error) {
				console.error('Error accessing media devices:', error);

				// Gombok letiltása
				captureButton.disabled = true;
				if (frames.length === 0) {
					playButton.disabled = true;
				}
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

		// Capture gomb letiltása
		captureButton.disabled = true;

		// Kameraváltó elem engedélyezése
		cameraSelect.disabled = false;

		// Letitljuk a vezérlőgombokat ha nincsenek képkockák
		if (frames.length === 0) {
			for (let i = 1; i < buttons.length; i++) {
				buttons[i].disabled = true;
			}
		}
		
	}
});

let selectedFrameIndex = 0; // Változó a kiválasztott képkocka indexének tárolására
let selectedFrame; // Változó a kiválasztott képkocka tárolására
let secondSelectedFrameIndex = null; // Változó a második kiválasztott képkocka indexének tárolására
let secondSelectedFrame; // Változó a második kiválasztott képkocka tárolására

// Képkocka készítése gomb eseménykezelő
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
    img.addEventListener('click', function (event) {
		if (event.shiftKey) {
			// Második kijelölés
			if (secondSelectedFrame) {
				// Ha a kijelölt képkocka már kijelölt, töröljük a kijelölést
				if (frames.indexOf(capturedFrame) === secondSelectedFrameIndex) {
					secondSelectedFrame.classList.remove('second-selected');
					secondSelectedFrame = null;
					secondSelectedFrameIndex = null;

					// Töröljük az overlayFrame div tartalmát
					document.getElementById('overlayFrame').innerHTML = '';
				} else {
					secondSelectedFrame.classList.remove('second-selected');
					secondSelectedFrameIndex = frames.indexOf(capturedFrame);
					secondSelectedFrame = framesDiv.children[secondSelectedFrameIndex];
					secondSelectedFrame.classList.add('second-selected');

					// Hozzáadás az overlayFrame divhez
					const overlayFrame = document.getElementById('overlayFrame');
					overlayFrame.innerHTML = ''; // Előző képkocka eltávolítása
					const img = document.createElement('img');
					img.src = capturedFrame;
					overlayFrame.appendChild(img);
				}
			} else {
				secondSelectedFrameIndex = frames.indexOf(capturedFrame);
				secondSelectedFrame = framesDiv.children[secondSelectedFrameIndex];
				secondSelectedFrame.classList.add('second-selected');

				// Hozzáadás az overlayFrame divhez
				const overlayFrame = document.getElementById('overlayFrame');
				overlayFrame.innerHTML = ''; // Előző képkocka eltávolítása
				const img = document.createElement('img');
				img.src = capturedFrame;
				overlayFrame.appendChild(img);
			}
		} else {
			// Normál kijelölés
			if (selectedFrame) {
				selectedFrame.classList.remove('selected');
			}
			selectedFrameIndex = frames.indexOf(capturedFrame);
			selectedFrame = framesDiv.children[selectedFrameIndex];
			selectedFrame.classList.add('selected');

			// Kép betöltése a playback canvasba
			const playbackCanvas = document.getElementById('playbackCanvas');
			const context = playbackCanvas.getContext('2d');
			const img = new Image();
			img.onload = function() {
				playbackCanvas.width = img.width;
				playbackCanvas.height = img.height;
				context.clearRect(0, 0, playbackCanvas.width, playbackCanvas.height);
				context.drawImage(img, 0, 0, playbackCanvas.width, playbackCanvas.height);
			};
			img.src = capturedFrame;
		}
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
            const img = new Image();
            img.src = frames[frameIndex];
			img.onload = function() {
				const playbackCanvas = document.getElementById('playbackCanvas');
				playbackCanvas.width = img.width;
				playbackCanvas.height = img.height;
				const ctx = playbackCanvas.getContext('2d');
				ctx.clearRect(0, 0, playbackCanvas.width, playbackCanvas.height); // Eltávolítjuk az előző képkockát
				ctx.drawImage(img, 0, 0); // Hozzáadjuk az új képkockát
			}

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
	// Ha van second-selected képkocka
	if (secondSelectedFrame) {
		// Töröljük a second-selected képkockát a frames-ből
		frames.splice(secondSelectedFrameIndex, 1);
		// Töröljük a second-selected képkockát a DOM-ból
		framesDiv.removeChild(framesDiv.children[secondSelectedFrameIndex]);
		// Töröljük a second-selected kijelölést
		secondSelectedFrame.classList.remove('second-selected');
		// Töröljük az overlayFrame div tartalmát
		const overlayFrame = document.getElementById('overlayFrame');
		overlayFrame.innerHTML = '';
		// Töröljük a helyi tárolóból a képkockákat
		localStorage.setItem('framesContent', frames.join(','));
		// Ürítjük a second-selected változókat
		secondSelectedFrame = null;
		secondSelectedFrameIndex = null;
	} else {
		// Töröljük a képkockákat
		frames = [];
		framesDiv.innerHTML = '';
		// Töröljük a lejátszást a canvasból
		const playbackCanvas = document.getElementById('playbackCanvas');
		const context = playbackCanvas.getContext('2d');
		context.clearRect(0, 0, playbackCanvas.width, playbackCanvas.height);
		// Töröljük a kijelöléseket
		if (selectedFrame) {
			selectedFrame.classList.remove('selected');
		}
		// Töröljük az overlayFrame div tartalmát
		const overlayFrame = document.getElementById('overlayFrame');
		overlayFrame.innerHTML = '';
		// Töröljük a helyi tárolóból a képkockákat
		localStorage.removeItem('framesContent');
	}

	// Letiltjuk a vezérlőgombokat, ha nincs több képkocka és nem megy a kamera
	if (frames.length === 0 && !isCameraOn) {
		for (let i = 1; i < buttons.length; i++) {
			buttons[i].disabled = true;
		}
	}

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

// Beállítások mentése
function saveSettings() {
	localStorage.setItem('xValue', xControl.value);
	localStorage.setItem('yValue', yControl.value);
	localStorage.setItem('sizeValue', sizeControl.value);
	localStorage.setItem('fps', fps);
}

// Eseménykezelők hozzáadása a vezérlő elemekhez
xControl.addEventListener('input', function() {
	updateCirclePositions();
	saveSettings();
});

yControl.addEventListener('input', function() {
	updateCirclePositions();
	saveSettings();
});

sizeControl.addEventListener('input', function() {
	updateCirclePositions();
	saveSettings();
});

fpsRange.addEventListener('input', function () {
	fps = parseInt(this.value);
	fpsValue.textContent = this.value; // Frissítjük az FPS értékét
	saveSettings();
});

// LocalStorage-ból való beállítások betöltése
function loadSettings() {
	if (localStorage.getItem('xValue')) {
		xControl.value = localStorage.getItem('xValue');
	}
	if (localStorage.getItem('yValue')) {
		yControl.value = localStorage.getItem('yValue');
	}
	if (localStorage.getItem('sizeValue')) {
		sizeControl.value = localStorage.getItem('sizeValue');
	}
	if (localStorage.getItem('fps')) {
		fps = parseInt(localStorage.getItem('fps'));
		fpsRange.value = fps;
		fpsValue.textContent = fps;
	}
	updateCirclePositions();
}

// Betöltjük a beállításokat, amikor a dokumentum betöltődik
document.addEventListener('DOMContentLoaded', loadSettings);

// Betöltjük a képkockákat, amikor a dokumentum betöltődik
document.addEventListener('DOMContentLoaded', loadFramesContent);

// Mentjük a képkockákat, amikor a dokumentum bezárul
window.addEventListener('beforeunload', saveFramesContent);

// Elmentjük a frames div tartalmát
function saveFramesContent() {
	var framesContent = document.getElementById('frames').innerHTML;
	localStorage.setItem('framesContent', framesContent);
}

// Visszatöltjük a frames div tartalmát
function loadFramesContent() {
	var savedFramesContent = localStorage.getItem('framesContent');
	if (savedFramesContent) {
		document.getElementById('frames').innerHTML = savedFramesContent;
	}
}