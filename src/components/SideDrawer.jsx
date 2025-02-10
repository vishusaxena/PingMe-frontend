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

  const { user, chats, setChats, setSelectedChat } = ChatState();
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
        closeOnClick: true,
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(
        `http://localhost:5000/api/user?search=${search}`,
        config
      );
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      toast.error("Error occurred! Failed to load search results", {
        position: "bottom-left",
        autoClose: 5000,
        closeOnClick: true,
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `http://localhost:5000/api/chat`,
        { userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      setDrawerOpen(false); // Close the drawer after selecting a user
    } catch (error) {
      toast.error("Error fetching the chat", {
        position: "bottom-left",
        autoClose: 5000,
        closeOnClick: true,
      });
      setLoadingChat(false);
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bgcolor="#121212"
        width="100%"
        padding="5px 10px"
        color="white"
        border={1}
      >
        <Tooltip title="Search Users to chat" arrow placement="bottom-end">
          <Button
            variant="text"
            startIcon={<SearchIcon />}
            onClick={() => setDrawerOpen(true)}
          >
            <Typography sx={{ display: { xs: "none", md: "inline" }, px: 2 }}>
              Search User
            </Typography>
          </Button>
        </Tooltip>
        <Typography variant="h6" fontFamily="Work Sans">
          PingMe
        </Typography>
        <Box display="flex" alignItems="center" color="white">
          <IconButton
            onClick={(e) => setNotificationMenuAnchor(e.currentTarget)}
          >
            <NotificationsIcon fontSize="large" sx={{ color: "white" }} />
          </IconButton>
          <Menu
            anchorEl={notificationMenuAnchor}
            open={Boolean(notificationMenuAnchor)}
            onClose={() => setNotificationMenuAnchor(null)}
          >
            <MenuItem>No New Messages</MenuItem>
          </Menu>
          <IconButton onClick={(e) => setProfileMenuAnchor(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, border: 1 }} src={user.pic} />
            <ExpandMoreIcon />
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
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Search Users
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 2 }}>
            <InputBase
              placeholder="Search by name or email"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ p: 1, border: "1px solid #ccc", borderRadius: 1 }}
            />
            <Button onClick={handleSearch} sx={{ ml: 1 }}>
              Go
            </Button>
          </Box>
          {loading ? (
            <CircularProgress sx={{ alignSelf: "center", mt: 2 }} />
          ) : (
            <List>
              {searchResult.map((user) => (
                <ListItem
                  button
                  key={user._id}
                  onClick={() => accessChat(user._id)}
                >
                  <ListItemText primary={user.name} secondary={user.email} />
                </ListItem>
              ))}
            </List>
          )}
          {loadingChat && (
            <CircularProgress sx={{ alignSelf: "center", mt: 2 }} />
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default ChatHeader;
