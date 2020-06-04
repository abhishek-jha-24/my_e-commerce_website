const express = require("express");
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const router = express.Router();
const mongoose = require("mongoose");

const verifyToken = require('../middleware/check-auth');
const dotenv = require('dotenv');
const User = require("../models/user");
const jwt = require('jsonwebtoken');



const conn = mongoose.connection;
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});



const storage = new GridFsStorage({
  url: 'mongodb+srv://dbAbhishekjha:' + process.env.MONGO_ATLAS_PW + '@abhishek-ow5k3.mongodb.net/test?retryWrites=true&w=majority',
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });


const Newproduct = require("../models/product");


router.get('/', verifyToken, function(req, res, next){
  const token = req.cookies.token || '';
  const decrypt = jwt.verify(token, process.env.JWT_KEY)

  

  


  res.render('Home', {
    user: decrypt
  });
 
});




router.get("/Get-All", verifyToken, (req, res, next) => {
  const token = req.cookies.token || '';
  const decrypt = jwt.verify(token, process.env.JWT_KEY)
  console.log(decrypt.email)
  


  
  

  Newproduct.find()
    .select("name price _id productImage filename")
    .exec()
    .then(docs => {
      
      res.render('Get-All', {
        items: docs
      })
      
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get('/Your-Products/:email', verifyToken, function(req, res, next){
  var zzz = req.params.email;
  console.log(zzz)


  Newproduct.find({ email: zzz})
    .select("name price _id productImage")
    .exec()
    .then(docs => {
      res.render('Get-All', {
        items: docs
      })
      
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});



router.get("/Add-New-Product", (req, res, next) => {
  res.render('Add-New-Product');

});

router.post("/Add-New-Product", upload.single('file'), (req, res, next) => {
  console.log(req.file) 
  


  const token = req.cookies.token || '';
  const decrypt = jwt.verify(token, process.env.JWT_KEY)
  console.log(decrypt.email)
  file = req.file;
 
  
  const newproduct = new Newproduct({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    email: decrypt.email,
    ImageId: file.id,
    filename: file.filename
    
     
  });
  console.log(newproduct.ImageId)
  



  newproduct
    .save()
    .then(result => {
      console.log(result);
      res.redirect('/products/Add-New-Product')
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});



router.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Files exist
    return res.json(files);
  });
});



router.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    return res.json(file);
  });
});




// @route GET /image/:filename
// @desc Display Image
router.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});




router.get("/Get-One/:productId", verifyToken, (req, res, next) => {
  const token = req.cookies.token || '';
  const decrypt = jwt.verify(token, process.env.JWT_KEY)
  const id = req.params.productId;
  Newproduct.findById(id)
    .select('name price _id ImageId email')
    .exec()
    .then(doc => {
      console.log('we have entered the then function')
      console.log("From database", doc);
      if (doc) {
        console.log('entered first if')
        var z = doc.ImageId




        gfs.files.findOne({ _id: z}, (err, file) => {
    // Check if file
          if (!file || file.length === 0) {
            console.log('enetered minor if')
            res.render('Get-One', {
              items: doc,
              file: false
            })
            
          } else {
            console.log('enetered minor else')
            if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
              file.isImage = true;
            } else {
              console.log('eneterd minor 2nd else')
              file.isImage = false;
            }
            res.render('Get-One', {
              items: doc,
              file: file,
              user: decrypt
            })
            
          }
        });
      } else {
        console.log('eneterd major else')
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/update-one-product", verifyToken, (req, res, next) => {
  res.render('update');

});




 

router.patch("/update-one-product", verifyToken, (req, res, next) => {

  var id = req.body.id;
  var name = req.body.name;
  console.log(id)
  var item={
    
    name: req.body.name,
    price: req.body.price,
  };
  Newproduct.updateOne({ "_id": mongoose.Types.ObjectId(id) }, { $set: item })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Product updated',
          request: {
              type: 'GET',
            
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


router.get("/Delete-One-Product/:productId",  verifyToken, (req, res, next) => {
  const productId = req.params.productId;
  console.log(productId)
  res.render('Delete', {
    productId: productId
  });
 



});



router.delete("/Delete-One-Product/:productId", (req, res, next) => {
  const productId = req.params.productId;
  var passedVariable = req.query.valid;
  console.log(passedVariable)

  const token = req.cookies.token || '';
  const decrypt = jwt.verify(token, process.env.JWT_KEY)
  console.log(decrypt.email)
  
  var id = req.body.productId;

  console.log(id);
  Newproduct.find({ email: decrypt.email })
    .exec()
    .then(docs => {
      console.log(docs)
      if (docs.length > 0) {
        Newproduct.remove({_id: productId })
          .exec()
          .then(result => {
            res.status(200).json({
              message: 'product deleted successfully',
            })
          })
          .catch(err => {
            console.log(err);;
          });

      }
      else{
        console.log('you cannot dlete this product')
      }
    })
    .catch( err => {
      console.log(err)
    });


});

module.exports = router;
