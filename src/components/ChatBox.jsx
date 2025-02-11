import { Box, Typography } from "@mui/material";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      sx={{
        display: { xs: selectedChat ? "flex" : "none", md: "flex" },
        alignItems: "center",
        flexDirection: "column",
        p: 3,
        width: "92%",

        color: "white",
        fontFamily: "'Poppins', sans-serif",
        height: "90%",
      }}
    >
      {selectedChat ? (
        <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      ) : (
        <Typography
          sx={{
            textAlign: "center",
            mt: 2,
            fontSize: "18px",
            color: "white",
            fontWeight: "500",
          }}
        >
          Select a chat to start messaging
        </Typography>
      )}
    </Box>
  );
};

export default Chatbox;
