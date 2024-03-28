function updatePin(pinId, size, top, side) {
	const pin = document.getElementById(pinId);
	pin.style.width = `${size}px`;
	pin.style.height = `${size}px`;
	pin.style.top = `${top}%`;
	pin.style[pinId === 'left-pin' ? 'left' : 'right'] = `${side}%`;
}

function updatePinValue(spanId, value) {
	document.getElementById(spanId).innerText = value;
}

function initializePins() {
	const positionPins = localStorageInstance.get('positionPins') || {};
	const pinSize = positionPins.pinSize || document.getElementById('pinSize').value;
	const topOffset = positionPins.topOffset || document.getElementById('topOffset').value;
	const sideOffset = positionPins.sideOffset || document.getElementById('sideOffset').value;

	document.getElementById('pinSize').value = pinSize;
	document.getElementById('topOffset').value = topOffset;
	document.getElementById('sideOffset').value = sideOffset;

	updatePinValue('pinSizeValue', pinSize);
	updatePinValue('topOffsetValue', topOffset);
	updatePinValue('sideOffsetValue', sideOffset);

	updatePin('left-pin', pinSize, topOffset, sideOffset);
	updatePin('right-pin', pinSize, topOffset, sideOffset);
}

initializePins();

function handlePinChange(inputId, spanId, pinId) {
	const input = document.getElementById(inputId);
	const value = input.value;
	updatePinValue(spanId, value);
	updatePin(pinId, document.getElementById('pinSize').value, document.getElementById('topOffset').value, document.getElementById('sideOffset').value);

	const positionPins = localStorageInstance.get('positionPins') || {};
	positionPins[inputId] = value;
	localStorageInstance.set('positionPins', positionPins);
}

document.getElementById('pinSize').addEventListener('input', function() {
	handlePinChange('pinSize', 'pinSizeValue', 'left-pin');
	handlePinChange('pinSize', 'pinSizeValue', 'right-pin');
});

document.getElementById('topOffset').addEventListener('input', function() {
	handlePinChange('topOffset', 'topOffsetValue', 'left-pin');
	handlePinChange('topOffset', 'topOffsetValue', 'right-pin');
});

document.getElementById('sideOffset').addEventListener('input', function() {
	handlePinChange('sideOffset', 'sideOffsetValue', 'left-pin');
	handlePinChange('sideOffset', 'sideOffsetValue', 'right-pin');
});


const clearSettingsButton = document.getElementById('clearSettings');
clearSettingsButton.addEventListener('click', () => {
	localStorageInstance.clearSettings('positionPins')
	// Újratöltjük az oldalt
	location.reload();
});
