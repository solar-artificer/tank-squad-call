const { useState, useEffect } = BdApi.React;

import DiscordAPI from "@/discord-api/DiscordAPI";

import {Field, Label} from '@headlessui/react'
import DiscordComboBox from "@/components/DiscordComboBox/DiscordComboBox";
import PicturePicker from "@/components/PicturePicker/PicturePicker";
import DiscordSlider from "@/components/DiscordSlider/DiscordSlider";


export default function SettingsPanel({}) {
    const [settings, setSettings] = useState(DiscordAPI.settings);
    const [servers, setServers] = useState([]);
    const [voiceChannels, setVoiceChannels] = useState([]);
    const [textChannels, setTextChannels] = useState([]);

    // Load servers on mount
    useEffect(() => {
        setServers(DiscordAPI.getSortedServers());
    }, []);

    // Load channels when server changes
    useEffect(() => {
        const { voiceChannels, textChannels } = DiscordAPI.getChannelsForServer(settings.serverID);
        setVoiceChannels(voiceChannels);
        setTextChannels(textChannels);
    }, [settings.serverID]);

    const updateSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        DiscordAPI.settings = newSettings;
        DiscordAPI.saveSettings();
    };

    const handleUpdate = async () => {
        await DiscordAPI.update();

        const closeButton = document.querySelector('.bd-modal-root:has( .bd-addon-settings-wrap) .bd-modal-footer .bd-button');
        closeButton.click();
    };

    return (
        <div>
            <div className="tanksquad-call-trigger"></div>
            <div className="space-y-6 max-w-2xl flex flex-col">
                <h1 className="font-bold text-xl">
                    Настройки для Зова ТАНКОСКВАДА
                </h1>

                <button onClick={handleUpdate} className="discord-button discord-button-brand flex items-center gap-2 max-w-48">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                        <path d="M16 16h5v5"/>
                    </svg>
                    Скачать обновление
                </button>

                <Field>
                    <Label className="discord-label block mb-2">
                        Сервер
                    </Label>
                    <DiscordComboBox
                        items={servers}
                        value={settings.serverID}
                        onChange={(value) => updateSetting('serverID', value)}
                        placeholder="Выбери сервер"
                        emptyMessage="Нету подходящих серверов."
                        showImage={true}
                        showFallbackInitials={true}
                    />
                </Field>

                <Field>
                    <Label className="discord-label block mb-2">
                        Канал для создания войс чата
                    </Label>
                    <DiscordComboBox
                        items={voiceChannels}
                        value={settings.createVoiceChannelChannelID}
                        onChange={(value) => updateSetting('createVoiceChannelChannelID', value)}
                        placeholder="Выбери канал для создания войс чата..."
                        emptyMessage="Нету подходящих серверов."
                    />
                </Field>

                <Field>
                    <Label className="discord-label block mb-2">
                        Канал для поиска игроков
                    </Label>
                    <DiscordComboBox
                        items={textChannels}
                        value={settings.callChannelID}
                        onChange={(value) => updateSetting('callChannelID', value)}
                        placeholder="Выбери канал для поиска игроков"
                        emptyMessage="Нету подходящих серверов."
                    />
                </Field>

                <PicturePicker
                    value={settings.tankPoolPictureUrl}
                    onChange={(value) => updateSetting('tankPoolPictureUrl', value)}
                    label="Картинка с перечнем танков"
                    placeholder="Нажми или перетяни картинку"
                />

                <Field>
                    <Label className="discord-label block mb-2">
                        Громкость бурчания Орна
                    </Label>
                    <DiscordSlider
                        value={settings.ornnRumblingVolume}
                        onChange={(value) => updateSetting('ornnRumblingVolume', value)}
                        min={0}
                        max={1}
                        step={0.0001}
                    />
                </Field>

                <Field>
                    <Label className="discord-label block mb-2">
                        Путь к lockfile
                    </Label>
                    <input
                        type="text"
                        className="discord-input discord-text-input w-full"
                        value={settings.lockfilePath}
                        onChange={(e) => updateSetting('lockfilePath', e.target.value)}
                    />
                </Field>
            </div>
        </div>
    );
}