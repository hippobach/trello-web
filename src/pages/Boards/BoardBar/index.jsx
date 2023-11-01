import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import BoltIcon from '@mui/icons-material/Bolt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import FilterListIcon from '@mui/icons-material/FilterList';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const MENU_STYLE = {
  color: 'primary.main',
  backgroundColor: 'white',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '& .MuiSvgIcon-root': {
    color: 'primary.main',
  },
  '&:hover': {
    backgroundColor: 'primary.50',
  },
};

const BoardBar = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: (theme) => theme.trello.boardBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        paddingX: 2,
        overflowX: 'auto',
        borderTop: '1px solid #00bfa5',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          sx={MENU_STYLE}
          icon={<DashboardIcon />}
          label="Hipop Bach"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<VpnLockIcon />}
          label="Public/Private Workspace"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<AddToDriveIcon />}
          label="Add to Google Drive"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="outlined" startIcon={<PersonAddIcon />}>
          Invite
        </Button>
        <AvatarGroup
          max={4}
          sx={{
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              fontSize: 16,
            },
          }}
        >
          <Tooltip title="hipopbach">
            <Avatar
              alt="Hippo Bach"
              src="https://lh3.googleusercontent.com/a/ACg8ocL6xAp_sIJLsQdjDaQhg8wyIeJpy9cCpwzNIk1-5LokRcE=s288-c-no"
            />
          </Tooltip>
          <Tooltip title="hipopbach">
            <Avatar
              alt="Hippo Bach"
              src="https://lh3.googleusercontent.com/a/ACg8ocL6xAp_sIJLsQdjDaQhg8wyIeJpy9cCpwzNIk1-5LokRcE=s288-c-no"
            />
          </Tooltip>
          <Tooltip title="hipopbach">
            <Avatar
              alt="Hippo Bach"
              src="https://lh3.googleusercontent.com/a/ACg8ocL6xAp_sIJLsQdjDaQhg8wyIeJpy9cCpwzNIk1-5LokRcE=s288-c-no"
            />
          </Tooltip>
          <Tooltip title="hipopbach">
            <Avatar
              alt="Hippo Bach"
              src="https://lh3.googleusercontent.com/a/ACg8ocL6xAp_sIJLsQdjDaQhg8wyIeJpy9cCpwzNIk1-5LokRcE=s288-c-no"
            />
          </Tooltip>
          <Tooltip title="hipopbach">
            <Avatar
              alt="Hippo Bach"
              src="https://lh3.googleusercontent.com/a/ACg8ocL6xAp_sIJLsQdjDaQhg8wyIeJpy9cCpwzNIk1-5LokRcE=s288-c-no"
            />
          </Tooltip>
          <Tooltip title="hipopbach">
            <Avatar
              alt="Hippo Bach"
              src="https://lh3.googleusercontent.com/a/ACg8ocL6xAp_sIJLsQdjDaQhg8wyIeJpy9cCpwzNIk1-5LokRcE=s288-c-no"
            />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  );
};

export default BoardBar;
