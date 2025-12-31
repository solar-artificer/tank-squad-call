import defaultSettings from "./DefaultSettings";

const path = window.require('path');
const request = window.require('request');
const fs = window.require('fs');

class DiscordAPI {
    static PLUGIN_NAME = "TankSquadCall";
    static SETTINGS_KEY = 'settings';

    static SUCCESSFUL_CHANGE_CHANNEL_POLLING_RATE = 50;

    constructor() {
        this.loadSettings();
        this.log('Настройки', this.settings);

        this.discordInternals = this.getDiscordInternals();
    }

    loadSettings() {
        const userPersistedSettings = BdApi.Data.load(DiscordAPI.PLUGIN_NAME, DiscordAPI.SETTINGS_KEY);
        this.settings = Object.assign({}, defaultSettings, userPersistedSettings);
    }

    saveSettings() {
        BdApi.Data.save(DiscordAPI.PLUGIN_NAME, DiscordAPI.SETTINGS_KEY, this.settings);
    }

    getDiscordInternals() {
        const ChannelStore = BdApi.Webpack.getStore('ChannelStore');
        const GuildStore = BdApi.Webpack.getStore('GuildStore');
        const SortedGuildStore = BdApi.Webpack.getStore('SortedGuildStore');
        const GuildChannelStore = BdApi.Webpack.getStore('GuildChannelStore');
        const VoiceStateStore = BdApi.Webpack.getStore('VoiceStateStore');
        const UserStore = BdApi.Webpack.getStore('UserStore');
        const SlowmodeStore = BdApi.Webpack.getStore('SlowmodeStore');

        const VoiceActions = BdApi.Webpack.getModule(
            m => m.selectVoiceChannel,
            {searchExports: true}
        );

        const MessageActions = BdApi.Webpack.getModule(
            m => m.sendMessage && m.receiveMessage,
            {searchExports: true}
        );

        const CloudUploader = BdApi.Webpack.getModule(
            m => m?.prototype?.upload && m?.prototype?.uploadFileToCloud,
            {searchExports: true}
        );

        return {
            ChannelStore,
            GuildStore,
            SortedGuildStore,
            GuildChannelStore,
            VoiceStateStore,
            UserStore,
            SlowmodeStore,

            VoiceActions,
            MessageActions,

            CloudUploader
        }
    }

    async sendCallMessage(freeSlots) {
        try {
            const callMessage = {
                content: this.composeCallMessage(freeSlots),
                tts: false,
                invalidEmojis: [],
                validNonShortcutEmojis: [],
                nonce: this.generateNonce()
            };

            await this.discordInternals.MessageActions.sendMessage(
                this.settings.callChannelID,
                callMessage,
                undefined,
                {}
            );
        } catch (error) {
            this.showToast(`Произошла ошибка при послании сообщения: "${error.message}"`, "error");
            this.logError(`Произошла ошибка при послании сообщения: "${error.message}"`);
        }
    }

    composeCallMessage(amountOfFreeSlots) {
        const currentVoiceChannel = this.getCurrentVoiceChannel();
        if (!currentVoiceChannel) {
            throw new Error("Не найден текущий активній войс чат");
        }

        const currentVoiceChannelLink = `https://discord.com/channels/${currentVoiceChannel.guild_id}/${currentVoiceChannel.id}`;

        return this.settings.callMessageTemplate
            .replaceAll('FREE_SLOTS', amountOfFreeSlots.toString())
            .replaceAll('LINK', currentVoiceChannelLink);
    }

    createTankSquadChannel() {
        try {
            const initialVoiceChannelID = this.getCurrentVoiceChannel()?.id;

            this.joinVoiceChannel(this.settings.createVoiceChannelChannelID);

            let unsuccessfulChecks = 0;
            const intervalID = setInterval(() => {
                const currentVoiceChannelID = this.getCurrentVoiceChannel()?.id;

                if (
                    currentVoiceChannelID === null || currentVoiceChannelID === undefined
                    || currentVoiceChannelID === this.settings.createVoiceChannelChannelID
                    || currentVoiceChannelID === initialVoiceChannelID
                ) {
                    unsuccessfulChecks++;

                    if (unsuccessfulChecks >= 50) {
                        this.showToast(`Произошла ошибка при создании канала`, "error");
                        this.logError(`Произошла ошибка при создании канала`);
                        clearInterval(intervalID);
                    }

                    return;
                }

                clearInterval(intervalID);
                this.postPictureToVoiceChannel(
                    this.settings.serverID,
                    currentVoiceChannelID,
                    this.settings.tankPoolPictureUrl
                );
            }, DiscordAPI.SUCCESSFUL_CHANGE_CHANNEL_POLLING_RATE);
        } catch (error) {
            this.showToast(`Произошла ошибка при создании канала: "${error.message}"`, "error");
            this.logError(`Произошла ошибка при создании канала: "${error.message}"`);
        }
    }

