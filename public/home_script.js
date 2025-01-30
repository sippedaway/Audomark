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

if (userProfilePicture) {
    const profilePictureElement = document.getElementById('pfp');
    const mpfp = document.getElementById('mpfp')

    profilePictureElement.src = userProfilePicture;
    mpfp.src = userProfilePicture;
}

function fetchUserData() {
    fetch('/server/user/get-data', {
        method: 'GET',
        credentials: 'include', 
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = 'https://audomark.sipped.org/401';
                }
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            renderData(data);
            jsonData = data;
            checkDefaultRatingMethod();
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
}

fetchUserData();

function renderData(data) {
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = '';

    data.forEach(artistData => {
        const artistDiv = document.createElement("div");
        artistDiv.classList.add("artist");

        const artistHeader = document.createElement("div");
        artistHeader.classList.add("artist-header");

        const artistIcon = document.createElement("img");
        artistIcon.id = 'artistIcon';
        artistIcon.src = artistData.icon;
        artistIcon.alt = artistData.artist;
        artistIcon.addEventListener("click", () => openImagePopupArtist(artistData));
        artistIcon.classList.add("artist-icon");

        const addButton = document.createElement("button");
        addButton.classList.add("add-album-btn");
        addButton.innerHTML = '<i class="fas fa-plus"></i>';
        addButton.addEventListener("click", () => addAlbum(artistData));

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-artist-btn");
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.addEventListener("click", () => deleteArtist(artistData));

        const artistName = document.createElement("input");
        artistName.type = "text";
        artistName.className = 'hinput';
        artistName.value = artistData.artist;
        artistName.onchange = function() {
            updateArtistName(this.value, artistData);
        };

        artistHeader.appendChild(artistIcon);
        artistHeader.appendChild(artistName);
        artistHeader.appendChild(addButton);
        artistHeader.appendChild(deleteButton);
        artistDiv.appendChild(artistHeader);

        artistData.albums.forEach(album => {
            const albumDiv = document.createElement("div");
            albumDiv.id = `album-${artistData.name}-${album.name}`;
            albumDiv.classList.add("album");

            const albumName = document.createElement("input");
            albumName.type = "text";
            albumName.className = "albumnameinput";
            albumName.onchange = function() {
                updateAlbumTitle(this.value, album);
            };
            albumName.value = album.name;

            const albumCover = document.createElement("img");
            albumCover.src = album.cover;
            albumCover.alt = album.name;
            albumCover.addEventListener("click", () => openImagePopup(album));

            const arwrapper = document.createElement('div');
            arwrapper.classList.add("arwrapper");
            const albumRatingWrapper = document.createElement("div");
            albumRatingWrapper.classList.add("album-rating-wrapper");

            const albumRating = document.createElement("input");
            albumRating.type = "number";
            albumRating.classList.add("albumratinginput");
            albumRating.value = album.rating;
            albumRating.onchange = function() {
                updateAlbumRating(this.value, album);
            };
            albumRating.min = 0;
            albumRating.max = 100;

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-artist-btn");
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.style = 'width: 34px; height: 34px; margin-left: 8px;';
            deleteButton.addEventListener("click", () => deleteAlbum(album));

            const updateBackground = (rating) => {
                let bgImage;
                if (rating <= 39) bgImage = "./bg/0.png";
                else if (rating <= 69) bgImage = "./bg/40.png";
                else if (rating <= 79) bgImage = "./bg/70.png";
                else if (rating <= 89) bgImage = "./bg/80.png";
                else if (rating <= 99) bgImage = "./bg/90.png";
                else bgImage = "./bg/100.png";
                
                albumRatingWrapper.style.backgroundImage = `url(${bgImage})`;
            };

            updateBackground(album.rating);
            albumRating.addEventListener("change", (event) => {
                const newRating = parseInt(event.target.value, 10) || 0;
                album.rating = Math.min(100, Math.max(0, newRating));
            
                updateBackground(album.rating);
                saveData(JSON.stringify(jsonData, null, 2));
                renderData(jsonData);
            });

            arwrapper.appendChild(albumRatingWrapper);
            albumRatingWrapper.appendChild(albumRating);
            arwrapper.appendChild(deleteButton);

            albumDiv.appendChild(albumCover);
            albumDiv.appendChild(albumName);
            albumDiv.appendChild(arwrapper);

            albumDiv.draggable = true;
            albumDiv.addEventListener('dragstart', (e) => onDragStart(e, artistData, album));
            albumDiv.addEventListener('dragover', (e) => onDragOver(e));
            albumDiv.addEventListener('drop', (e) => onDrop(e, artistData, album));
            albumDiv.addEventListener('dragenter', () => albumDiv.classList.add('over'));
            albumDiv.addEventListener('dragleave', () => albumDiv.classList.remove('over'));
            albumDiv.addEventListener('dragend', () => albumDiv.classList.remove('over'));

            artistDiv.appendChild(albumDiv);
        });

        contentDiv.appendChild(artistDiv);
    });
}

//////////// ALBUM DRAG & DROP ////////////

let draggedAlbum = null;

function onDragStart(event, artistData, album) {
    draggedAlbum = { artistData, album }; 
    event.dataTransfer.effectAllowed = 'move';
    
    event.target.classList.add('dragging');
}

function onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.target.classList.remove('dragging');
}

