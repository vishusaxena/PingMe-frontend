import { useEffect, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
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
        headers: { Authorization: `Bearer ${user.token}` },
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
      if (!newMessage.trim()) return; // Prevent sending empty messages

      socket.emit("stop typing", selectedChat._id);

      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const requestData = {
          content: newMessage.trim(),
          chatId: selectedChat?._id, // Ensure chatId is valid
        };

        console.log("Sending message:", requestData); // Debug request

        const { data } = await axios.post(
          "http://localhost:5000/api/message",
          requestData,
          config
        );

        setNewMessage(""); // Clear input
        setMessages((prevMessages) => [...prevMessages, data]); // Update UI immediately
        socket.emit("new message", data); // Emit message to socket
      } catch (error) {
        console.error("Send message error:", error.response?.data || error);
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

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      selectedChatCompare = selectedChat;
    }
  }, [selectedChat]);

  useEffect(() => {
    const messageHandler = (newMessageReceived) => {
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
    };

    socket.on("message received", messageHandler);

    return () => {
      socket.off("message received", messageHandler); // Cleanup to prevent duplicates
    };
  }, [selectedChat]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    let timerLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "white",
            }}
          >
            <IconButton
              sx={{ color: "white", display: { xs: "flex", md: "none" } }}
              onClick={() => setSelectedChat("")}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h6"
              fontFamily="'Poppins', sans-serif"
              fontWeight="500"
            >
              {selectedChat.isGroupChat
                ? selectedChat.chatName.toUpperCase()
                : getSender(user, selectedChat.users)}
            </Typography>
            {!selectedChat.isGroupChat ? (
              <ProfileModal user={getSenderFull(user, selectedChat.users)} />
            ) : (
              <UpdateGroupChatModal
                fetchMessages={fetchMessages}
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
              />
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 2,
              bgcolor: "#2A2A2A",
              width: "100%",
              height: "100%",
              borderRadius: "10px",
              overflowY: "auto",
              color: "width",
            }}
          >
            {loading ? (
              <CircularProgress sx={{ alignSelf: "center", mt: 2 }} size={50} />
            ) : (
              <ScrollableChat messages={messages} />
            )}

            {istyping && (
              <Lottie
                options={defaultOptions}
                width={70}
                height={30}
                style={{ marginBottom: 15 }}
              />
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#3A3A3A",
                borderRadius: "10px",
                p: 1,
                mt: 2,
              }}
            >
              <TextField
                fullWidth
                variant="standard"
                placeholder="Enter a message..."
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={sendMessage}
                sx={{
                  input: {
                    color: "white",
                    fontFamily: "'Poppins', sans-serif",
                  },
                }}
              />
              <IconButton onClick={() => sendMessage({ key: "Enter" })}>
                <SendIcon sx={{ color: "#00A86B" }} />
              </IconButton>
            </Box>
          </Box>
        </>
      ) : (
        <Typography variant="h5" sx={{ textAlign: "center", mt: 5 }}>
          Click on a user to start chatting
        </Typography>
      )}
    </>
  );
};

export default SingleChat;
