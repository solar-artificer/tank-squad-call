import DiscordApi from '../../../discord-api/DiscordAPI';

import ToolbarButton from "../ToolbarButton/ToolbarButton";

import living_forge_icon from "../../../assets/Ornn_Living_Forge.webp";

export default function CreateChannelButton() {
    const handleCreateChannel = () => {
        DiscordApi.createTankSquadChannel();
    };

    return (
        <ToolbarButton onClick={handleCreateChannel}>
            <img src={living_forge_icon} />
        </ToolbarButton>
    );
}