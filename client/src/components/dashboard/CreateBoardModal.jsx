import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Input, InputGroup, Label } from '../common/Input';
import { Button } from '../common/Button';
import boardService from '../../services/boardService';

const CreateBoardModal = ({ isOpen, onClose, onBoardCreated }) => {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newBoard = await boardService.createBoard({ title });
            onBoardCreated(newBoard);
            setTitle('');
            onClose();
        } catch (error) {
            console.error("Failed to create board", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Board">
            <form onSubmit={handleSubmit}>
                <InputGroup>
                    <Label>Board Title</Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Marketing Campaign"
                        autoFocus
                        required
                    />
                </InputGroup>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                    <Button type="button" onClick={onClose} style={{ background: 'transparent', color: '#64748b', boxShadow: 'none' }}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={!title || loading}>
                        {loading ? 'Creating...' : 'Create Board'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateBoardModal;
