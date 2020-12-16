import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import getYear from 'date-fns/getYear';
import useCreateGameMutation from 'hooks/graphql/mutations/createGame';
import useUpdateGameMutation from 'hooks/graphql/mutations/updateGame';
import useFetchGameDataMutation from 'hooks/graphql/mutations/fetchGameData';
import { systemOrder } from 'helpers/systems';
import { prepareValues } from 'helpers/form';
import Select from 'atoms/Select';
import TextField from 'atoms/TextField';
import Slider from 'atoms/Slider';
import Button from 'atoms/Button';
import TextArea from 'atoms/TextArea';
import Dialog from 'molecules/Dialog';
import Form, { FormItem } from 'molecules/Form';

const Editor = (props) => {
    const createGame = useCreateGameMutation();
    const updateGame = useUpdateGameMutation();
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
    const [loading, setLoading] = useState(false);
    const defaultState = {
        title: '',
        system: () => ({
            defaultValue: null,
            modify: (system) => (
                system
                    ? { value: system.id, label: system.name }
                    : null
            ),
        }),
        rating: 50,
        release: 2020,
        description: '',
        youTubeId: '',
        developer: () => ({
            defaultValue: null,
            modify: (developer) => (
                developer
                    ? { value: developer.id, label: developer.name }
                    : null
            ),
        }),
        compilation: () => ({
            defaultValue: null,
            modify: (compilation) => (
                compilation
                    ? { value: compilation.id, label: compilation.title }
                    : null
            ),
        }),
        genres: () => ({
            defaultValue: null,
            modify: (genres) => (
                genres
                    ? genres.map((genre) => ({ value: genre.id, label: genre.name }))
                    : null
            ),
        }),
    };
    const [state, setState] = useState(prepareValues(props.game, defaultState));
    const [errors, setErrors] = useState({});
    const validators = [{
        field: 'title',
        isValid: (value) => !!value.trim(),
        message: 'Please enter a title.',
    }, {
        field: 'system',
        isValid: (value) => !!value,
        message: 'Please select a system.',
    }, {
        field: 'description',
        isValid: (value) => !!value.trim(),
        message: 'Please enter a description.',
    }, {
        field: 'youTubeId',
        isValid: (value) => !!value.trim(),
        message: 'Please enter a YouTube ID.',
    }, {
        field: 'developer',
        isValid: (value) => !!value,
        message: 'Please select a developer.',
    }, {
        field: 'genres',
        isValid: (value) => value.length > 0,
        message: 'Please select at least one genre.',
    }];

    useEffect(() => {
        if (props.open) {
            setErrors({});
            setState(prepareValues(props.game, defaultState));
        }
    }, [props.open]);

    const changeValueHandler = (key) => (value) => {
        setState((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const formatSelectValue = (value) => {
        if (!value || value.value === '') {
            return null;
        }

        return value.__isNew__ ? { name: value.value } : { id: value.value };
    };

    const autoFillFields = async () => {
        const { data } = await fetchGameData({
            title: state.title.trim(),
            system: (
                allSystems.find(({ id }) => id === state.system.value)?.name
                || state.system.value
            ),
        });

        const developer = allDevelopers.find(({ name }) => name === data.fetchGameData.developer);

        setState((previous) => ({
            ...previous,
            description: data.fetchGameData.description,
            release: data.fetchGameData.release,
            youTubeId: data.fetchGameData.youTubeId,
            developer: developer
                ? { value: developer.id, label: developer.name }
                : { value: data.fetchGameData.developer, label: data.fetchGameData.developer, __isNew__: true },
            genres: data.fetchGameData.genres.map((genre) => {
                const existingGenre = allGenres.find(({ name }) => name === genre);

                return existingGenre
                    ? { value: existingGenre.id, label: existingGenre.name }
                    : { value: genre, label: genre, __isNew__: true };
            }),
        }));
    };

    const save = async () => {
        const foundErrors = validators.reduce((result, current) => {
            if (current.isValid(state[current.field])) {
                return result;
            }

            return {
                ...result,
                [current.field]: current.message,
            };
        }, {});

        if (Object.values(foundErrors).length > 0) {
            setErrors(foundErrors);
            return;
        }

        setLoading(true);

        const mutation = props.game ? updateGame : createGame;

        await mutation({
            id: props.game?.id,
            title: state.title.trim(),
            rating: state.rating,
            release: state.release,
            description: state.description.trim(),
            youTubeId: state.youTubeId.trim(),
            system: formatSelectValue(state.system),
            developer: formatSelectValue(state.developer),
            compilation: formatSelectValue(state.compilation),
            genres: state.genres.map(formatSelectValue),
            lists: [{ id: props.listId }],
            dlcs: [],
        });

        setLoading(false);
        props.onClose();
    };

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            onSave={save}
            title={props.game ? 'Edit game' : 'Add game'}
            loading={loading}
        >
            <Form>
                <FormItem
                    label="Title"
                    error={errors.title}
                >
                    <TextField
                        value={state.title}
                        onChange={changeValueHandler('title')}
                    />
                </FormItem>

                <FormItem
                    label="System"
                    error={errors.system}
                >
                    <Select
                        creatable
                        items={allSystems.map((system) => ({
                            value: system.id, label: system.name,
                        }))}
                        onChange={changeValueHandler('system')}
                        value={state.system}
                    />
                </FormItem>

                <FormItem label="Auto-fill fields">
                    <Button
                        onClick={autoFillFields}
                        disabled={!state.title.trim() || !state.system}
                    >
                        Auto-fill
                    </Button>
                </FormItem>

                <FormItem label="Compilation">
                    <Select
                        creatable
                        items={allCompilations.map((compilation) => ({
                            value: compilation.id, label: compilation.title,
                        }))}
                        onChange={changeValueHandler('compilation')}
                        value={state.compilation}
                    />
                </FormItem>

                <FormItem
                    label="Developer"
                    error={errors.developer}
                >
                    <Select
                        creatable
                        items={allDevelopers.map((developer) => ({
                            value: developer.id, label: developer.name,
                        }))}
                        onChange={changeValueHandler('developer')}
                        value={state.developer}
                    />
                </FormItem>

                <FormItem
                    label="Genres"
                    error={errors.genres}
                >
                    <Select
                        creatable
                        isMulti
                        items={allGenres.map((genre) => ({
                            value: genre.id, label: genre.name,
                        }))}
                        onChange={changeValueHandler('genres')}
                        value={state.genres}
                    />
                </FormItem>

                <FormItem label="Release">
                    <Slider
                        min={1980}
                        max={getYear(new Date())}
                        stepSize={1}
                        value={state.release}
                        onChange={changeValueHandler('release')}
                    />
                </FormItem>

                <FormItem
                    label="Description"
                    error={errors.description}
                >
                    <TextArea
                        value={state.description}
                        onChange={changeValueHandler('description')}
                    />
                </FormItem>

                <FormItem
                    label="YouTube ID"
                    error={errors.youTubeId}
                >
                    <TextField
                        value={state.youTubeId}
                        onChange={changeValueHandler('youTubeId')}
                    />
                </FormItem>

                <FormItem label="Rating">
                    <Slider
                        min={0}
                        max={100}
                        stepSize={5}
                        value={state.rating}
                        onChange={changeValueHandler('rating')}
                    />
                </FormItem>
            </Form>
        </Dialog>
    );
};

Editor.defaultProps = {
    game: null,
};

Editor.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    game: PropTypes.object,
    systems: PropTypes.array.isRequired,
    developers: PropTypes.array.isRequired,
    compilations: PropTypes.array.isRequired,
    genres: PropTypes.array.isRequired,
    listId: PropTypes.string.isRequired,
};

export default Editor;
