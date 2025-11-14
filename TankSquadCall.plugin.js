/**
 * @name TankSquadCall
 * @author SolarArtificer
 * @description
 * @version 0.3.0
 */

module.exports = class TankSquadCall {
    constructor() {
        this.createVoiceChannelButton = null;
        this.sendCallButton = null;

        this.settings = {
            serverID: '1010911948226957353',
            createVoiceChannelChannelID: '1010911949531394173',
            callChannelID: '1010911949531394170',

            tankPoolPictureUrl: 'https://media.discordapp.net/attachments/1010911949531394173/1437610759436898466/919552572fd1bac0.png?ex=6913deda&is=69128d5a&hm=9242e74d32fcd8b8a4911ae42d5dcb24842ca3abd156c14954e4f0577c0ea7aa&=&format=webp&quality=lossless',
            callMessageTemplate:
                '+{AMOUNT_OF_FREE_SLOTS} В ТАНКОСКВАД\n' +
                '-Пикаем чемпионов с ролью танка и играем засчёт крепкой мужской дружбы.\n' +
                '-Играем на RU\n' +
                '{CURRENT_VOICE_CHANNEL_LINK}'
        };
    }

    start() {
        this.discordInternals = this.getDiscordInternals();
        console.log('DISCORD INTERNALS');
        console.log(this.discordInternals);

        this.addCreateVoiceChannelButton();
        this.addSendCallButton();
    } 

    stop() {
        this.discordInternals = null;

        this.removeCreateVoiceChannelButton();
        this.removeSendCallButton();
    }

    getDiscordInternals() {
        const ChannelStore = BdApi.Webpack.getModule(m => m.getChannel && m.hasChannel);
        const GuildStore = BdApi.Webpack.getModule(m => m.getGuild && m.getGuilds);

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

        const GuildChannelStore = BdApi.Webpack.getModule(
            m => m.getChannels && m.hasChannels,
            {searchExports: true}
        );

        // Try multiple methods to find VoiceStateStore
        let VoiceStateStore = BdApi.Webpack.getModule(
            m => m.getVoiceStateForUser,
            {searchExports: true}
        );

        if (!VoiceStateStore) {
            VoiceStateStore = BdApi.Webpack.getModule(
                m => m.getVoiceStatesForChannel,
                {searchExports: true}
            );
        }

        if (!VoiceStateStore) {
            VoiceStateStore = BdApi.Webpack.getModule(
                m => m.getVoiceState,
                {searchExports: true}
            );
        }

        const UserStore = BdApi.Webpack.getModule(
            m => m.getCurrentUser,
            {searchExports: true}
        );

        return {
            ChannelStore,
            GuildStore,
            GuildChannelStore,
            VoiceStateStore,
            UserStore,
            VoiceActions,
            MessageActions,
        }
    }

    addCreateVoiceChannelButton() {
        const toolbar = document.querySelector('[class^="appAsidePanelWrapper"] [class^="bar"] [class^="trailing"]');

        // Create the button
        this.createVoiceChannelButton = document.createElement('div');
        this.createVoiceChannelButton.id = 'tankSquadCallButton';
        this.createVoiceChannelButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
        `;
        
        // Style the button to match Discord's style
        this.createVoiceChannelButton.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            margin: 0 8px;
            cursor: pointer;
            color: var(--interactive-normal);
            transition: color 0.2s;
        `;

        // Hover effect
        this.createVoiceChannelButton.addEventListener('mouseenter', () => {
            this.createVoiceChannelButton.style.color = 'var(--interactive-hover)';
        });
        
        this.createVoiceChannelButton.addEventListener('mouseleave', () => {
            this.createVoiceChannelButton.style.color = 'var(--interactive-normal)';
        });

        // Click handler
        this.createVoiceChannelButton.addEventListener('click', () => {
            this.createTankSquadChannel();
        });

        // Add tooltip
        this.createVoiceChannelButton.setAttribute('aria-label', 'Tank Squad Call');
        this.createVoiceChannelButton.setAttribute('role', 'button');

        // Insert before the first child (leftmost position)
        toolbar.insertBefore(this.createVoiceChannelButton, toolbar.firstChild);
    }

    removeCreateVoiceChannelButton() {
        if (this.createVoiceChannelButton && this.createVoiceChannelButton.parentNode) {
            this.createVoiceChannelButton.parentNode.removeChild(this.createVoiceChannelButton);
            this.createVoiceChannelButton = null;
        }
    }

    addSendCallButton() {
        const toolbar = document.querySelector('[class^="appAsidePanelWrapper"] [class^="bar"] [class^="trailing"]');

        // Create the button
        this.sendCallButton = document.createElement('div');
        this.sendCallButton.id = 'tankSquadCallButton';
        this.sendCallButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
        `;
        
        // Style the button to match Discord's style
        this.sendCallButton.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            margin: 0 8px;
            cursor: pointer;
            color: var(--interactive-normal);
            transition: color 0.2s;
        `;

        // Hover effect
        this.sendCallButton.addEventListener('mouseenter', () => {
            this.sendCallButton.style.color = 'var(--interactive-hover)';
        });
        
        this.sendCallButton.addEventListener('mouseleave', () => {
            this.sendCallButton.style.color = 'var(--interactive-normal)';
        });

        // Click handler
        this.sendCallButton.addEventListener('click', () => {
            this.sendCall();
        });

        // Add tooltip
        this.sendCallButton.setAttribute('aria-label', 'Tank Squad Call');
        this.sendCallButton.setAttribute('role', 'button');

        // Insert before the first child (leftmost position)
        toolbar.insertBefore(this.sendCallButton, toolbar.firstChild);
    }

    removeSendCallButton() {
        if (this.sendCallButton && this.sendCallButton.parentNode) {
            this.sendCallButton.parentNode.removeChild(this.sendCallButton);
            this.sendCallButton = null;
        }
    }

    sendCall() {
        const callMessage = {
            content: this.constructCallMessage(),
            tts: false,
            invalidEmojis: [],
            validNonShortcutEmojis: [],
            // Add unique nonce
            nonce: Date.now().toString() + Math.random().toString(36)
        };

        this.discordInternals.MessageActions.sendMessage(this.settings.callChannelID, callMessage, undefined, {});
    }

    constructCallMessage() {
        const voiceChannelInfo = this.getCurrentVoiceChannel();
        if (!voiceChannelInfo) {
            // TODO Error handling
            return;
        }

        let currentVoiceChannelLink = `https://discord.com/channels/${voiceChannelInfo.guild_id}/${voiceChannelInfo.id}`;

        // TODO I have thought of a better UI
        const currentUserCount = this.getVoiceChannelUserCount(voiceChannelInfo.guild_id, voiceChannelInfo.id);
        let amountOfFreeSlots = 5 - currentUserCount;

        const message = this.settings.callMessageTemplate
            .replaceAll('{AMOUNT_OF_FREE_SLOTS}', amountOfFreeSlots.toString())
            .replaceAll('{CURRENT_VOICE_CHANNEL_LINK}', currentVoiceChannelLink);

        return message;
    }

    createTankSquadChannel() {
        const didSuccessfullyJoin = this.joinVoiceChannel(this.settings.serverID, this.settings.createVoiceChannelChannelID);
        if (!didSuccessfullyJoin) {
            return;
        }

        // TODO I don't like this timeout
        setTimeout(() => {
                this.postPictureToVoiceChannel(
                    this.settings.serverID,
                    this.settings.createVoiceChannelChannelID,
                    this.settings.tankPoolPictureUrl
                );
            },
            5000
        );
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

            BdApi.showToast(`Joining voice channel: ${channel.name}`, {type: "success"});
            console.log(`TankSquadCall: Successfully joined ${channel.name}`);
            
            return true;

        } catch (error) {
            BdApi.showToast(`Error joining voice channel: ${error.message}`, {type: "error"});
            console.error("TankSquadCall Error:", error);
            return false;
        }
    }

    // Post picture to a specific voice channel (finds associated text channel)
    postPictureToVoiceChannel(serverId, voiceChannelId, pictureURL) {
        try {
            console.log(`Posting picture to voice channel ${voiceChannelId}: ${pictureURL}`);

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

            const pictureMessage = {
                content: pictureURL,
                tts: false,
                invalidEmojis: [],
                validNonShortcutEmojis: [],
                // Add unique nonce
                nonce: Date.now().toString() + Math.random().toString(36)
            };

            this.discordInternals.MessageActions.sendMessage(targetTextChannel.id, pictureMessage, undefined, {});

            BdApi.showToast(`Picture posted to #${targetTextChannel.name}!`, {type: "success"});
            console.log(`TankSquadCall: Picture posted to channel ${targetTextChannel.id}`);

            return true;
        } catch (error) {
            BdApi.showToast(`Error posting picture: ${error.message}`, {type: "error"});
            console.error("TankSquadCall Error:", error);
            return false;
        }
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
}