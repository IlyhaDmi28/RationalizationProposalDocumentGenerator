const express = require("express");
const actController = require('../controllers/actController');

module.exports = () => {
    const router = express.Router(); 

    router.get('/', async (req, res) => actController.index(req, res));
    router.post('/generate', async (req, res) => actController.generateAct(req, res));

    return router;
}