function onDrop(event, artistData, album) {
    event.preventDefault();
    event.target.classList.remove('dragging');

    if (draggedAlbum) {
        const draggedArtistData = draggedAlbum.artistData;
        const draggedAlbumData = draggedAlbum.album;

        if (draggedAlbumData !== album) {
            const draggedArtistIndex = jsonData.findIndex(a => a.artist === draggedArtistData.artist);
            const artistIndex = jsonData.findIndex(a => a.artist === artistData.artist);

            if (draggedArtistIndex === artistIndex) {
                const draggedAlbumIndex = draggedArtistData.albums.indexOf(draggedAlbumData);
                const albumIndex = artistData.albums.indexOf(album);

                draggedArtistData.albums.splice(draggedAlbumIndex, 1);
                draggedArtistData.albums.splice(albumIndex, 0, draggedAlbumData);

                renderData(jsonData);
                saveData(JSON.stringify(jsonData, null, 2));
            }
        }
    }

    draggedAlbum = null; 
}

//////////// ////////////

function updateArtistName(newTitle, artist) {
    console.log(artist, artist.name, newTitle);
    artist.artist = newTitle;
    saveData(JSON.stringify(jsonData, null, 2));
    renderData(jsonData);
}

function updateAlbumTitle(newTitle, album) {
    album.name = newTitle;
    saveData(JSON.stringify(jsonData, null, 2));
    renderData(jsonData);
}

function updateAlbumRating(newRating, album) {
    if (album) {
        album.rating = parseInt(newRating, 10) || 0;
        saveData(JSON.stringify(jsonData, null, 2));
        renderData(jsonData);
    }
}

function deleteAlbum(album) {
    for (const artist of jsonData) {
        const albumIndex = artist.albums.findIndex(
            a => a.name === album.name && a.cover === album.cover && a.rating === album.rating
        );

        if (albumIndex !== -1) {
            artist.albums.splice(albumIndex, 1);

            updatedData = JSON.stringify(jsonData, null, 2);
            saveData(updatedData);
            break;
        }
    }

    renderData(jsonData);
}

function deleteArtist(artist) {
    const artistIndex = jsonData.findIndex(a => a.artist === artist.artist);

    if (artistIndex !== -1) {
        jsonData.splice(artistIndex, 1);

        const updatedData = JSON.stringify(jsonData, null, 2);
        saveData(updatedData);

        renderData(jsonData);
    }
}

function openImagePopupArtist(artist) {
    currentArtist = artist;

    document.getElementById("artistimagePopup").style.display = "flex";
    document.getElementById("confirmartist").addEventListener("click", saveArtistImage);
}

function openImagePopup(image) {
    document.getElementById("imagePopup").style.display = "flex";
    document.getElementById('csac').addEventListener("click", () => saveImage(image));
}

function closeImagePopup() {
    document.getElementById("imagePopup").style.display = "none";
    document.getElementById("artistimagePopup").style.display = 'none';
}

