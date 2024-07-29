const express = require("express");
const router = express.Router(); 

const Project = require('../models/project');

router.get('/', async (req, res) =>{
  console.log('Пользователь:' ,req.user);
  if(req.query.id !== undefined) {
    return;
  }
  const projects = await Project.find();
  res.json(projects);
})

module.exports = router;