const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns
} = require('../controllers/column.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createColumn);
router.put('/reorder', reorderColumns); // Order matters: specific paths before :id
router.put('/:id', updateColumn);
router.delete('/:id', deleteColumn);

module.exports = router;
