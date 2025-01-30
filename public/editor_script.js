let jsonData = [];
let data = [];

const userProfilePicture = getCookie('userProfilePicture');

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
}

function loadData() {
    fetch('/server/user/get-data', {
        method: 'GET',
        credentials: 'include', 
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = "https://audomark.sipped.org/login";
                }
            }
            return response.json();
        })
        .then(data => {
            jsonData = data;
            displayData(data);
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
}

function handleSearch() {
    const searchQuery = document.getElementById("searchBar").value.toLowerCase();
    
    const filteredData = jsonData.filter(artist => 
        artist.artist.toLowerCase().includes(searchQuery)
    );
    
    displayData(filteredData);
}

function displayData(filteredData) {
    const artistsContainer = document.getElementById('artistsContainer');
    artistsContainer.innerHTML = '';

    filteredData.forEach((artist, artistIndex) => {
        const artistDiv = document.createElement('div');
        artistDiv.classList.add('artist-block');
        artistDiv.id = `artist-${artistIndex}`;

        artistDiv.innerHTML = `
            <!-- Artist name and remove button container -->
            <div class="artist-header">
                <input type="text" id="artistName-${artistIndex}" placeholder="Artist Name" value="${artist.artist}" onchange="updateArtist(${artistIndex})">
                <button class="remove-button" onclick="removeArtist(${artistIndex})">-</button>
            </div>

            <input type="text" id="artistIcon-${artistIndex}" placeholder="Artist Image URL" value="${artist.icon}" onchange="updateArtist(${artistIndex})">
            
            <!-- Horizontal bar for albums with the "Albums" text and plus button -->
            <div class="albums-header">
                <span>Albums</span>
                <button class="plus-button" onclick="addAlbum(${artistIndex})">+</button>
            </div>

            <div class="albums-container" id="albums-${artistIndex}">
                <!-- Albums will be dynamically added here -->
            </div>
        `;

        artistsContainer.appendChild(artistDiv);

        artist.albums.forEach((album, albumIndex) => {
            addAlbumFields(artistIndex, albumIndex, album);
        });
    });
}

function addAlbumFields(artistIndex, albumIndex, album) {
    const albumDiv = document.createElement('div');
    albumDiv.classList.add('album-block');
    albumDiv.id = `album-${artistIndex}-${albumIndex}`;
    albumDiv.draggable = true;

    albumDiv.innerHTML = `
        <span class="grab-icon">☰</span>
        <input type="text" id="albumName-${artistIndex}-${albumIndex}" placeholder="Album Name" value="${album.name}" onchange="updateAlbum(${artistIndex}, ${albumIndex})">
        <input type="number" id="albumRating-${artistIndex}-${albumIndex}" placeholder="Album Rating" min="0" max="10" value="${album.rating}" onchange="updateAlbum(${artistIndex}, ${albumIndex})">
        <input type="text" id="albumCover-${artistIndex}-${albumIndex}" placeholder="Album Cover URL" value="${album.cover}" onchange="updateAlbum(${artistIndex}, ${albumIndex})">
        <button class="remove-button" onclick="removeAlbum(${artistIndex}, ${albumIndex})">-</button>
    `;

    albumDiv.addEventListener('dragstart', (e) => onDragStart(e, artistIndex, albumIndex));
    albumDiv.addEventListener('dragover', (e) => onDragOver(e));
    albumDiv.addEventListener('drop', (e) => onDrop(e, artistIndex, albumIndex));
    albumDiv.addEventListener('dragenter', () => albumDiv.classList.add('over'));
    albumDiv.addEventListener('dragleave', () => albumDiv.classList.remove('over'));
    albumDiv.addEventListener('dragend', () => albumDiv.classList.remove('over'));

    document.getElementById(`albums-${artistIndex}`).appendChild(albumDiv);
}

//////////////////////////////// DRAG AND DROPPING ALBUMS IN ORDER ////////////////////////////////

let draggedAlbum = null;

function onDragStart(event, artistIndex, albumIndex) {
    draggedAlbum = { artistIndex, albumIndex };
    event.dataTransfer.effectAllowed = 'move';

    const albumDiv = document.getElementById(`album-${artistIndex}-${albumIndex}`);
    albumDiv.classList.add('dragging');
}

function onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

function onDrop(event, artistIndex, albumIndex) {
    event.preventDefault();
    if (draggedAlbum) {
        const draggedArtistIndex = draggedAlbum.artistIndex;
        const draggedAlbumIndex = draggedAlbum.albumIndex;

        if (draggedArtistIndex === artistIndex) {
            const draggedAlbumData = jsonData[draggedArtistIndex].albums[draggedAlbumIndex];
            jsonData[draggedArtistIndex].albums.splice(draggedAlbumIndex, 1);
            jsonData[draggedArtistIndex].albums.splice(albumIndex, 0, draggedAlbumData);

            displayData(jsonData);
        }
    }
    draggedAlbum = null;
}

//////////////////////////////// //////////////////////////////// ////////////////////////////////



function removeArtist(artistIndex) {
    jsonData.splice(artistIndex, 1);
    displayData(jsonData);
}

function removeAlbum(artistIndex, albumIndex) {
    jsonData[artistIndex].albums.splice(albumIndex, 1);
    displayData(jsonData);
}


function saveData() {
    const updatedData = JSON.stringify(jsonData, null, 2);

    fetch('/server/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: updatedData,
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to save data.');
                });
            }
            return response.json();
        })
        .then(data => {
            showSuccessMessage('Data successfully saved.');
        })
        .catch(error => {
            updateStatus("Error saving data: " + error.message, "error");
        });
}

