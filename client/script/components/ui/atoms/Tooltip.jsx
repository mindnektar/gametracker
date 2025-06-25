import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import useToggle from 'hooks/useToggle';

const Tooltip = (props) => {
    const [visible, show, hide] = useToggle(false);

    return (
        <div
            className="ui-tooltip"
            onMouseEnter={show}
            onMouseLeave={hide}
        >
            {props.children}

            <div className={classnames('ui-tooltip__content', { 'ui-tooltip__content--visible': visible })}>
                {props.content}
            </div>
        </div>
    );
};

Tooltip.propTypes = {
    children: PropTypes.node.isRequired,
    content: PropTypes.node.isRequired,
};

export default Tooltip;
