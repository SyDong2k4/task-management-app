import React from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { FaTrash } from 'react-icons/fa';

const CommentItem = ({ comment, canEdit = true, onDelete }) => {
    const { user } = useAuth();
    const isAuthor = user && comment.author._id === user._id;

    return (
        <div className="flex gap-3 mb-4 group">
            <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {comment.author.avatar ? (
                        <img
                            src={comment.author.avatar}
                            alt={comment.author.username}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        comment.author.username.charAt(0).toUpperCase()
                    )}
                </div>
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-800 text-sm">
                        {comment.author.username}
                    </span>
                    <span className="text-xs text-slate-500">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                </div>
                <div className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {comment.content}
                </div>
            </div>
            {canEdit && isAuthor && (
                <button
                    onClick={() => onDelete(comment._id)}
                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1"
                    title="Delete comment"
                >
                    <FaTrash size={12} />
                </button>
            )}
        </div>
    );
};

export default CommentItem;
