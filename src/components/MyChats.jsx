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
        "http://localhost:5000/api/chat",
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
                onClick={() => setSelectedChat(chat)}
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
                    src={chat.users.find((u) => u._id !== user._id)?.pic}
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
                  sx={{ color: "rgba(255,255,255,0.7)" }}
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
