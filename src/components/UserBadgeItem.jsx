import { Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Chip
      label={`${user.name}${admin === user._id ? " (Admin)" : ""}`}
      onDelete={handleFunction}
      color="primary"
      variant="outlined"
      deleteIcon={<CloseIcon />}
      sx={{ m: 0.5, fontSize: 12, px: 1 }}
    />
  );
};

export default UserBadgeItem;
