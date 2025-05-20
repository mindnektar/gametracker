import React, { useMemo, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import FormContext from 'contexts/form';
import FormRowContext from 'contexts/formRow';
import ErrorBoundary from './ErrorBoundary';

const Row = (props) => {
    const formContext = useContext(FormContext);

    const formRowContextValue = useMemo(() => ({
        label: props.label,
    }), []);

    useEffect(() => {
        if (props.required) {
            formContext.showRequiredText();
        }
    }, [props.required]);

    return (
        <div
            className={classnames(
                'ui-form-row',
                `ui-form-row--justify-${props.justify}`,
                { 'ui-form-row--wide-label': props.wideLabel },
            )}
        >
            <ErrorBoundary>
                <div className="ui-form-row__wrapper">
                    <div className="ui-form-row__label">
                        <div>
                            {props.label}{props.required ? '*' : ''}
                        </div>
                    </div>

                    <div className="ui-form-row__content">
                        <FormRowContext.Provider value={formRowContextValue}>
                            {props.children}
                        </FormRowContext.Provider>
                    </div>
                </div>
            </ErrorBoundary>
        </div>
    );
};

Row.JUSTIFY_SPACE_BETWEEN = 'space-between';
Row.JUSTIFY_LEFT = 'left';
Row.JUSTIFY_RIGHT = 'right';

Row.defaultProps = {
    help: null,
    justify: Row.JUSTIFY_SPACE_BETWEEN,
    label: null,
    required: false,
    wideLabel: false,
};

Row.propTypes = {
    children: PropTypes.node.isRequired,
    help: PropTypes.arrayOf(PropTypes.node),
    justify: PropTypes.oneOf([Row.JUSTIFY_SPACE_BETWEEN, Row.JUSTIFY_LEFT, Row.JUSTIFY_RIGHT]),
    label: PropTypes.node,
    required: PropTypes.bool,
    wideLabel: PropTypes.bool,
};

export default Row;
