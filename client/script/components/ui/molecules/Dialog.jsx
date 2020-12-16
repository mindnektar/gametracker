import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Button from 'atoms/Button';

const Dialog = (props) => createPortal((
    <TransitionGroup component={React.Fragment}>
        {props.open && (
            <CSSTransition
                classNames="ui-dialog-"
                mountOnEnter
                timeout={{
                    enter: 300,
                    exit: 300,
                }}
                unmountOnExit
            >
                <div className="ui-dialog">
                    <div className="ui-dialog__overlay" />

                    <div
                        className="ui-dialog__close"
                        onClick={props.onClose}
                    >
                        ✕
                    </div>

                    <div className="ui-dialog__container">
                        <div className="ui-dialog__header">{props.title}</div>

                        <div className="ui-dialog__body">
                            {props.children}
                        </div>

                        <div className="ui-dialog__footer">
                            <Button onClick={props.onSave}>Save</Button>
                        </div>
                    </div>
                </div>
            </CSSTransition>
        )}
    </TransitionGroup>
), document.body);

Dialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
};

export default Dialog;
