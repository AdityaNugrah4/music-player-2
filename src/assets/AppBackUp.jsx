import { useRef, useState, useEffect, useCallback } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { FaPause, FaPlay, FaStepBackward, FaStepForward, FaStop, FaVolumeDown, FaVolumeUp } from 'react-icons/fa';
import './App.css'

const trackList = [
    {
        name: 'Fly Me to The Moon',
        artist: 'Frank Sinatra',
        image: '/Image/Frank_Sinatra.jpg', // Path relative to public folder
        path: '/Audio/FlyMeToTheMoon_FrankSinatra.m4a' // Path relative to public folder
    },
    {
        name: 'My Way',
        artist: 'Frank Sinatra',
        image: '/Image/Frank_Sinatra.jpg',
        path: '/Audio/MyWay_FrankSinatra.m4a'
    },
    {
        name: 'Raindrops Keep Faling on My Head',
        artist: 'B.J. Thomas',
        image: '/Image/BJ_Thomas.jpg',
        path: '/Audio/RaindropsKeepFallinOnMyHead_BJThomas.m4a'
    }
];

function App() {
    // --- State Variables ---
    const [trackIndex, setTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackTime, setCurrenTrackTime] = useState('00:00');
    const [totalTrackTimeDuration, setTotalTrackTimeDuration] = useState('00:00');
    const [seekSliderValue, setSeekSliderValue] = useState(0);
    const [volumeSliderValue, setVolumeSliderValue] = useState(1);
    const [currentTrackData, setCurrentTrackData] = useState(trackList[0]);
    const [isTrackArtVisible, setIsTrackArtVisible] = useState(true);

    const audioRef = useRef(null);
    const updateTimeRef = useRef(null);

    // Helper
    const formatTime = (timeSeconds) => {
        if (isNaN(timeSeconds) || timeSeconds === 0) return '00:00';
        const minutes = Math.floor(timeSeconds / 60);
        const seconds = Math.floor(timeSeconds % 60);
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        // return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const resetTrackValues = useCallback(() => {
        setCurrenTrackTime('00:00');
        setTotalTrackTimeDuration('00:00');
        setSeekSliderValue(0);
    }, []);

    // Loading the track
    const loadTrack = useCallback((index) => {
        console.log(`Loading ${index + 1}: ${trackList[index].name}`);
        clearInterval(updateTimeRef.current);
        resetTrackValues();

        // For fade out track
        setIsTrackArtVisible(false);

        // Fade in new track
        setTimeout(() => {
            setCurrentTrackData(trackList[index]);
            setIsTrackArtVisible(true)
        }, 300);

        // This what caused the track to reset everytime the volume is slided
        if (audioRef.current) {
            audioRef.current.src = trackList[index].path;
            // audioRef.current.load();
            // audioRef.current.volume = volumeSliderValue / 100;
        }
        // Note: Actual playback (if isPlaying was true) will be handled by the play/pause useEffect
    }, [resetTrackValues]); // This is dependencies

    // Effect for play/pause fucntion (the cause of error)
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.play().catch(error => {
                console.error("Error playing track:", error);
                setIsPlaying(false) // resetting state if fail
            });
            clearInterval(updateTimeRef.current); // To clear timer first from previous track
            updateTimeRef.current = setInterval(seekUpdate, 1000);
        } else {
            audioRef.current.pause();
            clearInterval(updateTimeRef.current);
        };

        return () => {
            clearInterval(updateTimeRef.current);
        }; // Only re-run when isPlaying changes OR the track data changes (implying a new track loaded)
    }, [isPlaying, currentTrackData]);

    useEffect(() => {
        loadTrack(trackIndex);
    }, [trackIndex, loadTrack]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current
        }
    })

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volumeSliderValue;
        }
    }, [volumeSliderValue]);

    const playTrack = () => {
        console.log('Track Play triggered');
        setIsPlaying(true);
    };

    const pauseTrack = () => {
        console.log('Track Pause triggered');
        setIsPlaying(false);
    };

    const stopTrack = () => {
        console.log('Track Stop triggered');
        // if (audioRef.current) {
        //   audioRef.current.pause();
        //   audioRef.current.curretTime = 0; // Reset playback position
        // }
        // setIsPlaying(false);
        setIsPlaying(false);
        audioRef.current.currentTime = 0;
        resetTrackValues();
    };

    const nextTrack = useCallback(() => {
        console.log('Next Track triggered');
        setTrackIndex((prevIndex) => (prevIndex < trackList.length - 1 ? prevIndex + 1 : 0));

        if (isPlaying) {
            // Ensure play is triggered after load, useEffect [isPlaying, currentTrackData] handles this
        } else {
            setIsPlaying(false); // Explicitly ensure it stays paused if it wasn't playing
        }
    }, [isPlaying]); // isPlaying is needed to decide if the *next* track should auto-play

    const prevTrack = () => {
        console.log('Prev Track triggered');
        setTrackIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : trackList.length - 1));

        if (isPlaying) {
            // useEffect [isPlaying, currentTrackData] handles this
        } else {
            setIsPlaying(false);
        }
    };

    const seekTo = (event) => {
        const newValue = event.target.value;
        setSeekSliderValue(newValue);
        if (audioRef.current && !isNaN(audioRef.current.duration)) {
            const seekTime = audioRef.current.duration * (newValue / 100);
            audioRef.current.currentTime = seekTime;
        }
    };

    const setVolume = (event) => {
        setVolumeSliderValue(parseFloat(event.target.value))
    };

    const seekUpdate = () => {
        if (audioRef.current && !isNaN(audioRef.current.duration)) {
            const newPosition = audioRef.current.currentTime * (100 / audioRef.current.duration);
            setSeekSliderValue(newPosition);

            setCurrenTrackTime(formatTime(audioRef.current.currentTime));
            if (totalTrackTimeDuration === '00:00' || totalTrackTimeDuration === formatTime(NaN)) {
                setTotalTrackTimeDuration(formatTime(audioRef.current.duration));
            }
        } else {
            if (audioRef.current && audioRef.current.currentTime === 0) {
                resetTrackValues();
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setTotalTrackTimeDuration(formatTime(audioRef.current.duration));
            seekUpdate(); // Call seekUpdate once immediately to show initial 00:00 / duration
        }
    };

    const handleEnded = useCallback(() => {
        console.log("Track Ended");
        nextTrack();
    }, [nextTrack]);

    return (
        <>
            <div className="flex flex-col min-h-screen w-full justify-center items-center text-center m-0 p-0 overflow-x-hidden text-white bg-neutral-500">

                {/* Audio Element - hidden but essential */}
                <audio
                    ref={audioRef}
                    onTimeUpdate={seekUpdate} // Update slider and time display
                    onLoadedMetadata={handleLoadedMetadata} // Get duration when ready
                    onEnded={handleEnded} // Go to next track when finished
                // src is set in loadTrack/useEffect
                ></audio>

                {/* Title */}
                <div className="text-[clamp(1.25rem,0.5vw+1rem,1.875rem)] w-full">
                    <h1
                        className="mb-2 text-2xl lg:text-4xl font-bold underline hover:cursor-pointer hover:text-red-400 hover:scale-125 transition-transform duration-200 ease-in-out">
                        Music Player (React)
                    </h1>
                </div>

                {/* Details Area */}
                <div className="details w-full flex flex-col justify-center items-center content-center justify-items-center">
                    <div className="now-playing">
                        Playing {trackIndex + 1} of {trackList.length}
                    </div>
                    <div
                        className={`track-art w-[clamp(150px,60vw,500px)] h-[35vh] rounded-2xl bg-center bg-cover transition-opacity duration-500 my-3 shadow-2xl ${isTrackArtVisible ? 'opacity-100' : 'opacity-0'}`} // Dynamic opacity
                        style={{ backgroundImage: `url('${currentTrackData.image}')` }} // Set background image via style
                    >
                    </div>
                    <div className="track-name text-[clamp(1rem,5vw,2.5rem)] font-bold backdrop-blur-sm py-1 px-12 rounded-2xl">
                        {currentTrackData.name}
                    </div>
                    <div className="track-artist">
                        By {currentTrackData.artist}
                    </div>
                </div>

                {/* Track Duration Slider */}
                <div className="slider-container my-2 flex items-center justify-center space-x-2 w-full px-4"> {/* Added flex for layout */}
                    <span className="current-time w-12 text-right">{currentTrackTime}</span>
                    <input
                        type="range"
                        min="0" // Start from 0
                        max="100"
                        value={seekSliderValue}
                        className="seek-slider hover:outline-4 hover:outline-gray-300 hover:rounded-2xl transition-all w-1/2 cursor-pointer" // Added cursor-pointer
                        // Use onChange for final value OR onInput for live updates while dragging
                        onChange={seekTo} // Matches original behavior
                        onInput={seekTo} // Use this for smoother dragging feedback
                    />
                    <span className="total-duration w-12 text-left">{totalTrackTimeDuration}</span> {/* Fixed width */}
                </div>

                {/* Track Buttons */}
                <div className="my-2 flex justify-center w-full"> {/* Added flex for centering */}
                    <div
                        className="w-[clamp(150px,60vw,300px)] border rounded-2xl py-3 bg-transparent backdrop-blur-sm flex items-center justify-center space-x-5 text-3xl">
                        <button
                            onClick={prevTrack}
                            className="prev-track flex hover:scale-125 active:scale-110 transition-transform duration-200 bg-transparent border-none text-neutral-50 m-0 text-xl lg:text-2xl items-center justify-center justify-items-center content-center lg:mx-4 ease-in-out"
                            aria-label="Previous Track" // Accessibility
                        >
                            <FaStepBackward />
                        </button>

                        {/* Conditional Rendering for Play/Pause */}
                        {isPlaying ? (
                            <button
                                onClick={pauseTrack}
                                className="pause-track flex hover:scale-125 active:scale-110 transition-transform duration-200 bg-transparent border-none text-neutral-50 m-0 text-xl lg:text-2xl items-center justify-center justify-items-center content-center lg:mx-4 ease-in-out" // No 'hidden' needed
                                aria-label="Pause Track" // Accessibility
                            >
                                <FaPause />
                            </button>
                        ) : (
                            <button
                                onClick={playTrack}
                                className="play-track flex hover:scale-125 active:scale-110 transition-transform duration-200 bg-transparent border-none text-neutral-50 m-0 text-xl lg:text-2xl items-center justify-center justify-items-center content-center lg:mx-4 ease-in-out" // No 'hidden' needed
                                aria-label="Play Track" // Accessibility
                            >
                                <FaPlay />
                            </button>
                        )}

                        <button
                            onClick={stopTrack}
                            className="stop-track flex hover:scale-125 active:scale-110 transition-transform duration-200 bg-transparent border-none text-neutral-50 m-0 text-xl lg:text-2xl items-center justify-center justify-items-center content-center lg:mx-4 ease-in-out"
                            aria-label="Stop Track" // Accessibility
                        >
                            <FaStop />
                        </button>
                        <button
                            onClick={nextTrack}
                            className="next-track flex hover:scale-125 active:scale-110 transition-transform duration-200 bg-transparent border-none text-neutral-50 m-0 text-xl lg:text-2xl items-center justify-center justify-items-center content-center lg:mx-4 ease-in-out"
                            aria-label="Next Track" // Accessibility
                        >
                            <FaStepForward />
                        </button>
                    </div>
                </div>

                {/* Volume Slider */}
                <div className="slider-container flex items-center justify-center space-x-2 w-full px-4"> {/* Added flex for layout */}
                    <FaVolumeDown /> {/* Useicons */}
                    <input
                        type="range"
                        min={0} // Start from 0
                        max={1}
                        step={0.01}
                        value={volumeSliderValue}
                        className="track-volume w-1/4 cursor-pointer" // Added cursor-pointer, adjusted width
                        onChange={setVolume} // Use onChange is fine for volume
                        aria-label="Volume" // Accessibility
                    />
                    <FaVolumeUp /> {/* Use icons */}
                    {/* Removed the extra span */}
                </div>
            </div>
        </>
    );
}

export default App