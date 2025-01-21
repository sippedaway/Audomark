// GITHUB REPOSITORY READERS //

// Keep in mind many parts of the code were removed from the repistory for privacy, duh
// Look, I suck at node.js and I'm dumb. I don't want to show too much but still keep it open-source
// oAuth2 and Sessions took me a long time and I don't want anyone to struggle
// It's definitely a shitty system but it works alright
// I'll be trying to explain some things while you're reading this code
// No comments for frontend. Should be simple enough

const express = require('express');
const expressSession = require('express-session');

const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const cors = require('cors');
const path = require('path');
const fs = require('fs');


// Cookies to keep sessionId
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT;

const activeSessions = {};

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

//////////////////////////////// OAUTH2 ////////////////////////////////

// Parts removed

passport.use(new GoogleStrategy({
    clientID: // Kept elsewhere,
    clientSecret: // Kept elsewhere,
    callbackURL: 'https://audomark.sipped.org/auth/google/callback',
}, (token, tokenSecret, profile, done) => {
    return done(null, profile);
}));

passport.use(new DiscordStrategy({
    clientID: // Kept elsewhere,
    clientSecret: // Kept elsewhere,
    callbackURL: 'https://audomark.sipped.org/auth/discord/callback',
    scope: ['identify'],
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

function checkAndCreateUserDataFile(userId, res) {
    // Parts removed

    const defaultData = [
        {
            "artist": "Example artist",
            "icon": "https://static-00.iconduck.com/assets.00/profile-icon-512x512-w0uaq4yr.png",
            "albums": [
                {
                    "name": "Click 'Edit' to create your album ratings",
                    "cover": "https://cdn-icons-png.flaticon.com/512/1274/1274881.png",
                    "rating": 0
                }
            ]
        }
    ];

    // x - part removed

    fs.access(x, fs.constants.F_OK, (err) => {
        if (!err) {
            res.redirect('/');
        } else {
            fs.writeFile(x, JSON.stringify(defaultData, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Error creating the file:', writeErr);
                }
                res.redirect('/');
            });
        }
    });
}

////////


// oAuth2 system. Email and user Profile Picture are kept in a cookie as well as the sessionId. The sessionId is used to authorize access to loading and saving, pretty much a temporary password, but no passwords 
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    const email = req.user.emails[0].value;
    const profilePicture = req.user.photos ? req.user.photos[0].value : '';

    const sessionId = Math.random().toString(36).substr(2) + Date.now().toString(36);
    activeSessions[sessionId] = { email, timestamp: Date.now() };
    
    res.cookie('sessionId', sessionId, { httpOnly: true, secure: true, maxAge: 24 * 60 * 60 * 1000 });

    res.cookie('userProfilePicture', profilePicture, { maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('authMethod', "Google", { maxAge: 24 * 60 * 60 * 1000 });

    checkAndCreateUserDataFile(email, res);
});

app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
    const userId = req.user.id;
    const avatar = req.user.avatar;
    const email = userId;

    let profilePicture = avatar
        ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

    const sessionId = Math.random().toString(36).substr(2) + Date.now().toString(36);
    activeSessions[sessionId] = { email, timestamp: Date.now() };
    
    res.cookie('sessionId', sessionId, { httpOnly: true, secure: true, maxAge: 24 * 60 * 60 * 1000 });

    res.cookie('userEmail', userId, { maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('userProfilePicture', profilePicture, { maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('authMethod', "Discord", { maxAge: 24 * 60 * 60 * 1000 });
    
    checkAndCreateUserDataFile(userId, res);
});

const authenticateSession = (req, res, next) => {
    const sessionId = req.cookies.sessionId;

    if (!sessionId || !activeSessions[sessionId]) {
        return res.status(401).json({ error: 'Unauthorized: Invalid session ID' });
    }

    req.user = { email: activeSessions[sessionId].email };
    next();
};

app.get('/server/user/get-data', authenticateSession, (req, res) => {

    // Parts removed

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Lmao error reading the file:', err);
            return res.status(500).json({ error: 'Could not read user data' });
        }
        res.json(JSON.parse(data));
    });
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/username', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login-step2.html'))
});

app.post('/server/user/logout', (req, res) => {
    const sessionId = req.cookies.sessionId;

    if (sessionId && activeSessions[sessionId]) {
        delete activeSessions[sessionId];
    }

    res.clearCookie('sessionId');
    res.clearCookie('authMethod');
    res.clearCookie('userProfilePicture');

    res.redirect('/');
});

//////////////////////////////// MAIN PAGES ////////////////////////////////

app.get('/editor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'editor.html'));
});

app.get('/', authenticateSession, (req, res) => {
  const email = req.user.email;
  
  if (!email) {
    return res.redirect('/login');
  }
  
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.get('/statistics', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'statistics', 'stats.html'));
});

app.get('/deleteaccount', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'deleteaccount.html'));
});

app.get('/accountdeleted', (req, res) => {
  res.sendFile(path.join(__dirname, 'error', 'deleted.html'));
});

//////////////////////////////// DELETE ACCOUNT ////////////////////////////////

app.post('/server/user/delete', authenticateSession, (req, res) => {
    
    // Parts removed
    // x - part removed

    fs.unlink( x , (err) => {
        if (err) {
            console.error('Error deleting user file:', err);
            return res.status(500).json({ error: 'Failed to delete user account.' });
        }

        res.clearCookie('sessionId');
        res.clearCookie('authMethod');
        res.clearCookie('userProfilePicture');
        res.redirect('/');
        res.json({ message: 'Account deleted successfully.' });
    });
});


//////////////////////////////// POST JSON ////////////////////////////////


// Posting edits to user data
app.post('/server/edit', authenticateSession, (req, res) => {

    // Parts removed
    // x - part removed

    try {
        const jsonString = JSON.stringify(req.body, null, 2);

        fs.writeFile(x, jsonString, (writeErr) => {
            if (writeErr) {
                addLog('Error writing to user file: ' + writeErr);
                return res.status(500).json({ error: 'Failed to save new user data' });
            }

            res.json({ message: 'Data replaced successfully!' });
        });
    } catch (error) {
        return res.status(400).json({ error: 'Idk we are probably down for updates' });
    }
});

app.all('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'error', '404.html'));
});
