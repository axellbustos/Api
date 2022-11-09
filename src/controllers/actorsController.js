const db = require("../database/models");
const{Op}=require ('sequelize')
const {createError}= require('../helpers/index')

const actorsController = {
  list: async (req, res) => { 

    let { limit, order ="id" } = req.query;
    let fields=['first_name', 'last_name', 'ranking','id']
    try {
      if(order && !fields.includes(order)){
        let error = new Error("solo se puede ordenar por nombre, apellido o ranking");
        error.status = 400;
        throw error;
      }
      let total = await  db.Actor.count(); 
      let actors = await db.Actor.findAll({
        attributes: {
          exclude: ["created_at", "updated_at"],
        },
        limit: limit ? +limit : 5,
        order: [order]
      });
      return res.status(200).json({
        ok: true, 
        meta: {
          status: 200,
        },
        data: { 
          perPage: actors.length,
          total,
          actors,
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

  detail: async (req, res) => {
    const {id} = req.params;
    try {
      //validacion del tipo de dato que es id
      if (isNaN(id)) {
        throw createError(400,'El id debe ser un numero')
      }
      //validacion de la existencia del actor
      let actor = await db.Actor.findByPk(id);
      if (!actor) {
        throw createError(404,'No hay un actor con ese id')

      }
      //return res.send()
      return res.status(200).json({
        ok: true,
        meta: {
          status:200
        },
        data: {
          actor,
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
      let actor = await db.Actor.findAll({
        where:{
            [Op.substring]:name //Ejemplo substring =  %potter%
        }
      }
      )
      if (!actor) {
        let error = new Error("No hay un actor con ese nombre"); 
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

module.exports = actorsController;
