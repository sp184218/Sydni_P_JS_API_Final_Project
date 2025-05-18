let debounceTimeout;
let currentPage = 1;
const itemsPerPage = 20;
let searchQuery = "";
let allCharacters = [];
let filteredCharacters = [];

// Your 12 cursors with hotspots (adjust hotspots per image if needed)
const cursors = [
  { src: 'images/ShadowJago-Photoroom.png', x: 16, y: 16 },
  { src: 'images/spinal-Photoroom.png', x: 16, y: 16 },
  { src: 'images/TJCombo-Photoroom.png', x: 16, y: 16 },
  { src: 'images/Tusk-Photoroom.png', x: 16, y: 16 },
  { src: 'images/Sabrewulf-Photoroom.png', x: 16, y: 16 },
  { src: 'images/orchid-Photoroom.png', x: 16, y: 16 },
  { src: 'images/kim-Photoroom.png', x: 16, y: 16 },
  { src: 'images/Maya-Photoroom.png', x: 16, y: 16 },
  { src: 'images/Jago-Photoroom.png', x: 16, y: 16 },
  { src: 'images/cinder-Photoroom.png', x: 16, y: 16 },
  { src: 'images/fulgore-original-Photoroom.png', x: 16, y: 16 },
  { src: 'images/glacius-Photoroom.png', x: 16, y: 16 },
];

