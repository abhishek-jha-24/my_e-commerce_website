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








router.get('/', function(req, res, next){
  res.render('Get-started')
})


module.exports = router;