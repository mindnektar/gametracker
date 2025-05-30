import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useDeleteGenre from 'hooks/graphql/mutations/deleteGenre';
import Button from 'atoms/Button';
import OptionBar from 'molecules/OptionBar';
import GenreEditor from './Genres/GenreEditor';
import Genre from './Genres/Genre';

const Genres = (props) => {
    const [genreEditorState, setGenreEditorState] = useState({ id: null, isOpen: false });
    const [expandedGenre, setExpandedGenre] = useState(null);
    const deleteGenre = useDeleteGenre();
    const genres = props.genres.toSorted((a, b) => a.name.localeCompare(b.name));

    const toggleExpandedGenre = (id) => {
        setExpandedGenre((previous) => (previous === id ? null : id));
    };

    const openGenreEditor = (id) => {
        setGenreEditorState({ id, isOpen: true });
    };

    const closeGenreEditor = () => {
        setGenreEditorState((previous) => ({ ...previous, isOpen: false }));
    };

    return (
        <>
            <OptionBar>
                <OptionBar.Group />

                <OptionBar.Group>
                    <OptionBar.Item>
                        <Button onClick={openGenreEditor}>
                            Add genre
                        </Button>
                    </OptionBar.Item>
                </OptionBar.Group>
            </OptionBar>

            {genres.map((genre) => (
                <Genre
                    games={props.games}
                    genre={genre}
                    toggleExpanded={toggleExpandedGenre}
                    expanded={expandedGenre === genre.id}
                    openGenreEditor={openGenreEditor}
                    deleteGenre={deleteGenre}
                />
            ))}

            <GenreEditor
                open={genreEditorState.isOpen}
                genre={props.genres.find(({ id }) => id === genreEditorState.id)}
                onClose={closeGenreEditor}
            />
        </>
    );
};

Genres.propTypes = {
    games: PropTypes.object.isRequired,
    genres: PropTypes.array.isRequired,
};

export default Genres;
