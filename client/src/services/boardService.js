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

    createCard: async (boardId, cardData) => {
        // cardData should include { title, columnId }
        // Fix: Server expects POST /api/cards
        const response = await api.post(`/cards`, { ...cardData, boardId });
        return response.data;
    },

    moveCard: async (cardId, { columnId, order }) => {
        const response = await api.put(`/cards/${cardId}/move`, { columnId, order });
        return response.data;
    },

    reorderColumns: async (boardId, columnIds) => {
        const response = await api.put(`/boards/${boardId}/columns/reorder`, { columnIds });
        return response.data;
    }
};

export default boardService;
