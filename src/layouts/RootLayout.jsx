import { useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { UserContext } from "../contexts/usercontext"

import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box'

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button'
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import NotesIcon from '@mui/icons-material/Notes';
import Avatar from '@mui/material/Avatar';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ShieldIcon from '@mui/icons-material/Shield';
import { EmojiPeople } from '@mui/icons-material';


const drawerWidth = 200;

 const menuItemsUser = [
    { 
        text: 'My Plans', 
        icon: <NotesIcon color="secondary" />, 
        path: '/' 
    },
    { 
        text: 'Account', 
        icon: <AccountBoxIcon color="secondary" />, 
        path: '/account' 
    },
    {
        text: 'MyBadges',
        icon: <ShieldIcon color="primary" />,
        path: '/myBadges'
    }
  ];

  const menuItemsAdmin = [
    { 
        text: 'My Classes', 
        icon: <NotesIcon color="secondary" />, 
        path: '/classes' 
    },
    { 
        text: 'Account', 
        icon: <AccountBoxIcon color="secondary" />, 
        path: '/account' 
    },
    {
        text: 'Students',
        icon: <EmojiPeople color="secondary" />,
        path: '/students'
    }
  ]

function Layout() {

    const { currentUser, isAdmin, avatar, logout } = useContext(UserContext);
    const location = useLocation()
    const [ menuItems, setMenuItems ] = useState([])



    let history = useNavigate();

    if(currentUser){
        console.log('In Layout user is Admin is '+isAdmin)
    } else {
        history.push('/login')
    }

    useEffect(() => {
        if(isAdmin){
            setMenuItems(menuItemsAdmin)
        } else {
            setMenuItems(menuItemsUser)
        }
    },[isAdmin])

	const logoutHandler = async() => {
        console.log('Logout Clicked');
        await logout().then(() => {
            history.push('/login')
          }).catch((error) => {
            console.log(error)
          });
	};

    if(currentUser) {
        return (
            <Box sx={{display:'flex'}}>
                <AppBar position="fixed" sx={{zIndex: (theme) => theme.zIndex.drawer + 1}} >
                    <Toolbar>
                        <Typography variant="h6" noWrap>
                            DragonBadges
                        </Typography>
                        <Box sx={{flexGrow:1}}/>
                        <Button color='inherit' onClick={() => history.push('/badges')} >Badges</Button>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                        }}
                >
                    <Toolbar />
                    <Divider />
                    <center>
                        <Avatar alt="User Avatar" src={avatar} sx={{height: 110, width: 100, flexShrink: 0, flexGrow: 0, marginTop: 2}} />
                        <p>
                            {' '}
                            {currentUser && currentUser.displayName ? currentUser.displayName : "Welcome!"}
                        </p>
                    </center>
                    <Divider />
                    <List>
                    {menuItems.map((item) => (
                        <ListItem 
                        button 
                        key={item.text} 
                        onClick={() => history.push(item.path)}
                        className={location.pathname === item.path ? null : null}
                        >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                        <ListItem
                        button
                        key='logout'
                        onClick={() => logoutHandler()}
                        >
                            <ListItemIcon>
                                {' '}
                                <ExitToAppIcon />{' '}
                                <ListItemText primary='Logout' />
                            </ListItemIcon>
                        </ListItem>
                    </List>
                </Drawer>
                <Box sx={{width:1, m:2}} >
                  <Outlet/>
                </Box>
            </Box>    
        )
    } else {
        return <div></div>
    }

}

export default Layout;