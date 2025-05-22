import React from 'react';
import PropTypes from 'prop-types';
import groupMap from 'helpers/groupMap';
import statusMap from 'helpers/statusMap';
import Button from 'atoms/Button';
import Select from 'atoms/Select';

const Meta = (props) => {
    const openEditor = () => {
        props.openGameEditor();
    };

    return (
        <div className="meta">
            <div className="meta__options">
                <Select
                    options={[
                        ...Object.entries(groupMap).map(([value, { label }]) => ({
                            value, label,
                        })),
                        { value: 'none', label: 'None' },
                    ]}
                    onChange={props.setGroupBy}
                    value={props.groupBy}
                />

                <Select
                    options={[
                        ...Object.entries(statusMap).map(([value, label]) => ({
                            value, label,
                        })),
                        { value: 'all', label: 'All' },
                    ]}
                    onChange={props.setStatusFilter}
                    value={props.statusFilter}
                />
            </div>

            <div className="meta__options">
                <Button onClick={props.pickRandom}>
                    Pick random game
                </Button>

                <Button onClick={openEditor}>
                    Add game
                </Button>
            </div>
        </div>
    );
};

Meta.propTypes = {
    openGameEditor: PropTypes.func.isRequired,
    pickRandom: PropTypes.func.isRequired,
    setGroupBy: PropTypes.func.isRequired,
    groupBy: PropTypes.string.isRequired,
    statusFilter: PropTypes.string.isRequired,
    setStatusFilter: PropTypes.func.isRequired,
};

export default Meta;
