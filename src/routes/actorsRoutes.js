const express = require('express');
const router = express.Router();
const {list, detail, getByName} = require('../controllers/actorsController');

router.get('/actors', list);
router.get('/actors/name/:name?', getByName);
router.get('/actors/detail/:id', detail);



module.exports = router;