const userEmail = getCookie('userEmail');
const userProfilePicture = getCookie('userProfilePicture');
const authMethod = getCookie('authMethod');

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

document.addEventListener('DOMContentLoaded', () => {    
    const accountData = {
        icon: userProfilePicture,
        authMethod: 'Undefined',
        email: userEmail,
    };

    const accountDiv = document.getElementById('accountContent');

    const accountIcon = document.createElement('img');
    accountIcon.src = accountData.icon;
    accountIcon.alt = 'Profile Picture';
    accountIcon.classList.add('account-icon');

    const upfp = document.getElementById('pfp2');
    if(upfp) {
        upfp.src = userProfilePicture;
    }

    const accountDetails = document.createElement('div');
    accountDetails.classList.add('account-details');

    let emailLabel = "Email Address:";

    if (authMethod === 'Google') {
        accountData.authMethod = 'Google';
    } else if (authMethod === 'Discord') {
        accountData.authMethod = 'Discord';
        emailLabel = "Discord User ID:";
    } else if (authMethod === 'GitHub') {
        accountData.authMethod = 'GitHub';
        emailLabel = "GitHub Username:";
    }

    const authMethodElement = document.createElement('p');
    authMethodElement.innerHTML = `<span class="detail-label">Sign-up method:</span> <span class="detail-value">${accountData.authMethod}</span>`;

    const emailElement = document.createElement('p');
    emailElement.innerHTML = `<span class="detail-label">${emailLabel}</span> <span class="detail-value">${accountData.email}</span>`;

    const logoutb = document.createElement('button');
    logoutb.id = 'logout';
    logoutb.onclick = logout;
    logoutb.classList.add('hlbutton');
    logoutb.textContent = 'Logout';

    accountDetails.appendChild(authMethodElement);

    if (authMethod !== 'Google') {
        accountDetails.appendChild(emailElement);
    }

    accountDiv.appendChild(accountIcon);
    accountDiv.appendChild(accountDetails);
    accountDiv.appendChild(logoutb);
});

function logout() {
    fetch('/server/user/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                window.location.href = 'https://audomark.sipped.org/login';
            } else {
                alert('Logout failed');
            }
        })
        .catch(err => {
            console.error('Error logging out:', err);
        });
}

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

/////////////////////////////////////// RULES ///////////////////////////////////////

function initializeSettings() {
    const ratingsort = JSON.parse(localStorage.getItem('ratingsort')) || {};

    const averageRatingCheckbox = document.getElementById('averageRating');
    const above90Checkbox = document.getElementById('above90');
    const rated100Checkbox = document.getElementById('rated100');
    const greater90Checkbox = document.getElementById('greater90');
    const greater50Checkbox = document.getElementById('greater50');
    const after3AlbumsCheckbox = document.getElementById('after3Albums');

    const defaultSort = localStorage.getItem('defaultSort') || 'alphabetical';
    const defaultSortDropdown = document.getElementById('defaultSort');
    defaultSortDropdown.value = defaultSort;

    averageRatingCheckbox.checked = true;
    above90Checkbox.checked = ratingsort.above90 || false;
    rated100Checkbox.checked = ratingsort.rated100 || false;
    greater90Checkbox.checked = ratingsort.greater90 || false;
    greater50Checkbox.checked = ratingsort.greater50 || false;
    after3AlbumsCheckbox.checked = ratingsort.after3Albums || false;
}

function saveToLocalStorage(ratingsort) {
    localStorage.setItem('ratingsort', JSON.stringify(ratingsort));
}

function handleAbove90Change() {
    const above90Checkbox = document.getElementById('above90');
    const ratingsort = JSON.parse(localStorage.getItem('ratingsort')) || {};
    ratingsort.above90 = above90Checkbox.checked;
    saveToLocalStorage(ratingsort);
}

function handleRated100Change() {
    const rated100Checkbox = document.getElementById('rated100');
    const ratingsort = JSON.parse(localStorage.getItem('ratingsort')) || {};
    ratingsort.rated100 = rated100Checkbox.checked;
    saveToLocalStorage(ratingsort);
}

function handleGreater90Change() {
    const greater90Checkbox = document.getElementById('greater90');
    const ratingsort = JSON.parse(localStorage.getItem('ratingsort')) || {};
    ratingsort.greater90 = greater90Checkbox.checked;
    saveToLocalStorage(ratingsort);
}

function handleGreater50Change() {
    const greater50Checkbox = document.getElementById('greater50');
    const ratingsort = JSON.parse(localStorage.getItem('ratingsort')) || {};
    ratingsort.greater50 = greater50Checkbox.checked;
    saveToLocalStorage(ratingsort);
}

function handleAfter3AlbumsChange() {
    const after3AlbumsCheckbox = document.getElementById('after3Albums');
    const ratingsort = JSON.parse(localStorage.getItem('ratingsort')) || {};
    ratingsort.after3Albums = after3AlbumsCheckbox.checked;
    saveToLocalStorage(ratingsort);
}

initializeSettings();

/////////////////////////////////////// DEFAULT SORTING ///////////////////////////////////////

function saveSortPreference() {
    const selectedOption = document.getElementById("defaultSort").value;
    localStorage.setItem('defaultSort', selectedOption);
}

/////////////////////////////////////// ON INITIALIZE ///////////////////////////////////////

window.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        const ct = document.getElementById('currenttab')
        ct.style = "box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);"
    }
});

/////////////////////////////////////// DOWNLOAD DATA ///////////////////////////////////////

function downloadJson() {
    fetch('/server/user/get-data', {
        method: 'GET',
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = 'https://audomark.sipped.org/401';
                }
                throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then(data => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'user_data.json';
            link.click();
        })
        .catch(error => {
            console.error('Error fetching or downloading user data:', error);
        });
}


function showTab(tabName) {
    const tabs = document.querySelectorAll('.tb');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(tabName).style.display = 'block';
}

document.addEventListener("DOMContentLoaded", () => {
    showTab('account');
});