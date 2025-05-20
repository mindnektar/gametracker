import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import FormErrorBoundaryContext from 'contexts/formErrorBoundary';
import Error from 'atoms/Error';

const ErrorBoundary = (props) => {
    const [error, setError] = useState(null);

    const formErrorBoundaryContextValue = useMemo(() => ({
        setError,
    }), []);

    return (
        <div className="ui-form-error-boundary">
            <FormErrorBoundaryContext.Provider value={formErrorBoundaryContextValue}>
                {props.children}

                <Error>{error}</Error>
            </FormErrorBoundaryContext.Provider>
        </div>
    );
};

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
