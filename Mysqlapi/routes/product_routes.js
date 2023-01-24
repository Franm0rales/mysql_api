import express from "express";
import productController from "../controller/product_controller.js";

const productRouter = express.Router();

// Subir una o varias imágenes al servidor y base de datos
productRouter.post("/upload", productController.uploadImage);
// Obtener una imagen por su id
productRouter.get("/image/:id", productController.getImage);

export default productRouter;
