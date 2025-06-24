import React from 'react';
import PropTypes from 'prop-types';
import useCreateGameMutation from 'hooks/graphql/mutations/createGame';
import useUpdateGameMutation from 'hooks/graphql/mutations/updateGame';
import Modal from 'molecules/Modal';
import FormData from './GameEditor/FormData';

const GameEditor = (props) => {
    const createGame = useCreateGameMutation();
    const updateGame = useUpdateGameMutation();

    const formatSelectValue = (value, options, key = 'name') => {
        if (!value || value === '') {
            return null;
        }

        const hasOption = options.some((item) => item.id === value);

        return hasOption ? { id: value } : { [key]: value };
    };

    const save = async (values) => {
        const mutation = props.game ? updateGame : createGame;

        await mutation({
            id: props.game?.id,
            title: values.title.trim(),
            rating: values.rating * 10,
            release: values.release * 1,
            description: values.description.trim(),
            youTubeId: values.youTubeId.trim(),
            status: values.status,
            timeToBeat: values.timeToBeat * 1,
            criticRating: values.criticRating * 10,
            country: values.country,
            system: formatSelectValue(values.system, props.systems),
            developer: formatSelectValue(values.developer, props.developers),
            compilation: formatSelectValue(values.compilation, props.compilations, 'title'),
            genres: values.genres.map((genre) => formatSelectValue(genre, props.genres)),
            franchises: values.franchises.map((franchise) => formatSelectValue(franchise, props.franchises)),
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
                status: 'planned',
                timeToBeat: 0,
                criticRating: {
                    _default: 0,
                    _modify: (value) => value / 10,
                },
                system: {
                    _default: null,
                    _modify: (value) => value.id,
                },
                developer: {
                    _default: null,
                    _modify: (value) => value.id,
                },
                compilation: {
                    _default: null,
                    _modify: (value) => value.id,
                },
                genres: {
                    _default: [],
                    _map: (value) => value.id,
                },
                franchises: {
                    _default: [],
                    _map: (value) => value.id,
                },
                country: null,
            }}
            formSubject={props.game}
            isOpen={props.open}
            onConfirm={save}
        >
            <Modal.Screen headline={props.game ? 'Edit game' : 'Add game'}>
                <FormData
                    developers={props.developers}
                    genres={props.genres}
                    systems={props.systems}
                    compilations={props.compilations}
                    franchises={props.franchises}
                />
            </Modal.Screen>
        </Modal>
    );
};

GameEditor.defaultProps = {
    game: null,
};

GameEditor.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    game: PropTypes.object,
    systems: PropTypes.array.isRequired,
    developers: PropTypes.array.isRequired,
    compilations: PropTypes.array.isRequired,
    genres: PropTypes.array.isRequired,
    franchises: PropTypes.array.isRequired,
};

export default GameEditor;
