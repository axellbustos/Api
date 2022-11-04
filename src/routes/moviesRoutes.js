const express = require('express');
const router = express.Router();
const moviesController = require('../controllers/moviesController');

router.get('/movies', moviesController.list);
router.get('/movies/new', moviesController.newest);
router.get('/movies/recommended', moviesController.recomended);
router.get('/movies/detail/:id', moviesController.detail);
//Rutas exigidas para la creación del CRUD
router.post('/movies/create', moviesController.create);
router.put('/movies/update/:id', moviesController.update);
router.delete('/movies/delete/:id', moviesController.destroy);

module.exports = router;