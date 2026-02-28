import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaTrash, FaAlignLeft, FaList, FaUser } from 'react-icons/fa';
import boardService from '../../services/boardService';
import CommentItem from './CommentItem';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const CardDetailModal = ({ card, canEdit = true, onClose, onDelete, onUpdate }) => {
    const { user } = useAuth();
    const socket = useSocket();
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || '');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    // Focus refs
    const titleInputRef = useRef(null);
    const descInputRef = useRef(null);

    // Fetch comments on mount
    useEffect(() => {
        const fetchComments = async () => {
            setIsLoadingComments(true);
            try {
                const data = await boardService.getComments(card._id);
                setComments(data);
            } catch (error) {
                console.error("Failed to load comments", error);
            } finally {
                setIsLoadingComments(false);
            }
        };

        fetchComments();
    }, [card._id]);

    // Socket listeners for comments
    useEffect(() => {
        if (!socket) return;

        const handleCommentAdded = (comment) => {
            if (comment.cardId?.toString() === card._id?.toString()) {
                setComments((prev) => [comment, ...prev]);
            }
        };

        const handleCommentDeleted = (commentId) => {
            setComments((prev) => prev.filter((c) => c._id !== commentId));
        };

        socket.on('comment:added', handleCommentAdded);
        socket.on('comment:deleted', handleCommentDeleted);

        return () => {
            socket.off('comment:added', handleCommentAdded);
            socket.off('comment:deleted', handleCommentDeleted);
        };
    }, [socket, card._id]);


    // Auto-focus logic
    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isEditingTitle]);

    useEffect(() => {
        if (isEditingDesc && descInputRef.current) {
            descInputRef.current.focus();
        }
    }, [isEditingDesc]);


    // Handlers
    const handleTitleSave = async () => {
        if (title !== card.title) {
            try {
                await onUpdate(card._id, { title });
            } catch (err) {
                console.error(err);
                setTitle(card.title); // Revert on error
            }
        }
        setIsEditingTitle(false);
    };

    const handleDescSave = async () => {
        if (description !== card.description) {
            try {
                await onUpdate(card._id, { description });
            } catch (err) {
                console.error(err);
                setDescription(card.description || '');
            }
        }
        setIsEditingDesc(false);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await boardService.addComment(card._id, newComment);
            setNewComment('');
        } catch (error) {
            console.error("Failed to add comment", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm("Delete this comment?")) {
            try {
                await boardService.deleteComment(commentId);
            } catch (error) {
                console.error("Failed to delete comment", error);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {/* Header / Title */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className="mt-1 text-slate-500">
                            <FaAlignLeft size={20} /> {/* Icon placeholder for Card */}
                        </div>
                        <div className="flex-1">
                            {canEdit && isEditingTitle ? (
                                <input
                                    ref={titleInputRef}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={handleTitleSave}
                                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                                    className="w-full text-xl font-bold text-slate-800 border-2 border-indigo-500 rounded px-2 py-1 focus:outline-none"
                                />
                            ) : (
                                <h2
                                    onClick={() => canEdit && setIsEditingTitle(true)}
                                    className={`text-xl font-bold text-slate-800 rounded px-2 py-1 -ml-2 ${canEdit ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                                >
                                    {title}
                                </h2>
                            )}
                            <div className="text-sm text-slate-500 px-2 mt-1">
                                in column <span className="font-medium underline decoration-dotted">{card.columnTitle}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Description */}
                    <div className="flex items-start gap-4 mb-8">
                        <div className="mt-1 text-slate-500">
                            <FaAlignLeft size={18} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
                            {canEdit && isEditingDesc ? (
                                <div className="space-y-2">
                                    <textarea
                                        ref={descInputRef}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full border border-slate-300 rounded-md p-3 min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Add a more detailed description..."
                                    />
                                    <div className="flex gap-2">
                                        <Button onClick={handleDescSave} size="sm">Save</Button>
                                        <button
                                            onClick={() => {
                                                setIsEditingDesc(false);
                                                setDescription(card.description || '');
                                            }}
                                            className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => canEdit && setIsEditingDesc(true)}
                                    className={`min-h-[60px] p-3 rounded ${description ? 'text-slate-700' : 'text-slate-400 italic bg-slate-50'} ${canEdit ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                                >
                                    {description || (canEdit ? "Add a more detailed description..." : '')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="flex items-start gap-4">
                        <div className="mt-1 text-slate-500">
                            <FaList size={18} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-slate-700 mb-4">Activity</h3>

                            {/* Add Comment - only for member/admin */}
                            {canEdit && (
                            <div className="flex gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        user?.username?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1">
                                    <form onSubmit={handleAddComment}>
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            className="w-full border border-slate-300 rounded-md p-3 min-h-[50px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-2"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAddComment(e);
                                                }
                                            }}
                                        />
                                        {newComment.trim() && (
                                            <Button
                                                type="submit"
                                                className="px-3 py-1.5 text-sm mt-1"
                                                disabled={!newComment.trim()}
                                            >
                                                Comment
                                            </Button>
                                        )}
                                    </form>
                                </div>
                            </div>
                            )}

                            {/* Comment List */}
                            <div className="space-y-1">
                                {isLoadingComments ? (
                                    <div className="text-slate-400 text-sm text-center py-4">Loading comments...</div>
                                ) : comments.length > 0 ? (
                                    comments.map(comment => (
                                        <CommentItem
                                            key={comment._id}
                                            comment={comment}
                                            canEdit={canEdit}
                                            onDelete={handleDeleteComment}
                                        />
                                    ))
                                ) : (
                                    <div className="text-slate-400 text-sm italic">No comments yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-48 bg-slate-50 p-4 border-l border-slate-200">
                    {canEdit && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Actions</h4>
                        <button
                            onClick={onDelete}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 bg-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-700 rounded transition-colors text-sm"
                        >
                            <FaTrash size={14} /> Delete Card
                        </button>
                    </div>
                    )}

                    {/* Add more sidebar items here later: Members, Labels, Dates */}
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Add to card</h4>
                        <button className="w-full text-left flex items-center gap-2 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors text-sm mb-2">
                            <FaUser size={14} /> Members
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardDetailModal;
