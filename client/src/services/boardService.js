import api from './api';

const boardService = {
    getAllBoards: async () => {
        const response = await api.get('/boards');
        return response.data;
    },

    getBoardById: async (id) => {
        const response = await api.get(`/boards/${id}`);
        return response.data;
    },

    createBoard: async (boardData) => {
        const response = await api.post('/boards', boardData);
        return response.data;
    },

    updateBoard: async (id, boardData) => {
        const response = await api.put(`/boards/${id}`, boardData);
        return response.data;
    },

    deleteBoard: async (id) => {
        const response = await api.delete(`/boards/${id}`);
        return response.data;
    },

    createColumn: async (boardId, columnData) => {
        const response = await api.post(`/boards/${boardId}/columns`, columnData);
        return response.data;
    },

    updateColumn: async (boardId, columnId, columnData) => {
        const response = await api.put(`/boards/${boardId}/columns/${columnId}`, columnData);
        return response.data;
    },

    deleteColumn: async (boardId, columnId) => {
        const response = await api.delete(`/boards/${boardId}/columns/${columnId}`);
        return response.data;
    },

    createCard: async (boardId, cardData) => {
        // cardData should include { title, columnId }
        // Fix: Server expects POST /api/cards
        const response = await api.post(`/cards`, { ...cardData, boardId });
        return response.data;
    },

    updateCard: async (cardId, cardData) => {
        const response = await api.put(`/cards/${cardId}`, cardData);
        return response.data;
    },

    deleteCard: async (cardId) => {
        const response = await api.delete(`/cards/${cardId}`);
        return response.data;
    },

    moveCard: async (cardId, { columnId, order }) => {
        const response = await api.put(`/cards/${cardId}/move`, { columnId, order });
        return response.data;
    },

    // Comments
    getComments: async (cardId) => {
        const response = await api.get(`/comments/${cardId}`);
        return response.data;
    },

    addComment: async (cardId, content) => {
        const response = await api.post(`/comments/${cardId}`, { content });
        return response.data;
    },

    deleteComment: async (commentId) => {
        const response = await api.delete(`/comments/${commentId}`);
        return response.data;
    },

    reorderColumns: async (boardId, columnIds) => {
        const response = await api.put(`/boards/${boardId}/columns/reorder`, { columnIds });
        return response.data;
    },

    // Members (Trello-like roles: admin, member, observer)
    addMember: async (boardId, userId, role = 'member') => {
        const response = await api.post(`/boards/${boardId}/members`, { userId, role });
        return response.data;
    },

    updateMemberRole: async (boardId, userId, role) => {
        const response = await api.put(`/boards/${boardId}/members/${userId}`, { role });
        return response.data;
    },

    removeMember: async (boardId, userId) => {
        const response = await api.delete(`/boards/${boardId}/members/${userId}`);
        return response.data;
    }
};

export default boardService;
