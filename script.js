// === FIREBASE CONFIG (Copied from your owner panel) ===
const firebaseConfig = {
  apiKey: "AIzaSyBngQ0i4atsxAWbMS7cUXyqHQbojF9iAvU",
  authDomain: "anireal-web.firebaseapp.com",
  databaseURL: "https://anireal-web-default-rtdb.firebaseio.com",
  projectId: "anireal-web",
  storageBucket: "anireal-web.firebasestorage.app",
  messagingSenderId: "594064091961",
  appId: "1:594064091961:web:dec5f771c026c4f7c196e8",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const homePage = document.getElementById('homePage');
const searchPage = document.getElementById('searchPage');
const detailsPage = document.getElementById('detailsPage');
const upcomingPage = document.getElementById('upcomingPage');
const allAnimePage = document.getElementById('allAnimePage');
const dmcaPage = document.getElementById('dmcaPage'); // New DMCA page element

const searchIcon = document.getElementById('searchIcon');
const notificationIcon = document.getElementById('notificationIcon');
const seeAllBtn = document.getElementById('seeAllBtn'); 
const backButtonSearch = document.getElementById('backButtonSearch');
const backButtonDetails = document.getElementById('backButtonDetails');
const backButtonUpcoming = document.getElementById('backButtonUpcoming');
const backButtonAllAnime = document.getElementById('backButtonAllAnime');
const backButtonDmca = document.getElementById('backButtonDmca'); // New DMCA back button
const searchInput = document.getElementById('searchInput');
const mainSlider = document.getElementById('mainSlider');
const dynamicContentContainer = document.getElementById('dynamic-content-container');

// This will store all anime data fetched from Firebase for search and details pages.
let allAnimeData = [];

function hideAllPages() {
    homePage.style.display = 'none';
    searchPage.style.display = 'none';
    detailsPage.style.display = 'none';
    upcomingPage.style.display = 'none';
    allAnimePage.style.display = 'none';
    dmcaPage.style.display = 'none'; // Hide DMCA page
}

searchIcon.addEventListener('click', () => {
  hideAllPages();
  searchPage.style.display = 'block';
  searchInput.value = ''; // Clear previous search
  document.getElementById('searchResults').innerHTML = ''; // Clear previous results
  searchInput.focus();
});

notificationIcon.addEventListener('click', () => {
  hideAllPages();
  upcomingPage.style.display = 'block';
  window.scrollTo(0, 0);
});

// Event listener for the new footer links (Privacy, Terms, DMCA)
const dmcaLinks = document.querySelectorAll('.js-dmca-link');
dmcaLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        hideAllPages();
        dmcaPage.style.display = 'block';
        window.scrollTo(0, 0);
    });
});

function goBackToHome() {
    hideAllPages();
    homePage.style.display = 'block';
}

// Added the new DMCA back button to the list
[backButtonSearch, backButtonDetails, backButtonUpcoming, backButtonAllAnime, backButtonDmca].forEach(btn => {
    btn.addEventListener('click', goBackToHome);
});

// Renders the FULL details page for an anime
function renderDetailsPage(animeId) {
    const anime = allAnimeData.find(a => a.id === animeId);
    if (!anime) {
        console.error('Anime not found!', animeId);
        goBackToHome();
        return;
    }

    // Show standard components
    document.querySelector('#detailsPage .details-infobox').style.display = 'block';
    document.querySelector('#detailsPage .download-box').style.display = 'flex';
    document.querySelector('#detailsPage .social-buttons-container').style.display = 'flex';
    document.getElementById('detailsPageTitle').textContent = "Details";


    document.getElementById('detailsTitle').textContent = anime.title || 'N/A';
    document.getElementById('detailsRating').textContent = anime.rating || 'N/A';
    document.getElementById('detailsGenre').textContent = anime.genre || 'Unknown';
    document.getElementById('detailsFileSize').textContent = anime.fileSize || 'N/A';
    document.getElementById('detailsAudio').textContent = anime.audio || 'Japanese';
    document.getElementById('detailsDescription').textContent = anime.description || 'No detailed description available.';
    
    // Handle download links
    const telegramLink = anime.telegramChannelLink || "#";
    document.getElementById('download-480p').href = telegramLink;
    document.getElementById('download-720p').href = telegramLink;
    document.getElementById('download-1080p').href = telegramLink;
    
    // Handle Zip file link
    const zipLink = anime.zipFileLink;
    const zipBox = document.getElementById('zip-download-box');
    const zipInfoRow = document.getElementById('zip-info-row');

    if (zipLink) {
        document.getElementById('zipFileLink').href = zipLink;
        document.getElementById('detailsZip').textContent = "Yes";
        zipBox.style.display = 'block';
        zipInfoRow.style.display = 'flex';
    } else {
        document.getElementById('detailsZip').textContent = "No";
        zipBox.style.display = 'none';
        zipInfoRow.style.display = 'none';
    }
    
    hideAllPages();
    detailsPage.style.display = 'block';
    window.scrollTo(0, 0);
}

