import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'atoms/Tooltip';

const Graph = (props) => {
    const maxTotal = Math.max(1, ...props.data.map(({ dropped, active, planned, completed }) => dropped + active + planned + completed));

    return (
        <div className="ui-graph">
            <div className="ui-graph__sidebar">
                {props.data.map(({ key, label }) => (
                    <div key={key} className="ui-graph__sidebar-item">
                        {label}
                    </div>
                ))}
            </div>

            <div className="ui-graph__data">
                {props.data.map(({ key, dropped, active, planned, completed }) => (
                    <div key={key} className="ui-graph__data-item">
                        {completed > 0 && (
                            <Tooltip
                                content={`${completed} completed game${completed === 1 ? '' : 's'}`}
                                style={{ width: `${(completed / maxTotal) * 100}%` }}
                            >
                                <div className="ui-graph__data-item-bar ui-graph__data-item-bar--completed" />
                            </Tooltip>
                        )}
                        {active > 0 && (
                            <Tooltip
                                content={`${active} active game${active === 1 ? '' : 's'}`}
                                style={{ width: `${(active / maxTotal) * 100}%` }}
                            >
                                <div className="ui-graph__data-item-bar ui-graph__data-item-bar--active" />
                            </Tooltip>
                        )}
                        {planned > 0 && (
                            <Tooltip
                                content={`${planned} planned game${planned === 1 ? '' : 's'}`}
                                style={{ width: `${(planned / maxTotal) * 100}%` }}
                            >
                                <div className="ui-graph__data-item-bar ui-graph__data-item-bar--planned" />
                            </Tooltip>
                        )}
                        {dropped > 0 && (
                            <Tooltip
                                content={`${dropped} dropped game${dropped === 1 ? '' : 's'}`}
                                style={{ width: `${(dropped / maxTotal) * 100}%` }}
                            >
                                <div className="ui-graph__data-item-bar ui-graph__data-item-bar--dropped" />
                            </Tooltip>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

Graph.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        dropped: PropTypes.number.isRequired,
        active: PropTypes.number.isRequired,
        planned: PropTypes.number.isRequired,
        completed: PropTypes.number.isRequired,
    })).isRequired,
};

export default Graph;
