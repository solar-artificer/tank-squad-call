import SettingsPanel from "./components/SettingsPanel/SettingsPanel";

import sharedStyles from "./css/shared.css";
import overrideSettingsPanelStyles from "./css/override-settings-panel.css";
import toolbarButtonsStyles from "./components/ToolbarButtons/ToolbarButtons.css";
import toolbarButtonStyles from "./components/ToolbarButtons/ToolbarButton/ToolbarButton.css";
import settingsPanelStyles from "./components/SettingsPanel/SettingsPanel.css";
import freeSlotsInputStyles from "./components/ToolbarButtons/FreeSlotsInput/FreeSlotsInput.css";

import ToolbarButtons from "./components/ToolbarButtons/ToolbarButtons";

export default class TankSquadCallPlugin {
    _toolbarButtonsContainerElement = null;
    _toolbarButtonsReactRoot = null;

    _settingsPanelContainerElement = null;
    _settingsPanelReactRoot = null;

    _observer = null;

    constructor(meta) {
    }

    start() {
        console.log("TankSquadCallPlugin started");

        this.addToolbarButtons();

        if (this._observer == null) {
            const callback = (mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type !== 'childList') {
                        continue;
                    }

                    for (const removedNode of mutation.removedNodes) {
                        if (removedNode === this._toolbarButtonsContainerElement) {
                            this.addToolbarButtons();
                        }
                    }

                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.matches('[class*="appAsidePanelWrapper_"] [class*="bar_"]')) {
                            this.addToolbarButtons();
                        }
                    }
                }
            };

            this._observer = new MutationObserver(callback);
            this._observer.observe(
                document.body,
                {
                    childList: true,
                    subtree: true
                }
            );
        }
    }

    stop() {
        console.log("TankSquadCallPlugin stopped");

        this._observer.disconnect();

        if (this._toolbarButtonsReactRoot != null) {
            this._toolbarButtonsReactRoot.unmount();
            this._toolbarButtonsContainerElement.remove();
        }

        if (this._settingsPanelReactRoot != null) {
            this._settingsPanelReactRoot.unmount();
            this._settingsPanelContainerElement.remove();
        }
    }

    addToolbarButtons() {
        if (this._toolbarButtonsReactRoot != null) {
            this._toolbarButtonsReactRoot.unmount();
            this._toolbarButtonsContainerElement.remove();
        }

        const toolbar = document.querySelector('[class*="appAsidePanelWrapper_"] [class*="bar_"] [class*="trailing_"]');

        this._toolbarButtonsContainerElement = BdApi.DOM.parseHTML("<div class='toolbar-buttons-container'>");
        toolbar.prepend(this._toolbarButtonsContainerElement);

        const shadow = this._toolbarButtonsContainerElement.attachShadow({mode: 'open'});

        // Fix keyboard events in shadow DOM
        for (const eventType of ['keydown', 'paste', 'cut', 'copy']) {
            shadow.addEventListener(eventType, (e) => {
                e.stopPropagation();
            }, true);
        }

        const styleElement = BdApi.DOM.createElement('style');
        styleElement.innerHTML =
            sharedStyles
            + toolbarButtonsStyles
            + toolbarButtonStyles
            + freeSlotsInputStyles;
        shadow.append(styleElement);

        const toolbarButtonsReactRootElement = BdApi.DOM.parseHTML("<div class='toolbar-buttons-react-root'>");
        shadow.append(toolbarButtonsReactRootElement);

        this._toolbarButtonsReactRoot = BdApi.ReactDOM.createRoot(toolbarButtonsReactRootElement);
        this._toolbarButtonsReactRoot.render(BdApi.React.createElement(ToolbarButtons));
    }

    getSettingsPanel() {
        this._settingsPanelContainerElement = BdApi.DOM.parseHTML("<div class='settings-panel-container tanksquad-call-trigger'>");

        const hidingDefaultBetterDiscordPartsStyleElement = BdApi.DOM.createElement('style');
        hidingDefaultBetterDiscordPartsStyleElement.innerHTML = overrideSettingsPanelStyles;
        this._settingsPanelContainerElement.append(hidingDefaultBetterDiscordPartsStyleElement);

        const shadow = this._settingsPanelContainerElement.attachShadow({mode: 'open'});

        // Fix keyboard events in shadow DOM
        for (const eventType of ['keydown', 'paste', 'cut', 'copy']) {
            shadow.addEventListener(eventType, (e) => {
                e.stopPropagation();
            }, true);
        }

        const styleElement = BdApi.DOM.createElement('style');
        styleElement.innerHTML = sharedStyles + settingsPanelStyles;
        shadow.append(styleElement);

        const settingsPanelReactRootElement = BdApi.DOM.parseHTML("<div class='settings-panel-react-root'>");
        shadow.append(settingsPanelReactRootElement);

        this._settingsPanelReactRoot = BdApi.ReactDOM.createRoot(settingsPanelReactRootElement);
        this._settingsPanelReactRoot.render(BdApi.React.createElement(SettingsPanel));

        return this._settingsPanelContainerElement;
    }
}