// Renders a SIMPLE text-only version of the details page (for Characters/Posts)
function renderSimpleDetailsPage(title, description) {
    document.querySelector('#detailsPage .details-infobox').style.display = 'none';
    document.querySelector('#detailsPage .download-box').style.display = 'none';
    document.getElementById('zip-download-box').style.display = 'none';
    document.querySelector('#detailsPage .social-buttons-container').style.display = 'flex'; // Keep social buttons

    document.getElementById('detailsPageTitle').textContent = title;
    document.getElementById('detailsDescription').textContent = description;

    hideAllPages();
    detailsPage.style.display = 'block';
    window.scrollTo(0, 0);
}

// --- DATA FETCHING FUNCTIONS FROM FIREBASE ---

// 1. Fetch Banners for Slider
async function fetchAndRenderSlider() {
    try {
        const snapshot = await db.collection('animeBanners').orderBy("createdAt", "desc").get();
        mainSlider.innerHTML = '';
        const sliderData = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const anime = {
                id: doc.id,
                title: data.title,
                genres: data.genre || '',
                poster: data.imageUrl,
                description: data.description,
                ...data // Store all other fields like rating, fileSize etc.
            };
            sliderData.push(anime);
            allAnimeData.push(anime); // Add to global data list
        });

        sliderData.forEach(anime => {
            const slideHTML = `
                <div class="slide">
                    <img src="${anime.poster}" alt="${anime.title}">
                    <div class="slide-content">
                        <h2 class="slide-title">${anime.title}</h2>
                        <p class="slide-genres">${anime.genres}</p>
                        <p class="slide-description">${anime.description}</p>
                        <div class="slide-buttons">
                            <a href="${anime.telegramChannelLink || '#'}" target="_blank" class="play-button">▶ Play</a>
                            <button class="list-button" data-anime-id="${anime.id}">Details</button>
                        </div>
                    </div>
                </div>`;
            mainSlider.insertAdjacentHTML('beforeend', slideHTML);
        });
        
        // Re-attach listeners for the new details buttons
        mainSlider.querySelectorAll('.list-button').forEach(button => {
            button.addEventListener('click', (e) => {
                renderDetailsPage(e.target.dataset.animeId);
            });
        });

        startAutoSlider();
    } catch (error) {
        console.error("Error fetching banners: ", error);
        mainSlider.innerHTML = '<p>Error loading banners.</p>';
    }
}

// 2. Fetch "Add Update" for New Release Section
async function fetchAndRenderNewReleases() {
    try {
        const snapshot = await db.collection('updates').orderBy("createdAt", "desc").get();
        if (snapshot.empty) return;

        let sectionHTML = '<div class="category-section"><h2 class="category-title">New Release</h2><div class="category-row">';
        snapshot.forEach(doc => {
            const data = doc.data();
            // This data will be shown simply, so no need to add to allAnimeData
            sectionHTML += `
                <div class="banner-card" data-title="${data.title}" data-description="${data.description}">
                    <div class="banner-img"><img src="${data.imageUrl}" alt="${data.title}"></div>
                    <div class="banner-body">
                        <h3 class="banner-title">${data.title}</h3>
                        <p class="banner-date">Date: ${data.date || 'N/A'}</p>
                    </div>
                </div>`;
        });
        sectionHTML += '</div></div>';
        dynamicContentContainer.innerHTML += sectionHTML;

    } catch (error) {
        console.error("Error fetching new releases: ", error);
    }
}

