import { useState, useRef, useCallback } from "react";
import ArcadeAudio from '../assets/Audio/Arcade-by-Red-Skies.mp3';
import ArcadeCover from '../assets/Image/0ddf19a5fbfd5d8c0781fec682804ef6_3712603487144567485.jpg';
import InsideYouAudio from '../assets/Audio/Inside-You-by-lemonmusicstidio.mp3';
import InsideYouCover from '../assets/Image/En-Nah_Stroll_Sticker_Pack_1_Relaxed.png';
import LoFiAudio from '../assets/Audio/LoFi-by-BoDleasons.mp3';
import LoFiCover from '../assets/Image/Sticker_Set_1_Anby_doubt.png';
import JazzAudio from '../assets/Audio/The-Best-Jazz-Club-in-New-Orleans-Paolo-Argento.mp3';
import JazzCover from '../assets/Image/Frank_Sinatra.jpg';
import TokyoAudio from '../assets/Audio/Tokyo-Cafe-TVARI.mp3';
import TokyoCover from '../assets/Image/District_Lumina_Square_Icon.png';

export const trackList = [
    {
        name: 'Arcade',
        artist: 'Red Skies',
        image: ArcadeCover, // Path relative to public folder
        path: ArcadeAudio // Path relative to public folder
    },
    {
        name: 'Inside You',
        artist: 'lemonmusicstudio',
        image: InsideYouCover,
        path: InsideYouAudio
    },
    {
        name: 'LoFi by BoDleasons',
        artist: 'BoDleasons',
        image: LoFiCover,
        path: LoFiAudio
    },
    {
        name: 'The Best Jazz Club in New Orleans',
        artist: 'BoDleasons',
        image: JazzCover,
        path: JazzAudio
    },
    {
        name: 'Tokyo Cafe',
        artist: 'Tokyo Cafe TVARI',
        image: TokyoCover,
        path: TokyoAudio
    }
];
