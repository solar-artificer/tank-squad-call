import SettingsPanel from "./components/SettingsPanel/SettingsPanel";
import styles from "./styles.css";
import toolbarButtonsStyles from "./components/ToolbarButtons/ToolbarButtons.css";
import toolbarButtonStyles from "./components/ToolbarButtons/ToolbarButton/ToolbarButton.css";
import ToolbarButtons from "./components/ToolbarButtons/ToolbarButtons";

export default class TankSquadCallPlugin {
    _toolbarButtonsContainerElement = null;
    _toolbarButtonsReactRoot = null;
    _observer = null;

    constructor(meta) {
    }

    start() {
        console.log("TankSquadCallPlugin started");

        this.addMarkup();

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
    }

    addMarkup() {
        this.addToolbarButtons();
    }

    addToolbarButtons() {
        const toolbar = document.querySelector('[class^="appAsidePanelWrapper"] [class^="bar"] [class^="trailing"]');

        this._toolbarButtonsContainerElement = BdApi.DOM.parseHTML("<div class='toolbar-buttons-container'>");
        toolbar.prepend(this._toolbarButtonsContainerElement);

        const toolbarButtonsReactRootElement = BdApi.DOM.parseHTML("<div class='toolbar-buttons-react-root'>");
        this._toolbarButtonsContainerElement.prepend(toolbarButtonsReactRootElement);

        this._toolbarButtonsReactRoot = BdApi.ReactDOM.createRoot(toolbarButtonsReactRootElement);
        this._toolbarButtonsReactRoot.render(BdApi.React.createElement(ToolbarButtons));

        const styleElement = BdApi.DOM.createElement('style', {className: 'tank-squad-call-toolbar-buttons-styles'});
        styleElement.innerHTML = styles + toolbarButtonsStyles + toolbarButtonStyles;
        this._toolbarButtonsContainerElement.prepend(styleElement);
    }

    getSettingsPanel() {
        return SettingsPanel;
    }
}