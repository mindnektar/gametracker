import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import getYear from 'date-fns/getYear';
import ModalContext from 'contexts/modal';
import validate from 'helpers/validate';
import statusMap from 'helpers/statusMap';
import { systemOrder } from 'helpers/systems';
import useFetchGameDataMutation from 'hooks/graphql/mutations/fetchGameData';
import Button from 'atoms/Button';
import Form from 'molecules/Form';

const FormData = (props) => {
    const modal = useContext(ModalContext);
    const fetchGameData = useFetchGameDataMutation();
    const allSystems = [...props.systems].sort((a, b) => (
        systemOrder.indexOf(a.name) - systemOrder.indexOf(b.name)
    ));
    const allDevelopers = [...props.developers].sort((a, b) => (
        a.name.localeCompare(b.name)
    ));
    const allCompilations = [...props.compilations].sort((a, b) => (
        a.title.localeCompare(b.title)
    ));
    const allGenres = [...props.genres].sort((a, b) => (
        a.name.localeCompare(b.name)
    ));

    const autoFillFields = async () => {
        modal.setLoading(true);
        modal.setErrorMessageHandler('title', null);

        try {
            const { data } = await fetchGameData({
                title: modal.formValues.title.trim(),
                system: allSystems.find(({ id }) => id === modal.formValues.system.value)?.name || modal.formValues.system.value,
                aiInstructions: modal.formValues.aiInstructions.trim(),
            });

            const developer = allDevelopers.find(({ name }) => name === data.fetchGameData.developer);

            modal.setFormValue('description', data.fetchGameData.description);
            modal.setFormValue('release', data.fetchGameData.release);
            modal.setFormValue('youTubeId', data.fetchGameData.youTubeId);
            modal.setFormValue('developer', developer ? {
                value: developer.id,
                label: developer.name,
            } : {
                value: data.fetchGameData.developer,
                label: data.fetchGameData.developer,
                __isNew__: true,
            });
            modal.setFormValue('genres', data.fetchGameData.genres.map((genre) => {
                const existingGenre = allGenres.find(({ name }) => name === genre);

                return existingGenre
                    ? { value: existingGenre.id, label: existingGenre.name }
                    : { value: genre, label: genre, __isNew__: true };
            }));
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

            <Form.Row label="System" required>
                <Form.Control
                    name="system"
                    validators={[{
                        isValid: validate.required(),
                        message: 'Please select a system.',
                    }]}
                >
                    <Form.Control.Select
                        clearable
                        options={allSystems.map((system) => ({
                            value: system.id, label: system.name,
                        }))}
                        withCustom
                    />
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
                    disabled={!modal.formValues.title.trim() || !modal.formValues.system}
                >
                    Auto-fill
                </Button>
            </Form.Row>

            <Form.Row label="Compilation">
                <Form.Control name="compilation">
                    <Form.Control.Select
                        clearable
                        options={allCompilations.map((compilation) => ({
                            value: compilation.id, label: compilation.title,
                        }))}
                        withCustom
                    />
                </Form.Control>
            </Form.Row>

            <Form.Row label="Developer" required>
                <Form.Control
                    name="developer"
                    validators={[{
                        isValid: validate.required(),
                        message: 'Please select a developer.',
                    }]}
                >
                    <Form.Control.Select
                        clearable
                        options={allDevelopers.map((developer) => ({
                            value: developer.id, label: developer.name,
                        }))}
                        withCustom
                    />
                </Form.Control>
            </Form.Row>

            <Form.Row label="Genres" required>
                <Form.Control
                    name="genres"
                    validators={[{
                        isValid: validate.required(),
                        message: 'Please select a developer.',
                    }]}
                >
                    <Form.Control.Select
                        clearable
                        multiple
                        options={allGenres.map((genre) => ({
                            value: genre.id, label: genre.name,
                        }))}
                        withCustom
                    />
                </Form.Control>
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

            <Form.Row label="Status" required>
                <Form.Control name="status">
                    <Form.Control.Select
                        options={Object.entries(statusMap).map(([value, label]) => ({
                            value, label,
                        }))}
                    />
                </Form.Control>
            </Form.Row>

            {modal.formValues.status === 'completed' && (
                <Form.Row label="Rating" required>
                    <Form.Control name="rating">
                        <Form.Control.Slider
                            min={0}
                            max={10}
                            stepSize={0.5}
                        />
                    </Form.Control>
                </Form.Row>
            )}
        </Form>
    );
};

FormData.propTypes = {
    developers: PropTypes.array.isRequired,
    genres: PropTypes.array.isRequired,
    systems: PropTypes.array.isRequired,
    compilations: PropTypes.array.isRequired,
};

export default FormData;
