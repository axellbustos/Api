const db = require("../database/models");
const moment = require("moment");
const { createError, getUrl, getUrlBase } = require('../helpers/index')

const moviesController = {
    list: async (req, res) => {
        let { limit, order, search, offset } = req.query
        let fields = ['title', 'ranking', 'release_date', 'length', 'awards']

        try {
            if (order && !fields.includes(order)) { //comprueba el campo que pide order y si no esta en fields crea un error
                throw createError(400, `solo se puede ordenar por los campos ${fields.join(', ')}`)
            }
            let total = await db.Movie.count();
            let movies = await db.Movie.findAll({
                attributes: {
                    exclude: ["created_at", "updated_at"]
                },
                include: [
                    {
                        association: 'genre',
                        attributes: {
                            exclude: ["created_at", "updated_at"]
                        }
                    },
                    {
                        association: 'actors',
                        attributes: {
                            exclude: ["created_at", "updated_at"]
                        }
                    }
                ],
                limit: limit ? +limit : 5,
                offset: offset ? +offset : 0,
                order: [order ? order : "id"]
            })
            /*antes de enviarlo obtenemos una url con la funcion getUrl definida en helpers
            usando setDataValue la agregamos junto con el nombre de la propiedad nueva "link"
            esta informacion es temporal y debe obtenerse en cada pedido si lo queremos nuevamente*/
            movies.forEach(movie => { movie.setDataValue('link', `${getUrl(req)}/${movie.id}`) })

            return res.status(200).json({
                ok: true, //confirmar el estado de la operacion(opcional)
                meta: {
                    status: 200,
                },
                data: { //los datos que envia para ser utilizados
                    perPage: movies.length,//cantidad de peliculas
                    total,
                    movies,
                }
            })
        } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message,
            });
        }

    },
    detail: async (req, res) => {
        const { id } = req.params
        try {
            if (isNaN(id)) {
                throw createError(400, 'El id debe ser un numero')
            }
            const movie = await db.Movie.findByPk(req.params.id, {
                include: [
                    {
                        association: 'genre',
                        attributes: {
                            exclude: ["created_at", "updated_at"]
                        }
                    },
                    {
                        association: 'actors',
                        attributes: {
                            exclude: ["created_at", "updated_at"]
                        }
                    }],
                attributes: {
                    exclude: ["created_at", "updated_at", "genre_id"]
                }
            })
            if (!movie) {
                throw createError(404, 'No hay una pelicula con ese id')
            }
            movie.release_date = moment(movie.release_date).format('')//revisar formato al mostrar


            return res.status(200).json({
                ok: true, //confirmar el estado de la operacion(opcional)
                meta: {
                    status: 200,
                },
                data: {
                    movie
                }
            })

        } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message,
            });
        }

    },
    newest: async (req, res) => {
        const { limit } = req.query;
        const option = {
            order: [["release_date", "DESC"]],
            include: [
                {
                    association: 'genre',
                    attributes: {
                        exclude: ["created_at", "updated_at"]
                    }
                },
                {
                    association: 'actors',
                    attributes: {
                        exclude: ["created_at", "updated_at"]
                    }
                }],
            attributes: {
                exclude: ["created_at", "updated_at", "genre_id"]
            },
            limit: limit ? +limit : 5
        };
        try {
            const movies = await db.Movie.findAll(option);
            const moviesModify = movies.map(movie => {
                return {
                    ...movie.dataValues,
                    link: `${getUrlBase(req)}/${movie.id}`
                }
            })
            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                },
                data: {
                    movies: moviesModify,
                }
            })
        } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message,
            });
        };

    },
    recomended: async (req, res) => {
        const { limit } = req.query;
        const option ={
            include: [
                {
                    association: 'genre',
                    attributes: {
                        exclude: ["created_at", "updated_at"]
                    }
                },
                {
                    association: 'actors',
                    attributes: {
                        exclude: ["created_at", "updated_at"]
                    }
                }],
            where: {
                rating: { [db.Sequelize.Op.gte]: 8 },
            },
            order: [["rating", "DESC"]],
            attributes: {
                exclude: ["created_at", "updated_at", "genre_id"]
            },
            limit: limit ? +limit : 5
        }
        try {
            const movies= await db.Movie.findAll(option)
            const moviesModify = movies.map(movie => {
                return {
                    ...movie.dataValues,
                    link: `${getUrlBase(req)}/${movie.id}`
                }
            })
            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                },
                data: {
                    movies: moviesModify,
                }
            })
        } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message,
            });
        }
        
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    create: function (req, res) {
        Movies.create({
            title: req.body.title,
            rating: req.body.rating,
            awards: req.body.awards,
            release_date: req.body.release_date,
            length: req.body.length,
            genre_id: req.body.genre_id,
        })
            .then(() => {
                return res.redirect("/movies");
            })
            .catch((error) => res.send(error));
    },
    update: function (req, res) {
        let movieId = req.params.id;
        Movies.update(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id,
            },
            {
                where: { id: movieId },
            }
        )
            .then(() => {
                return res.redirect("/movies");
            })
            .catch((error) => res.send(error));
    },
    destroy: function (req, res) {
        let movieId = req.params.id;
        Movies.destroy({ where: { id: movieId }, force: true }) // force: true es para asegurar que se ejecute la acción
            .then(() => {
                return res.redirect("/movies");
            })
            .catch((error) => res.send(error));
    },
};

module.exports = moviesController;
