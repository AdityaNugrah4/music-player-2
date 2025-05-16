import { useRef, useState, useEffect, useCallback } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { FaMicrophoneAlt, FaMusic, FaPause, FaPlay, FaPlayCircle, FaRecordVinyl, FaStepBackward, FaStepForward, FaStop, FaTape, FaVolumeDown, FaVolumeUp } from 'react-icons/fa';
import { CiCircleChevDown, CiCircleChevUp } from 'react-icons/ci'
import { GiPocketRadio, GiRadioTower } from "react-icons/gi";
import { BsFillMusicPlayerFill, BsHeadphones } from "react-icons/bs";
import { LuVideotape } from "react-icons/lu";
import './App.css'
import Background1 from './Components/AnimationBackground1';
import Background2 from './Components/AnimationBackground2';

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
  const [collapsible, setCollapsible] = useState(true)

  const collapsRef = useRef(null);
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

  {/* For handling tracklist */ }
  const handleSelectTrack = (selectedIndex) => {
    console.log(`Track selected from list: ${trackList[selectedIndex].name}`);
    if (selectedIndex === trackIndex) {
      if (!isPlaying) {
        playTrack();
      }
      return;
    }
    setTrackIndex(selectedIndex);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  }

  {/* For spinning Image */ }
  const spinDisc = isPlaying ? 'animate-disc-spin outline-solid outline-8 outline-[#f1da00]' : 'outline-solid outline-1 outline-white';
  {/* For Tracklist */ }
  const collapsibleDiv = collapsible ? 'relative block box-content flex overflow-y-auto h-10 lg:h-20 opacity-100 mb-2 rounded-b-xl' : 'overflow-hidden opacity-0 h-0 pointer-events-none';

  return (
    <>
      <div className="flex overflow-hidden flex-col min-h-screen w-full justify-center items-center text-center m-0 p-0 overflow-x-hidden text-white bg-[#2e2e32]">

        {/* Audio Element - hidden but essential */}
        <audio
          ref={audioRef}
          onTimeUpdate={seekUpdate} // Update slider and time display
          onLoadedMetadata={handleLoadedMetadata} // Get duration when ready
          onEnded={handleEnded} // Go to next track when finished
        // src is set in loadTrack/useEffect
        ></audio>

        <div className='fixed h-full w-[400%]  animate-move-right'>
          <div className='w-[400%] h-full bg-[#2e2e32] opacity-100 bg-[linear-gradient(#232323_1.3px,transparent_1.3px),linear-gradient(to_right,#232323_1.3px,#2e2e32_1.3px)] bg-[length:26px_26px]'></div>
        </div>

        <Background1 />
        <Background2 />

        <div className='bg-[linear-gradient(225deg,#2e2e32_0%,rgba(46,46,50,0)_50%)] from-transparent to-[#2e2e32] absolute h-full w-full'></div>
        <div className='z-100 lg:top-0 lg:mb-4'>
          {/* Title */}
          <div className="text-[clamp(1.25rem,0.5vw+1rem,1.875rem)] w-full backdrop-blur-md rounded-4xl px-4 hover:scale-125 transition-transform duration-200 ease-in-out">
            <h1
              className="mb-0 mt-0 md:mb-2 lg:mt-2 text-2xl lg:text-4xl font-bold underline hover:cursor-pointer hover:text-red-400 ">
              Music Player (React)
            </h1>
          </div>
        </div>
        <div className="mt-2 z-10 md:grid md:grid-cols-2 md:w-[96%]">
          <div>
            {/* Image Area */}
            <div className="details w-full flex flex-col justify-center items-center content-center justify-items-center">
              <div className="now-playing px-3 rounded-2xl backdrop-blur-sm">
                Playing {trackIndex + 1} of {trackList.length}
              </div>
              <div
                className={`track-art group flex cursor-pointer w-[35vw] h-[35vw] md:w-[32vw] md:h-[32vw] rounded-full bg-center bg-cover transition-all duration-500 my-5  shadow-2xl items-center justify-center ${spinDisc} ${isTrackArtVisible ? 'opacity-100' : 'opacity-0'}`} // Dynamic opacity
                style={{ backgroundImage: `url('${currentTrackData.image}')` }} // Set background image via style
                key={currentTrackData.path || trackIndex}
              >
                {isPlaying
                  ? <span onClick={pauseTrack} className='text-9xl opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90 active:text-[#f1da00] group-active:opacity-100 transition-all '>
                    <FaPause />
                  </span>
                  : <span onClick={playTrack} className='text-9xl opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90 active:text-[#f1da00] group-active:opacity-100 transition-all '>
                    <FaPlay />
                  </span>}

              </div>
            </div>
          </div>
          <div className='bg-transparent pt-1 backdrop-blur-md outline-solid outline-[#2e2e32] border-solid border-gray-500 outline-8 rounded-xl items-center justify-items-center'>

            {/* Details Area */}
            <div className="box-content flex border border-gray-400 bg-[#232323] outline-solid outline-black outline-4 justify-center track-name text-[clamp(1rem,5vw,2.5rem)] font-bold backdrop-blur-sm py-1 lg:mt-6 px-1 md:px-4 md:mx-4 rounded-2xl">
              {currentTrackData.name}
            </div>
            <div className="track-artist mt-1 bg-[#232323] outline-solid outline-black outline-4 px-4 rounded-b-2xl">
              By {currentTrackData.artist}
            </div>

            {/* Track Duration Slider */}
            <div className="slider-container my-2 bg-[#232323] rounded-2xl flex items-center justify-center space-x-2 w-10/12 px-2"> {/* Added flex for layout */}
              <span className="current-time w-12 text-right">{currentTrackTime}</span>
              <input
                type="range"
                min="0" // Start from 0
                max="100"
                value={seekSliderValue}
                className="seek-slider flex appearance-none accent-black rounded-full hover:outline-4 hover:outline-gray-300 hover:rounded-2xl transition-all w-1/2 cursor-pointer" // Added cursor-pointer
                // Use onChange for final value OR onInput for live updates while dragging
                onChange={seekTo} // Matches original behavior
                onInput={seekTo} // Use this for smoother dragging feedback
              />
              <span className="total-duration w-12 text-left">{totalTrackTimeDuration}</span> {/* Fixed width */}
            </div>

            {/* Track Buttons */}
            <div className="my-2 flex justify-center w-full"> {/* Added flex for centering */}
              <div
                className="w-[clamp(150px,60vw,300px)] border border-gray-400 rounded-2xl py-3 bg-[#232323] outline-black outline-solid outline-4 flex items-center justify-center space-x-5 text-3xl">
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
              <FaVolumeDown />
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
              <FaVolumeUp />

            </div>

            {/* List track */}
            <h3 onClick={() => setCollapsible(!collapsible)} className='flex bg-[#232323] rounded-b-2xl mb-0 mt-2 lg:mt-7 md:py-2 px-3 md:mb-2 outline-solid outline-black outline-4 border border-gray-400 hover:bg-[#f1da00] active:bg-[#f1da00] transition-all cursor-pointer'>
              <span className='flex align-middle items-center mr-2'>
                {collapsible ? <CiCircleChevDown /> : <CiCircleChevUp />}
              </span>
              Playlist
            </h3>
            <div ref={collapsRef} className={`${collapsibleDiv} py-1 mt-1 flex-col duration-500 transition-all border-t-0 mb-0 bg-[#232323] w-[90%]`}>
              {trackList.map((track, index) => (
                <div key={index} onClick={() => handleSelectTrack(index)} className='group text-start items-start content-center lg:py-2 hover:shadow cursor-pointer px-1 rounded-t-xl active:bg-white transition-all'>
                  <span className='mr-1 align-middle group-hover:text-[#f1da00] transition-colors'><FaPlayCircle /></span>
                  <span className='peer'>{track.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App
