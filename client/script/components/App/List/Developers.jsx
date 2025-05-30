import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useDeleteDeveloper from 'hooks/graphql/mutations/deleteDeveloper';
import Button from 'atoms/Button';
import OptionBar from 'molecules/OptionBar';
import DeveloperEditor from './Developers/DeveloperEditor';
import Developer from './Developers/Developer';

const Developers = (props) => {
    const [developerEditorState, setDeveloperEditorState] = useState({ id: null, isOpen: false });
    const [expandedDeveloper, setExpandedDeveloper] = useState(null);
    const deleteDeveloper = useDeleteDeveloper();
    const developers = props.developers.toSorted((a, b) => a.name.localeCompare(b.name));

    const toggleExpandedDeveloper = (id) => {
        setExpandedDeveloper((previous) => (previous === id ? null : id));
    };

    const openDeveloperEditor = (id) => {
        setDeveloperEditorState({ id, isOpen: true });
    };

    const closeDeveloperEditor = () => {
        setDeveloperEditorState((previous) => ({ ...previous, isOpen: false }));
    };

    return (
        <>
            <OptionBar>
                <OptionBar.Group />

                <OptionBar.Group>
                    <OptionBar.Item>
                        <Button onClick={openDeveloperEditor}>
                            Add developer
                        </Button>
                    </OptionBar.Item>
                </OptionBar.Group>
            </OptionBar>

            {developers.map((developer) => (
                <Developer
                    games={props.games}
                    developer={developer}
                    toggleExpanded={toggleExpandedDeveloper}
                    expanded={expandedDeveloper === developer.id}
                    openDeveloperEditor={openDeveloperEditor}
                    deleteDeveloper={deleteDeveloper}
                />
            ))}

            <DeveloperEditor
                open={developerEditorState.isOpen}
                developer={props.developers.find(({ id }) => id === developerEditorState.id)}
                onClose={closeDeveloperEditor}
            />
        </>
    );
};

Developers.propTypes = {
    games: PropTypes.object.isRequired,
    developers: PropTypes.array.isRequired,
};

export default Developers;
