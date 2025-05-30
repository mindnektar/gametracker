import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useDeleteCompilation from 'hooks/graphql/mutations/deleteCompilation';
import Button from 'atoms/Button';
import OptionBar from 'molecules/OptionBar';
import CompilationEditor from './Compilations/CompilationEditor';
import Compilation from './Compilations/Compilation';

const Compilations = (props) => {
    const [compilationEditorState, setCompilationEditorState] = useState({ id: null, isOpen: false });
    const [expandedCompilation, setExpandedCompilation] = useState(null);
    const deleteCompilation = useDeleteCompilation();
    const compilations = props.compilations.toSorted((a, b) => a.title.localeCompare(b.title));

    const toggleExpandedCompilation = (id) => {
        setExpandedCompilation((previous) => (previous === id ? null : id));
    };

    const openCompilationEditor = (id) => {
        setCompilationEditorState({ id, isOpen: true });
    };

    const closeCompilationEditor = () => {
        setCompilationEditorState((previous) => ({ ...previous, isOpen: false }));
    };

    return (
        <>
            <OptionBar>
                <OptionBar.Group />

                <OptionBar.Group>
                    <OptionBar.Item>
                        <Button onClick={openCompilationEditor}>
                            Add compilation
                        </Button>
                    </OptionBar.Item>
                </OptionBar.Group>
            </OptionBar>

            {compilations.map((compilation) => (
                <Compilation
                    games={props.games}
                    compilation={compilation}
                    toggleExpanded={toggleExpandedCompilation}
                    expanded={expandedCompilation === compilation.id}
                    openCompilationEditor={openCompilationEditor}
                    deleteCompilation={deleteCompilation}
                />
            ))}

            <CompilationEditor
                open={compilationEditorState.isOpen}
                compilation={props.compilations.find(({ id }) => id === compilationEditorState.id)}
                onClose={closeCompilationEditor}
            />
        </>
    );
};

Compilations.propTypes = {
    games: PropTypes.object.isRequired,
    compilations: PropTypes.array.isRequired,
};

export default Compilations;
