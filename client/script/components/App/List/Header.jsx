import React from 'react';
import PropTypes from 'prop-types';

const Header = (props) => (
    <div className="header">
        <div className="header__label">
            {props.listName}
        </div>

        <div className="header__total">
            {props.gameCount} games
        </div>
    </div>
);

Header.propTypes = {
    listName: PropTypes.string.isRequired,
    gameCount: PropTypes.number.isRequired,
};

export default Header;
