import React from 'react';
import PropTypes from 'prop-types';

const Flag = (props) => (
    <div className="ui-flag">
        {props.code ? (
            <img src={`/images/flags/${props.code}.svg`} alt="" />
        ) : (
            <div className="ui-flag__placeholder">
                ?
            </div>
        )}
    </div>
);

Flag.defaultProps = {
    code: null,
};

Flag.propTypes = {
    code: PropTypes.string,
};

export default Flag;