// 3. Fetch "Add Post" for Popular Characters Section
async function fetchAndRenderPopularCharacters() {
    try {
        const snapshot = await db.collection('post').orderBy("createdAt", "desc").get();
        if (snapshot.empty) return;
        
        let sectionHTML = '<div class="category-section"><h2 class="category-title">Popular Characters</h2><div class="category-row">';
        snapshot.forEach(doc => {
            const data = doc.data();
            // Using data attributes to store details for the click event
            sectionHTML += `
                <div class="character-card" data-title="${data.title}" data-description="${data.description}">
                    <div class="character-img"><img src="${data.imageUrl}" alt="${data.title}"></div>
                    <p class="character-name">${data.title}</p>
                </div>`;
        });
        sectionHTML += '</div></div>';
        dynamicContentContainer.innerHTML += sectionHTML;
    } catch (error) {
        console.error("Error fetching popular characters: ", error);
    }
}

// 4. Fetch "Add Anime" & "Add Series" for Categories
async function fetchAndRenderCategories() {
    try {
        const animeSnapshot = await db.collection('anime').orderBy("createdAt", "desc").get();
        const seriesSnapshot = await db.collection('series').orderBy("createdAt", "desc").get();
        
        let allItems = [];
        animeSnapshot.forEach(doc => allItems.push({ id: doc.id, type: 'anime', ...doc.data() }));
        seriesSnapshot.forEach(doc => allItems.push({ id: doc.id, type: 'series', ...doc.data() }));

        allAnimeData = allAnimeData.concat(allItems); // Add all to global data list

        // Group by category
        const groupedByCategory = allItems.reduce((acc, item) => {
            const category = item.category || (item.type === 'series' ? 'Fantasy' : 'Uncategorized');
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});

        // Render each category
        for (const category in groupedByCategory) {
            const items = groupedByCategory[category];
            const isFantasy = category.toLowerCase() === 'fantasy';
            
            let sectionHTML = `<div class="category-section"><h2 class="category-title">${category}</h2><div class="category-row">`;
            
            items.forEach(item => {
                if (isFantasy || item.type === 'series') { // Fantasy Layout for Series
                     sectionHTML += `
                        <div class="fantasy-card" data-anime-id="${item.id}">
                            <div class="fantasy-card-main">
                                <div class="fantasy-poster"><img src="${item.imageUrl}" alt="${item.title}"></div>
                                <div class="fantasy-details">
                                    <p><strong>Season:</strong> ${item.season || '1'}</p>
                                    <p><strong>Episodes:</strong> ${item.totalEpisodes || 'N/A'}</p>
                                    <p><strong>Duration:</strong> ${item.duration || 'N/A'}</p>
                                    <p><strong>Quality:</strong> ${item.quality || 'N/A'}</p>
                                    <p><strong>Language:</strong> ${item.language || 'N/A'}</p>
                                    <p><strong>Genre:</strong> ${item.genre || 'N/A'}</p>
                                </div>
                            </div>
                            <h3 class="fantasy-title-bottom">${item.title}</h3>
                        </div>`;
                } else { // Standard Card Layout for Anime
                    sectionHTML += `
                        <div class="card" data-anime-id="${item.id}">
                            <div class="card-img"><img src="${item.imageUrl}" alt="${item.title}"></div>
                            <div class="card-body">
                                <h3 class="card-title">${item.title}</h3>
                                <div class="card-meta">
                                    <div class="card-info">
                                        <span>⭐ ${item.rating || 'N/A'}</span>
                                        <span>E${item.totalEpisodes || '??'}+</span>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                }
            });
            sectionHTML += '</div></div>';
            dynamicContentContainer.innerHTML += sectionHTML;
        }

    } catch (error) {
        console.error("Error fetching categories: ", error);
    }
}

// 5. Fetch Upcoming Releases for Bell Icon Page [UPDATED FUNCTION]
async function fetchAndRenderUpcoming() {
    const container = document.getElementById('upcoming-content');
    try {
        const snapshot = await db.collection('upcoming').orderBy("createdAt", "desc").get();
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<p>No upcoming releases announced.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            let releaseTimestamp; 

            // Check if the new custom duration format is used (e.g., D52 H12)
            if (data.time && (data.time.toUpperCase().includes('D') || data.time.toUpperCase().includes('H') || data.time.toUpperCase().includes('M') || data.time.toUpperCase().includes('S'))) {
                
                // This logic requires a valid creation timestamp from Firebase.
                // If it's missing, the timer cannot work correctly.
                if (!data.createdAt || typeof data.createdAt.toMillis !== 'function') {
                    console.error("Skipping upcoming item due to missing or invalid 'createdAt' field:", data.title);
                    return; // Skips this item and moves to the next one
                }

                let days = 0, hours = 0, minutes = 0, seconds = 0;
                const timeUpper = data.time.toUpperCase();

                const dayMatch = timeUpper.match(/D(\d+)/);
                if (dayMatch) days = parseInt(dayMatch[1], 10);

                const hourMatch = timeUpper.match(/H(\d+)/);
                if (hourMatch) hours = parseInt(hourMatch[1], 10);
                
                const minuteMatch = timeUpper.match(/M(\d+)/);
                if (minuteMatch) minutes = parseInt(minuteMatch[1], 10);

                const secondMatch = timeUpper.match(/S(\d+)/);
                if (secondMatch) seconds = parseInt(secondMatch[1], 10);

                const totalMilliseconds = (days * 86400000) + (hours * 3600000) + (minutes * 60000) + (seconds * 1000);
                
                // Use the fixed creation time from the database. This is the fix.
                const creationTime = data.createdAt.toMillis();
                releaseTimestamp = creationTime + totalMilliseconds;

            } else {
                // Fallback to old logic: a fixed date and time (e.g., 2025-12-25 and 22:30)
                const releaseDateTimeString = `${data.date || new Date().toISOString().split('T')[0]}T${data.time || '00:00'}:00`;
                releaseTimestamp = new Date(releaseDateTimeString).getTime();
            }
            
            if (isNaN(releaseTimestamp)) {
                console.error("Invalid release timestamp calculated for:", data.title);
                return; // Skip if the final date is invalid
            }

            const bannerHTML = `
                <div class="upcoming-banner" style="background-image: url('${data.imageUrl}');" data-release-date="${releaseTimestamp}">
                    <div class="banner-overlay">
                        <h2 class="banner-title">${data.title}</h2>
                        <p class="banner-season">Season ${data.season || 'N/A'}</p>
                        <p class="banner-genres">${data.genre || ''}</p>
                        <p class="countdown-header">Coming Out In</p>
                        <div class="countdown-container">
                            <div class="countdown-box"><span class="countdown-number days">0</span><span class="countdown-label">d</span></div>
                            <div class="countdown-box"><span class="countdown-number hours">0</span><span class="countdown-label">h</span></div>
                            <div class="countdown-box"><span class="countdown-number minutes">0</span><span class="countdown-label">m</span></div>
                            <div class="countdown-box"><span class="countdown-number seconds">0</span><span class="countdown-label">s</span></div>
                        </div>
                    </div>
                </div>`;
            container.innerHTML += bannerHTML;
        });
        startCountdownTimers(); // Start timers after content is loaded
    } catch (error) {
         console.error("Error fetching upcoming releases: ", error);
         container.innerHTML = '<p>Error loading upcoming releases.</p>';
    }
}


// --- SLIDER LOGIC ---
let currentIndex = 0;
let slideInterval;
function updateSliderPosition() { if(mainSlider && mainSlider.children.length > 0) { mainSlider.style.transform = `translateX(-${currentIndex * (100 / mainSlider.children.length)}%)`; } }
function nextSlide() { if(mainSlider && mainSlider.children.length > 0){ currentIndex = (currentIndex + 1) % mainSlider.children.length; updateSliderPosition(); } }
function startAutoSlider() { stopAutoSlider(); if(mainSlider.children.length > 1) slideInterval = setInterval(nextSlide, 3000); }
function stopAutoSlider() { clearInterval(slideInterval); }

// --- Countdown Timer Logic ---
function startCountdownTimers() {
    document.querySelectorAll('.upcoming-banner').forEach(banner => {
        // Read the timestamp directly now, it's already in milliseconds
        const releaseDate = parseInt(banner.getAttribute('data-release-date'), 10);
        if (isNaN(releaseDate)) return;

        const daysEl = banner.querySelector('.days');
        const hoursEl = banner.querySelector('.hours');
        const minutesEl = banner.querySelector('.minutes');
        const secondsEl = banner.querySelector('.seconds');
        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        const timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = releaseDate - now;

            if (distance < 0) {
                clearInterval(timerInterval);
                banner.querySelector('.countdown-container').innerHTML = "<p style='font-weight:bold; font-size:18px;'>Released!</p>";
                return;
            }
            daysEl.innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
            hoursEl.innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            minutesEl.innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            secondsEl.innerText = Math.floor((distance % (1000 * 60)) / 1000);
        }, 1000);
    });
}

// --- SEARCH LOGIC ---
const suggestionsContainer = document.getElementById('suggestionsContainer');
const searchResultsContainer = document.getElementById('searchResults');

function renderSearchResults(animeList) {
    searchResultsContainer.innerHTML = '';
    if (!animeList || animeList.length === 0) {
        searchResultsContainer.innerHTML = '<p style="text-align:center; color: #aaa;">No anime found.</p>';
        return;
    }
    animeList.forEach(anime => {
        const cardHTML = `
            <div class="search-result-card">
                <div class="search-result-poster"><img src="${anime.imageUrl || anime.poster}" alt="${anime.title}"></div>
                <div class="search-result-details">
                    <h3 class="search-result-title">${anime.title}</h3>
                    <p class="search-result-desc">${anime.description}</p>
                    <div class="search-result-buttons">
                        <button class="download-btn-search" data-anime-id="${anime.id}">Download</button>
                    </div>
                </div>
            </div>`;
        searchResultsContainer.innerHTML += cardHTML;
    });
}

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    suggestionsContainer.innerHTML = '';
    if (query) {
        let filteredAnime = allAnimeData.filter(a => a.title && a.title.toLowerCase().includes(query));
        filteredAnime.sort((a, b) => a.title.toLowerCase().startsWith(query) ? -1 : 1);
        
        filteredAnime.slice(0, 5).forEach(anime => { // Show top 5 suggestions
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = anime.title;
            item.onclick = () => {
                searchInput.value = anime.title;
                suggestionsContainer.style.display = 'none';
                renderSearchResults([anime]);
            };
            suggestionsContainer.appendChild(item);
        });
        suggestionsContainer.style.display = filteredAnime.length > 0 ? 'block' : 'none';
        renderSearchResults(filteredAnime);
    } else {
        suggestionsContainer.style.display = 'none';
        searchResultsContainer.innerHTML = '';
    }
});

// --- EVENT DELEGATION FOR DYNAMIC CONTENT ---
document.addEventListener('click', (e) => {
    // For search results download button
    if (e.target.matches('.download-btn-search')) {
        const animeId = e.target.dataset.animeId;
        if (animeId) renderDetailsPage(animeId);
    }
    // For all cards on home page (anime, series)
    const card = e.target.closest('.card, .fantasy-card');
    if (card && card.dataset.animeId) {
        renderDetailsPage(card.dataset.animeId);
    }
    // For character and new release cards (simple details)
    const simpleCard = e.target.closest('.character-card, .banner-card');
    if (simpleCard && simpleCard.dataset.title) {
        renderSimpleDetailsPage(simpleCard.dataset.title, simpleCard.dataset.description);
    }
    // To hide search suggestions
    if (!e.target.closest('.search-container')) {
        suggestionsContainer.style.display = 'none';
    }
});

// [FIXED FUNCTION]
function renderAllAnimePage(animeData) {
    const contentArea = document.querySelector('#allAnimePage .page-content');
    contentArea.innerHTML = ''; 

    const gridContainer = document.createElement('div');
    gridContainer.className = 'all-anime-grid';
    
    // Filters out items that might not have a title or image, just in case
    const validAnimeData = animeData.filter(anime => anime.title && (anime.imageUrl || anime.poster));
    
    validAnimeData.forEach(anime => {
        const cardHTML = `
            <div class="card" data-anime-id="${anime.id}">
                <div class="card-img">
                    <img src="${anime.imageUrl || anime.poster}" alt="${anime.title}">
                </div>
                <div class="card-body">
                    <h3 class="card-title">${anime.title}</h3>
                    <div class="card-meta">
                        <div class="card-info">
                            <span>⭐ ${anime.rating || 'N/A'}</span>
                            <span>E${anime.totalEpisodes || '??'}+</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        gridContainer.innerHTML += cardHTML;
    });
    contentArea.appendChild(gridContainer);
}

seeAllBtn.addEventListener('click', () => {
  hideAllPages();
  renderAllAnimePage(allAnimeData);
  allAnimePage.style.display = 'block';
  window.scrollTo(0, 0);
});

// --- INITIALIZE THE APP ---
async function initializeApp() {
    dynamicContentContainer.innerHTML = '<p style="text-align:center; padding: 40px;">Loading Content...</p>';
    await fetchAndRenderSlider();
    
    // Clear container before adding new content
    dynamicContentContainer.innerHTML = '';
    
    // Load all sections in order
    await fetchAndRenderNewReleases();
    await fetchAndRenderPopularCharacters();
    await fetchAndRenderCategories(); // This handles both anime and series/fantasy

    // Also fetch data for the upcoming page in the background
    fetchAndRenderUpcoming();
}

document.addEventListener('DOMContentLoaded', initializeApp);
