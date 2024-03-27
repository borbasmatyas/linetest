
function updateThresholdValue(spanId, value) {
	document.getElementById(spanId).innerText = value;
}

function initializeThreshold() {
	const threshold = localStorageInstance.get('threshold') || {};
	const upperThreshold = threshold.upperThreshold || document.getElementById('upperThreshold').value;
	const lowerThreshold = threshold.lowerThreshold || document.getElementById('lowerThreshold').value;


	document.getElementById('upperThreshold').value = upperThreshold;
	document.getElementById('lowerThreshold').value = lowerThreshold;

	updateThresholdValue('upperThresholdValue', upperThreshold);
	updateThresholdValue('lowerThresholdValue', lowerThreshold);

}

initializeThreshold();

function handleThresholdChange(thresholdInputId, thresholdSpanId) {
	const input = document.getElementById(thresholdInputId);
	const value = input.value;
	updateThresholdValue(thresholdSpanId, value);

	const threshold = localStorageInstance.get('threshold') || {};
	threshold[thresholdInputId] = value;
	localStorageInstance.set('threshold', threshold);
}

document.getElementById('lowerThreshold').addEventListener('input', function() {
	handleThresholdChange('lowerThreshold', 'lowerThresholdValue');
});

document.getElementById('upperThreshold').addEventListener('input', function() {
	handleThresholdChange('upperThreshold', 'upperThresholdValue');
});


const clearCalibrationButton = document.getElementById('clearCalibrationButton');
clearCalibrationButton.addEventListener('click', () => {
	localStorageInstance.clearSettings('threshold')
	// Újratöltjük az oldalt
	location.reload();
});