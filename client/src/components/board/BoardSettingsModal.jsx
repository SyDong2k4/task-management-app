import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import boardService from '../../services/boardService';
import { Button } from '../common/Button';
import { toast } from 'react-toastify';

const BoardSettingsModal = ({ isOpen, onClose, board, onUpdated, onDelete }) => {
  const [title, setTitle] = useState(board?.title || '');
  const [description, setDescription] = useState(board?.description || '');
  const [background, setBackground] = useState(board?.background || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (board) {
      setTitle(board.title || '');
      setDescription(board.description || '');
      setBackground(board.background || '');
    }
  }, [board]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!board) return;
    setSaving(true);
    try {
      const updated = await boardService.updateBoard(board._id, {
        title,
        description,
        background,
      });
      onUpdated?.(updated);
      toast.success('Board settings updated');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update board');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!board) return;
    if (!window.confirm('Are you sure you want to delete this board? This cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      await boardService.deleteBoard(board._id);
      toast.success('Board deleted');
      onDelete?.();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete board');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Board settings">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/70"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/70 min-h-[80px]"
            placeholder="Optional description for this board"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Background color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={background || '#f8fafc'}
              onChange={(e) => setBackground(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-slate-300 dark:border-slate-600 p-0"
            />
            <input
              type="text"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="#f8fafc or css color"
              className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/70"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-600 hover:text-red-500 disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Delete board'}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <Button type="submit" disabled={saving} className="px-4 py-2 text-sm">
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default BoardSettingsModal;

