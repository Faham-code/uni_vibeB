import Story from "../models/story.js";
import { v2 as cloudinary } from "cloudinary";

// Create a new story (expires in 24 hours)
export const createStory = async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "stories",
      });
      imageUrl = result.secure_url;
    } else {
      return res.status(400).json({ error: "Image is required" });
    }

    const story = new Story({
      img: imageUrl,
      author: req.body.author,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
    });

    await story.save();
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all active stories (not expired)
export const getStories = async (req, res) => {
  try {
    const now = new Date();
    const stories = await Story.find({ expiresAt: { $gt: now } }).populate("author", "username");
    res.status(200).json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get delete story by id
export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await Story.findByIdAndDelete(id);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    } 
    res.status(200).json({ message: "Story deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};