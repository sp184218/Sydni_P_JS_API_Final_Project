let debounceTimeout;
let currentPage = 1;
const itemsPerPage = 20;
let searchQuery = "";
let allCharacters = [];
let filteredCharacters = [];

const searchInput = document.getElementById("search-input");
const results = document.getElementById("results");
const paginationControls = document.getElementById("pagination-controls");

// Spinner setup
const spinner = document.createElement("div");
spinner.innerHTML = `<div class="loader">Loading...</div>`;
Object.assign(spinner.style, {
  textAlign: "center",
  marginTop: "20px"
});
results.parentElement.insertBefore(spinner, results);
hideSpinner(); // initially hidden

function showSpinner() {
  spinner.style.display = "block";
}

function hideSpinner() {
  spinner.style.display = "none";
}

// Fetch characters from the API
async function fetchKICharacters() {
  showSpinner();
  try {
    const res = await fetch("https://finalkillerinstinctapi.onrender.com/api/scrape/characters");
    const data = await res.json();

    if (!Array.isArray(data?.characters)) {
      throw new Error("Characters data not in expected array format");
    }

    allCharacters = data.characters.map((char, index) => ({
      id: index.toString(),
      name: char.name?.trim() || "Unknown",
      description: char.description?.trim() || "No description provided.",
      images: Array.isArray(char.images) ? char.images : [],
      url: char.url || "#"
    }));

    updateDisplay();
  } catch (err) {
    console.error("Error fetching character list:", err);
    displayError("Failed to load character list.");
  } finally {
    hideSpinner();
  }
}

// Debounced search input
searchInput.addEventListener("input", function (e) {
  searchQuery = e.target.value.trim();
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    currentPage = 1;
    updateDisplay();
  }, 500);
});

// Pagination controls
function setPaginationControls() {
  const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage);
  paginationControls.innerHTML = "";

  if (totalPages <= 1) return;

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Previous";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updateDisplay();
    }
  });

  const pageInfo = document.createElement("span");
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      updateDisplay();
    }
  });

  paginationControls.append(prevBtn, pageInfo, nextBtn);
}

// Main display logic
function updateDisplay() {
  if (!allCharacters.length) {
    displayError("No characters loaded.");
    return;
  }

  filteredCharacters = allCharacters.filter(character =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!filteredCharacters.length) {
    displayError("No characters found.");
    return;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  displayCharacters(filteredCharacters.slice(start, end));
  setPaginationControls();
}

// Display characters in list
function displayCharacters(characters) {
  const html = characters.map(char => `
    <li>
      <a href="#" data-id="${char.id}">${escapeHTML(char.name)}</a>
    </li>
  `).join("");

  results.innerHTML = html;

  document.querySelectorAll("#results a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = e.target.dataset.id;
      const character = allCharacters.find(c => c.id === id);
      if (character) showCharacterDialog(character);
    });
  });
}

// Show character details
function showCharacterDialog(character) {
  const modal = document.createElement("div");
  modal.classList.add("character-modal");

  const image = character.images[0] || "";
  const safeDescription = escapeHTML(character.description);
  const safeURL = character.url;

 modal.innerHTML = `
  <div class="character-content" style="background: #fff; color: #000; padding: 20px; border-radius: 10px; max-width: 500px;">
    <h2>${escapeHTML(character.name)}</h2>
    ${image ? `<img src="${image}" alt="${escapeHTML(character.name)}" style="max-width: 200px; display:block; margin: 10px auto;" />` : ""}
    <p style="white-space: pre-line;">${safeDescription}</p>
    <a href="${safeURL}" target="_blank" rel="noopener noreferrer">More info</a>
    <br><br>
    <button id="close-modal">Close</button>
  </div>
`;

  Object.assign(modal.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999"
  });

  document.body.appendChild(modal);

  document.getElementById("close-modal").addEventListener("click", () => {
    modal.remove();
  });
}

// Show error in UI
function displayError(message) {
  results.innerHTML = `<p style="color:red;">${escapeHTML(message)}</p>`;
  paginationControls.innerHTML = "";
}

// Escape HTML to prevent injection and layout breakage
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Start app
fetchKICharacters();
document.addEventListener("DOMContentLoaded", function () {
  const videoModal = document.getElementById("intro-modal");
  const video = document.getElementById("intro-video");
  const overlay = document.getElementById("start-overlay");
  const startBtn = document.getElementById("start-button");

  // Just in case any elements are missing
  if (!videoModal || !video || !overlay || !startBtn) {
    console.error("Modal elements missing");
    return;
  }

  // Show both modals initially
  videoModal.style.display = "flex";
  overlay.style.display = "flex";

  // Start with muted autoplay
  video.currentTime = 0;
  video.muted = true;
  video.play().catch(err => console.warn("Muted autoplay failed:", err));

  // Start button logic
  startBtn.addEventListener("click", () => {
    overlay.style.display = "none";     // Hide overlay modal
    video.muted = false;                // Unmute and restart video
    video.currentTime = 0;
    video.play().catch(err => console.error("Playback with sound failed:", err));
  });

    // Close video modal on *any* click (except the start button itself, the more info button, and the cursor button)
 document.addEventListener("click", (e) => {
  const isStartButton = e.target === startBtn;
  const isCursorModal = modal.contains(e.target) || e.target === chooseCursorBtn;
  const isInsideCharacterModal = e.target.closest(".character-content") !== null;
  const isMoreInfoLink = e.target.closest("a[href]")?.getAttribute("href") !== "#";

  if (isStartButton || isCursorModal || isInsideCharacterModal || isMoreInfoLink) return;

  e.preventDefault();
  overlay.style.display = "none";
  videoModal.style.display = "none";
  video.pause();
  video.currentTime = 0;
});


  // Close video modal and stop video on spacebar
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      overlay.style.display = "none";
      videoModal.style.display = "none";
      video.pause();
      video.currentTime = 0;
    }
  });
});

// Cursor Selector Logic
document.addEventListener("DOMContentLoaded", function () {
  const chooseCursorBtn = document.getElementById('choose-cursor');
  const cursorModal = document.getElementById('cursorModal');
  const closeModal = document.getElementById('closeModal');
  const cursorOptions = document.querySelectorAll('.cursor-option');

  // Show cursor selection modal
  chooseCursorBtn.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Choose Cursor clicked');
    cursorModal.classList.add('visible');
    cursorModal.classList.remove('hidden');
  });

  // Close modal
  closeModal.addEventListener('click', function () {
    cursorModal.classList.remove('visible');
    cursorModal.classList.add('hidden');
  });

  // Handle cursor selection
  cursorOptions.forEach(img => {
    img.addEventListener('click', () => {
      const imgURL = img.getAttribute('src');
      document.body.style.cursor = `url(${imgURL}), auto`;
      localStorage.setItem("chosenCursor", imgURL);
      cursorModal.classList.remove('visible');
      cursorModal.classList.add('hidden');
    });
  });
});




