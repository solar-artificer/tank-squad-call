const {useState, useEffect, useRef} = BdApi.React;

import DiscordAPI from '@/discord-api/DiscordAPI';

import {Popover, PopoverButton, PopoverPanel} from '@headlessui/react';
import ToolbarButton from "../ToolbarButton/ToolbarButton";

import editMessageTemplateStyles from "./EditMessageTemplate.css";
import change_message_template_icon from '@/assets/Lunar_Revel_Scroll_profileicon.jpg';
import gameEndViewBackground from '@/assets/GameEndView_Background.png';


export default function EditMessageTemplate() {
    const [messageTemplate, setMessageTemplate] = useState('');
    const debounceTimerRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        setMessageTemplate(DiscordAPI.settings.callMessageTemplate || '');
    }, []);

    // Auto-save with debounce when messageTemplate changes
    useEffect(() => {
        if (messageTemplate === '' || messageTemplate === DiscordAPI.settings.callMessageTemplate) {
            return;
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            DiscordAPI.settings.callMessageTemplate = messageTemplate;
            DiscordAPI.saveSettings();
        }, 1000);

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
        <Popover className="edit-message-template-button-container">
            <PopoverButton as="div">
                <ToolbarButton>
                    <img src={change_message_template_icon} className="pointer-events-none" alt="Изменить объявление"/>
                </ToolbarButton>
            </PopoverButton>

            <PopoverPanel anchor="bottom end" className="edit-message-template-dropdown" onClick={handlePanelClick}
                          style={{
                              backgroundImage: `url(${gameEndViewBackground})`
                          }}>
                {/* We portal this out of Shadow DOM, so need to do inject styles here */}
                <style>
                    {editMessageTemplateStyles}
                </style>

                <div className="edit-message-template-hint">
                    Количество свободных мест - FREE_SLOTS<br/>
                    Ссылка на канал - LINK
                </div>

                <textarea
                    ref={textareaRef}
                    className="edit-message-template-textarea"
                    rows="6"
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    onBlur={handleBlur}
                />
            </PopoverPanel>
        </Popover>
    );
}

