import React from 'react';
import PropTypes from 'prop-types';
import useCreateGenreMutation from 'hooks/graphql/mutations/createGenre';
import useUpdateGenreMutation from 'hooks/graphql/mutations/updateGenre';
import Modal from 'molecules/Modal';
import FormData from './GenreEditor/FormData';

const GenreEditor = (props) => {
    const createGenre = useCreateGenreMutation();
    const updateGenre = useUpdateGenreMutation();

    const save = async (values) => {
        const mutation = props.genre ? updateGenre : createGenre;

        await mutation({
            id: props.genre?.id,
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
            formSubject={props.genre}
            isOpen={props.open}
            onConfirm={save}
        >
            <Modal.Screen headline={props.genre ? 'Edit genre' : 'Add genre'}>
                <FormData />
            </Modal.Screen>
        </Modal>
    );
};

GenreEditor.defaultProps = {
    genre: null,
};

GenreEditor.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    genre: PropTypes.object,
};

export default GenreEditor;
