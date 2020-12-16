import React from 'react';
import PropTypes from 'prop-types';
import groupMap from 'helpers/groupMap';
import Button from 'atoms/Button';
import Select from 'atoms/Select';

const Meta = (props) => {
    const openEditor = () => {
        props.openEditor();
    };

    return (
        <div className="meta">
            <Select
                items={[
                    ...Object.entries(groupMap).map(([value, { label }]) => ({
                        value, label,
                    })),
                    { value: 'none', label: 'None' },
                ]}
                onChange={props.setGroupBy}
                value={props.groupBy}
            />

            <Button onClick={openEditor}>
                Add game
            </Button>
        </div>
    );
};

Meta.propTypes = {
    openEditor: PropTypes.func.isRequired,
    setGroupBy: PropTypes.func.isRequired,
    groupBy: PropTypes.object.isRequired,
};

export default Meta;
