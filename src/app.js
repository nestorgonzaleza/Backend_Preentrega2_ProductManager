const express = require("express");
const http = require("http")
const socketIo = require("socket.io")
const handlebars = require("express-handlebars")
const path = require("path");
const {Server} = require("socket.io")
const productsRouter = require("./routes/productos.router")
const cartsRouter = require("./routes/carts.router")
const chatRouter = require("./routes/chat.router")
const mongoose = require("mongoose");
// const realTimeProductsRouter = require("./public/realtimeproducts.router")
const fs = require("fs");
const { productModel } = require("./models/productos.model");




const app = express()
const server = http.createServer(app)
const io = new Server(server)


const PORT= 8080


//middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//handlebars configuración
app.engine("handlebars", handlebars.engine())
//Carpeta de vista
app.set("views", path.join(__dirname, "views"))
//Esteblecer handlebars como motor de plantillas
app.set("view engine", "handlebars")
app.use(express.static(__dirname+"/views"))
//Archivos dentro de la carpeta public
app.use(express.static(path.join(__dirname, "public")))

//routers
app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/api/messages", chatRouter)

//Mongoose
mongoose.connect("mongodb+srv://nestorgonzalez:012342023@clusterbackend.m8mx5zs.mongodb.net/?retryWrites=true&w=majority")
    .then(()=>{
        console.log("Conectado a la BD")
    })
    .catch((error)=>{
        console.error(`Error al intentar conectar a la BD ${error}`)
    })

//ENDPOINT CHAT
app.get("/", (req,res)=>{
  let user = {
    cargo : "Profe",
    institucion : "Coderhouse"

  }
  res.render("chat", {user:user})
})

//ENDPONT DETALLES
app.get("/product/:pid", async (req,res)=>{
  let {pid} = req.params
  let detalle = await productModel.findOne({_id:pid})
  detalle = detalle.toJSON()
  res.render("detailProduct", {product: detalle})
})

//SOCKETS
// endpoint socket
app.get("/realtimeproducts", (req,res)=>{
  res.render("realTimeProducts.handlebars")
})


//socket.io
io.on("connection", (socket) => {
  console.log("Un usuario se ha conectado");

  socket.on("disconnect", ()=>{
    console.log("Usuario desconectado")
  })
  socket.on("message", (data)=>{
    console.log(data)
  })  
  socket.on("solicitarProductos", () => {
    const productos = leerProducto();

    socket.emit("mostrarProductos", productos)
  });

 
});





//app listening//
server.listen(PORT, ()=>{
  console.log(`Server escuchando en ${PORT}`)
})




  //LEER PRODUCTOS EN PRODUCTOS.JSON
function leerProducto() {
    try {
        const filePath = path.join(__dirname, '../productos.json');
        products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return products;
    } catch (error) {
        console.error('Error de lectura:', error);
    }
}