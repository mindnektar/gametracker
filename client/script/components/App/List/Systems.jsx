import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useDeleteSystem from 'hooks/graphql/mutations/deleteSystem';
import useUpdateSystemOrder from 'hooks/graphql/mutations/updateSystemOrder';
import Button from 'atoms/Button';
import OptionBar from 'molecules/OptionBar';
import Sortable from 'Sortable';
import SystemEditor from './Systems/SystemEditor';
import System from './Systems/System';

const Systems = (props) => {
    const [systemEditorState, setSystemEditorState] = useState({ id: null, isOpen: false });
    const [expandedSystem, setExpandedSystem] = useState(null);
    const deleteSystem = useDeleteSystem();
    const updateSystemOrder = useUpdateSystemOrder();
    const systems = props.systems.toSorted((a, b) => a.order - b.order);

    const toggleExpandedSystem = (id) => {
        setExpandedSystem((previous) => (previous === id ? null : id));
    };

    const openSystemEditor = (id) => {
        setSystemEditorState({ id, isOpen: true });
    };

    const closeSystemEditor = () => {
        setSystemEditorState((previous) => ({ ...previous, isOpen: false }));
    };

    const onSort = (newIndex, oldIndex) => {
        const nextSystems = [...systems];

        nextSystems.splice(newIndex, 0, nextSystems.splice(oldIndex, 1)[0]);

        updateSystemOrder(
            { id: systems[oldIndex].id, order: newIndex },
            nextSystems.map((system, index) => ({
                ...system,
                order: index,
            })),
        );
    };

    return (
        <>
            <OptionBar>
                <OptionBar.Group />

                <OptionBar.Group>
                    <OptionBar.Item>
                        <Button onClick={openSystemEditor}>
                            Add system
                        </Button>
                    </OptionBar.Item>
                </OptionBar.Group>
            </OptionBar>

            <Sortable onChange={onSort}>
                {systems.map((system, index) => (
                    <Sortable.Item
                        key={system.id}
                        index={index}
                    >
                        <System
                            games={props.games}
                            system={system}
                            toggleExpanded={toggleExpandedSystem}
                            expanded={expandedSystem === system.id}
                            openSystemEditor={openSystemEditor}
                            deleteSystem={deleteSystem}
                        />
                    </Sortable.Item>
                ))}
            </Sortable>

            <SystemEditor
                open={systemEditorState.isOpen}
                system={props.systems.find(({ id }) => id === systemEditorState.id)}
                onClose={closeSystemEditor}
            />
        </>
    );
};

Systems.propTypes = {
    games: PropTypes.object.isRequired,
    systems: PropTypes.array.isRequired,
};

export default Systems;
