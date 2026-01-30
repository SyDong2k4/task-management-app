const express = require('express');
const router = express.Router();
const {
    createCard,
    getCard,
    updateCard,
    deleteCard,
    moveCard
} = require('../controllers/card.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createCard);
router.get('/:id', getCard);
router.put('/:id', updateCard);
router.put('/:id/move', moveCard);
router.delete('/:id', deleteCard);

module.exports = router;
