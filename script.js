let currentSong = new Audio();
let songs;
let currentFolder = "Motivational";


// Converts seconds to MM:SS format for time display
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


// ------------------------
// // Fetches all .mp3 song filenames from a given folder [localhost version]
// async function getSongs(folder) {
//     let a = await fetch(`/songs-folder/${folder}/`);
//     let response = await a.text();

//     let div = document.createElement("div");
//     div.innerHTML = response;
//     let as = div.getElementsByTagName("a");
//     songs = [];

//     // Filter and extract MP3 file names
//     for (let i = 0; i < as.length; i++) {
//         const element = as[i];
//         if(element.href.endsWith(".mp3")) {
//             let mp3ONE = element.href.split(`/songs-folder/${folder}/`)[1];
//             let mp3TWO = mp3ONE.split(".mp3")[0];
//             songs.push(mp3TWO.replaceAll("%20", " "));
//         }
//     }
//     return songs;
// }
// ------------------------


// Fetches all .mp3 song filenames from songs.json [deployed version]
async function getSongs(folder) {
    let res = await fetch("/songs.json");
    let data = await res.json();
    songs = data[folder] || [];
    console.log(songs)
    return songs;
}


// Displays all album cards dynamically from info.json
async function displayAlbums() {
    let cardContainer = document.querySelector(".cardContainer")

    let response = await fetch("/info.json");
    let data = await response.json()

    // Loop through album data and create cards
    for (let i = 0; i < data.length; i++) {
        cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card">
            <img class="green-play" src="images/icons/green-play.png" alt="">
            <img src=${data[i].cover} alt="">
            <h3 id="cardSongTitle">${data[i].title}</h3>
            <p>${data[i].desc}</p>
        </div>`
    }

    // Handle album card click to load respective songs
    cardContainer.addEventListener("click", async (event) => {
        if (event.target.closest(".card")) {
            let cardSongTitle = event.target.closest(".card").getElementsByTagName("h3")[0].innerText.split(" ")[0];
            currentFolder = cardSongTitle;
            songs = await getSongs(currentFolder);

            let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
            songUL.innerHTML = "";

            // Render song list in sidebar
            for (const song of songs) {
                songUL.innerHTML += `<li><img class="music-svg" src="images/icons/music.svg" alt="">
                    <div class="info">
                        <div>${song.split("-")[0]}</div>
                        <div>${song.split("-")[1]}</div>
                    </div>
                    <img class="playnow" width="30px" style="filter:invert(1)" src="images/icons/playnow.png" alt=""></li>`;
            }

            // Add click listeners to each song to play on click
            Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
                e.addEventListener("click", element => {
                    let leftPanelSongName = e.querySelector(".info").children[0].innerHTML + "-" + e.querySelector(".info").children[1].innerHTML;
                    playMusic(currentFolder, leftPanelSongName)
                })
            })

            playMusic(currentFolder, songs[0]);
        }
    });
}


// Handles actual song playing logic
function playMusic(folder, track, pause=false) {

    // ------------------------
    // // [localhost version]
    // currentSong.src = `/songs-folder/${folder}/` + track + ".mp3";
    // ------------------------

    // [deployed version]
    currentSong.src = `/songs-folder/${folder}/` + encodeURIComponent(track) + ".mp3";

    if(!pause) {
        currentSong.play();
        play.src = "images/icons/pause.svg";
    }

    document.querySelector(".songInfo").innerHTML = track;

    currentSong.addEventListener('loadeddata', () => {
        document.querySelector(".songTime").innerHTML = `00:00 / ${secondsToMinutesSeconds(currentSong.duration)}`;
    });

    currentSong.addEventListener('ended', () => {
        play.src = "images/icons/play.svg";
    });
}


// App entry point
async function main() {
    songs = await getSongs(currentFolder);

    playMusic(currentFolder, songs[0], true)

    displayAlbums();

    // Show songs in sidebar on load
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="music-svg" src="images/icons/music.svg" alt="">
            <div class="info">
                <div>${song.split("-")[0]}</div>
                <div>${song.split("-")[1]}</div>
            </div>
            <img class="playnow" width="30px" style="filter:invert(1)" src="images/icons/playnow.png" alt=""></li>`;
    }

    // Add click listeners to each song to play on click
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let leftPanelSongName = e.querySelector(".info").children[0].innerHTML + "-" + e.querySelector(".info").children[1].innerHTML;
            playMusic(currentFolder, leftPanelSongName)
        })
    })

    // Toggle play/pause on play button click
    document.getElementById("play").addEventListener("click", () => {
        if(currentSong.paused) {
            currentSong.play();
            play.src = "images/icons/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "images/icons/play.svg";
        }
    })

    // Play previous song
    document.getElementById("previous").addEventListener("click", () => {
        currentSong.pause();
    
        let currentSongFolderName = currentSong.src.split("/").slice(-2)[0];
        let currentSongFileName = currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ").split(".")[0];
    
        let index = songs.indexOf(currentSongFileName);
    
        if (index !== -1 && (index - 1) >= 0) {
            playMusic(currentSongFolderName, songs[index - 1]);
        } else {
            console.log("No previous song available");
        }
    })

    // Play next song
    document.getElementById("next").addEventListener("click", () => {
        currentSong.pause();
    
        let currentSongFolderName = currentSong.src.split("/").slice(-2)[0];
        let currentSongFileName = currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ").split(".")[0];
    
        let index = songs.indexOf(currentSongFileName);
    
        if (index !== -1 && (index + 1) < songs.length) {
            playMusic(currentSongFolderName, songs[index + 1]);
        } else {
            console.log("No next song available");
        }
    });
    
    // Change volume from volume slider
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("images/icons/mute.png", "images/icons/volume.png")
        } else {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("images/icons/volume.png", "images/icons/mute.png")
        }
    })

    // Mute/unmute volume icon click handler
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.png")){
            currentSong.volume = 0;
            e.target.src = e.target.src.replace("images/icons/volume.png", "images/icons/mute.png")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("images/icons/mute.png", "images/icons/volume.png")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

    // Update song progress bar and time on playback
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Seek audio on progress bar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Open left sidebar on hamburger click (mobile)
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Close left sidebar on close icon click
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

}

main();