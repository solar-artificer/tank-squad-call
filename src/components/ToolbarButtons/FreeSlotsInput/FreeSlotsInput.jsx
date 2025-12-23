const { useEffect, useRef, useMemo } = BdApi.React;
import debounce from 'lodash/debounce';

import DiscordApi from '@/discord-api/DiscordAPI';

import free_slots_icon from '@/assets/Dancing_in_the_Moonlight_Poro_profileicon.png';

const AUTO_UPDATE_DELAY = 15_000;
const AUTO_UPDATE_RATE = 50;

export default function FreeSlotsInput({ value, onValueChange }) {
    const shouldAutoUpdateFreeSlots = useRef(true);

    const updateFreeSlots = () => {
        if (!shouldAutoUpdateFreeSlots.current) {
            return;
        }

        const currentFreeSlots = DiscordApi.getCurrentFreeSlots();
        if (Number.isInteger(currentFreeSlots)) {
            onValueChange(Math.max(1, currentFreeSlots));
        } else {
            onValueChange(currentFreeSlots);
        }
    };

    // Create debounced function to resume auto-updates after AUTO_UPDATE_DELAY ms
    const debouncedResumeAutoUpdateFunction = useMemo(
        () => debounce(() => {
            shouldAutoUpdateFreeSlots.current = true;
        }, AUTO_UPDATE_DELAY),
        []
    );

    const handleIncrement = () => {
        shouldAutoUpdateFreeSlots.current = false;
        debouncedResumeAutoUpdateFunction();
        onValueChange(Math.max(1, value + 1));
    };

    const handleDecrement = () => {
        shouldAutoUpdateFreeSlots.current = false;
        debouncedResumeAutoUpdateFunction();
        onValueChange(Math.max(1, value - 1));
    };

    const handleClick = (event) => {
        event.preventDefault();
        handleIncrement();
    };

    const handleContextMenu = (event) => {
        event.preventDefault();
        handleDecrement();
    };

    useEffect(() => {
        updateFreeSlots();
        const intervalID = setInterval(updateFreeSlots, AUTO_UPDATE_RATE);

        return () => {
            clearInterval(intervalID);
            debouncedResumeAutoUpdateFunction.cancel();
        };
    }, []);

    const hasSpecifiedFreeSlots = value !== null;

    return (
        <div 
            className={`free-slots-input-container ${hasSpecifiedFreeSlots ? 'free-slots-input-container-has-specified-number' : ''}`}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
        >
            <div className="free-slots-foreground">
                <span className="free-slots-value">{value}</span>
            </div>
            <img src={free_slots_icon} className="free-slots-background" alt="Количество свободных мест"/>
        </div>
    );
}