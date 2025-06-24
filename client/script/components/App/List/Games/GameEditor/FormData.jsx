import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import getYear from 'date-fns/getYear';
import ModalContext from 'contexts/modal';
import validate from 'helpers/validate';
import statusMap from 'helpers/statusMap';
import countries from 'helpers/countries';
import useFetchGameDataMutation from 'hooks/graphql/mutations/fetchGameData';
import useLocalStorage from 'hooks/useLocalStorage';
import Button from 'atoms/Button';
import Genre from 'atoms/Genre';
import Select from 'atoms/Select';
import Flag from 'atoms/Flag';
import Form from 'molecules/Form';

const autofillOptions = [
    { value: 'description', label: 'Description' },
    { value: 'developer', label: 'Developer' },
    { value: 'country', label: 'Country' },
    { value: 'franchise', label: 'Franchise' },
    { value: 'genres', label: 'Genres' },
    { value: 'release', label: 'Release' },
    { value: 'timeToBeat', label: 'Time to beat' },
    { value: 'youTubeId', label: 'YouTube ID' },
    { value: 'criticRating', label: 'Critic rating' },
];

const FormData = (props) => {
    const [autoFillTypes, setAutoFillTypes] = useLocalStorage('autoFillTypes', autofillOptions.map(({ value }) => value));
    const modal = useContext(ModalContext);
    const fetchGameData = useFetchGameDataMutation();
    const allSystems = [...props.systems].sort((a, b) => (
        a.order - b.order
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
    const allFranchises = [...props.franchises].sort((a, b) => (
        a.name.localeCompare(b.name)
    ));

    const autoFillFields = async () => {
        modal.setLoading(true);
        modal.setErrorMessageHandler('title', null);

        try {
            const { data } = await fetchGameData({
                title: modal.formValues.title.trim(),
                system: allSystems.find(({ id }) => id === modal.formValues.system)?.name || modal.formValues.system,
                compilation: allCompilations.find(({ id }) => id === modal.formValues.compilation)?.title || modal.formValues.compilation,
                aiInstructions: modal.formValues.aiInstructions.trim(),
                types: autoFillTypes,
            });

            const developer = allDevelopers.find(({ name }) => name === data.fetchGameData.developer);
            const franchise = allFranchises.find(({ name }) => name === data.fetchGameData.franchise);
            const country = countries.find(({ name }) => name === data.fetchGameData.country)?.code;

            if (autoFillTypes.includes('description')) {
                modal.setFormValue('description', data.fetchGameData.description);
            }

            if (autoFillTypes.includes('release')) {
                modal.setFormValue('release', data.fetchGameData.release);
            }

            if (autoFillTypes.includes('timeToBeat')) {
                modal.setFormValue('timeToBeat', data.fetchGameData.timeToBeat);
            }

            if (autoFillTypes.includes('youTubeId')) {
                modal.setFormValue('youTubeId', data.fetchGameData.youTubeId);
            }

            if (autoFillTypes.includes('developer')) {
                modal.setFormValue('developer', developer ? developer.id : data.fetchGameData.developer);
            }

            if (autoFillTypes.includes('country')) {
                modal.setFormValue('country', country);
            }

            if (autoFillTypes.includes('franchise')) {
                modal.setFormValue('franchises', [franchise ? franchise.id : data.fetchGameData.franchise]);
            }

            if (autoFillTypes.includes('criticRating')) {
                modal.setFormValue('criticRating', data.fetchGameData.criticRating / 10);
            }

            if (autoFillTypes.includes('genres')) {
                modal.setFormValue('genres', data.fetchGameData.genres.map((genre) => {
                    const existingGenre = allGenres.find(({ name }) => name === genre);

                    return existingGenre?.id || genre;
                }));
            }
        } catch (error) {
            modal.setErrorMessageHandler('title')(error.message);
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
                    <Form.Control.TextField onSubmit={autoFillFields} />
                </Form.Control>
            </Form.Row>

            <Form.Row label="Auto-fill fields">
                <Button
                    onClick={autoFillFields}
                    disabled={!modal.formValues.title.trim() || !modal.formValues.system}
                >
                    Auto-fill
                </Button>

                <Select
                    clearable
                    multiple
                    options={autofillOptions}
                    value={autoFillTypes}
                    onChange={setAutoFillTypes}
                />
            </Form.Row>

            <Form.Row label="Franchises">
                <Form.Control name="franchises">
                    <Form.Control.Select
                        clearable
                        multiple
                        options={allFranchises.map((franchise) => ({
                            value: franchise.id, label: franchise.name,
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

            <Form.Row label="Country">
                <Form.Control name="country">
                    <Form.Control.Select
                        clearable
                        options={countries.map((country) => ({
                            value: country.code,
                            label: country.name,
                            image: <Flag code={country.code} />,
                        }))}
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
                        decorator={(label) => (
                            <Genre name={label} />
                        )}
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

            <Form.Row label="Status" required>
                <Form.Control name="status">
                    <Form.Control.Select
                        options={Object.entries(statusMap).map(([value, status]) => ({
                            value,
                            ...status,
                        }))}
                    />
                </Form.Control>
            </Form.Row>

            {modal.formValues.status === 'completed' && (
                <Form.Row label="Personal rating" required>
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
    franchises: PropTypes.array.isRequired,
};

export default FormData;
