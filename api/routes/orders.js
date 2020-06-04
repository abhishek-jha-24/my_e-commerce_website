const express = require("express");
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const router = express.Router();
const mongoose = require("mongoose");
const verifyToken = require('../middleware/check-auth');
const Order = require("../models/order");
const Newproduct = require("../models/product");
const User = require("../models/user");
const jwt = require('jsonwebtoken');
// Handle incoming GET requests to /orders
router.get('/', function(req, res, next){
  res.render('Home-Orders');
 
});


router.get("/Get-All-Orders", verifyToken, (req, res, next) => {
  const token = req.cookies.token || '';
  const decrypt = jwt.verify(token, process.env.JWT_KEY)
  Order.find({email: decrypt.email })
    .select("product quantity _id")
    .populate('product', 'name')
    .exec()
    .then(docs => {
      console.log(docs)
      
      res.render('Get-All-Orders', {
        items: docs
      })
     
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});


router.get("/Add-New-Order/:productId", verifyToken, (req, res, next) => {
  res.render('Add-New-Order', {
    productId: req.params.productId

  });

});




router.post("/Add-New-Order/:productId", (req, res, next) => {
  const token = req.cookies.token || '';
  const decrypt = jwt.verify(token, process.env.JWT_KEY)
  console.log(decrypt.email)
  Newproduct.findById(req.params.productId)
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.params.productId,
        email: decrypt.email
        
      });
      return order.save();
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Order stored",
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity,
          email: result.email
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/Get-Product/" + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});







router.get("/Get-Product/:orderId", verifyToken, (req, res, next) => {
  console.log('a');

  Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }
      res.render('Get-One-Order', {
        items: order
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});







router.get("/Delete-One-Order/:orderId", verifyToken, (req, res, next) => {

  const orderId = req.params.orderId;

  res.render('Delete-One-Order', {
    orderId: orderId
  });

});



router.delete("/Delete-One-Order/:orderId", (req, res, next) => {
  Order.remove({ _id: req.params.orderId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Order deleted",
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});














module.exports = router;

