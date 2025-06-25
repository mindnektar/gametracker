import React from 'react';
import PropTypes from 'prop-types';
import countries from 'helpers/countries';
import Tooltip from 'atoms/Tooltip';

const countryMap = new Map(countries.map((country) => [country.code, country]));

const Flag = (props) => (
    <div className="ui-flag">
        {props.code ? (
            <Tooltip content={countryMap.get(props.code)?.name}>
                <img
                    src={`/images/flags/${props.code}.svg`}
                    alt={countryMap.get(props.code)?.name}
                />
            </Tooltip>
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
