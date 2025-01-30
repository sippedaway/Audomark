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
        authMethod: '',
        email: userEmail,
    };

    const accountDiv = document.getElementById('accountContent');

    const accountIcon = document.createElement('img');
    accountIcon.src = accountData.icon;
    accountIcon.alt = 'Profile Picture';
    accountIcon.classList.add('account-icon');

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
        emaillabel = 'Github Username:'
    }

    const authMethodElement = document.createElement('p');
    authMethodElement.innerHTML = `<span class="detail-label">Sign-up method:</span> <span class="detail-value">${accountData.authMethod}</span>`;

    const emailElement = document.createElement('p');
    emailElement.innerHTML = `<span class="detail-label">${emailLabel}</span> <span class="detail-value">${accountData.email}</span>`;

    accountDetails.appendChild(authMethodElement);

    if (authMethod !== 'Google') {
        accountDetails.appendChild(emailElement);
    }

    accountDiv.appendChild(accountIcon);
    accountDiv.appendChild(accountDetails);
});

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

function toggleDeleteButton() {
    const checkBox = document.getElementById('imsure');
    const deleteButton = document.getElementById('deleteAccountButton');
            
    deleteButton.disabled = !checkBox.checked;
}

function deleteAccount() {
    fetch('/server/user/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
     })

    window.location.href = 'https://audomark.sipped.org/accountdeleted';
}