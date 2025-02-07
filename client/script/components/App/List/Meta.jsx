import React from 'react';
import PropTypes from 'prop-types';
import groupMap from 'helpers/groupMap';
import statusMap from 'helpers/statusMap';
import Button from 'atoms/Button';
import Select from 'atoms/Select';

const Meta = (props) => {
    const openEditor = () => {
        props.openEditor();
    };

    return (
        <div className="meta">
            <div className="meta__options">
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

                <Select
                    items={[
                        ...Object.entries(statusMap).map(([value, label]) => ({
                            value, label,
                        })),
                        { value: 'all', label: 'All' },
                    ]}
                    onChange={props.setStatusFilter}
                    value={props.statusFilter}
                />
            </div>

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
    statusFilter: PropTypes.string.isRequired,
    setStatusFilter: PropTypes.func.isRequired,
};

export default Meta;
