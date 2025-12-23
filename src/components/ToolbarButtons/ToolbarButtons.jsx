const { useState } = BdApi.React;

import forge_menu from '@/assets/Forge_Menu.png';

import CreateChannelButton from './CreateChannelButton/CreateChannelButton';
import SendCallButton from './SendCallButton/SendCallButton';
import EditMessageTemplate from './EditMessageTemplateButton/EditMessageTemplate';
import FreeSlotsInput from './FreeSlotsInput/FreeSlotsInput';
import Divider from './Divider/Divider';

export default function ToolbarButtons() {
    const [freeSlots, setFreeSlots] = useState(null);

    return (
        <div className="toolbar-buttons">
            <div className="toolbar-menu" style={{ backgroundImage: `url(${forge_menu})` }}>
                <CreateChannelButton />
                <SendCallButton freeSlots={freeSlots} />
                <FreeSlotsInput value={freeSlots} onValueChange={setFreeSlots} />
                <EditMessageTemplate />
            </div>

            <Divider/>
        </div>
    );
}