function saveArtistImage() {
    const imageLink = document.getElementById("arimageLink").value;
    const imageFile = document.getElementById("arimageFile").files[0];

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            currentArtist.icon = e.target.result;
            saveData(JSON.stringify(jsonData, null, 2));
            renderData(jsonData);
        };
        reader.readAsDataURL(imageFile);
    } else if (imageLink) {
        currentArtist.icon = imageLink;
        saveData(JSON.stringify(jsonData, null, 2));
        renderData(jsonData);
    }

    closeImagePopup();
}

function saveImage(album) {
    const imageLink = document.getElementById("imageLink").value;
    const imageFile = document.getElementById("imageFile").files[0];

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            album.cover = e.target.result;
            saveData(JSON.stringify(jsonData, null, 2));
            renderData(jsonData);
        };
        reader.readAsDataURL(imageFile);
    } else if (imageLink) {
        album.cover = imageLink;
        saveData(JSON.stringify(jsonData, null, 2));
        renderData(jsonData);
    }

    closeImagePopup();
}

function saveChanges() {
    const albumName = document.getElementById("popupAlbumName").value;
    const albumRating = document.getElementById("popupAlbumRating").value;

    console.log("Saved album details:", {
        name: albumName,
        rating: albumRating,
    });
}

//////////// //////////// ////////////

function addAlbum(ard) {
    const alb = {
        name: "New album",
        cover: "https://audomark.sipped.org/public/bg/pfp_placeholder.png",
        rating: 0
    };

    ard.albums.push(alb);
    renderData(jsonData);
    saveData(JSON.stringify(jsonData, null, 2));
}

function addArtist() {
    jsonData.push({ "artist": "New artist", "icon": "https://audomark.sipped.org/public/bg/pfp_placeholder.png", "albums": [] });
    renderData(jsonData);
    document.documentElement.scrollTop = document.documentElement.scrollHeight;
    saveData(JSON.stringify(jsonData, null, 2));
}

//////////// //////////// ////////////

function handleSortChange() {
    const sortOption = document.getElementById("sortOptions").value;

    if (sortOption === "alphabetical") {
        sortByAlphabetical();
    } else if (sortOption === "ratings") {
        sortByRating();
    }
}

function mhandleSortChange() {
    const sortOption = document.getElementById("msortOptions").value;

    if (sortOption === "alphabetical") {
        sortByAlphabetical();
    } else if (sortOption === "ratings") {
        sortByRating();
    }
}

function sortByAlphabetical() {
    jsonData.sort((a, b) => a.artist.localeCompare(b.artist));
    renderData(jsonData);
}

function sortByRating() {
    jsonData.sort((a, b) => {
        const averageRatingA = calculateAverageRating(a);
        const averageRatingB = calculateAverageRating(b);
        return averageRatingB - averageRatingA;
    });
    renderData(jsonData);
}

function calculateAverageRating(artist) {
    const ratingsort = JSON.parse(localStorage.getItem('ratingsort')) || {};

    let validAlbums = artist.albums.filter(album => album.rating > 0);

    if (validAlbums.length === 0) {
        return 0;
    }

    let totalRating = validAlbums.reduce((sum, album) => {
        let albumRating = album.rating;

        if (ratingsort.above90 && album.rating > 90) {
            albumRating += 80;
        }
        if (ratingsort.rated100 && album.rating === 100) {
            albumRating += 90;
        }
        if (ratingsort.greater90 && album.rating > 90) {
            albumRating += 50;
        }
        if (ratingsort.greater50 && album.rating > 50) {
            albumRating += 20;
        }

        return sum + albumRating;
    }, 0);

    if (ratingsort.after3Albums && validAlbums.length > 3) {
        totalRating += validAlbums.length * 30; 
    }

    let numberOfAlbums = validAlbums.length;
    return totalRating / numberOfAlbums;
}

window.addEventListener('DOMContentLoaded', () => {
    checkDefaultRatingMethod();
    
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        const ct = document.getElementById('currenttab')
        ct.style = "box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);"
    }
});

function checkDefaultRatingMethod() {
    const defaultSort = localStorage.getItem('defaultSort') || 'alphabetical';
    if (defaultSort === 'alphabetical') {
        sortByAlphabetical();
    } else if (defaultSort === 'ratings') {
        sortByRating();
    }

    const defaultSortDropdown = document.getElementById('sortOptions');
    const m = document.getElementById('msortOptions')

    defaultSortDropdown.value = defaultSort;
    m.value = defaultSort;
}