    joinVoiceChannel(channelId) {
        // Verify the channel exists
        const channel = this.discordInternals.ChannelStore.getChannel(channelId);
        if (!channel) {
            throw new Error(`Не нашёл канала с ID ${channelId}!`);
        }

        // Check if it's a voice channel (type 2 = voice, type 13 = stage)
        if (
            channel.type !== 2
            && channel.type !== 13
        ) {
            throw new Error(`Канал "${channel.name}" не голосовой!`);
        }

        this.log(`Пытаюсь подключиться к войс чату c ID ${channelId}...`);
        this.discordInternals.VoiceActions.selectVoiceChannel(channelId);
        this.log(`Успешно получилось подключиться к войс чату ${channel.name}!`);
    }

    // Post picture to a specific voice channel (finds associated text channel)
    // Supports both URL and Base64 encoded images
    async postPictureToVoiceChannel(serverId, voiceChannelId, pictureUrl) {
        this.log(`Пытаюсь запостить картинку в войс чате c ID ${voiceChannelId}`);

        const voiceChannel = this.discordInternals.ChannelStore.getChannel(voiceChannelId);
        if (!voiceChannel) {
            throw new Error(`Не нашёл войс чата c ID ${voiceChannelId}!`);
        }

        const targetTextChannel = this.getTextChannelForVoiceChannel(voiceChannel);
        if (!targetTextChannel) {
            throw new Error(`Не нашёл подходящего текстового канала!`);
        }

        const file = await this.getFileFromPictureUrl(pictureUrl);
        const cloudUploader = new this.discordInternals.CloudUploader(
            {
                file: file,
                platform: 1
            },
            targetTextChannel.id,
            false,
            0
        );
        await cloudUploader.upload();

        this.discordInternals.MessageActions.sendMessage(
            targetTextChannel.id,
            {
                content: '',
                tts: false,
                invalidEmojis: [],
                validNonShortcutEmojis: [],
                nonce: this.generateNonce()
            },
            undefined,
            {
                attachmentsToUpload: [cloudUploader]
            }
        );

        this.showToast(`Запостил картинку`, "success");
        this.log(`Запостил картинку в канал с ID ${targetTextChannel.id}`);
    }

    async getFileFromPictureUrl(pictureUrl) {
        if (pictureUrl.startsWith('data:image/')) {
            // Handle Base64 - convert to file
            return this.base64ToFile(pictureUrl);
        } else {
            // Handle URL - fetch and convert to file
            const response = await fetch(pictureUrl);
            const blob = await response.blob();
            const mimeType = blob.type || 'image/png';
            const extension = mimeType.split('/')[1] || 'png';

            return new File(
                [blob],
                `image.${extension}`,
                {
                    type: mimeType
                }
            );
        }
    }

    // Helper method to convert base64 to File object
    base64ToFile(base64Data) {
        // Extract mime type and base64 content
        const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
            throw new Error('Невалидная картинка в формате Base64');
        }

        const mimeType = matches[1];
        const base64Content = matches[2];

        // Determine file extension from mime type
        const extension = mimeType.split('/')[1] || 'png';
        const filename = `image.${extension}`;

