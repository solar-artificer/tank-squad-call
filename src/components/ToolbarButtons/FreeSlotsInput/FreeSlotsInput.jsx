import debounce from 'lodash/debounce';
const { useEffect, useRef, useMemo } = BdApi.React;

import DiscordApi from '../../../discord-api/DiscordAPI';

const AUTO_UPDATE_DELAY = 15_000;
const AUTO_UPDATE_RATE = 50;

export default function FreeSlotsInput({ value, onValueChange }) {
    const shouldAutoUpdateFreeSlots = useRef(true);

    const updateFreeSlots = () => {
        if (!shouldAutoUpdateFreeSlots.current) {
            return;
        }
        
        onValueChange(DiscordApi.getCurrentFreeSlots());
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

        onValueChange(newValue);
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
        <div>
            <input
                type="number"
                value={value}
                onChange={handleInputChange}
                min="0"
                style={{ width: '60px'}}
            />
        </div>
    );
}