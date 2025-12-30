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
    };

    return (
        <div className="space-y-6 max-w-2xl flex flex-col">
            <h1 className="font-bold text-xl">
                Найстроки для Зова ТАНКОСКВАДА
            </h1>

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
                    Громкость бурчания Орнна
                </Label>
                <DiscordSlider
                    value={settings.ornnRumblingVolume}
                    onChange={(value) => updateSetting('ornnRumblingVolume', value)}
                    min={0}
                    max={1}
                    step={0.0001}
                />
            </Field>

            <div>
                <button onClick={handleUpdate} className="discord-button discord-button-brand">
                    Обновить
                </button>
            </div>
        </div>
    );
}