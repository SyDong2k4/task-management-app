import React, { useEffect, useMemo, useState } from 'react';
import { FaUserPlus, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import boardService from '../../services/boardService';
import { toast } from 'react-toastify';

const ROLES = [
  { value: 'member', label: 'Member' },
  { value: 'observer', label: 'Observer' },
  { value: 'admin', label: 'Admin' },
];

const BoardMembers = ({ board, onMembersChange }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteRole, setInviteRole] = useState('member');

  const isAdmin = useMemo(
    () => board?.currentUserRole === 'admin',
    [board?.currentUserRole]
  );

  const members = board?.members || [];

  const existingIds = useMemo(
    () => new Set(members.map((m) => m._id).concat(board?.owner?._id ? [board.owner._id] : [])),
    [members, board?.owner]
  );

  useEffect(() => {
    let active = true;
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const users = await userService.searchUsers(query.trim());
        if (!active) return;
        setResults(users.filter((u) => !existingIds.has(u._id)));
      } catch (err) {
        console.error(err);
        if (active) toast.error('Failed to search users');
      } finally {
        active && setLoading(false);
      }
    };

    const timeout = setTimeout(search, 300);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query, existingIds]);

  const handleInvite = async (targetUser, role = 'member') => {
    try {
      const updatedMembers = await boardService.addMember(board._id, targetUser._id, role);
      onMembersChange?.(updatedMembers);
      toast.success(`Invited ${targetUser.username} as ${role}`);
      setQuery('');
      setResults([]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      const updatedMembers = await boardService.updateMemberRole(board._id, memberId, newRole);
      onMembersChange?.(updatedMembers);
      toast.success('Role updated');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Remove this member from the board?')) return;
    try {
      const updatedMembers = await boardService.removeMember(board._id, memberId);
      onMembersChange?.(updatedMembers);
      toast.success('Member removed');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {members.slice(0, 4).map((m) => (
          <div
            key={m._id}
            className="relative group w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold"
            title={`${m.username}${m.role ? ` (${m.role})` : ''}`}
          >
            {m.avatar ? (
              <img
                src={m.avatar}
                alt={m.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              m.username?.charAt(0).toUpperCase()
            )}
            {isAdmin && m._id !== board.owner?._id && (
              <button
                onClick={() => handleRemove(m._id)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100"
              >
                <FaTimes />
              </button>
            )}
          </div>
        ))}
        {members.length > 4 && (
          <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold">
            +{members.length - 4}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="relative">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FaUserPlus size={10} />
            Invite
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-500">Add as:</span>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email"
                className="w-full mb-2 px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              <div className="max-h-48 overflow-y-auto">
                {loading ? (
                  <div className="text-xs text-slate-500 text-center py-2">Searching...</div>
                ) : results.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-2">
                    {query.trim() ? 'No users found' : 'Type to search users'}
                  </div>
                ) : (
                  results.map((u) => (
                    <button
                      key={u._id}
                      className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col"
                      onClick={() => handleInvite(u, inviteRole)}
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {u.username}
                      </span>
                      <span className="text-[11px] text-slate-500">{u.email}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BoardMembers;

