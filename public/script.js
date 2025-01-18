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
            renderData(data);
            jsonData = data;
            checkDefaultRatingMethod();
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
}

function renderData(data) {
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = '';

    data.forEach(artistData => {
        const artistDiv = document.createElement("div");
        artistDiv.classList.add("artist");

        const artistHeader = document.createElement("div");
        artistHeader.classList.add("artist-header");

        const artistIcon = document.createElement("img");
        artistIcon.src = artistData.icon;
        artistIcon.alt = artistData.artist;
        artistIcon.classList.add("artist-icon");

        const artistName = document.createElement("h2");
        artistName.textContent = artistData.artist;

        artistHeader.appendChild(artistIcon);
        artistHeader.appendChild(artistName);
        artistDiv.appendChild(artistHeader);

        artistData.albums.forEach(album => {
            const albumDiv = document.createElement("div");
            albumDiv.classList.add("album");

            const albumName = document.createElement("h3");
            albumName.textContent = album.name;

            const albumCover = document.createElement("img");
            albumCover.src = album.cover;
            albumCover.alt = album.name;

            const albumRating = document.createElement("div");
            albumRating.classList.add("album-rating");

            let bgImage;
            if (album.rating <= 39) bgImage = "./bg/0.png";
            else if (album.rating <= 69) bgImage = "./bg/40.png";
            else if (album.rating <= 79) bgImage = "./bg/70.png";
            else if (album.rating <= 89) bgImage = "./bg/80.png";
            else if (album.rating <= 99) bgImage = "./bg/90.png";
            else bgImage = "./bg/100.png";

            albumRating.style.backgroundImage = `url(${bgImage})`;
            albumRating.innerHTML = `<span>${album.rating}</span>`;

            albumDiv.addEventListener("click", () => openAlbumPopup(album, artistData));

            albumDiv.appendChild(albumCover);
            albumDiv.appendChild(albumName);
            albumDiv.appendChild(albumRating);

            artistDiv.appendChild(albumDiv);
        });

        contentDiv.appendChild(artistDiv);
    });
}

//////////// ALBUM POPUPS ////////////

function openAlbumPopup(album, artist) {
    const popup = document.getElementById("albumPopup");
    const albumCover = document.getElementById("popupAlbumCover");
    const albumName = document.getElementById("popupAlbumName");
    const artistName = document.getElementById("popupArtistName");
    const albumRating = document.getElementById("popupAlbumRating");
    const body = document.body;

    albumCover.src = album.cover;
    albumName.textContent = album.name;
    artistName.textContent = artist.artist;
    albumRating.textContent = album.rating;

    let bgImage;
    if (album.rating <= 39) bgImage = "./bg/0.png";
    else if (album.rating <= 69) bgImage = "./bg/40.png";
    else if (album.rating <= 79) bgImage = "./bg/70.png";
    else if (album.rating <= 89) bgImage = "./bg/80.png";
    else if (album.rating <= 99) bgImage = "./bg/90.png";
    else bgImage = "./bg/100.png";
    document.getElementById("popupRating").style.backgroundImage = `url(${bgImage})`;

    popup.style.display = "flex";
    body.classList.add("no-scroll");
}

function closePopup() {
    const popup = document.getElementById("albumPopup");
    const body = document.body;

    popup.style.display = "none";
    body.classList.remove("no-scroll");
}

document.getElementById("closePopup").addEventListener("click", closePopup);

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
    fetchUserData();
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