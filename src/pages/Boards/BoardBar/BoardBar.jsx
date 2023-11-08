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
  color: 'white',
  backgroundColor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '& .MuiSvgIcon-root': {
    color: 'white',
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
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? '#34495e' : '#1976d2',
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
        <Button
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              borderColor: 'white',
            },
          }}
          variant="outlined"
          startIcon={<PersonAddIcon />}
        >
          Invite
        </Button>
        <AvatarGroup
          max={4}
          sx={{
            gap: '10px',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              fontSize: 16,
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              '&:first-of-type': { bgcolor: '#a4b0be' },
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
