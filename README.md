![audomark.sipped.org header](https://audomark.sipped.org/public/github/audomark.png?v=20250130)

[![Version](https://img.shields.io/badge/Version-1.4-blue)](#)
[![HTML](https://img.shields.io/badge/HTML-%23E34F26.svg?logo=html5&logoColor=white)](#)
[![CSS](https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=fff)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)](#)
[![NodeJS](https://img.shields.io/badge/Node.js-6DA55F?logo=node.js&logoColor=white)](#)
[![Express.js](https://img.shields.io/badge/Express.js-%23404d59.svg?logo=express&logoColor=%2361DAFB)](#)
[![GitHub created at](https://img.shields.io/github/created-at/sippedaway/Audomark)](#)
[![GitHub last commit](https://img.shields.io/github/last-commit/sippedaway/Audomark)](#)

# [Audomark](https://audomark.sipped.org/)
Rank and manage your music in one place. Keep and share your favorite artists, albums together with a simple statistics system that includes pie charts and artist ratings. Back out and download your data any time to keep offline.

[<kbd> <br> audomark.sipped.org <br> </kbd>](https://audomark.sipped.org)

## What is Audomark?
Audomark is a website where you can add and rank your listened-to music. Here's how it works!

#### Simple editor
With the simple editor, anyone can add as many artists and albums as possible! Then, rank all albums from 0 to 100. This will create a personal statistics page and let you dynamically see what music you like the most, and with one click share it with others!
#### Share / export / statistics
Always keep an eye on your top artists, albums, and more with the statistics page. Statistics include how many albums & artists you've rated, a pie chart of the ratings you put, an average album rating, top 10 albums, fun things, and artist ratings. At any time export your albums and artists as an image and share with anyone, if you've got friends! Well. Or hang it up on your wall, cool right?
#### Manage everything
Change how you'd like your top artists to be calculated, how you want to sort artists, and more... Just visit the Settings. 
#### Authentication
Uses a simple session ID system with Google and Discord oAuth2. Currently no username-password sign up method, fortunately or not. If you want to have offline access, please [contact](mailto:hello@sipped.org) me and I'll be sure to add an offline mode, even including a self-hosting download.

## Development
Made by sipped in under a month in December 2024 - January 2025. Made with HTML/CSS/JavaScript + express/node.js and is currently hosted on [audomark.sipped.org](https://audomark.sipped.org) (or sipped.org/audomark)

## Status
When servers are unactive, the website isn't working, you found bugs, or have questions - **email me at** audomark@sipped.org
Responses usually take <30 minutes unless I'm sleeping. Check my GitHub timezone

My hosting service status page: https://status.webhostmost.com

**(02/01) Currently online: version 1.4 out now**

## Version
#### 1.4 / Minor fixes
- **Release**: 02/01
- All pages: on mobile, added mobile navigation bar to all pages
- All pages: dark mode coloring fixes
- Home: fixed all mobile layout bugs and added various CSS mobile optimizations
- Settings: added a seperate optimized sidebar for smaller width screens

**Known issues**:
- Home: on maximum width screens album title letter count is too small to utilize the width
#### 1.3 / Major revamp
- **Release**: 01/30
- Home: artist name, artist icon, album title, album cover and album ratings are all editable now
- Home: upload local files or use image URL to upload album/artist images
- Home: delete and manage albums & artists immediately
- Home: placeholder "New album" and "New artist"
- Settings: categorized by tabs and information
- Settings: added the Classic Editor explanation and visit button
- Settings: fixed "Default sorting method" dropdown being offset on the left
- Editor: removed from navbar (archived)
- Authentication: sign-in by GitHub
- GitHub: removed server.js for now
  
**Known issues**:
- Dark theme not in 401, 404 and "Delete account" pages
- Home (Mobile): bad title and album rating visibility, usually cut off
- Settings (Mobile): can't even explain, very not good
#### 1.2 / Minor updates
- GitHub: added server.js, README changes
- Editor: button sizes optimization on mobile
- Home: removed Audomark nav-bar on mobile
#### 1.1
- Bug fixes, optimization
- Known issues: Audomark header visible on mobile screens
#### 1.0
- Base release

## Credits
- [sipped](https://github.com/sippedaway)
