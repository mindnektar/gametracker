import React from 'react';
import PropTypes from 'prop-types';
import useCreateSystemMutation from 'hooks/graphql/mutations/createSystem';
import useUpdateSystemMutation from 'hooks/graphql/mutations/updateSystem';
import Modal from 'molecules/Modal';
import FormData from './SystemEditor/FormData';

const SystemEditor = (props) => {
    const createSystem = useCreateSystemMutation();
    const updateSystem = useUpdateSystemMutation();

    const save = async (values) => {
        const mutation = props.system ? updateSystem : createSystem;

        await mutation({
            id: props.system?.id,
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
            formSubject={props.system}
            isOpen={props.open}
            onConfirm={save}
        >
            <Modal.Screen headline={props.system ? 'Edit system' : 'Add system'}>
                <FormData />
            </Modal.Screen>
        </Modal>
    );
};

SystemEditor.defaultProps = {
    system: null,
};

SystemEditor.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    system: PropTypes.object,
};

export default SystemEditor;
