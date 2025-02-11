import React, { useState } from "react";
import { Modal, Box, Typography, Button, IconButton } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { ChatState } from "../Context/ChatProvider"; // Import ChatState

const ProfileModal = ({ user, children }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (!user) {
    console.log("User is undefined in ProfileModal"); // Debugging
    return null; // Or show a loading state
  }

  return (
    <>
      {children ? (
        <span onClick={handleOpen}>{children}</span>
      ) : (
        <IconButton onClick={handleOpen} sx={{ color: "white" }}>
          <Visibility />
        </IconButton>
      )}

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h4">{user?.name || "Unknown User"}</Typography>
          <img
            src={user?.pic || "default-avatar.png"}
            alt={user?.name || "User"}
            style={{
              borderRadius: "50%",
              width: "150px",
              height: "150px",
              margin: "20px auto",
            }}
          />
          <Typography variant="h6">
            Email: {user?.email || "No Email"}
          </Typography>
          <Button variant="contained" onClick={handleClose} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default ProfileModal;
