const { useState } = BdApi.React;

import CreateChannelButton from './CreateChannelButton/CreateChannelButton';
import SendCallButton from './SendCallButton/SendCallButton';
import CallOptionsButton from './CallOptionsButton/CallOptionsButton';
import FreeSlotsInput from './FreeSlotsInput/FreeSlotsInput';
import SlowmodeCooldown from './SlowmodeCooldown/SlowmodeCooldown';

export default function ToolbarButtons() {
    const [freeSlots, setFreeSlots] = useState(0);

    return (
        <div className="toolbar-buttons">
            <CreateChannelButton />
            <SendCallButton freeSlots={freeSlots} />
            <SlowmodeCooldown />
            <FreeSlotsInput value={freeSlots} onValueChange={setFreeSlots} />
            <CallOptionsButton />

            <div className={"divider"}/>
        </div>
    );
}