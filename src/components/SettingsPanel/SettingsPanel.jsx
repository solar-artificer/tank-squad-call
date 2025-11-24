const { useState } = BdApi.React;

import DiscordAPI from "../../discord-api/DiscordAPI";

function saveSettings(serializedSettings) {
    console.log(serializedSettings);
    DiscordAPI.settings = JSON.parse(serializedSettings);
    DiscordAPI.saveSettings();
}

export default function SettingsPanel({}) {
    const [serializedSettings, setSerializedSettings] = useState(JSON.stringify(DiscordAPI.settings));

    return (
        <div>
            <textarea onChange={e=> setSerializedSettings(e.target.value)}>{serializedSettings}</textarea>
            <button onClick={() => saveSettings(serializedSettings)}>Save</button>
            <button onClick={() => saveSettings(serializedSettings)}>Save</button>
        </div>
    )
}