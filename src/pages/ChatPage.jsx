import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  TextField,
  Button,
  Snackbar,
} from "@mui/material";
import axios from "axios";

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [openToast, setOpenToast] = useState(false);
  const user = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/chat", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats", error);
    }
  };

  const accessChat = async (userId) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/chat",
        { userId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSelectedChat(data);
      fetchChats();
      setMessage("Chat created successfully");
      setOpenToast(true);
    } catch (error) {
      console.error("Error accessing chat", error);
    }
  };

  const createGroupChat = async (groupName, userIds) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/chat/group",
        { name: groupName, users: JSON.stringify(userIds) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setChats([data, ...chats]);
      setMessage("Group created successfully");
      setOpenToast(true);
    } catch (error) {
      console.error("Error creating group chat", error);
    }
  };

  const searchUsers = async () => {
    if (!search) return;
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/user?search=${search}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setUsers(data);
    } catch (error) {
      console.error("Error searching users", error);
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      {/* Navbar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            PINGme
          </Typography>
          <TextField
            label="Search Users"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mx: 2, bgcolor: "white" }}
          />
          <Button variant="contained" onClick={searchUsers}>
            Search Chat
          </Button>
          <Button variant="contained" sx={{ ml: 2 }}>
            Add Group Chat
          </Button>
        </Toolbar>
      </AppBar>

      <Box display="flex" flex={1}>
        {/* Sidebar */}
        <Box width="30%" p={2} bgcolor="#f0f0f0">
          <Typography variant="h6">Chats</Typography>
          <List>
            {chats.map((chat) => (
              <ListItem
                button
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                sx={{
                  bgcolor: chat.isGroupChat ? "#d1c4e9" : "#bbdefb",
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <ListItemText
                  primary={
                    chat.isGroupChat
                      ? chat.chatName
                      : chat.users.find((u) => u._id !== user._id)?.name
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Main Chat Window */}
        <Box
          flex={1}
          p={2}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          {selectedChat ? (
            <Typography variant="h6">
              Chat with{" "}
              {selectedChat.isGroupChat
                ? selectedChat.chatName
                : selectedChat.users.find((u) => u._id !== user._id)?.name}
            </Typography>
          ) : (
            <Typography variant="h6">
              Select a chat to start messaging
            </Typography>
          )}
        </Box>
      </Box>

      <Snackbar
        open={openToast}
        autoHideDuration={3000}
        onClose={() => setOpenToast(false)}
        message={message}
      />
    </Box>
  );
};

export default ChatPage;
