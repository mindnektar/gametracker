import React from 'react';
import PropTypes from 'prop-types';
import useUpdateGameMutation from 'hooks/graphql/mutations/updateGame';
import Modal from 'molecules/Modal';
import FormData from './DescriptorEditor/FormData';

const DescriptorEditor = (props) => {
    const updateGame = useUpdateGameMutation();

    const save = async (values) => {
        await updateGame({
            id: props.game.id,
            atmosphere: values.atmosphere * 1,
            mood: values.mood * 1,
            pacing: values.pacing * 1,
            complexity: values.complexity * 1,
            playerAgency: values.playerAgency * 1,
            narrativeStructure: values.narrativeStructure * 1,
            challengeFocus: values.challengeFocus * 1,
            challengeIntensity: values.challengeIntensity * 1,
        });

        props.onClose();
    };

    return (
        <Modal
            close={props.onClose}
            formConfig={{
                atmosphere: 2,
                mood: 2,
                pacing: 2,
                complexity: 2,
                playerAgency: 2,
                narrativeStructure: 2,
                challengeFocus: 2,
                challengeIntensity: 2,
            }}
            formSubject={props.game}
            isOpen={props.open}
            onConfirm={save}
        >
            <Modal.Screen headline="Edit descriptors">
                <FormData gameId={props.game?.id} />
            </Modal.Screen>
        </Modal>
    );
};

DescriptorEditor.defaultProps = {
    game: null,
};

DescriptorEditor.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    game: PropTypes.object,
};

export default DescriptorEditor;
