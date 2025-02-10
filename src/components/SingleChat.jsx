import { useEffect, useState } from "react";
import SendIcon from "@mui/icons-material/Send"; // Import the icon

import {
  Box,
  Typography,
  IconButton,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Lottie from "react-lottie";
import io from "socket.io-client";
import axios from "axios";
import animationData from "../animations/typing.json";

import ScrollableChat from "./ScrollableChat";
import ProfileModal from "./ProfileModal";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);

  // State for Snackbar (Material UI's notification system)
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:5000/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      setSnackbarMessage("Failed to Load Messages");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" || event.type === "click") {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(
          "http://localhost:5000/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        setNewMessage("");
        setMessages((prevMessages) => [...prevMessages, data]);

        socket.emit("new message", data);

        fetchMessages(); // Force update messages after sending
      } catch (error) {
        setSnackbarMessage("Failed to send the Message");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      selectedChatCompare = selectedChat;
    }
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.some((n) => n._id === newMessageReceived._id)) {
          setNotification((prev) => [newMessageReceived, ...prev]);
          setFetchAgain((prev) => !prev);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Typography
            variant="h5"
            sx={{
              pb: 2,
              px: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <IconButton
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={() => setSelectedChat("")}
            >
              <ArrowBackIcon />
            </IconButton>
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              p: 2,
              bgcolor: "#E8E8E8",
              width: "100%",
              height: "100%",
              borderRadius: 2,
              overflowY: "auto",
            }}
          >
            {loading ? (
              <CircularProgress
                sx={{ alignSelf: "center", margin: "auto" }}
                size={50}
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <Box sx={{ mt: 2 }}>
              {istyping && (
                <Lottie
                  options={defaultOptions}
                  width={70}
                  style={{ marginBottom: 15 }}
                />
              )}
              <TextField
                fullWidth
                variant="filled"
                placeholder="Enter a message..."
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={sendMessage}
                sx={{
                  backgroundColor: "#E0E0E0",
                  borderRadius: 1,
                }}
              />
              <IconButton
                onClick={() => sendMessage({ key: "Enter" })} // Simulate Enter key event
                color="primary"
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="h4">
            Click on a user to start chatting
          </Typography>
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SingleChat;