function updateArtist(artistIndex) {
    const artistName = document.getElementById(`artistName-${artistIndex}`).value;
    const artistIcon = document.getElementById(`artistIcon-${artistIndex}`).value;

    jsonData[artistIndex].artist = artistName;
    jsonData[artistIndex].icon = artistIcon;
    displayData(jsonData);
}

function updateAlbum(artistIndex, albumIndex) {
    const albumName = document.getElementById(`albumName-${artistIndex}-${albumIndex}`).value; // Corrected with backticks
    const albumRating = document.getElementById(`albumRating-${artistIndex}-${albumIndex}`).value; // Corrected with backticks
    const albumCover = document.getElementById(`albumCover-${artistIndex}-${albumIndex}`).value; // Corrected with backticks

    jsonData[artistIndex].albums[albumIndex] = {
        name: albumName,
        cover: albumCover,
        rating: parseInt(albumRating)
    };

    displayData(jsonData);
}


function addArtist() {
    const artistIndex = jsonData.length;
    jsonData.push({ "artist": "", "icon": "", "albums": [] });

    const artistDiv = document.createElement('div');
    artistDiv.classList.add('artist-block');
    artistDiv.id = `artist-${artistIndex}`;

    artistDiv.innerHTML = `
<input type="text" id="artistName-${artistIndex}" placeholder="Artist Name" onchange="updateArtist(${artistIndex})">
<input type="text" id="artistIcon-${artistIndex}" placeholder="Artist Image URL" onchange="updateArtist(${artistIndex})">
<div class="albums-container" id="albums-${artistIndex}">
    <button onclick="addAlbum(${artistIndex})" class="button">+ Add Album</button>
</div>
`;

    document.getElementById('artistsContainer').appendChild(artistDiv);
    displayData(jsonData);
}


function addAlbum(artistIndex) {
    const albumIndex = jsonData[artistIndex].albums.length;
    jsonData[artistIndex].albums.push({ "name": "", "cover": "", "rating": 0 });

    addAlbumFields(artistIndex, albumIndex, jsonData[artistIndex].albums[albumIndex]);
    displayData(jsonData);
}

function showSuccessMessage(message) {
    updateStatus(message, "success");

    setTimeout(() => {
        updateStatus('Console | Edit your artists and album rankings', "normal");
    }, 2000);
}

function updateStatus(message, type) {
    const statusBar = document.getElementById('statusBar');
    statusBar.textContent = message;

    if (type === "success") {
        statusBar.style.backgroundColor = "#28a745";
        statusBar.style.color = "white";
    } else if (type === "error") {
        statusBar.style.backgroundColor = "#dc3545";
        statusBar.style.color = "white";
    } else if (type === "normal") {
        statusBar.style.backgroundColor = "";
        statusBar.style.color = "";
    }
}

function switchView(view) {
    const managerView = document.getElementById('managerView');
    const guideView = document.getElementById('guideView');
    const statusBar = document.getElementById('statusBar');

    if (view === 'manager') {
        managerView.classList.remove('hidden');
        guideView.classList.add('hidden');
    } else if (view === 'guide') {
        guideView.classList.remove('hidden');
        managerView.classList.add('hidden');
        document.getElementById('jsonEditor').value = JSON.stringify(jsonData, null, 2);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();

    upfp = document.getElementById('pfp');
    upfp.src = userProfilePicture;

    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        const ct = document.getElementById('currenttab')
        ct.style = "box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);"
    }
});