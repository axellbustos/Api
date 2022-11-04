const db = require("../database/models");
const{Op}=require ('sequelize')
const {createError}= require('../helpers/index')

const genresController = {
  list: async (req, res) => { //funcion asincronica

    let { limit, order ="id" } = req.query;
    let fields=['name', 'ranking','id']//fields-campos
    try {
      //VERIFICA EL ERROR PRIMERO
      //para evitar busquedas innecesarias en la DB cuando hay errores
      if(order && !fields.includes(order)){ //comprueba el campo que pide order y si no esta en fields crea un error
        let error = new Error("solo se puede ordenar por nombre o ranking");
        error.status = 400;
        throw error;
      }
      //SI NO HAY ERROR EJECUTA EL CODIGO
      let total = await  db.Genre.count(); //devuelve una cantidad en number
      let genres = await db.Genre.findAll({
        attributes: {
          exclude: ["created_at", "updated_at"],
        },
        limit: limit ? +limit : 5,
        order: [order]
      });
      return res.status(200).json({
        ok: true, //confirmar el estado de la operacion(opcional)
        meta: {
          status: 200,
        },
        data: { //los datos que envia para ser utilizados
          perPage: genres.length,//cantidad de generos
          total,
          genres,
        }, 
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        ok: false,
        msg: error.message,
      });
    }
    /*db.Genre.findAll()
        .then((genres) => {
            res.render("genresList.ejs", { genres });
        });*/
  },

  detail: async (req, res) => {
    const {id} = req.params;
    try {
      //validacion del tipo de dato que es id
      if (isNaN(id)) {
        throw createError(400,'El id debe ser un numero')
      }
      //validacion de la existencia del genero
      let genre = await db.Genre.findByPk(id);
      if (!genre) {
        throw createError(404,'No hay un genero con ese id')

        //alternativa anterior para mostrar errores
        /*return res.status(200).json({
            ok: false,
            meta: {
                items: 1,
              },
              data: {
                  status:200,
                  msg: "No hay un genero con ese id"
              }
            
          });*/
      }
      //return res.send()
      return res.status(200).json({
        ok: true,
        meta: {
          status:200
        },
        data: {
          genre,
          total: 1,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        ok: false,
        msg: error.message,
      });
    }
  },

  getByName: async (req, res) => {
    const { name } = req.params;
                                   
    try {
      if (!name) {
        let error = new Error("El nombre es obligatorio");
        error.status = 400; 
        throw error;
      }
      let genre = await db.Genre.findOne({
        where:{
            [Op.substring]:name //substring =  %Ejemplo%
        }
      }
      )
      if (!genre) {
        let error = new Error("No hay un genero con ese nombre"); 
        error.status = 404; 
        throw error; 
      }
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        ok: false,
        msg: error.message,
      });
    }
  },
  
};

module.exports = genresController;
