import DiscordApi from '@/discord-api/DiscordAPI';

import ToolbarButton from "../ToolbarButton/ToolbarButton.jsx";

import create_channel_icon from "@/assets/Ornn_Living_Forge_HD.png";

export default function CreateChannelButton() {
    const handleCreateChannel = () => {
        DiscordApi.createTankSquadChannel();
    };

    return (
        <ToolbarButton onClick={handleCreateChannel}>
            <img src={create_channel_icon} className="pointer-events-none" alt="Создать канал" />
        </ToolbarButton>
    );
}