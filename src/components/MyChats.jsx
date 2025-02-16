import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
  Button,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import GroupChatModal from "./GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const [loading, setLoading] = useState(false);
  const { user, chats, setChats, selectedChat, setSelectedChat } = ChatState();

  const fetchChats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(
        "https://pingme-backend-p56z.onrender.com/api/chat",
        config
      );
      setChats(data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load chats", {
        position: "bottom-left",
        autoClose: 5000,
        closeOnClick: true,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || chats.length > 0) return; // Don't refetch if chats already exist

    fetchChats();
  }, [user, fetchAgain]);

  return (
    <Box
      sx={{
        width: "40vw",
        height: "78vh",
        bgcolor: "#121212",
        color: "white",
        p: 2,

        boxShadow: 3,
        overflowY: "auto",
        borderRadius: "10px",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        mb={2}
        fontSize={40}
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        My Chats
        <GroupChatModal>
          <Button sx={{ color: "white", border: 1 }}>
            <IconButton color="primary">
              <AddIcon />
            </IconButton>
            New Group Chat
          </Button>
        </GroupChatModal>
      </Typography>

      {loading ? (
        <CircularProgress
          sx={{ display: "block", mx: "auto", color: "white" }}
        />
      ) : (
        <List>
          {chats.length > 0 ? (
            chats.map((chat) => (
              <ListItem
                key={chat._id}
                button
                selected={selectedChat?._id === chat._id}
                onClick={() => {
                  if (selectedChat?._id !== chat._id) {
                    setSelectedChat(chat);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: selectedChat?._id === chat._id ? "#1e88e5" : "#333",
                  color: "white",
                  "&:hover": { bgcolor: "#1e88e5" },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={
                      chat.isGroupChat
                        ? "https://via.placeholder.com/150?text=Group" // Online default avatar for group chats
                        : chat.users.find((u) => u._id !== user._id)?.pic
                    }
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    chat.isGroupChat
                      ? chat.chatName
                      : chat.users.find((u) => u._id !== user._id)?.name
                  }
                  secondary={
                    chat.latestMessage?.content || "No recent messages"
                  }
                  sx={{ color: "white" }}
                />
              </ListItem>
            ))
          ) : (
            <Typography textAlign="center">No chats available</Typography>
          )}
        </List>
      )}
    </Box>
  );
};

export default MyChats;
