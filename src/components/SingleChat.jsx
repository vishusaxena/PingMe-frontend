import { useEffect, useRef, useState } from "react";
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

const ENDPOINT = "https://pingme-backend-p56z.onrender.com";
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
  const selectedChatRef = useRef(null);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!selectedChat || !user?.token) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      setLoading(true);
      console.log("Fetching messages for chat:", selectedChat._id);

      const { data } = await axios.get(
        `https://pingme-backend-p56z.onrender.com/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.error("Error fetching messages:", error.response?.data || error);
      setSnackbarMessage("Failed to Load Messages");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const sendMessage = async (event) => {
    if (
      (event.key === "Enter" || event.type === "click") &&
      newMessage.trim()
    ) {
      if (!selectedChat || !user?.token) {
        setSnackbarMessage("Chat not selected or user not authenticated");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return;
      }

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
          chatId: selectedChat._id,
        };

        console.log("Sending message:", requestData);

        const { data } = await axios.post(
          "https://pingme-backend-p56z.onrender.com/api/message",
          requestData,
          config
        );

        setNewMessage("");
        setMessages((prevMessages) => [...prevMessages, data]);
        socket.emit("new message", data);
      } catch (error) {
        console.error("Error sending message:", error.response?.data || error);
        setSnackbarMessage("Failed to send the Message");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
      console.log("Socket connected!"); //
    });

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!selectedChat || !user?.token) return;

    if (selectedChatRef.current === selectedChat._id) return;
    selectedChatRef.current = selectedChat._id;

    fetchMessages();

    setNotification((prev) =>
      prev.filter((n) => n.chat._id !== selectedChat._id)
    );
  }, [selectedChat, user]);

  console.log(notification, "-------");
  useEffect(() => {
    const messageHandler = (newMessageReceived) => {
      console.log("New Message Received:", newMessageReceived);
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification((prev) => [newMessageReceived, ...prev]);
          setFetchAgain(!fetchAgain);
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
              width: "80%",
              height: "100%",
              borderRadius: "10px",
              overflowY: "auto",
              color: "width",
            }}
          >
            {loading ? (
              <CircularProgress
                sx={{ alignSelf: "center", mt: 2, marginBottom: 29 }}
                size={50}
              />
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
