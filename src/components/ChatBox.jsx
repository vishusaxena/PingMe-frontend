import { Box } from "@mui/material";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState(); // Ensure we correctly access `selectedChat`

  return (
    <Box
      sx={{
        display: { xs: selectedChat ? "flex" : "none", md: "flex" },
        alignItems: "center",
        flexDirection: "column",
        p: 3,
        bgcolor: "white",
        width: { xs: "100%", md: "68%" },
        borderRadius: 2,
        border: 1,
        borderColor: "grey.300",
      }}
    >
      {selectedChat ? (
        <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      ) : (
        <Box
          sx={{ textAlign: "center", mt: 2, fontSize: "18px", color: "gray" }}
        >
          Select a chat to start messaging
        </Box>
      )}
    </Box>
  );
};

export default Chatbox;