function mhandleSearch() {
    const searchQuery = document.getElementById("msearchBar").value.toLowerCase();
    const filteredData = jsonData.filter(artist => {
        return artist.artist.toLowerCase().includes(searchQuery) ||
               artist.albums.some(album => album.name.toLowerCase().includes(searchQuery));
    });
    renderData(filteredData);
}

function handleSearch() {
    const searchQuery = document.getElementById("searchBar").value.toLowerCase();
    const filteredData = jsonData.filter(artist => {
        return artist.artist.toLowerCase().includes(searchQuery) ||
               artist.albums.some(album => album.name.toLowerCase().includes(searchQuery));
    });
    renderData(filteredData);
}

document.getElementById('logout').addEventListener('click', () => {
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/server/user/!l';
        } else {
            alert('Logout failed');
        }
    })
    .catch(err => {
        console.error('Error logging out:', err);
    });
});

function toggleMobileSearchSort() {
    const mobileSearchSortContainer = document.getElementById("mobileSearchSortContainer");

    if (mobileSearchSortContainer.classList.contains("hidden")) {
        mobileSearchSortContainer.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
        mobileSearchSortContainer.classList.add("hidden");
    }
}

function handleMobileSearch() {
    const query = document.getElementById("mobileSearchBar").value.toLowerCase();
    const filteredData = jsonData.filter(artist => artist.artist.toLowerCase().includes(searchQuery));
    renderData(filteredData);
}

function handleMobileSortChange() {
    const sortOption = document.getElementById("mobileSortOptions").value;
    console.log("Mobile sort option selected:", sortOption);
}

function toggleDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isDarkMode) {
        localStorage.setItem('darkMode', 'false');
        document.body.classList.remove('dark-mode');
    } else {
        localStorage.setItem('darkMode', 'true');
        document.body.classList.add('dark-mode');
    }
}

//////////////////////////////// SAVE DATA ////////////////////////////////

function saveData(data) {
    fetch('/server/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data,
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
}

function generateShareImage() {
    const contentDiv = document.getElementById("content");
    const statusTextDiv = document.getElementById("statusText");

    jsonData.sort((a, b) => a.artist.localeCompare(b.artist));

    let layoutHtml = '<div style="padding: 0 20px;">';
    jsonData.forEach(artistData => {
        layoutHtml += `<div style="margin-bottom: 20px;">
            <h2 style="margin: 0;">${artistData.artist}</h2>`;
        artistData.albums.forEach(album => {
            layoutHtml += `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
                <img src="${album.cover}" alt="${album.name}" style="width: 50px; height: 50px; margin-right: 10px;" class="album-cover">
                <span style="flex: 1;">${album.name}</span>
                <span style="width: 50px; text-align: right;">${album.rating}</span>
            </div>`;
        });
        layoutHtml += `</div>`;
    });
    layoutHtml += '</div>';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = layoutHtml;
    document.body.appendChild(tempDiv);

    const images = tempDiv.querySelectorAll('.album-cover');
    const promises = [];
    const albumsWithCORSIssues = [];

    images.forEach(img => {
        promises.push(new Promise((resolve, reject) => {
            fetch(img.src, { method: 'HEAD' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch image');
                    }
                    resolve();
                })
                .catch(error => {
                    albumsWithCORSIssues.push(img.alt);
                    resolve();
                });
        }));
    });

    Promise.allSettled(promises).then(() => {
        html2canvas(tempDiv, { useCORS: true }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'artist_and_albums.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            document.body.removeChild(tempDiv);

            if (albumsWithCORSIssues.length === 0) {
                statusTextDiv.innerHTML = '<span style="color: green;">Album ratings successfully downloaded!</span>';
            } else {
                statusTextDiv.innerHTML = `
                    <span style="color: green;">Album ratings downloaded!</span><br>
                    <span style="color: red;">${albumsWithCORSIssues.join(', ')} will not have album covers due to the image sources blocking CORS. Check console logs!</span>
                `;
            }
        });
    }).catch((error) => {
        console.error("Image failed to load:", error);
        document.body.removeChild(tempDiv);

        statusTextDiv.innerHTML = `<span style="color: red;">Download failed! Error: ${error.message}</span>`;
    });
}