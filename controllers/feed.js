/* eslint-disable no-unused-vars */
const fs = require('fs')
const path = require('path')

const { validationResult } = require('express-validator')

const Post = require('../models/post')
const User = require('../models/user')


exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1
  const perPage = 2

  try {
    const totalItems = await Post.find().countDocuments()

    const posts = await Post.find()
      .populate('creator')
      .skip((currentPage - 1) * perPage)
      .limit(perPage)

    res.status(200).json({
      message: 'Posts fetched successfully!',
      posts: posts,
      totalItems: totalItems
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed')
    error.statusCode = 422
    throw error
  }

  if (!req.file) {
    const err = new Error('No image provided')
    err.statusCode = 422
    throw err
  }

  const imageUrl = req.file.path
  const title = req.body.title
  const content = req.body.content

  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId
  })
  try {
    await post.save()
    let user = await User.findById(req.userId)
    user.posts.push(post)
    const savedUser = await user.save()

    res.status(201).json({
      message: 'Post created successfully',
      post: post,
      creator: { _id: user._id, name: user.name }
    })
    return savedUser
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId

  try {
    const post = await Post.findById(postId)
    if (!post) {
      const error = new Error('Could not find post')
      error.statusCode = 404
      throw error
    }
    res.status(200).json({
      message: 'Post fetched successfully!',
      post: post
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed')
    error.statusCode = 422
    throw error
  }

  const title = req.body.title
  const content = req.body.content

  let imageUrl = req.body.image
  if (req.file) {
    imageUrl = req.file.path
  }

  if (!imageUrl) {
    const err = new Error('No file picked')
    err.statusCode = 422
    throw err
  }
  try {
    const post = await Post.findById(postId)
    if (!post) {
      const error = new Error('Could not find post')
      error.statusCode = 404
      throw error
    }

    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not Authorized')
      error.statusCode = 403
      throw error
    }

    post.title = title
    post.imageUrl = imageUrl
    post.content = content

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl)
    }

    const result = await post.save()
    res.status(200).json({
      message: 'Post updated successfully!',
      post: result
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId
  try {
    const post = await Post.findById(postId)

    if (!post) {
      const error = new Error('Could not find post')
      error.statusCode = 404
      throw error
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not Authorized')
      error.statusCode = 403
      throw error
    }
    clearImage(post.imageUrl)
    const result = await Post.findByIdAndRemove(postId)
    const user = await User.findById(req.userId)
    user.posts.pull(postId)

    await user.save()
    res.status(200).json({
      message: 'Post deleted successfully!'
    })

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath)
  fs.unlink(filePath, err => console.log(err))
}