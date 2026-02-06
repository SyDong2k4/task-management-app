import React, { useState, useEffect } from 'react';
import BoardList from '../components/dashboard/BoardList';
import CreateBoardModal from '../components/dashboard/CreateBoardModal';
import boardService from '../services/boardService';

const Dashboard = () => {
    const [boards, setBoards] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            const data = await boardService.getAllBoards();
            setBoards(data);
        } catch (error) {
            console.error("Failed to fetch boards", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBoardCreated = (newBoard) => {
        setBoards([...boards, newBoard]);
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Your Boards</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Organize your work into boards and keep everything on track.
                    </p>
                </div>
                <div className="hidden sm:flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {boards.length} boards
                    </span>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 transition-colors">
                {loading ? (
                    <div className="text-slate-500">Loading boards...</div>
                ) : (
                    <BoardList
                        boards={boards}
                        onOpenCreateModal={() => setIsModalOpen(true)}
                    />
                )}
            </div>

            <CreateBoardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onBoardCreated={handleBoardCreated}
            />
        </div>
    );
};

export default Dashboard;
