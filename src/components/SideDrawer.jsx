import { useState } from "react";
import {
  Box,
  Button,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Drawer,
  InputBase,
  List,
  ListItem,
  CircularProgress,
  ListItemText,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ProfileModal from "./ProfileModal";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ChatHeader = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    user,
    chats,
    setChats,
    setSelectedChat,
    notification,
    setNotification,
  } = ChatState(); // Integrated notification state

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast.warning("Please enter something in search", {
        position: "top-left",
        autoClose: 5000,
      });
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `https://pingme-backend-p56z.onrender.com/api/user?search=${search}`,
        config
      );
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      toast.error("Error occurred! Failed to load search results", {
        position: "bottom-left",
        autoClose: 5000,
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `https://pingme-backend-p56z.onrender.com/api/chat`,
        { userId },
        config
      );
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      setDrawerOpen(false);
    } catch (error) {
      toast.error("Error fetching the chat", {
        position: "bottom-left",
        autoClose: 5000,
      });
      setLoadingChat(false);
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-around"
        alignItems="center"
        bgcolor="#1E1E2F"
        p={2}
        width="100%"
        color="white"
      >
        <Tooltip title="Search Users to chat" arrow placement="bottom-end">
          <Button
            variant="text"
            startIcon={<SearchIcon />}
            onClick={() => setDrawerOpen(true)}
            sx={{ color: "#E0E0E0" }}
          >
            <Typography
              sx={{
                display: { xs: "none", md: "inline" },
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Search User
            </Typography>
          </Button>
        </Tooltip>
        <Typography
          variant="h5"
          fontFamily="Poppins, sans-serif"
          fontWeight="bold"
        >
          PingMe
        </Typography>
        <Box display="flex" alignItems="center">
          <IconButton
            onClick={(e) => setNotificationMenuAnchor(e.currentTarget)}
          >
            <NotificationsIcon fontSize="large" sx={{ color: "#E0E0E0" }} />
            {notification.length > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {notification.length}
              </Box>
            )}
          </IconButton>
          <Menu
            anchorEl={notificationMenuAnchor}
            open={Boolean(notificationMenuAnchor)}
            onClose={() => setNotificationMenuAnchor(null)}
          >
            {!notification.length && <MenuItem>No New Messages</MenuItem>}
            {notification.map((notif) => (
              <MenuItem
                key={notif._id}
                onClick={() => {
                  setSelectedChat(notif.chat);
                  setNotification(notification.filter((n) => n !== notif));
                }}
              >
                {notif.chat.isGroupChat
                  ? `New Message in ${notif.chat.chatName}`
                  : `New Message from ${notif.chat.users[0].name}`}
              </MenuItem>
            ))}
          </Menu>
          <IconButton onClick={(e) => setProfileMenuAnchor(e.currentTarget)}>
            <Avatar
              sx={{ width: 36, height: 36, border: "2px solid #E0E0E0" }}
              src={user.pic}
            />
            <ExpandMoreIcon sx={{ color: "#E0E0E0" }} />
          </IconButton>
          <Menu
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={() => setProfileMenuAnchor(null)}
          >
            <ProfileModal user={user}>
              <MenuItem>My Profile</MenuItem>
            </ProfileModal>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Box>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{
            width: 350,
            p: 3,
            bgcolor: "#2C2C3E",
            height: "100%",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontFamily: "Poppins, sans-serif" }}
            >
              Search Users
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon sx={{ color: "#E0E0E0" }} />
            </IconButton>
          </Box>
          <Divider sx={{ bgcolor: "#555" }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: 2,
              mb: 2,
              borderRadius: 1,
              bgcolor: "#3C3C4E",
              p: 1,
            }}
          >
            <InputBase
              placeholder="Search by name or email"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ color: "white" }}
            />
            <Button
              onClick={handleSearch}
              sx={{ ml: 1, bgcolor: "#5C5CE6", color: "white" }}
            >
              Go
            </Button>
          </Box>
          {loading ? (
            <CircularProgress
              sx={{ alignSelf: "center", mt: 2, color: "white" }}
            />
          ) : (
            <List>
              {searchResult.map((user) => (
                <ListItem
                  button
                  key={user._id}
                  onClick={() => accessChat(user._id)}
                >
                  <ListItemText
                    primary={user.name}
                    secondary={user.email}
                    sx={{ color: "white" }}
                  />
                </ListItem>
              ))}
            </List>
          )}
          {loadingChat && (
            <CircularProgress
              sx={{ alignSelf: "center", mt: 2, color: "white" }}
            />
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default ChatHeader;
