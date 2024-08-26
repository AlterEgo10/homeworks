const express = require("express");
const router = express.Router(); 

const Comment = require('../models/comment');

router.get('/', async (req, res) =>{
 
  if(req.query.id !== undefined) {
    return;
  }
  const comments = await Comment.find();
  res.json(comments);
})

router.get("/:id", async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (comment) {
    await comment.save();
    res.json(comment);
    return;
  }
  res.status(400);
  res.end();
});

router.post("/", async function (req, res) {
  try {
    const comment = new Comment(req.body);
   
    if (await comment.save()) {
      res.json({ result: true, ...comment.toObject()});
    } else {
      throw new Error("Не удалось сохранить комментарий в БД.");
    }
  } catch (err) {
    console.log(err);
    res.json({ result: "false" });
  }

});

router.patch("/:id", async function (req, res) {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (comment) {
      res.status(200);
      res.json(comment);
      return;
    }
  } catch (err) {
    res.status(400);
    res.end();
    return;
  }
  res.status(400);
  res.end();
  return;
});

router.delete("/:id", async function (req, res) {
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (comment) {
    res.status(204);
    res.end();
    return;
  }
  res.status(400);
  res.end();
});

module.exports = router;