import React from 'react';
import PropTypes from 'prop-types';
import useCreateDlcMutation from 'hooks/graphql/mutations/createDlc';
import useUpdateDlcMutation from 'hooks/graphql/mutations/updateDlc';
import Modal from 'molecules/Modal';
import FormData from './DlcEditor/FormData';

const DlcEditor = (props) => {
    const createDlc = useCreateDlcMutation();
    const updateDlc = useUpdateDlcMutation();

    const save = async (values) => {
        const mutation = props.dlc ? updateDlc : createDlc;

        await mutation({
            id: props.dlc?.id,
            gameId: props.dlc ? undefined : props.gameId,
            title: values.title.trim(),
            rating: values.rating * 10,
            release: values.release * 1,
            description: values.description.trim(),
            youTubeId: values.youTubeId.trim(),
            timeToBeat: values.timeToBeat * 1,
            criticRating: values.criticRating * 10,
        });

        props.onClose();
    };

    return (
        <Modal
            close={props.onClose}
            formConfig={{
                title: '',
                aiInstructions: '',
                rating: {
                    _default: 5,
                    _modify: (value) => value / 10,
                },
                release: 2020,
                description: '',
                youTubeId: '',
                timeToBeat: 0,
                criticRating: {
                    _default: 0,
                    _modify: (value) => value / 10,
                },
            }}
            formSubject={props.dlc}
            isOpen={props.open}
            onConfirm={save}
        >
            <Modal.Screen headline={props.dlc ? 'Edit DLC' : 'Add DLC'}>
                <FormData gameId={props.gameId} />
            </Modal.Screen>
        </Modal>
    );
};

DlcEditor.defaultProps = {
    dlc: null,
};

DlcEditor.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    dlc: PropTypes.object,
    gameId: PropTypes.string.isRequired,
};

export default DlcEditor;
