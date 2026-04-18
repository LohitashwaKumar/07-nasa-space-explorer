// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// ===== YOUR CODE STARTS HERE =====

const API_KEY = 'DEMO_KEY'; // Replace with your NASA API key later if you have one

const getImagesBtn = document.getElementById('getImagesBtn');
const gallery = document.getElementById('gallery');
const statusMessage = document.getElementById('statusMessage');
const factSection = document.getElementById('factSection');

const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

const spaceFacts = [
  "Did you know? One day on Venus is longer than one year on Venus.",
  "Did you know? The footprints on the Moon can last for millions of years.",
  "Did you know? Neutron stars can spin hundreds of times every second.",
  "Did you know? The Sun holds more than 99% of our solar system’s mass.",
  "Did you know? Some NASA APOD entries are videos instead of images."
];

function showRandomFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  factSection.textContent = spaceFacts[randomIndex];
}

function showLoadingMessage() {
  statusMessage.textContent = "🔄 Loading space photos…";
  gallery.innerHTML = "";
}

function showStatus(message) {
  statusMessage.textContent = message;
}

function clearStatus() {
  statusMessage.textContent = "";
}

async function fetchSpaceImages(startDate, endDate) {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch APOD data.");
  }

  const data = await response.json();

  // APOD date range returns an array
  // reverse so newest appears first
  return data.reverse();
}

function createGalleryItem(item) {
  const card = document.createElement('article');
  card.className = 'gallery-card';

  let mediaContent = '';

  if (item.media_type === 'image') {
    mediaContent = `
      <img src="${item.url}" alt="${item.title}" class="gallery-media">
    `;
  } else if (item.media_type === 'video') {
    mediaContent = `
      <div class="video-placeholder">
        <p>🎥 Video Entry</p>
        <a href="${item.url}" target="_blank" rel="noopener noreferrer">Open Video</a>
      </div>
    `;
  } else {
    mediaContent = `
      <div class="video-placeholder">
        <p>Unsupported media type</p>
      </div>
    `;
  }

  card.innerHTML = `
    ${mediaContent}
    <div class="gallery-info">
      <h3>${item.title}</h3>
      <p>${item.date}</p>
    </div>
  `;

  card.addEventListener('click', () => {
    openModal(item);
  });

  return card;
}

function renderGallery(items) {
  gallery.innerHTML = "";

  if (!items.length) {
    showStatus("No images found for that date range.");
    return;
  }

  clearStatus();

  items.forEach(item => {
    const card = createGalleryItem(item);
    gallery.appendChild(card);
  });
}

function openModal(item) {
  let mediaContent = '';

  if (item.media_type === 'image') {
    mediaContent = `
      <img src="${item.hdurl || item.url}" alt="${item.title}" class="modal-image">
    `;
  } else if (item.media_type === 'video') {
    mediaContent = `
      <div class="modal-video-block">
        <p>This APOD entry is a video.</p>
        <a href="${item.url}" target="_blank" rel="noopener noreferrer">Watch the video</a>
      </div>
    `;
  }

  modalBody.innerHTML = `
    ${mediaContent}
    <h2>${item.title}</h2>
    <p class="modal-date">${item.date}</p>
    <p class="modal-explanation">${item.explanation}</p>
  `;

  modal.classList.remove('hidden');
}

function closeModalWindow() {
  modal.classList.add('hidden');
  modalBody.innerHTML = "";
}

async function handleGalleryLoad() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    showStatus("Please select both a start date and an end date.");
    return;
  }

  if (startDate > endDate) {
    showStatus("Start date must come before end date.");
    return;
  }

  try {
    showLoadingMessage();
    const items = await fetchSpaceImages(startDate, endDate);
    renderGallery(items);
  } catch (error) {
    console.error(error);
    showStatus("Something went wrong while loading the gallery.");
  }
}

getImagesBtn.addEventListener('click', handleGalleryLoad);
closeModal.addEventListener('click', closeModalWindow);

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModalWindow();
  }
});

showRandomFact();