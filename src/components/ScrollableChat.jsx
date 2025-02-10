import { Avatar, Tooltip } from "@mui/material";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  // Debugging: Log the type and value of messages
  console.log("Messages received in ScrollableChat:", messages);
  console.log("Type of messages:", typeof messages);

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
                m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0",
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
