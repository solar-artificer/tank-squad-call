const {useState, useEffect} = BdApi.React;

import DiscordApi from '@/discord-api/DiscordAPI';

import ToolbarButton from "../ToolbarButton/ToolbarButton.jsx";

import './SendCallButton.css';

import call_icon from '@/assets/Ornn_Call_of_the_Forge_God_HD.png';

export default function SendCallButton({freeSlots}) {
    const [cooldown, setCooldown] = useState(0);
    const [isInVoiceChat, setIsInVoiceChat] = useState(false);

    useEffect(() => {
        const updateStatus = () => {
            // Check if user is in a voice channel
            const currentVoiceChannel = DiscordApi.getCurrentVoiceChannel();
            setIsInVoiceChat(currentVoiceChannel !== null);

            // Get the call channel ID from settings
            const channelId = DiscordApi.settings.callChannelID;

            if (!channelId) {
                setCooldown(0);
                return;
            }

            const remainingTime = DiscordApi.getSlowModeCooldown(channelId);

            if (remainingTime) {
                setCooldown(Math.floor(remainingTime / 1000));
            } else {
                setCooldown(0);
            }
        };

        updateStatus();

        const intervalId = setInterval(updateStatus, 25);

        return () => clearInterval(intervalId);
    }, []);

    const hasCooldown = cooldown !== 0;
    const isDisabled = !isInVoiceChat || hasCooldown;

    const handleSendCall = () => {
        DiscordApi.sendCall(freeSlots);
    };

    return (
        <ToolbarButton onClick={handleSendCall}
                       className={`send-call-button ${hasCooldown ? 'send-call-button-has-cooldown' : ''}`}
                       disabled={isDisabled}>
            <img src={call_icon} className="pointer-events-none send-call-background" alt="Запостить объявление"/>
            {hasCooldown && (
                <span className="send-call-cooldown">{cooldown}</span>
            )}
        </ToolbarButton>
    );
}