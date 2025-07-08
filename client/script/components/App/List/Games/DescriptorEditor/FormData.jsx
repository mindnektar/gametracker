import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import ModalContext from 'contexts/modal';
import descriptors from 'helpers/descriptors';
import useFetchDescriptorDataMutation from 'hooks/graphql/mutations/fetchDescriptorData';
import Button from 'atoms/Button';
import Form from 'molecules/Form';

const FormData = (props) => {
    const modal = useContext(ModalContext);
    const fetchDescriptorData = useFetchDescriptorDataMutation();

    const autoFillFields = async () => {
        modal.setLoading(true);
        modal.setErrorMessageHandler('title', null);

        try {
            const { data } = await fetchDescriptorData({ gameId: props.gameId });

            modal.setFormValue('atmosphere', data.fetchDescriptorData.atmosphere);
            modal.setFormValue('mood', data.fetchDescriptorData.mood);
            modal.setFormValue('pacing', data.fetchDescriptorData.pacing);
            modal.setFormValue('complexity', data.fetchDescriptorData.complexity);
            modal.setFormValue('playerAgency', data.fetchDescriptorData.playerAgency);
            modal.setFormValue('narrativeStructure', data.fetchDescriptorData.narrativeStructure);
            modal.setFormValue('challengeFocus', data.fetchDescriptorData.challengeFocus);
            modal.setFormValue('challengeIntensity', data.fetchDescriptorData.challengeIntensity);
        } catch (error) {
            modal.setErrorMessageHandler('title', error.message);
        }

        modal.setLoading(false);
    };

    return (
        <Form>
            <Form.Row label="Auto-fill fields">
                <Button onClick={autoFillFields}>
                    Auto-fill
                </Button>
            </Form.Row>

            {Object.entries(descriptors).map(([key, descriptor]) => (
                <Form.Row
                    key={key}
                    label={descriptor.label}
                >
                    <Form.Control name={key}>
                        <Form.Control.Slider
                            min={0}
                            max={4}
                            valueMap={descriptor.values}
                        />
                    </Form.Control>
                </Form.Row>
            ))}
        </Form>
    );
};

FormData.defaultProps = {
    gameId: null,
};

FormData.propTypes = {
    gameId: PropTypes.string,
};

export default FormData;
