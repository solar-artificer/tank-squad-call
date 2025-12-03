import defaultSettings from "./DefaultSettings";

class DiscordAPI {
    constructor() {
        this.loadSettings();
        console.log('SETTINGS');
        console.log(this.settings);

        this.discordInternals = this.getDiscordInternals();

        window.discordInternals = this.discordInternals;
        console.log('DISCORD INTERNALS');
        console.log(this.discordInternals);
    }

    loadSettings() {
        // TODO Constants/typescript
        const userPersistedSettings = BdApi.Data.load("TankSquadCall", "settings");
        this.settings = Object.assign({}, defaultSettings, userPersistedSettings);
    }

    saveSettings() {
        // TODO Constants/typescript
        BdApi.Data.save("TankSquadCall", "settings", this.settings);
    }

    getDiscordInternals() {
        const ChannelStore = BdApi.Webpack.getStore('ChannelStore');
        const GuildStore = BdApi.Webpack.getStore('GuildStore');
        const SortedGuildStore = BdApi.Webpack.getStore('SortedGuildStore');
        const GuildChannelStore = BdApi.Webpack.getStore('GuildChannelStore');
        const VoiceStateStore = BdApi.Webpack.getStore('VoiceStateStore');
        const UserStore = BdApi.Webpack.getStore('UserStore');
        const SlowmodeStore = BdApi.Webpack.getStore('SlowmodeStore');

        // Find the VoiceStateActions module - try multiple methods
        let VoiceActions = BdApi.Webpack.getModule(
            m => m.selectVoiceChannel,
            {searchExports: true}
        );

        if (!VoiceActions) {
            VoiceActions = BdApi.Webpack.getModule(
                m => m.default?.selectVoiceChannel,
                {searchExports: true}
            );
            if (VoiceActions) {
                VoiceActions = VoiceActions.default;
            }
        }

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

    sendCall(freeSlots) {
        const callMessage = {
            content: this.constructCallMessage(freeSlots),
            tts: false,
            invalidEmojis: [],
            validNonShortcutEmojis: [],
            // Add unique nonce
            nonce: Date.now().toString() + Math.random().toString(36)
        };

        this.discordInternals.MessageActions.sendMessage(this.settings.callChannelID, callMessage, undefined, {});
    }

    constructCallMessage(amountOfFreeSlots) {
        const voiceChannelInfo = this.getCurrentVoiceChannel();
        if (!voiceChannelInfo) {
            // TODO Error handling
            return;
        }

        let currentVoiceChannelLink = `https://discord.com/channels/${voiceChannelInfo.guild_id}/${voiceChannelInfo.id}`;

        const message = this.settings.callMessageTemplate
            .replaceAll('FREE_SLOTS', amountOfFreeSlots.toString())
            .replaceAll('LINK', currentVoiceChannelLink);

        return message;
    }

    createTankSquadChannel() {
        const didSuccessfullyJoin = this.joinVoiceChannel(this.settings.serverID, this.settings.createVoiceChannelChannelID);
        if (!didSuccessfullyJoin) {
            return;
        }

        const interval = setInterval(() => {
            let currentVoiceChannelID = this.getCurrentVoiceChannel()?.id;

            if (
                currentVoiceChannelID === null
                || currentVoiceChannelID === undefined

                || currentVoiceChannelID === this.settings.createVoiceChannelChannelID
            ) {
                return;
            }

            clearInterval(interval);
            this.postPictureToVoiceChannel(
                this.settings.serverID,
                currentVoiceChannelID,
                this.settings.tankPoolPictureUrl
            );
        }, 15);
    }

    joinVoiceChannel(serverId, channelId) {
        console.log(`Attempting to join voice channel ${channelId} in server ${serverId}`);

        try {
            if (!this.discordInternals.VoiceActions) {
                throw new Error("Could not find voice actions module!");
            }

            // Verify the server exists
            const guild = this.discordInternals.GuildStore.getGuild(serverId);
            if (!guild) {
                throw new Error(`Server with ID ${serverId} not found!`);
            }

            // Verify the channel exists
            const channel = this.discordInternals.ChannelStore.getChannel(channelId);
            if (!channel) {
                throw new Error(`Channel with ID ${channelId} not found!`);
            }

            // Check if it's a voice channel (type 2 = voice, type 13 = stage)
            if (channel.type !== 2 && channel.type !== 13) {
                throw new Error(`Channel "${channel.name}" is not a voice channel!`);
            }

            console.log(`Joining voice channel: ${channel.name} in ${guild.name}`);
            this.discordInternals.VoiceActions.selectVoiceChannel(channelId);
            console.log(`TankSquadCall: Successfully joined ${channel.name}`);

            return true;

        } catch (error) {
            this.showToast(`Произошла ошибка при подключении к войс чату: ${error.message}`, "error");
            console.error("TankSquadCall Error:", error);
            return false;
        }
    }

    // Post picture to a specific voice channel (finds associated text channel)
    // Supports both URL and Base64 encoded images
    async postPictureToVoiceChannel(serverId, voiceChannelId, pictureData) {
        try {
            console.log(`Posting picture to voice channel ${voiceChannelId}`);

            const voiceChannel = this.discordInternals.ChannelStore.getChannel(voiceChannelId);
            if (!voiceChannel) {
                throw new Error(`Could not find voice channel info!`);
            }

            const targetTextChannel = this.getTextChannelForVoiceChannel(voiceChannel);
            if (!targetTextChannel) {
                throw new Error(`Could not find a text channel to post in!`);
            }

            if (!this.discordInternals.MessageActions) {
                throw new Error(`Could not find message actions module!`);
            }

            let file;

            // Check if pictureData is base64 or URL
            if (pictureData.startsWith('data:image/')) {
                // Handle Base64 - convert to file
                file = this.base64ToFile(pictureData);
            } else {
                // Handle URL - fetch and convert to file
                const response = await fetch(pictureData);
                const blob = await response.blob();
                const mimeType = blob.type || 'image/png';
                const extension = mimeType.split('/')[1] || 'png';
                file = new File([blob], `image.${extension}`, {type: mimeType});
            }

            const pictureUploader = new this.discordInternals.CloudUploader(
                {
                    file: file,
                    platform: 1
                },
                targetTextChannel.id,
                false,
                0
            );

            await pictureUploader.upload();

            this.discordInternals.MessageActions.sendMessage(
                targetTextChannel.id,
                {
                    content: '',
                    tts: false,
                    invalidEmojis: [],
                    validNonShortcutEmojis: [],
                    nonce: Date.now().toString() + Math.random().toString(36)
                },
                undefined,
                {
                    attachmentsToUpload: [pictureUploader]
                }
            );

            this.showToast(`Запостил картинку`, "success");
            console.log(`TankSquadCall: Picture posted to channel ${targetTextChannel.id}`);
            return true;
        } catch (error) {
            this.showToast(`Произошла ошибка при постинге картинки: ${error.message}`, "error");
            console.error("TankSquadCall Error:", error);
            return false;
        }
    }

    // Helper method to convert base64 to File object
    base64ToFile(base64Data) {
        // Extract mime type and base64 content
        const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
            throw new Error('Invalid base64 image format');
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
        return new File([blob], filename, {type: mimeType});
    }

    getTextChannelForVoiceChannel(voiceChannel) {
        try {
            if (!this.discordInternals.GuildChannelStore) {
                throw new Error(`GuildChannelStore not available!`);
            }

            const allGuildChannels = this.discordInternals.GuildChannelStore.getChannels(voiceChannel.guild_id);
            const guildTextChannelsForVoiceChannels = allGuildChannels['VOCAL'];

            return guildTextChannelsForVoiceChannels.find(
                channelCandidate => channelCandidate.channel.id === voiceChannel.id
            )?.channel;
        } catch (error) {
            console.error("TankSquadCall: Error getting text channel for voice channel", error);
            return null;
        }
    }

    getCurrentVoiceChannel() {
        try {
            if (!this.discordInternals.UserStore) {
                throw new Error(`UserStore not available!`);
            }
            const currentUser = this.discordInternals.UserStore.getCurrentUser();

            if (!currentUser) {
                throw new Error(`Could not get current user!`);
            }

            if (!this.discordInternals.VoiceStateStore) {
                throw new Error(`VoiceStateStore not available!`);
            }

            const currentVoiceState = this.discordInternals.VoiceStateStore.getVoiceStateForUser(currentUser.id)
            if (!currentVoiceState) {
                return null;
            }

            const currentVoiceChannel = this.discordInternals.ChannelStore.getChannel(currentVoiceState.channelId);
            return currentVoiceChannel;
        } catch (error) {
            console.error("TankSquadCall: Error getting current voice channel", error);
            return null;
        }
    }

    getVoiceChannelUserCount(guildId, channelId) {
        try {
            if (!this.discordInternals.VoiceStateStore) {
                throw new Error(`VoiceStateStore not available!`);
            }

            const voiceStates = this.discordInternals.VoiceStateStore.getVoiceStatesForChannel(channelId);
            if (!voiceStates) {
                throw new Error(`Couldn't get voice states for channel ${channelId}!`);
            }

            const userCount = Object.keys(voiceStates).length;
            return userCount;
        } catch (error) {
            console.error("TankSquadCall: Error getting voice channel user count", error);
            return 0;
        }
    }

    getCurrentFreeSlots() {
        try {
            const voiceChannelInfo = this.getCurrentVoiceChannel();
            if (!voiceChannelInfo) {
                return 0;
            }

            const currentUserCount = this.getVoiceChannelUserCount(voiceChannelInfo.guild_id, voiceChannelInfo.id);
            const freeSlots = 5 - currentUserCount;
            return Math.max(0, freeSlots); // Ensure we don't return negative values
        } catch (error) {
            console.error("TankSquadCall: Error getting current free slots", error);
            return 0;
        }
    }

    getSlowModeCooldown(channelID) {
        return this.discordInternals.SlowmodeStore.getSlowmodeCooldownGuess(channelID);
    }

    showToast(message, type) {
        BdApi.UI.showToast(message, {type: type});
    }
}

// Create and export singleton instance
const discordApi = new DiscordAPI();
export default discordApi;