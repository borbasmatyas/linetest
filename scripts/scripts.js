
// A changeView gombbal a .camera-conatiner osztályhoz adunk hozzá / távolítunk el egy display: none; css tulajdonságot

let cameraContainer = document.querySelector('.camera-container');
let changeViewButton = document.getElementById('changeView');

changeViewButton.addEventListener('click', () => {
	cameraContainer.classList.toggle('hidden');
});
