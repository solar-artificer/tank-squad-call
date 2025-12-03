import DiscordApi from '@/discord-api/DiscordAPI';

import call_icon from '@/assets/Ornn_Call_of_the_Forge_God_HD.png';
import ToolbarButton from "../ToolbarButton/ToolbarButton.jsx";

export default function SendCallButton({ freeSlots }) {
    const handleSendCall = () => {
        DiscordApi.sendCall(freeSlots);
    };

    return (
        <ToolbarButton onClick={handleSendCall}>
            <img src={call_icon} className="pointer-events-none" alt="Запостить объявление"/>
        </ToolbarButton>
    );
}

