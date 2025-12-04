import classNames from 'classnames';

import './ToolbarButton.css';

export default function ToolbarButton({ children, className, onClick, disabled }) {
    return (
        <button 
            onClick={onClick} 
            className={classNames('toolbar-button', className, { 'toolbar-button-disabled': disabled })}
            disabled={disabled}
        >
            {children}
        </button>
    );
}