// Apply cursor globally via CSS rule on the fly
function applyCursor(cursor) {
  // Remove existing cursor style if any
  let styleEl = document.getElementById('dynamic-cursor-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-cursor-style';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    * {
      cursor: url('${cursor.src}') ${cursor.x} ${cursor.y}, auto !important;
    }
  `;
}

// Example: user clicks on an image to select cursor
document.querySelectorAll('.cursor-option').forEach((img, idx) => {
  img.style.cursor = 'pointer'; // show clickable
  img.addEventListener('click', () => {
    applyCursor(cursors[idx]);
  });
});

// Optional: set default cursor on page load
applyCursor(cursors[0]);



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

// Show character details modal
function showCharacterDialog(character) {
  const modal = document.createElement("div");
  modal.classList.add("character-modal");
 const defaultImage = "ki.jpg";
    const imageSrc = character.images[0] || defaultImage;
  const safeDescription = escapeHTML(character.description);
  const safeURL = character.url;

 modal.innerHTML = `
    <div class="character-content" 
     style="background-color: #add8e6;  /* light blue */
            color: #000080;           /* navy blue text */
            padding: 20px; 
            border-radius: 10px; 
            max-width: 500px; 
            transform: scale(1.05);
            box-shadow: 0 0 15px #0000ff, 0 0 25px #add8e6;
            cursor: pointer;">
      <h2>${escapeHTML(character.name)}</h2>
     <p style="white-space: pre-line;">${safeDescription}</p>
      <a href="${safeURL}" target="_blank" rel="noopener noreferrer">More info</a>
      <br><br>
      <button id="close-modal">Close</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("close-modal").addEventListener("click", () => {
    modal.remove();
  });
}

// Show error message
function displayError(message) {
  results.innerHTML = `<p style="color:red;">${escapeHTML(message)}</p>`;
  paginationControls.innerHTML = "";
}

// Escape HTML function
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Initialization on DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  // Video modal elements
  const videoModal = document.getElementById("intro-modal");
  const video = document.getElementById("intro-video");
  const overlay = document.getElementById("start-overlay");
  const startBtn = document.getElementById("start-button");

  // Cursor modal elements
  const chooseCursorBtn = document.getElementById('choose-cursor');
  const cursorModal = document.getElementById('cursorModal');
  const closeModal = document.getElementById('closeModal');
  const cursorOptions = document.querySelectorAll('.cursor-option');

  // Verify required elements exist
  if (!videoModal || !video || !overlay || !startBtn) {
    console.error("Video modal elements missing");
  } else {
    // Show modals initially
    videoModal.style.display = "flex";
    overlay.style.display = "flex";

    video.currentTime = 0;
    video.muted = true;
    video.play().catch(err => console.warn("Muted autoplay failed:", err));

    startBtn.addEventListener("click", () => {
      overlay.style.display = "none";     // Hide overlay modal
      video.muted = false;                // Unmute and restart video
      video.currentTime = 0;
      video.play().catch(err => console.error("Playback with sound failed:", err));

      // Auto-close after 41 seconds
      setTimeout(() => {
        overlay.style.display = "none";
        videoModal.style.display = "none";
        video.pause();
        video.currentTime = 0;
      }, 41000);
    });

    // Close video modal on *any* click outside special elements
    document.addEventListener("click", (e) => {
      const isStartButton = e.target === startBtn;
      const isCursorModal = cursorModal && cursorModal.contains(e.target);
      const isChooseCursorBtn = e.target === chooseCursorBtn;
      const isInsideCharacterModal = e.target.closest(".character-content") !== null;
      const isMoreInfoLink = e.target.closest("a[href]")?.getAttribute("href") !== "#";

      if (isStartButton || isCursorModal || isChooseCursorBtn || isInsideCharacterModal || isMoreInfoLink) {
        // Click inside protected areas, do not close
        return;
      }

      // Otherwise close modal
      e.preventDefault();
      overlay.style.display = "none";
      videoModal.style.display = "none";
      video.pause();
      video.currentTime = 0;
    });

    // Close video modal on spacebar
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        overlay.style.display = "none";
        videoModal.style.display = "none";
        video.pause();
        video.currentTime = 0;
      }
    });
  }

  // Cursor modal logic
  if (!chooseCursorBtn || !cursorModal || !closeModal) {
    console.error("Cursor modal elements missing");
  } else {
    // Load saved cursor from localStorage
    const savedCursor = localStorage.getItem("chosenCursor");
    if (savedCursor) {
      document.body.style.cursor = `url(${savedCursor}) 0 0, auto`;
    }

    chooseCursorBtn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      cursorModal.classList.add('visible');
      cursorModal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', function () {
      cursorModal.classList.remove('visible');
      cursorModal.classList.add('hidden');
    });

    cursorOptions.forEach(img => {
      img.addEventListener('click', () => {
        const imgURL = img.getAttribute('src');
        document.body.style.cursor = `url(${imgURL}) 64 64, auto`;
        localStorage.setItem("chosenCursor", imgURL);
        cursorModal.classList.remove('visible');
        cursorModal.classList.add('hidden');
      });
    });
  }
});

// Start fetching characters on script load
fetchKICharacters();

const charButtons = document.querySelectorAll(".char-btn");
const popupModal = document.getElementById("popup-modal");
const popupImage = document.getElementById("popup-image");
const popupDescription = document.getElementById("popup-description");
const popupClose = document.querySelector(".popup-close");

charButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const gifSrc = button.getAttribute("data-gif");
    popupImage.src = gifSrc;

    // Determine which description to show
    let descriptionId = "";
    if (button.classList.contains("favorite")) {
      descriptionId = "orchid-info";
    } else if (button.classList.contains("main")) {
      descriptionId = "jago-info";
    } else if (button.classList.contains("fighter")) {
      descriptionId = "cinder-info";
    }

    const descriptionElement = document.getElementById(descriptionId);
    if (descriptionElement) {
      popupDescription.innerHTML = descriptionElement.innerHTML;
    }

    popupModal.classList.remove("popup-hidden");
  });
});

// Close the popup
popupClose.addEventListener("click", () => {
  popupModal.classList.add("popup-hidden");
});

const swiper = new Swiper('.swiper-container', {
  // Optional parameters
  direction: 'horizontal',
  loop: false,
  
  // If you want pagination dots
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  
  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  
  // You can add other settings like speed, slidesPerView, etc.
});

