import { Field, Label, Textarea, Input  } from '@headlessui/react'

const { useState, useEffect } = BdApi.React;

import DiscordAPI from "../../discord-api/DiscordAPI";
import DiscordComboBox from "@/components/DiscordComboBox/DiscordComboBox";

import './SettingsPanel.css';

export default function SettingsPanel({}) {
    const [settings, setSettings] = useState(DiscordAPI.settings);
    const [servers, setServers] = useState([]);
    const [voiceChannels, setVoiceChannels] = useState([]);
    const [textChannels, setTextChannels] = useState([]);

    // Load servers on mount
    useEffect(() => {
        let guilds = [];

        try {
            const sortedGuildIds = DiscordAPI.discordInternals.SortedGuildStore.getFlattenedGuildIds();
            guilds = sortedGuildIds
                .map(guildId => {
                    const guild = DiscordAPI.discordInternals.GuildStore.getGuild(guildId);

                    if (!guild) {
                        return null;
                    }

                    return guild;
                })
                .filter(guild => guild !== null);
        } catch (error) {
            console.error(error)
            guilds = DiscordAPI.discordInternals.GuildStore.getGuilds();
        }

        const serverList = Object.values(guilds).map(guild => ({
            id: guild.id,
            name: guild.name,
            image: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=32` : null
        }));
        
        console.log('GUILDS');
        console.log(serverList);
        setServers(serverList);
    }, []);

    // Load channels when server changes
    useEffect(() => {
        if (!settings.serverID) return;

        try {
            const guildChannels = DiscordAPI.discordInternals.GuildChannelStore.getChannels(settings.serverID);
            
            // Get voice channels
            const voiceChannelList = guildChannels.VOCAL?.map(channelData => ({
                id: channelData.channel.id,
                name: channelData.channel.name
            })) || [];
            
            // Get text channels
            const textChannelList = guildChannels.SELECTABLE?.map(channelData => ({
                id: channelData.channel.id,
                name: channelData.channel.name
            })) || [];

            setVoiceChannels(voiceChannelList);
            setTextChannels(textChannelList);
        } catch (error) {
            console.error('Error loading channels:', error);
            setVoiceChannels([]);
            setTextChannels([]);
        }
    }, [settings.serverID]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        DiscordAPI.settings = settings;
        DiscordAPI.saveSettings();
        BdApi.UI.showToast('Настройки сохранены!', { type: 'success' });

        const closeButton = document.querySelector('.bd-modal-root:has( .tanksquad-call-trigger) .bd-modal-footer .bd-button');
        closeButton.click();
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

            <Field>
                <Label className="discord-label block mb-2">
                    URL картинки с перечнем танков
                </Label>
                <Input
                    type="text"
                    value={settings.tankPoolPictureUrl}
                    onChange={(e) => updateSetting('tankPoolPictureUrl', e.target.value)}
                    placeholder="URL картинки с перечнем танков"
                    className="discord-input discord-text-input w-full transition-colors placeholder:text-[#87898c] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 font-normal"
                />
            </Field>

            {
                /*
            <Field>
                <Label className="discord-label block mb-2">
                    Шаблон сообщения
                </Label>
                <Textarea
                    value={settings.callMessageTemplate}
                    onChange={(e) => updateSetting('callMessageTemplate', e.target.value)}
                    rows={4}
                    placeholder="Enter message template... Use {AMOUNT_OF_FREE_SLOTS} and {CURRENT_VOICE_CHANNEL_LINK} as placeholders."
                    className="w-full discord-input discord-textarea transition-colors placeholder:text-[#87898c] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                />
            </Field>
            */
            }

            <div className="flex justify-end pt-4">
                <button 
                    onClick={handleSave}
                    className="cursor-pointer rounded-[8px] bg-[#5865f2] px-4 py-2 text-sm font-medium text-white hover:bg-[#4752c4] focus:outline-none transition-colors"
                >
                    Сохранить
                </button>
            </div>
        </div>
    );
}