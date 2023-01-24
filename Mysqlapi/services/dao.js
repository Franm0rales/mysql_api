import userQueries from "./mysql_queries/user_queries.js";
// import productQueries from "./mysql_queries/product_queries.js";
const dao = {};

// Buscar un usuario por el email
dao.getUserByEmail = async (Email) => await userQueries.getUserByEmail(Email);
// Añadir un nuevo usuario
dao.addUser = async (userData) => await userQueries.addUser(userData);
// Buscar un usuario por el id
dao.getUserbyId = async (id) => await userQueries.getUserbyId(id);

// Eliminar un usuario
dao.deleteUser = async (id) => await userQueries.deleteUser(id);
// Modificar usuario por su id
dao.updateUser = async (id, userData) =>
  await userQueries.updateUser(id, userData);
// Añadir datos de la imagen subida al servidor
dao.addImage = async (imageData) => await productQueries.addImage(imageData);
// Obtener una imagen por su id
dao.getImageById = async (id) => await productQueries.getImageById(id);

export default dao;
