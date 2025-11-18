import SettingsPanel from "./components/SettingsPanel/SettingsPanel";
import styles from "./styles.css";
import toolbarButtonsStyles from "./components/ToolbarButtons/ToolbarButtons.css";
import toolbarButtonStyles from "./components/ToolbarButtons/ToolbarButton/ToolbarButton.css";
import ToolbarButtons from "./components/ToolbarButtons/ToolbarButtons";

export default class TankSquadCallPlugin {
    _toolbarButtonsRoot = null;

    constructor(meta) {
        this.meta = meta;
    }

    start() {
        BdApi.DOM.addStyle(this.meta.name, styles);
        BdApi.DOM.addStyle(this.meta.name + "-toolbar-buttons", toolbarButtonsStyles);
        BdApi.DOM.addStyle(this.meta.name + "-toolbar-button", toolbarButtonStyles);

        // TODO add observer
        this.addToolbarButtons();
    }

    stop() {
        BdApi.DOM.removeStyle(this.meta.name);
        BdApi.DOM.removeStyle(this.meta.name + "-toolbar-buttons");
        BdApi.DOM.removeStyle(this.meta.name + "-toolbar-button");

        BdApi.ReactDOM.unmountComponentAtNode(this._toolbarButtonsRoot);
    }

    addToolbarButtons() {
        const toolbar = document.querySelector('[class^="appAsidePanelWrapper"] [class^="bar"] [class^="trailing"]');

        const toolbarButtonsRootElement = BdApi.DOM.parseHTML("<div class='toolbar-buttons-root'>");
        toolbar.prepend(toolbarButtonsRootElement);

        this._toolbarButtonsRoot = BdApi.ReactDOM.createRoot(toolbarButtonsRootElement);
        this._toolbarButtonsRoot.render(BdApi.React.createElement(ToolbarButtons));
    }

    getSettingsPanel() {
        return SettingsPanel;
    }
}