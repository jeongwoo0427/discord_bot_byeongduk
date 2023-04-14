const mysql = require('mysql2/promise');
const db_config = require('../db_options.json');

const pool = mysql.createPool(db_config);


const db = {

    executeQuery : async (sql,params = [])=>{
      try{
        const connection = await pool.getConnection(async conn => conn);
        try{
          
          const [rows] = await connection.query(sql,params);
          connection.release();
  
          return rows;
          
        }catch (queryErr){
          connection.release();
          throw queryErr;
        }
  
      }catch(connectionErr){
        throw connectionErr;
      }
    },
  
    transactionQuery : async(callback)=>{
      const connection = await pool.getConnection(async conn => conn);
      try{
        await connection.beginTransaction();
  
        const [rows] = await callback(connection);
  
        await connection.commit();
  
        return rows;
  
      }catch(err){
        await connection.rollback();
        throw err;
      }finally{
        connection.release();
      }
    }
  }
  
  
  module.exports = db; //db객체 반환
  