        // Convert base64 to Blob
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: mimeType});

        // Create and return File object from Blob
        return new File(
            [blob],
            filename,
            {
                type: mimeType
            }
        );
    }

    getTextChannelForVoiceChannel(voiceChannel) {
        const allGuildChannels = this.discordInternals.GuildChannelStore.getChannels(voiceChannel.guild_id);
        const guildTextChannelsForVoiceChannels = allGuildChannels['VOCAL'];

        return guildTextChannelsForVoiceChannels.find(
            channelCandidate => channelCandidate.channel.id === voiceChannel.id
        )?.channel;
    }

    getCurrentVoiceChannel() {
        const currentUser = this.discordInternals.UserStore.getCurrentUser();
        if (!currentUser) {
            throw new Error('Не получилось получить текущего пользователя!');
        }

        const currentVoiceState = this.discordInternals.VoiceStateStore.getVoiceStateForUser(currentUser.id)
        if (!currentVoiceState) {
            return null;
        }

        return this.discordInternals.ChannelStore.getChannel(currentVoiceState.channelId);
    }

    getVoiceChannelUserCount(guildId, channelId) {
        const voiceStates = this.discordInternals.VoiceStateStore.getVoiceStatesForChannel(channelId);
        if (!voiceStates) {
            throw new Error(`Не получилось получить количество пользователей в войс чате!`);
        }

        return Object.keys(voiceStates).length;
    }

    getCurrentFreeSlots() {
        const currentVoiceChannel = this.getCurrentVoiceChannel();
        if (!currentVoiceChannel) {
            return null;
        }

        const currentUserCount = this.getVoiceChannelUserCount(currentVoiceChannel.guild_id, currentVoiceChannel.id);
        // This is only the default
        const freeSlots = 5 - currentUserCount;

        // Ensure we don't return negative values
        return Math.max(0, freeSlots);
    }

    getSortedServers() {
        const sortedGuildIds = this.discordInternals.SortedGuildStore.getFlattenedGuildIds();

        return sortedGuildIds
            .map(guildId => {
                const guild = this.discordInternals.GuildStore.getGuild(guildId);
                if (!guild) return null;

                return {
                    id: guild.id,
                    name: guild.name,
                    image: guild.icon
                        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=32`
                        : null
                };
            })
            .filter(guild => guild !== null);
    }

    getChannelsForServer(serverID) {
        if (!serverID) {
            return {
                voiceChannels: [],
                textChannels: []
            };
        }

        try {
            const guildChannels = this.discordInternals.GuildChannelStore.getChannels(serverID);

            const voiceChannels = guildChannels.VOCAL?.map(channelData => ({
                id: channelData.channel.id,
                name: channelData.channel.name
            })) || [];

            const textChannels = guildChannels.SELECTABLE?.map(channelData => ({
                id: channelData.channel.id,
                name: channelData.channel.name
            })) || [];

            return { voiceChannels, textChannels };
        } catch (error) {
            this.logError('Ошибка при загрузке чатов:', error);
            return { voiceChannels: [], textChannels: [] };
        }
    }

    getSlowModeCooldown(channelID) {
        return this.discordInternals.SlowmodeStore.getSlowmodeCooldownGuess(channelID);
    }

    async update() {
        try {
            const targetFileName = path.join(BdApi.Plugins.folder, "TankSquadCall.plugin.js");

            const updatedSourceCode = await new Promise(async (resolve, reject) => {
                await request(
                    {
                        url: `https://raw.githubusercontent.com/solar-artificer/tank-squad-call/refs/heads/main/dist/TankSquadCall.plugin.js?t=${Date.now()}`,
                        headers: {
                            'Cache-Control': 'no-cache, no-store',
                            'Pragma': 'no-cache'
                        }
                    },
                    (err, resp, result) => {
                        if (err) {
                            return reject(err);
                        }

                        // If a direct url was used
                        if (resp.statusCode === 200) {
                            return resolve(result)
                        }

                        // If an addon id and redirect was used
                        if (resp.statusCode === 302) {
                            request(resp.headers.location, (error, response, body) => {
                                if (error) {
                                    return reject(error);
                                }

                                if (response.statusCode !== 200) {
                                    return reject(response);
                                }

                                return resolve(body);
                            });
                        }
                    });
            });

            console.log(updatedSourceCode);
            try {
                console.log(updatedSourceCode.substring(0, 300));
            } catch (er) {

            }

            await fs.writeFile(targetFileName, updatedSourceCode);
            BdApi.Plugins.reload('Зов ТАНКОСКВАДА');
        } catch (error) {
            this.showToast(`Произошла ошибка при обновлении: "${error.message}"`, "error");
            this.logError(`Произошла ошибка при обновлении: "${error.message}"`);
        }
    }

    showToast(message, type) {
        BdApi.UI.showToast(message, {type: type});
    }

    log(...args) {
        console.log(`[${DiscordAPI.PLUGIN_NAME}]`, ...args);
    }

    logError(...args) {
        console.error(`[${DiscordAPI.PLUGIN_NAME}]`, ...args);
    }

    generateNonce() {
        return Date.now().toString() + Math.random().toString(36);
    }
}

// Create and export singleton instance
const discordApi = new DiscordAPI();
export default discordApi;