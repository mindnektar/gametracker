import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { CSSTransition } from 'react-transition-group';
import Button from 'atoms/Button';
import Loader from 'atoms/Loader';

const Dialog = (props) => createPortal((
    <CSSTransition
        in={props.open}
        classNames="ui-dialog-"
        mountOnEnter
        timeout={300}
        unmountOnExit
    >
        <div
            className={classnames(
                'ui-dialog',
                { 'ui-dialog--loading': props.loading }
            )}
        >
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

                <div className="ui-dialog__loading">
                    <Loader />
                </div>
            </div>
        </div>
    </CSSTransition>
), document.body);

Dialog.defaultProps = {
    loading: false,
};

Dialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    loading: PropTypes.bool,
};

export default Dialog;
