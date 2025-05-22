import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import getYear from 'date-fns/getYear';
import ModalContext from 'contexts/modal';
import validate from 'helpers/validate';
import useFetchDlcData from 'hooks/graphql/mutations/fetchDlcData';
import useLocalStorage from 'hooks/useLocalStorage';
import Button from 'atoms/Button';
import Select from 'atoms/Select';
import Form from 'molecules/Form';

const autofillOptions = [
    { value: 'description', label: 'Description' },
    { value: 'release', label: 'Release' },
    { value: 'timeToBeat', label: 'Time to beat' },
    { value: 'youTubeId', label: 'YouTube ID' },
    { value: 'criticRating', label: 'Critic rating' },
];

const FormData = (props) => {
    const [autoFillTypes, setAutoFillTypes] = useLocalStorage('autoFillTypesDlc', autofillOptions.map(({ value }) => value));
    const modal = useContext(ModalContext);
    const fetchDlcData = useFetchDlcData();

    const autoFillFields = async () => {
        modal.setLoading(true);
        modal.setErrorMessageHandler('title', null);

        try {
            const { data } = await fetchDlcData({
                title: modal.formValues.title.trim(),
                gameId: props.gameId,
                aiInstructions: modal.formValues.aiInstructions.trim(),
                types: autoFillTypes,
            });

            if (autoFillTypes.includes('description')) {
                modal.setFormValue('description', data.fetchDlcData.description);
            }

            if (autoFillTypes.includes('release')) {
                modal.setFormValue('release', data.fetchDlcData.release);
            }

            if (autoFillTypes.includes('timeToBeat')) {
                modal.setFormValue('timeToBeat', data.fetchDlcData.timeToBeat);
            }

            if (autoFillTypes.includes('youTubeId')) {
                modal.setFormValue('youTubeId', data.fetchDlcData.youTubeId);
            }

            if (autoFillTypes.includes('criticRating')) {
                modal.setFormValue('criticRating', data.fetchDlcData.criticRating / 10);
            }
        } catch (error) {
            modal.setErrorMessageHandler('title', error.message);
        }

        modal.setLoading(false);
    };

    return (
        <Form>
            <Form.Row label="Title" required>
                <Form.Control
                    name="title"
                    validators={[{
                        isValid: validate.required(),
                        message: 'Please enter a title.',
                    }]}
                >
                    <Form.Control.TextField />
                </Form.Control>
            </Form.Row>

            <Form.Row label="AI instructions">
                <Form.Control name="aiInstructions">
                    <Form.Control.TextField />
                </Form.Control>
            </Form.Row>

            <Form.Row label="Auto-fill fields">
                <Button
                    onClick={autoFillFields}
                    disabled={!modal.formValues.title.trim()}
                >
                    Auto-fill
                </Button>

                <Select
                    multiple
                    options={autofillOptions}
                    value={autoFillTypes}
                    onChange={setAutoFillTypes}
                />
            </Form.Row>

            <Form.Row label="Release" required>
                <Form.Control name="release">
                    <Form.Control.Slider
                        min={1980}
                        max={getYear(new Date())}
                        stepSize={1}
                    />
                </Form.Control>
            </Form.Row>

            <Form.Row label="Description" required>
                <Form.Control
                    name="description"
                    validators={[{
                        isValid: validate.required(),
                        message: 'Please enter a description.',
                    }]}
                >
                    <Form.Control.TextArea />
                </Form.Control>
            </Form.Row>

            <Form.Row label="YouTube ID" required>
                <Form.Control
                    name="youTubeId"
                    validators={[{
                        isValid: validate.required(),
                        message: 'Please enter a YouTube ID.',
                    }]}
                >
                    <Form.Control.TextField />
                </Form.Control>
            </Form.Row>

            <Form.Row label="Time to beat">
                <Form.Control name="timeToBeat">
                    <Form.Control.Slider
                        min={0}
                        max={100}
                        stepSize={0.5}
                    />
                </Form.Control>
            </Form.Row>

            <Form.Row label="Critic rating">
                <Form.Control name="criticRating">
                    <Form.Control.Slider
                        min={0}
                        max={10}
                        stepSize={0.1}
                    />
                </Form.Control>
            </Form.Row>

            <Form.Row label="Personal rating" required>
                <Form.Control name="rating">
                    <Form.Control.Slider
                        min={0}
                        max={10}
                        stepSize={0.5}
                    />
                </Form.Control>
            </Form.Row>
        </Form>
    );
};

FormData.propTypes = {
    gameId: PropTypes.string.isRequired,
};

export default FormData;
