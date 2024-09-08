const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.status(400).json({ message: "UserId parameter not sent with request" });
    }

    try {
        // Check if the chat already exists
        let existingChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ]
        }).populate("users", "-password")
          .populate("latestMessage");

        existingChat = await User.populate(existingChat, {
            path: 'latestMessage.sender',
            select: "name pic email",
        });

        if (existingChat.length > 0) {
            return res.status(200).json(existingChat[0]);
        } else {
            // Create a new chat
            const newChatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId],
            };

            const createdChat = await Chat.create(newChatData);

            // Retrieve and populate the newly created chat
            const fullChat = await Chat.findOne({ _id: createdChat._id })
                .populate("users", "-password");

            const populatedChat = await User.populate(fullChat, {
                path: 'latestMessage.sender',
                select: "name pic email",
            });

            return res.status(200).json(populatedChat);
        }
    } catch (error) {
        console.error("Error accessing chat:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

const fetchChats = asyncHandler(async (req, res) => {
    try {
        const results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 }); // Use "updatedAt" instead of "updateAt"

        const populatedResults = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
        });

        res.status(200).json(populatedResults);
    } catch (error) {
        res.status(500).json({ message: error.message }); // Use status 500 for internal errors
    }
});

const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).json({ message: "Please Fill all the fields" });
    }

    const users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res.status(400).json({ message: "More than 2 users are required to form a group chat" });
    }

    users.push(req.user._id);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user._id,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName },
        { new: true }
    ).populate("users", "-password")
     .populate("groupAdmin", "-password");
    
    if (!updatedChat) {
        return res.status(400).json({ message: "Chat Not Found" });
    } else {
        return res.status(200).json(updatedChat);
    }
});

const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId, 
        { $push: { users: userId } },
        { new: true }
    ).populate("users", "-password")
     .populate("groupAdmin", "-password");

    if (!added) {
        return res.status(400).json({ message: "Chat Not Found" });
    } else {
        return res.status(200).json(added);
    }
});

const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId, 
        { $pull: { users: userId } },
        { new: true }
    ).populate("users", "-password")
     .populate("groupAdmin", "-password");

    if (!removed) {
        return res.status(400).json({ message: "Chat Not Found" });
    } else {
        return res.status(200).json(removed);
    }
});

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup };
