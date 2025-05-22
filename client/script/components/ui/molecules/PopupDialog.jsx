import React, { useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import useToggle from 'hooks/useToggle';
import SpeechBubble from 'atoms/SpeechBubble';
import PopupDialogItem from './PopupDialog/PopupDialogItem';

const PopupDialog = forwardRef((props, ref) => {
    const [isOpen, , close, toggle] = useToggle(false);
    const rootRef = useRef();

    const onItemClickHandler = (item) => (event) => {
        event.stopPropagation();

        window.requestAnimationFrame(() => {
            if (!item.keepOpenOnClick) {
                close();
            }

            item.onClick({ close });
        });
    };

    const renderContent = () => (
        <div className="ui-popup-dialog__content">
            {props.items.map((item) => (
                item.available !== false ? (
                    <PopupDialogItem
                        key={item.label}
                        color={item.color}
                        destructive={item.destructive}
                        disabled={item.disabled}
                        icon={item.icon}
                        image={item.image}
                        isActive={item.isActive}
                        label={item.label}
                        loading={item.loading}
                        notification={item.notification}
                        onClick={onItemClickHandler(item)}
                        progress={item.progress}
                        subLabel={item.subLabel}
                    />
                ) : (
                    null
                )
            ))}
        </div>
    );

    return (
        <div
            ref={rootRef}
            className="ui-popup-dialog"
        >
            <SpeechBubble
                ref={ref}
                additionalContent={props.additionalContent}
                anchorSelector={props.anchorSelector}
                close={close}
                content={renderContent()}
                isOpen={isOpen}
                offset={props.offset}
                withOverlay={props.withOverlay}
            >
                {props.children({ isOpen, toggle })}
            </SpeechBubble>
        </div>
    );
});

PopupDialog.defaultProps = {
    additionalContent: () => null,
    anchorSelector: null,
    offset: 0,
    withOverlay: false,
};

PopupDialog.propTypes = {
    additionalContent: PropTypes.func,
    anchorSelector: PropTypes.string,
    children: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            available: PropTypes.bool,
            color: PropTypes.string,
            destructive: PropTypes.bool,
            disabled: PropTypes.bool,
            icon: PropTypes.string,
            image: PropTypes.string,
            isActive: PropTypes.bool,
            keepOpenOnClick: PropTypes.bool,
            label: PropTypes.string.isRequired,
            notification: PropTypes.bool,
            onClick: PropTypes.func,
            progress: PropTypes.number,
            subLabel: PropTypes.string,
        }),
    ).isRequired,
    offset: PropTypes.number,
    withOverlay: PropTypes.bool,
};

export default PopupDialog;
