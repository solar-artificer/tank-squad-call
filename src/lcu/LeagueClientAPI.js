import Logger from "@/logger";

const request = window.require('request');
const fs = window.require('fs');

import DiscordAPI from "@/discord-api/DiscordAPI";

class LeagueClientAPI {
    constructor() {
        this.authHeaderValue = null;
        this.baseUrl = null;
    }

    async setup() {
        // Already set up
        if (this.baseUrl !== null && this.authHeaderValue !== null) {
            return true;
        }

        if (DiscordAPI.settings.lockfilePath === undefined || DiscordAPI.settings.lockfilePath === null) {
            return false;
        }

        const lockfilePath = DiscordAPI.settings.lockfilePath;
        const doesLockFileExist = await new Promise((resolve, reject) => {
            fs.exists(lockfilePath,(error, data) => {
                if (error) {
                    reject(error);
                }

                resolve(data);
            });
        });
        if (!doesLockFileExist) {
            return false;
        }

        const lockfileContents = await new Promise((resolve, reject) => {
            fs.readFile(lockfilePath, "utf8", (error, data) => {
                if (error) {
                    reject(error);
                }

                resolve(data);
            });
        });
        if (lockfileContents === null) {
            return false;
        }

        const lockfileContentsParts = lockfileContents.split(':');
        const port = lockfileContentsParts[2];
        const token = lockfileContentsParts[3];

        this.baseUrl = `https://127.0.0.1:${port}/`

        const rawAuthToken = `riot:${token}`;
        const encodedAuthToken = btoa(rawAuthToken);
        this.authHeaderValue = `Basic ${encodedAuthToken}`;
    }

    async requestToLCU(relativeUrl) {
        // Use request module instead of fetch to bypass self-signed certificate
        return new Promise((resolve, reject) => {
            request(
                {
                    url: this.baseUrl + relativeUrl,
                    headers: {
                        'Authorization': this.authHeaderValue
                    },
                    rejectUnauthorized: false, // Allow self-signed certificates (LCU uses one)
                    json: true
                },
                (error, response, body) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve({response, body});
                }
            );
        });
    }

    async checkIfLeagueLobbyIsFull() {
        try {
            const didSuccessfullyPrepareApiClient = await this.setup();
            if (!didSuccessfullyPrepareApiClient) {
                return null;
            }

            const {response, body} = await this.requestToLCU('lol-lobby/v2/lobby');
            if (response.statusCode === 404) {
                Logger.log('404 при проверке полноты лобби в LCU');
                return null;
            }

            if (response.statusCode !== 200) {
                throw new Error(response.statusMessage);
            }

            const parsedContents = JSON.parse(body);

            const currentMembers = parsedContents.members;
            const maxLobbySize = parsedContents.gameConfig.maxLobbySize;

            // Maybe makes sense to check the invitations too
            return currentMembers.length >= maxLobbySize;
        } catch (error) {
            Logger.logError(`Произошла ошибка при проверке полноты лобби в LCU: "${error.message}"`);
            return null;
        }
    }

    async checkIfIsQueuedUp() {
        try {
            const didSuccessfullyPrepareApiClient = await this.setup();
            if (!didSuccessfullyPrepareApiClient) {
                return null;
            }

            const {response, body} = await this.requestToLCU('lol-matchmaking/v1/search');
            if (response.statusCode === 404) {
                Logger.log('404 при проверке статуса поиска в LCU');
                return null;
            }

            if (response.statusCode !== 200) {
                throw new Error(response.statusMessage);
            }

            const parsedContents = JSON.parse(body);

            return parsedContents.isCurrentlyInQueue;
        } catch (error) {
            Logger.logError(`Произошла ошибка при проверке статуса поиска в LCU: "${error.message}"`);
            return null;
        }
    }

    async checkIfIsInChampSelect() {
        try {
            const didSuccessfullyPrepareApiClient = await this.setup();
            if (!didSuccessfullyPrepareApiClient) {
                return null;
            }

            const { response } = await this.requestToLCU('lol-champ-select/v1/session');
            if (response.statusCode === 404) {
                return false;
            }

            if (response.statusCode !== 200) {
                throw new Error(response.statusMessage);
            }

            return true;
        } catch (error) {
            Logger.logError(`Произошла ошибка при проверке в пике ли пользователь в LCU: "${error.message}"`);
            return null;
        }
    }

    async getGameFlowPhase() {
        try {
            const didSuccessfullyPrepareApiClient = await this.setup();
            if (!didSuccessfullyPrepareApiClient) {
                return null;
            }

            const { response, body } = await this.requestToLCU('lol-gameflow/v1/session');
            if (response.statusCode === 404) {
                return null;
            }

            if (response.statusCode !== 200) {
                throw new Error(response.statusMessage);
            }

            const parsedContents = JSON.parse(body);
            return parsedContents.phase;
        } catch (error) {
            Logger.logError(`Произошла ошибка при проверке в пике ли пользователь в LCU: "${error.message}"`);
            return null;
        }
    }
}

// Create and export singleton instance
const leagueClientApi = new LeagueClientAPI();
export default leagueClientApi;