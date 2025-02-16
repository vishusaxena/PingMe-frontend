import React, { useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { Box } from "@mui/material";
import SideDrawer from "../components/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",

        width: "100vw",
        color: "white",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {user && <SideDrawer />}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          height: "90vh",
          width: "100vw",
          padding: "1rem",
          gap: "1rem",
        }}
      >
        {user && (
          <Box
            sx={{
              flex: 1,
              borderRadius: "10px",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",
              padding: "10px",
            }}
          >
            <MyChats fetchAgain={fetchAgain} />
          </Box>
        )}
        {user && (
          <Box
            sx={{
              flex: 2,
              bgcolor: "#1E1E1E",
              borderRadius: "10px",

              height: "83vh",
              marginTop: "10px",
            }}
          >
            <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;
