import React from 'react';
import PropTypes from 'prop-types';
import useCreateCompilationMutation from 'hooks/graphql/mutations/createCompilation';
import useUpdateCompilationMutation from 'hooks/graphql/mutations/updateCompilation';
import Modal from 'molecules/Modal';
import FormData from './CompilationEditor/FormData';

const CompilationEditor = (props) => {
    const createCompilation = useCreateCompilationMutation();
    const updateCompilation = useUpdateCompilationMutation();

    const save = async (values) => {
        const mutation = props.compilation ? updateCompilation : createCompilation;

        await mutation({
            id: props.compilation?.id,
            title: values.title.trim(),
        });

        props.onClose();
    };

    return (
        <Modal
            close={props.onClose}
            formConfig={{
                title: '',
            }}
            formSubject={props.compilation}
            isOpen={props.open}
            onConfirm={save}
        >
            <Modal.Screen headline={props.compilation ? 'Edit compilation' : 'Add compilation'}>
                <FormData />
            </Modal.Screen>
        </Modal>
    );
};

CompilationEditor.defaultProps = {
    compilation: null,
};

CompilationEditor.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    compilation: PropTypes.object,
};

export default CompilationEditor;
