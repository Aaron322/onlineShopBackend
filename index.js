const express = require('express')
const port = 4000
const app = express()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const cors = require('cors')

app.use(express.json())
app.use(cors())
//connect database
mongoose.connect()

app.get('/', (req, res) => {
  res.send('running')
})

//img storage service
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    )
  },
})
const upload = multer({ storage: storage })
//uploadd endpoint for images
app.use('/images', express.static('upload/images'))
app.post('/upload', upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  })
})

// schema for creating products
const Product = mongoose.model('Product', {
  id: {
    type: Number,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  image: {
    type: String,
    require: true,
  },
  category: {
    type: String,
    require: true,
  },
  new_price: {
    type: Number,
    require: true,
  },
  old_price: {
    type: Number,
    require: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  available: {
    type: Boolean,
    default: true,
  },
})

app.post('/addproduct', async (req, res) => {
  //autimately generate ID for product
  let products = await Product.find({})
  let id
  if (products.length > 0) {
    let last_product_array = products.slice(-1)
    let last_product = last_product_array[0]
    id = last_product.id + 1
  } else {
    id = 1
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  })
  console.log(product)
  await product.save()
  console.log('save')
  res.json({
    success: true,
    name: req.body.name,
  })
})

//delete products
app.post('/removeproduct', async (req, res) => {
  await Product.findOneAndDelete({
    id: req.body.id,
  })
  console.log('remove product')
  res.json({ success: true, name: req.body.name })
})

//display all products
app.get('/allproducts', async (req, res) => {
  let products = await Product.find({})
  console.log('all product')
  res.send(products)
})

app.listen(port, (err) => {
  if (!err) {
    console.log('running server on port' + port)
  } else {
    console.log(err)
  }
})
