import { Avatar, Tooltip } from "@mui/material";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { useEffect } from "react"; // Import

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  // Debugging: Log the type and value of messages

  useEffect(() => {
    console.log("Messages updated in ScrollableChat:", messages);
  }, [messages]); // Log only when messages update

  // Check if messages is an array
  if (!Array.isArray(messages)) {
    console.error("Error: messages is not an array. Received:", messages);
    return <p>Error: Messages data is invalid.</p>;
  }

  return (
    <ScrollableFeed>
      {messages.map((m, i) => (
        <div style={{ display: "flex", alignItems: "center" }} key={m._id}>
          {(isSameSender(messages, m, i, user._id) ||
            isLastMessage(messages, i, user._id)) && (
            <Tooltip title={m.sender.name} arrow>
              <Avatar
                alt={m.sender.name}
                src={m.sender.pic}
                sx={{
                  width: 32,
                  height: 32,
                  marginRight: 1,
                  marginTop: "7px",
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          )}
          <span
            style={{
              backgroundColor:
                m.sender._id === user._id ? "blueviolet" : "blue",
              marginLeft: isSameSenderMargin(messages, m, i, user._id),
              marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
              borderRadius: "20px",
              padding: "6px 14px",
              maxWidth: "75%",
              display: "inline-block",
              fontSize: "14px",
              wordWrap: "break-word",
            }}
          >
            {m.content}
          </span>
        </div>
      ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
