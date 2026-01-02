import _ from "lodash";

const {useState, useEffect, useRef} = BdApi.React;

import DiscordApi from '@/discord-api/DiscordAPI';
import LeagueClientAPI from "@/lcu/LeagueClientAPI";

import AudioPlayer from '@/audio/audio-player';

import ToolbarButton from "../ToolbarButton/ToolbarButton.jsx";

import call_icon from '@/assets/Ornn_Call_of_the_Forge_God_HD.png';
import ornn_timer_1 from '@/assets/ornn_timer_1.mp3';
import ornn_timer_2 from '@/assets/ornn_timer_2.mp3';

const ORNN_GRUMBLING_DELAY = 1.5 * 60_000;

export default function SendCallButton({freeSlots}) {
    const [cooldown, setCooldown] = useState(0);
    const [isInVoiceChat, setIsInVoiceChat] = useState(false);

    const reminderTimeoutRef = useRef(null);
    const shouldPlayOrnnRumblingRef = useRef(false);
    const audioPlayerRef = useRef(new AudioPlayer());

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
            const newCooldown = remainingTime
                ? Math.floor(remainingTime / 1000)
                : 0;
            setCooldown(newCooldown);
        };

        updateCooldown();
        const intervalId = setInterval(updateCooldown, 25);

        return () => {
            clearInterval(intervalId);
            if (reminderTimeoutRef.current) {
                clearTimeout(reminderTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (
            cooldown === 0
            && reminderTimeoutRef.current === null
            && shouldPlayOrnnRumblingRef.current
        ) {
            reminderTimeoutRef.current = setTimeout(async () => {
                shouldPlayOrnnRumblingRef.current = false;
                reminderTimeoutRef.current = null;

                const gameFlowPhase = await LeagueClientAPI.getGameFlowPhase();
                const allowedGameFlowPhases = [
                    null,
                    'None',
                    'Lobby',
                    'WaitingForStats',
                    'EndOfGame'
                ];
                if (!allowedGameFlowPhases.includes(gameFlowPhase)) {
                    return;
                }

                const randomTrackChoice = _.random(0, 1);
                const grumblingTrack = randomTrackChoice === 0
                    ? ornn_timer_1
                    : ornn_timer_2;

                await audioPlayerRef.current.play(grumblingTrack);
            }, ORNN_GRUMBLING_DELAY);
        }
    }, [cooldown]);

    const handleSendCall = async () => {
        // Cancel the reminder if user sends a new call
        if (reminderTimeoutRef.current) {
            clearTimeout(reminderTimeoutRef.current);
            reminderTimeoutRef.current = null;
        }
        shouldPlayOrnnRumblingRef.current = false;

        await DiscordApi.sendCallMessage(freeSlots);

        shouldPlayOrnnRumblingRef.current = true;
    };

    const isOnCooldown = cooldown !== 0;
    const isDisabled = isOnCooldown || !isInVoiceChat;

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