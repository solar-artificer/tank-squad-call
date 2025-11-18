import DiscordApi from '../../../discord-api/DiscordAPI';

import ToolbarButton from "../ToolbarButton/ToolbarButton";

import the_call_emote from "../../../assets/The_Call_Emote.png";

export default function CreateChannelButton() {
    const handleCreateChannel = () => {
        DiscordApi.createTankSquadChannel();
    };

    return (
        <ToolbarButton onClick={handleCreateChannel}>
            <img src={the_call_emote} />
        </ToolbarButton>
    );
}