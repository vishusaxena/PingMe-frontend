import {
  Avatar,
  Box,
  Typography,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";

const UserListItem = ({ user, handleFunction, isGroupChat = false }) => {
  return (
    <ListItem
      onClick={handleFunction}
      sx={{
        cursor: "pointer",
        backgroundColor: "#E8E8E8",
        "&:hover": { backgroundColor: "#38B2AC", color: "white" },
        borderRadius: 2,
        mb: 1,
        p: 1.5,
      }}
    >
      {/* {!isGroupChat && ( // Hide avatar if it's a group chat
        <ListItemAvatar>
          <Avatar alt={user.name} src={user.pic} />
        </ListItemAvatar>
      )} */}

      <ListItemText
        primary={
          <Typography variant="body1" fontWeight="bold">
            {user.name}
          </Typography>
        }
        secondary={
          <Typography variant="body2">
            <b>Email: </b> {user.email}
          </Typography>
        }
      />
    </ListItem>
  );
};

export default UserListItem;
