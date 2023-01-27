import express from "express";
import productController from "../controller/product_controller.js";

const productRouter = express.Router();

// Subir una o varias imágenes al servidor y base de datos
productRouter.post("/upload", productController.uploadImage);
// Obtener una imagen por su id
productRouter.get("/image/:id", productController.getImage);
// Buscar producto por su id
productRouter.get("/getproduct", productController.getProduct);
// traemos los productos
productRouter.get("/", productController.allProduct)

export default productRouter;
