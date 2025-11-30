import debounce from 'lodash/debounce';
const { useEffect, useRef, useMemo } = BdApi.React;

import DiscordApi from '../../../discord-api/DiscordAPI';
import './FreeSlotsInput.css';

const AUTO_UPDATE_DELAY = 15_000;
const AUTO_UPDATE_RATE = 50;

export default function FreeSlotsInput({ value, onValueChange }) {
    const shouldAutoUpdateFreeSlots = useRef(true);

    const updateFreeSlots = () => {
        if (!shouldAutoUpdateFreeSlots.current) {
            return;
        }
        
        onValueChange(Math.max(1, DiscordApi.getCurrentFreeSlots()));
    };

    // Create debounced function to resume auto-updates after AUTO_UPDATE_DELAY ms
    const debouncedResumeAutoUpdateFunction = useMemo(
        () => debounce(() => {
            shouldAutoUpdateFreeSlots.current = true;
        }, AUTO_UPDATE_DELAY),
        []
    );

    const handleInputChange = (event) => {
        const newValue = parseInt(event.target.value, 10);
        if (isNaN(newValue)) {
            return;
        }

        shouldAutoUpdateFreeSlots.current = false;
        debouncedResumeAutoUpdateFunction();

        onValueChange(Math.max(1, newValue));
    };

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

    useEffect(() => {
        updateFreeSlots();
        const intervalID = setInterval(updateFreeSlots, AUTO_UPDATE_RATE);

        return () => {
            clearInterval(intervalID);
            debouncedResumeAutoUpdateFunction.cancel();
        };
    }, []);

    return (
        <div className="free-slots-input-container">
            <input
                className="discord-input discord-text-input free-slots-input use-custom-spinners"
                type="number"
                value={value}
                onChange={handleInputChange}
                min="1"
            />
            <div className="free-slots-spinner-buttons">
                <button 
                    className="free-slots-spinner-button" 
                    onClick={handleIncrement}
                    type="button"
                    aria-label="Increment"
                >
                    ▲
                </button>
                <button 
                    className="free-slots-spinner-button" 
                    onClick={handleDecrement}
                    type="button"
                    aria-label="Decrement"
                >
                    ▼
                </button>
            </div>
        </div>
    );
}