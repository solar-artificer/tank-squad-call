const {useState, useEffect} = BdApi.React;

import DiscordApi from '@/discord-api/DiscordAPI';

import ToolbarButton from "../ToolbarButton/ToolbarButton.jsx";

import call_icon from '@/assets/Ornn_Call_of_the_Forge_God_HD.png';

export default function SendCallButton({freeSlots}) {
    const [cooldown, setCooldown] = useState(0);
    const [isInVoiceChat, setIsInVoiceChat] = useState(false);

    useEffect(() => {
        const updateVoiceStatus = () => {
            const currentVoiceChannel = DiscordApi.getCurrentVoiceChannel();
            setIsInVoiceChat(currentVoiceChannel !== null);
        };

        updateVoiceStatus();
        const intervalId = setInterval(updateVoiceStatus, 25);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const updateCooldown = () => {
            const remainingTime = DiscordApi.getSlowModeCooldown(DiscordApi.settings.callChannelID);
            setCooldown(remainingTime ? Math.floor(remainingTime / 1000) : 0);
        };

        updateCooldown();
        const intervalId = setInterval(updateCooldown, 25);

        return () => clearInterval(intervalId);
    }, []);

    const isOnCooldown = cooldown !== 0;
    const isDisabled = isOnCooldown || !isInVoiceChat;

    const handleSendCall = () => {
        DiscordApi.sendCallMessage(freeSlots);
    };

    return (
        <ToolbarButton onClick={handleSendCall}
                       className={`send-call-button ${isOnCooldown ? 'send-call-button-has-cooldown' : ''}`}
                       disabled={isDisabled}>
            <img src={call_icon} className="send-call-background pointer-events-none" alt="Запостить объявление"/>
            {isOnCooldown && (
                <span className="send-call-cooldown">{cooldown}</span>
            )}
        </ToolbarButton>
    );
}