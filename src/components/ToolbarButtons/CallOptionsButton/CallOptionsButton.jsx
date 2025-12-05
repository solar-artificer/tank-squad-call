import {Popover, PopoverButton, PopoverPanel} from '@headlessui/react';
import ToolbarButton from "../ToolbarButton/ToolbarButton";
import DiscordAPI from '../../../discord-api/DiscordAPI';

import './CallOptionsButton.css';
import callOptionsButtonStyles from "./CallOptionsButton.css";

import change_message_template_icon from '@/assets/Lunar_Revel_Scroll_profileicon.jpg';
import gameEndViewBackground from '@/assets/GameEndView_Background.png';

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
                    <img src={change_message_template_icon} className="pointer-events-none" alt="Изменить объявление"/>
                </ToolbarButton>
            </PopoverButton>

            <PopoverPanel anchor="bottom end" className="call-options-dropdown" onClick={handlePanelClick}
                          style={{
                              backgroundImage: `url(${gameEndViewBackground})`
                          }}>
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

