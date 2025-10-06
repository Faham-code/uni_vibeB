import Post from "../models/post.js";
import Notification from "../models/notification.js";
import { v2 as cloudinary } from "cloudinary";

// Create a new post
export const createPost = async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "posts",
      });
      imageUrl = result.secure_url;
    }

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      img: imageUrl,
      author: req.body.author, // Make sure to validate this
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get all posts (for user and their friends)
export const getPosts = async (req, res) => {
  try {
    // req.user.id should be set by your authentication middleware
    const userId = req.user.id;

    // Get the user's friends
    const user = await User.findById(userId).select("friends");
    const friendIds = user.friends || [];

    // Find posts by the user or their friends
    const posts = await Post.find({
      author: { $in: [userId, ...friendIds] }
    }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//delete a post by ID
export const deletePostById = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a post by ID
export const updatePostById = async (req, res) => {
  try {
    let imageUrl = req.body.img; // Keep existing image if not updated
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "posts",
      });
      imageUrl = result.secure_url;
    }
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { 
        title: req.body.title,
        content: req.body.content,
        img: imageUrl,
        author: req.body.author,
      },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Like a post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    post.likes.push(req.user.id);
    await post.save();
    if (post.author.toString() !== req.user.id) {
     await Notification.create({
    user: post.author,
    type: "like",
    fromUser: req.user.id,
    post: post._id,
    message: "Your post was liked!"
  });
}
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//unlike a post
export const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    post.likes = post.likes.filter(like => like.toString() !== req.user.id);
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } 
};


// add a comment to a post
export const commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    post.comments.push({
      user: req.user.id,
      content: req.body.content,
    });
    await post.save();
    if (post.author.toString() !== req.user.id) {
  await Notification.create({
    user: post.author,
    type: "comment",
    fromUser: req.user.id,
    post: post._id,
    message: "Someone commented on your post!"
  });
}
    res.status(200).json(post);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
};


