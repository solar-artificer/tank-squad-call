import DiscordApi from '@/discord-api/DiscordAPI';
import AudioPlayer from "@/audio/audio-player.ts";

import ToolbarButton from "../ToolbarButton/ToolbarButton.jsx";

import create_channel_icon from "@/assets/Ornn_Living_Forge_HD.png";

import ornn_timer from '@/assets/ornn_timer_1.mp3';

export default function CreateChannelButton() {
    const handleCreateChannel = async () => {
        const player = new AudioPlayer(ornn_timer);
        await player.play();
        return;
        DiscordApi.createTankSquadChannel();
    };

    return (
        <ToolbarButton onClick={handleCreateChannel}>
            <img src={create_channel_icon} className="pointer-events-none" alt="Создать канал" />
        </ToolbarButton>
    );
}