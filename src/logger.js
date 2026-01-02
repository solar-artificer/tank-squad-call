import {PLUGIN_NAME} from "@/constants";

class Logger {
    static log(...args) {
        console.log(`[${PLUGIN_NAME}]`, ...args);
    }

    static logError(...args) {
        console.error(`[${PLUGIN_NAME}]`, ...args);
    }
}

export default Logger;