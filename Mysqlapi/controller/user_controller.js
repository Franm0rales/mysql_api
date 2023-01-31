import dao from "../services/dao.js";
import { SignJWT, jwtVerify } from "jose";
import md5 from "md5";
import { transporter } from "../config/mailer.js";

const controller = {};

controller.addUser = async (req, res) => {
  const { Nombre, Email, password } = req.body;
  // Si no alguno de estos campos recibidos por el body devolvemos un 400 (bad request)
  if (!Nombre || !Email || !password)
    return res.status(400).send("Error al recibir el body");
  // Buscamos el usuario en la base de datos
  try {
     
    const user = await dao.getUserByEmail(Email);
    // Si existe el usuario respondemos con un 409 (conflict)
    if (user.length > 0) return res.status(409).send("usuario ya registrado");
    // Si no existe lo registramos
    const addUser = await dao.addUser(req.body);
    if (addUser)
    await transporter.sendMail({
      from: '"Bienvenido a Canteen design" <picassomorales@gmail.com>', // sender address
      to: Email, // list of receivers
      subject: "Hello ✔", // Subject line
      // text: "Hello world?", // plain text body
      html: '<b>Bienvenido a Canteen design,espero disfrutes de nuestros productos para cualquier consulta contactanos, gracias por registrarte!! Enlace de la web: http://127.0.0.1:5173/login</b>', // html body
    });
      return res.send(`Usuario ${Nombre} con id: ${addUser} registrado`);
  } catch (e) {
    console.log(e.message);
  }
};

// Controlador para el login de un usuario
controller.loginUser = async (req, res) => {
  const { Email, password } = req.body;
  // Si no alguno de estos campos recibidos por el body devolvemos un 400 (bad request)
  if (!Email || !password)
    return res.status(400).send("Error al recibir el body");
  try {
    let user = await dao.getUserByEmail(Email);
    // Si no existe el usuario respondemos con un 404 (not found)
    if (user.length <= 0) return res.status(404).send("usuario no registrado");
    // Pasamos md5 a la paswword recibida del cliente
    const clienPassword = md5(password);
    // Como la consulta a la base de datos nos devuelve un array con el objeto del usuario usamos la desestructuración.
    [user] = user;
    // Si existe el usuario, comprobamos que la password es correcta. Si no lo es devolvemos un 401 (unathorized)
    if (user.password != clienPassword)
      return res.status(401).send("password incorrecta");
    // Si es correcta generamos el token y lo devolvemos al cliente
    // Construimos el JWT con el id, email y rol del usuario
    const jwtConstructor = new SignJWT({
      id: user.id,
      Email,
      role: user.role,
    });

    // Codificamos el la clave secreta definida en la variable de entorno por requisito de la librería jose
    // y poder pasarla en el formato correcto (uint8Array) en el método .sign
    const encoder = new TextEncoder();
    // Generamos el JWT. Lo hacemos asíncrono, ya que nos devuelve una promesa.
    // Le indicamos la cabecera, la creación, la expiración y la firma (clave secreta).
    const jwt = await jwtConstructor
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(encoder.encode(process.env.JWT_SECRET));
    //Si todo es correcto enviamos la respuesta. 200 OK
    return res.send({ jwt });
  } catch (e) {
    console.log(e.message);
  }
};
// Controlador para eliminar un usuario por su id
controller.deleteUser = async (req, res) => {
  // OBTENER CABECERA Y COMPROBAR SU AUTENTICIDAD Y CADUCIDAD
  const { authorization } = req.headers;
  // Si no existe el token enviamos un 401 (unauthorized)
  if (!authorization) return res.sendStatus(401);
  const token = authorization.split(" ")[1];

  try {
    // codificamos la clave secreta
    const encoder = new TextEncoder();
    // verificamos el token con la función jwtVerify. Le pasamos el token y la clave secreta codificada
    const { payload } = await jwtVerify(
      token,
      encoder.encode(process.env.JWT_SECRET)
    );
    // Verificamos que seamos usuario administrador
    if (!payload.role)
      return res.status(409).send("no tiene permiso de administrador");
    // Buscamos si el id del usuario existe en la base de datos
    const user = await dao.getUserbyId(req.params.id);
    // Si no existe devolvemos un 404 (not found)
    if (user.length <= 0) return res.status(404).send("el usuario no existe");
    // Si existe, eliminamos el usuario por el id
    await dao.deleteUser(req.params.id);
    // Devolvemos la respuesta
    return res.send(`Usuario con id ${req.params.id} eliminado`);
  } catch (e) {
    console.log(e.message);
  }
};

// Controlador para modificar un usuario por su id
controller.updateUser = async (req, res) => {
  const { authorization } = req.headers;
  // Si no existe el token enviamos un 401 (unauthorized)
  if (!authorization) return res.sendStatus(401);

  try {
    // Si no nos llega ningún campo por el body devolvemos un 400 (bad request)
    if (Object.entries(req.body).length === 0)
      return res.status(400).send("Error al recibir el body");
    // Actualizamos el usuario
    await dao.updateUser(req.params.id, req.body);
    // Devolvemos la respuesta
    return res.send(`Usuario con id ${req.params.id} modificado`);
  } catch (e) {
    console.log(e.message);
  }
};

export default controller;
