import {Popover, PopoverButton, PopoverPanel} from '@headlessui/react';
import ToolbarButton from "../ToolbarButton/ToolbarButton";
import DiscordAPI from '../../../discord-api/DiscordAPI';
import './CallOptionsButton.css';
import callOptionsButtonStyles from "./CallOptionsButton.css";

const {useState, useEffect, useRef} = BdApi.React;

export default function CallOptionsButton() {
    const [messageTemplate, setMessageTemplate] = useState('');
    const debounceTimerRef = useRef(null);
    const textareaRef = useRef(null);

    // Load the current message template from settings
    useEffect(() => {
        setMessageTemplate(DiscordAPI.settings.callMessageTemplate || '');
    }, []);

    // Auto-save with debounce when messageTemplate changes
    useEffect(() => {
        // Skip on initial mount
        if (messageTemplate === '' || messageTemplate === DiscordAPI.settings.callMessageTemplate) {
            return;
        }

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer
        debounceTimerRef.current = setTimeout(() => {
            DiscordAPI.settings.callMessageTemplate = messageTemplate;
            DiscordAPI.saveSettings();
        }, 1000); // 1 second debounce

        // Cleanup
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [messageTemplate]);

    const handleBlur = () => {
        DiscordAPI.settings.callMessageTemplate = messageTemplate;
        DiscordAPI.saveSettings();
    };

    const handlePanelClick = () => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    return (
        <Popover className="call-options-button-container">
            <PopoverButton as="div">
                <ToolbarButton>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 512 512"
                        fill="white"
                        style={{display: 'block'}}
                    >
                        <path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/>
                    </svg>
                </ToolbarButton>
            </PopoverButton>

            <PopoverPanel anchor="bottom end" className="call-options-dropdown" onClick={handlePanelClick}>
                <style>
                    {callOptionsButtonStyles}
                </style>

                <div className="call-options-hint">
                    Количество свободных мест - FREE_SLOTS<br/>
                    Ссылка на канал - LINK
                </div>

                <textarea
                    ref={textareaRef}
                    className="call-options-textarea"
                    rows="6"
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    onBlur={handleBlur}
                />
            </PopoverPanel>
        </Popover>
    );
}

