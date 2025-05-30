import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useDeleteFranchise from 'hooks/graphql/mutations/deleteFranchise';
import Button from 'atoms/Button';
import OptionBar from 'molecules/OptionBar';
import FranchiseEditor from './Franchises/FranchiseEditor';
import Franchise from './Franchises/Franchise';

const Franchises = (props) => {
    const [franchiseEditorState, setFranchiseEditorState] = useState({ id: null, isOpen: false });
    const [expandedFranchise, setExpandedFranchise] = useState(null);
    const deleteFranchise = useDeleteFranchise();
    const franchises = props.franchises.toSorted((a, b) => a.name.localeCompare(b.name));

    const toggleExpandedFranchise = (id) => {
        setExpandedFranchise((previous) => (previous === id ? null : id));
    };

    const openFranchiseEditor = (id) => {
        setFranchiseEditorState({ id, isOpen: true });
    };

    const closeFranchiseEditor = () => {
        setFranchiseEditorState((previous) => ({ ...previous, isOpen: false }));
    };

    return (
        <>
            <OptionBar>
                <OptionBar.Group />

                <OptionBar.Group>
                    <OptionBar.Item>
                        <Button onClick={openFranchiseEditor}>
                            Add franchise
                        </Button>
                    </OptionBar.Item>
                </OptionBar.Group>
            </OptionBar>

            {franchises.map((franchise) => (
                <Franchise
                    games={props.games}
                    franchise={franchise}
                    toggleExpanded={toggleExpandedFranchise}
                    expanded={expandedFranchise === franchise.id}
                    openFranchiseEditor={openFranchiseEditor}
                    deleteFranchise={deleteFranchise}
                />
            ))}

            <FranchiseEditor
                open={franchiseEditorState.isOpen}
                franchise={props.franchises.find(({ id }) => id === franchiseEditorState.id)}
                onClose={closeFranchiseEditor}
            />
        </>
    );
};

Franchises.propTypes = {
    games: PropTypes.object.isRequired,
    franchises: PropTypes.array.isRequired,
};

export default Franchises;
