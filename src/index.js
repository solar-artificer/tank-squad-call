import Logger from "@/logger";
import {PLUGIN_NAME} from "@/constants";

import ToolbarButtons from "./components/ToolbarButtons/ToolbarButtons";
import SettingsPanel from "./components/SettingsPanel/SettingsPanel";

import externallyExposedStyles from "./css/oxternally-exposed.css";
import sharedStyles from "./css/shared.css";
import toolbarButtonsStyles from "./components/ToolbarButtons/ToolbarButtons.css";
import toolbarButtonStyles from "./components/ToolbarButtons/ToolbarButton/ToolbarButton.css";
import settingsPanelStyles from "./components/SettingsPanel/SettingsPanel.css";
import freeSlotsInputStyles from "./components/ToolbarButtons/FreeSlotsInput/FreeSlotsInput.css";
import editMessageTemplateButtonStyles
    from "./components/ToolbarButtons/EditMessageTemplateButton/EditMessageTemplate.css";
import picturePickerStyles from "./components/PicturePicker/PicturePicker.css";
import sendCallButtonStyles from "./components/ToolbarButtons/SendCallButton/SendCallButton.css";
import dividerStyles from "./components/ToolbarButtons/Divider/Divider.css";


export default class TankSquadCallPlugin {
    _toolbarButtonsContainerElement = null;
    _toolbarButtonsReactRoot = null;

    _settingsPanelContainerElement = null;
    _settingsPanelReactRoot = null;

    _toolbarButtonsObserver = null;

    constructor(meta) {
    }

    start() {
        Logger.log(`${PLUGIN_NAME} запустился!`);

        this.addOverrideLeakedCss();

        const toolbar = document.querySelector('[class*="appAsidePanelWrapper"] [class*="base"] > [class*="bar"] [class*="trailing"]');
        if (toolbar !== null) {
            this.addToolbarButtons();
        }

        this.setupToolbarButtonsObserver();
    }

    stop() {
        Logger.log(`${PLUGIN_NAME} остановился!`);

        if (this._toolbarButtonsObserver !== null) {
            this._toolbarButtonsObserver.disconnect();
        }

        if (this._toolbarButtonsReactRoot != null) {
            this._toolbarButtonsReactRoot.unmount();
            this._toolbarButtonsContainerElement.remove();
        }

        if (this._settingsPanelReactRoot != null) {
            this._settingsPanelReactRoot.unmount();
            this._settingsPanelContainerElement.remove();
        }

        const leakedStylesElement = document.querySelector('.tanksquad-call-override-leaked-css');
        if (leakedStylesElement !== null) {
            leakedStylesElement.remove();
        }
    }

    getSettingsPanel() {
        this._settingsPanelContainerElement = BdApi.DOM.parseHTML("<div class='settings-panel-container tanksquad-call-settings-panel'>");

        const shadow = this._settingsPanelContainerElement.attachShadow({mode: 'open'});
        this.preventDiscordHandlingOfKeyboardEvents(shadow);

        const styleElement = BdApi.DOM.createElement('style');
        styleElement.innerHTML = sharedStyles + settingsPanelStyles + picturePickerStyles;
        shadow.append(styleElement);

        const settingsPanelReactRootElement = BdApi.DOM.parseHTML("<div class='settings-panel-react-root'>");
        shadow.append(settingsPanelReactRootElement);

        this._settingsPanelReactRoot = BdApi.ReactDOM.createRoot(settingsPanelReactRootElement);
        this._settingsPanelReactRoot.render(BdApi.React.createElement(SettingsPanel));

        return this._settingsPanelContainerElement;
    }

    addOverrideLeakedCss() {
        const existingStylesElement = document.querySelector('.tanksquad-call-override-leaked-css');
        if (existingStylesElement !== null) {
            return;
        }

        const createdStyleElement = BdApi.DOM.parseHTML('<style class="tanksquad-call-override-leaked-css"></style>');
        createdStyleElement.innerHTML = externallyExposedStyles;

        document.head.appendChild(createdStyleElement);
    }

    setupToolbarButtonsObserver() {
        if (this._toolbarButtonsObserver !== null) {
            return;
        }

        const mutationCallback = (mutationsList) => {
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
                    if (
                        addedNode.nodeType === Node.ELEMENT_NODE
                        && addedNode.matches('[class*="appAsidePanelWrapper"] [class*="base"] > [class*="bar"]')
                    ) {
                        this.addToolbarButtons();
                    }
                }
            }
        };

        this._toolbarButtonsObserver = new MutationObserver(mutationCallback);
        this._toolbarButtonsObserver.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }

    addToolbarButtons() {
        if (this._toolbarButtonsReactRoot != null) {
            this._toolbarButtonsReactRoot.unmount();
            this._toolbarButtonsContainerElement.remove();
        }

        const toolbar = document.querySelector('[class*="appAsidePanelWrapper"] [class*="base"] > [class*="bar"] [class*="trailing"]');

        this._toolbarButtonsContainerElement = BdApi.DOM.parseHTML("<div class='toolbar-buttons-container' style='position: relative; z-index: 10000; overflow: visible;'>");
        toolbar.prepend(this._toolbarButtonsContainerElement);

        const shadow = this._toolbarButtonsContainerElement.attachShadow({mode: 'open'});
        this.preventDiscordHandlingOfKeyboardEvents(shadow);

        const styleElement = BdApi.DOM.createElement('style');
        styleElement.innerHTML =
            sharedStyles
            + toolbarButtonsStyles
            + toolbarButtonStyles
            + freeSlotsInputStyles
            + editMessageTemplateButtonStyles
            + sendCallButtonStyles
            + dividerStyles;
        shadow.append(styleElement);

        const toolbarButtonsReactRootElement = BdApi.DOM.parseHTML("<div class='toolbar-buttons-react-root'>");
        shadow.append(toolbarButtonsReactRootElement);

        this._toolbarButtonsReactRoot = BdApi.ReactDOM.createRoot(toolbarButtonsReactRootElement);
        this._toolbarButtonsReactRoot.render(BdApi.React.createElement(ToolbarButtons));
    }

    preventDiscordHandlingOfKeyboardEvents(shadow) {
        for (const eventType of ['keydown', 'paste', 'cut', 'copy']) {
            shadow.addEventListener(eventType, (e) => {
                e.stopPropagation();
            }, true);
        }
    }
}