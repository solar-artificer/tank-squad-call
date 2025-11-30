const { useState, useEffect } = BdApi.React;

import DiscordApi from '../../../discord-api/DiscordAPI';

export default function SlowmodeCooldown() {
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        const updateCooldown = () => {
            // Get the call channel ID from settings
            const channelId = DiscordApi.settings.callChannelID;
            
            if (!channelId) {
                setCooldown(0);
                return;
            }

            const remainingTime = DiscordApi.getSlowModeCooldown(channelId);
            
            if (remainingTime) {
                setCooldown(remainingTime / 1000);
            } else {
                setCooldown(0);
            }
        };

        updateCooldown();

        const intervalId = setInterval(updateCooldown, 1000);

        return () => clearInterval(intervalId);
    }, []);

    // Don't render if no cooldown
    if (cooldown <= 0) {
        return null;
    }

    // Format cooldown as minutes:seconds
    const minutes = Math.floor(cooldown / 60);
    const seconds = Math.floor(cooldown % 60);
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
        <div className="slowmode-cooldown">{formattedTime}</div>
    );
}

