const userpfp = getCookie('userProfilePicture');

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

function fetchUserData() {
    return fetch('/server/user/get-data', {
        method: 'GET',
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = 'https://audomark.sipped.org/401';
                }
                throw new Error('Failed to fetch user data');
            }
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            throw error;
        });
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

document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        const ct = document.getElementById('currenttab')
        ct.style = "box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);"
    }

    fetchUserData().then(data => {
        const allAlbums = data.flatMap(artist => artist.albums);

        upfp = document.getElementById('pfp');
        upfp2 = document.getElementById('pfp2');
        upfp3 = document.getElementById('mpfp');
        upfp.src = userpfp;
        upfp2.src = userpfp;
        upfp3.src = userpfp;

        document.getElementById('total-albums').textContent = allAlbums.length;
        document.getElementById('total-artists').textContent = data.length;

        renderPieChart(allAlbums);

        const avgRating = calculateAverageAlbumRating(allAlbums);
        document.getElementById('average-rating').textContent = avgRating.toFixed(1);

        const all100 = allAlbums.filter(album => album.rating === 100);
        const all100List = document.getElementById('all-100-albums');
        all100.forEach(album => {
            const li = document.createElement('li');

            const albumIcon = document.createElement('img');
            albumIcon.src = album.cover;
            albumIcon.alt = album.name;
            albumIcon.classList.add('albumcover');

            const albumText = document.createElement('span');
            albumText.textContent = album.name;

            li.appendChild(albumIcon);
            li.appendChild(albumText);

            all100List.appendChild(li);
        });

        populateList('top-10-albums', getTopAlbums(allAlbums, 10), true);
        populateList('worst-3-albums', getWorstAlbums(allAlbums, 3), true);

        const longestTitleAlbum = allAlbums.reduce((a, b) => a.name.length > b.name.length ? a : b, { name: '' });
        document.getElementById('longest-album-title').textContent = longestTitleAlbum.name || 'None yet!';

        populateList('top-10-artists-ratings', getTopArtistsByRating(data, 10), false);
        populateList('top-10-artists-albums', getTopArtistsByAlbumCount(data, 10), false);
    });
});

function populateList(containerId, items, isAlbumList = true) {
    const container = document.getElementById(containerId);
    items.forEach(item => {
        const li = document.createElement('li');

        const icon = document.createElement('img');
        if (isAlbumList) {
            icon.src = item.cover;
            icon.alt = item.name || 'album cover';
        }

        icon.classList.add('albumcover');
        if (isAlbumList) {
            li.appendChild(icon);
        }

        const text = document.createElement('span');
        text.textContent = item.name;
        li.appendChild(text);

        container.appendChild(li);
    });
}

function calculateAverageAlbumRating(albums = []) {
    const total = albums.reduce((sum, album) => sum + album.rating, 0);
    return albums.length > 0 ? total / albums.length : 0;
}

function getTopAlbums(albums = [], count = 10) {
    return [...albums]
        .filter(album => album.rating > 0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, count);
}

function getWorstAlbums(albums = [], count = 3) {
    return [...albums]
        .filter(album => album.rating > 0)
        .sort((a, b) => a.rating - b.rating)
        .slice(0, count);
}

function getTopArtistsByRating(artists = [], count = 10) {
    return [...artists]
        .map(artist => ({
            name: artist.artist,
            averageRating: calculateAverageAlbumRating(artist.albums),
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, count);
}

function getTopArtistsByAlbumCount(artists = [], count = 10) {
    return [...artists]
        .map(artist => ({
            name: artist.artist,
            albumCount: artist.albums.length,
        }))
        .sort((a, b) => b.albumCount - a.albumCount)
        .slice(0, count);
}

////////////////// PIE CHART //////////////

function calculateRatingDistribution(albums = []) {
    const ranges = [0, 0, 0, 0, 0];
    albums.forEach(album => {
        if (album.rating <= 20) ranges[0]++;
        else if (album.rating <= 40) ranges[1]++;
        else if (album.rating <= 60) ranges[2]++;
        else if (album.rating <= 80) ranges[3]++;
        else ranges[4]++;
    });
    return ranges;
}

function renderPieChart(albums = []) {
    const ctx = document.getElementById('ratings-pie-chart').getContext('2d');
    const distribution = calculateRatingDistribution(albums);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
            datasets: [{
                data: distribution,
                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'],
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw + ' albums';
                        }
                    }
                }
            }
        }
    });
}

/////////////////////////////////////////

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