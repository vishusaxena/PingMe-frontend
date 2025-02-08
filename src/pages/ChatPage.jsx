import React from "react";
import { ChatState } from "../Context/ChatProvider";
import { Box } from "@mui/material";
import SideDrawer from "../components/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  const { user } = ChatState();
  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "70%",
          height: "91.5vh",
          padding: "10px",
        }}
      >
        {user && <MyChats />}
        {user && <ChatBox />}
      </Box>
    </div>
  );
};

export default ChatPage;
