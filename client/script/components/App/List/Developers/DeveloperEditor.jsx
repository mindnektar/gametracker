import React from 'react';
import PropTypes from 'prop-types';
import useCreateDeveloperMutation from 'hooks/graphql/mutations/createDeveloper';
import useUpdateDeveloperMutation from 'hooks/graphql/mutations/updateDeveloper';
import Modal from 'molecules/Modal';
import FormData from './DeveloperEditor/FormData';

const DeveloperEditor = (props) => {
    const createDeveloper = useCreateDeveloperMutation();
    const updateDeveloper = useUpdateDeveloperMutation();

    const save = async (values) => {
        const mutation = props.developer ? updateDeveloper : createDeveloper;

        await mutation({
            id: props.developer?.id,
            name: values.name.trim(),
        });

        props.onClose();
    };

    return (
        <Modal
            close={props.onClose}
            formConfig={{
                name: '',
            }}
            formSubject={props.developer}
            isOpen={props.open}
            onConfirm={save}
        >
            <Modal.Screen headline={props.developer ? 'Edit developer' : 'Add developer'}>
                <FormData />
            </Modal.Screen>
        </Modal>
    );
};

DeveloperEditor.defaultProps = {
    developer: null,
};

DeveloperEditor.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    developer: PropTypes.object,
};

export default DeveloperEditor;
