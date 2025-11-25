import SettingsPanel from "./components/SettingsPanel/SettingsPanel";

import sharedStyles from "./styles.css";
import toolbarButtonsStyles from "./components/ToolbarButtons/ToolbarButtons.css";
import toolbarButtonStyles from "./components/ToolbarButtons/ToolbarButton/ToolbarButton.css";
import settingsPanelStyles from "./components/SettingsPanel/SettingsPanel.css";

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
                    if (mutation.type !== 'childlist') {
                        continue;
                    }

                    for (const removedNode of mutation.removedNodes) {
                        if (removedNode === this._toolbarButtonsContainerElement) {
                            console.log('Element was removed!');
                            this.addToolbarButtons();
                        }
                    }
                }
            };
            this._observer = new MutationObserver(callback);
            this._observer.observe(this._toolbarButtonsContainerElement.parentNode, {
                childList: true // Watch for additions/removals of child nodes
            });
        }
    }

    stop() {
        console.log("TankSquadCallPlugin stopped");

        this._observer.disconnect();

        this._toolbarButtonsReactRoot.unmount();
        this._toolbarButtonsContainerElement.remove();

        this._settingsPanelReactRoot.unmount();
        this._settingsPanelContainerElement.remove();
    }

    addToolbarButtons() {
        const toolbar = document.querySelector('[class^="appAsidePanelWrapper"] [class^="bar"] [class^="trailing"]');

        this._toolbarButtonsContainerElement = BdApi.DOM.parseHTML("<div class='toolbar-buttons-container'>");
        toolbar.prepend(this._toolbarButtonsContainerElement);

        const shadow = this._toolbarButtonsContainerElement.attachShadow({mode: 'open'});

        const styleElement = BdApi.DOM.createElement('style', {className: 'tank-squad-call-toolbar-buttons-styles'});
        styleElement.innerHTML = sharedStyles + toolbarButtonsStyles + toolbarButtonStyles;
        shadow.append(styleElement);

        const toolbarButtonsReactRootElement = BdApi.DOM.parseHTML("<div class='toolbar-buttons-react-root'>");
        shadow.append(toolbarButtonsReactRootElement);

        this._toolbarButtonsReactRoot = BdApi.ReactDOM.createRoot(toolbarButtonsReactRootElement);
        this._toolbarButtonsReactRoot.render(BdApi.React.createElement(ToolbarButtons));
    }

    getSettingsPanel() {
        this._settingsPanelContainerElement = BdApi.DOM.parseHTML("<div class='settings-panel-container'>");

        const shadow = this._settingsPanelContainerElement.attachShadow({mode: 'open'});

        const styleElement = BdApi.DOM.createElement('style', {className: 'tank-squad-call-toolbar-buttons-styles'});
        styleElement.innerHTML = sharedStyles + settingsPanelStyles;
        shadow.append(styleElement);

        const settingsPanelReactRootElement = BdApi.DOM.parseHTML("<div class='settings-panel-react-root'>");
        shadow.append(settingsPanelReactRootElement);

        this._settingsPanelReactRoot = BdApi.ReactDOM.createRoot(settingsPanelReactRootElement);
        this._settingsPanelReactRoot.render(BdApi.React.createElement(SettingsPanel));

        return this._settingsPanelContainerElement;
    }
}