import React from 'react';
import PropTypes from 'prop-types';
import useCreateFranchiseMutation from 'hooks/graphql/mutations/createFranchise';
import useUpdateFranchiseMutation from 'hooks/graphql/mutations/updateFranchise';
import Modal from 'molecules/Modal';
import FormData from './FranchiseEditor/FormData';

const FranchiseEditor = (props) => {
    const createFranchise = useCreateFranchiseMutation();
    const updateFranchise = useUpdateFranchiseMutation();

    const save = async (values) => {
        const mutation = props.franchise ? updateFranchise : createFranchise;

        await mutation({
            id: props.franchise?.id,
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
            formSubject={props.franchise}
            isOpen={props.open}
            onConfirm={save}
        >
            <Modal.Screen headline={props.franchise ? 'Edit franchise' : 'Add franchise'}>
                <FormData />
            </Modal.Screen>
        </Modal>
    );
};

FranchiseEditor.defaultProps = {
    franchise: null,
};

FranchiseEditor.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    franchise: PropTypes.object,
};

export default FranchiseEditor;
