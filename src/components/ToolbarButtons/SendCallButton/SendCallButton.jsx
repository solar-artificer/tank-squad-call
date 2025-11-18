import DiscordApi from '../../../discord-api/DiscordAPI';

import the_call_emote from '../../../assets/The_Call_Emote.png';
import ToolbarButton from "../ToolbarButton/ToolbarButton";

export default function SendCallButton({ freeSlots }) {
    const handleSendCall = () => {
        DiscordApi.sendCall(freeSlots);
    };

    return (
        <ToolbarButton onClick={handleSendCall}>
            <img src={the_call_emote} />
        </ToolbarButton>
    );
}

