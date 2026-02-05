
// Basic reducer structure for board state
export const boardReducer = (state, action) => {
    switch (action.type) {
        case 'SET_BOARD':
            return action.payload;
        case 'UPDATE_BOARD':
            return { ...state, ...action.payload };

        case 'ADD_COLUMN':
            if (!state.columns) state.columns = [];
            return {
                ...state,
                columns: [...state.columns, action.payload]
            };

        case 'UPDATE_COLUMN':
            return {
                ...state,
                columns: state.columns.map(col =>
                    col._id === action.payload._id ? { ...col, ...action.payload } : col
                )
            };

        case 'DELETE_COLUMN':
            return {
                ...state,
                columns: state.columns.filter(col => col._id !== action.payload)
            };

        case 'ADD_CARD':
            // Payload needs to include columnId
            return {
                ...state,
                columns: state.columns.map(col => {
                    if (col._id === action.payload.columnId) {
                        const exists = col.cards?.some(c => c._id === action.payload._id);
                        if (exists) return col;
                        return {
                            ...col,
                            cards: [...(col.cards || []), action.payload]
                        };
                    }
                    return col;
                })
            };

        case 'UPDATE_CARD':
            return {
                ...state,
                columns: state.columns.map(col => {
                    // Check if card belongs to this column (optimization: we might know columnId)
                    const cardIndex = col.cards?.findIndex(c => c._id === action.payload._id);
                    if (cardIndex > -1) {
                        const newCards = [...col.cards];
                        newCards[cardIndex] = { ...newCards[cardIndex], ...action.payload };
                        return { ...col, cards: newCards };
                    }
                    return col;
                })
            };

        case 'MOVE_CARD':
            const { cardId, sourceColumnId, destColumnId, destIndex } = action.payload;

            // Deep copy columns to avoid mutating state directly
            const newColumns = state.columns.map(col => ({
                ...col,
                cards: col.cards ? [...col.cards] : []
            }));

            const sourceCol = newColumns.find(col => col._id === sourceColumnId);
            const destCol = newColumns.find(col => col._id === destColumnId);

            if (!sourceCol || !destCol) return state;

            // Find and remove card from source
            const cardIndex = sourceCol.cards.findIndex(c => c._id === cardId);
            if (cardIndex === -1) return state;

            const [movedCard] = sourceCol.cards.splice(cardIndex, 1);

            // Update moved card's columnId just in case
            const updatedCard = { ...movedCard, columnId: destColumnId };

            // Insert into destination
            destCol.cards.splice(destIndex, 0, updatedCard);

            return {
                ...state,
                columns: newColumns
            };

        case 'DELETE_CARD':
            return {
                ...state,
                columns: state.columns.map(col => ({
                    ...col,
                    cards: col.cards ? col.cards.filter(c => c._id !== action.payload) : []
                }))
            };

        case 'REORDER_COLUMNS':
            const { newOrder } = action.payload; // array of columnIds
            if (!newOrder) return state;

            // Create a map for quick lookup
            const colMap = new Map(state.columns.map(c => [c._id, c]));

            // Reconstruct columns array in new order
            const reorderedColumns = newOrder.map(id => colMap.get(id)).filter(Boolean);

            // Append any columns that might be missing from newOrder (just in case)
            state.columns.forEach(c => {
                if (!newOrder.includes(c._id)) reorderedColumns.push(c);
            });

            return {
                ...state,
                columns: reorderedColumns
            };

        default:
            return state;
    }
};
