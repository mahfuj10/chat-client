import React, { useEffect, useRef, useState } from 'react';
import { BiConversation } from 'react-icons/bi';
import { IoPersonAddOutline } from 'react-icons/io5';
import { MdOutlineGroupAdd } from 'react-icons/md';
import { FiSettings } from 'react-icons/fi';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Fade,
  Grid,
  Typography,
  Drawer,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Covertation from '../../components/Convertation/Convertation';
import Chat from '../../components/Chat/Chat';
import Groups from '../../components/Groups/Groups';
import GroupChat from '../../components/GroupChat/GroupChat';
import UserDetails from '../../components/UserDetails/UserDetails';
import AddContracts from '../../components/AddContracts/AddContracts';
import GroupDetails from '../../components/GroupDetails/GroupDetails';
import '../../App.css';
import { Navigation } from '../../components/Navigation/Navigation';
import {
  getAllMessages,
  saveSearchName,
  selectUser
} from '../../components/Redux/counterSlice';
import {
  useAppDispatch,
  useAppSelector
} from '../../components/Redux/hooks';

const drawerWidth = { xs: '80%', sm: '60%', md: 350 };

function Home() {
  const {
    convertationUsers,
    joinedGroups,
    selectedUser,
    loginUser,
    openDetailsSection,
    usersDataLoading
  } = useAppSelector(state => state.data);
  const dispatch = useAppDispatch();
  const [activeNum, setActiveNum] = useState(1);
  const socketClient:any = useRef();
  const [groupId, setGroupId] = useState(0);
  const [roomId, setRoomId] = useState<any>();
  const [openSidebar, setOpenSidebar] = useState(1);
  const navigate = useNavigate();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const connectSocket = async () => {
        try {
        setIsLoading(true);
        
        socketClient.current = io.connect("http://localhost:8080");
        socketClient.current.removeAllListeners();
        socketClient.current.emit("user_connected", loginUser.uid)

        handleUpdateUserStatus(socketClient)
      } catch (error) {
        console.error("Error connecting to socket:", error);
      } finally {
        setIsLoading(false);
      }
    };

    connectSocket();

  }, [loginUser.uid]);

  
 

  if (Object.keys(selectedUser).length === 0) {
    for (const converUser of convertationUsers) {
      dispatch(selectUser(converUser));
    }
  }

  useEffect(() => {
    if (activeNum === 3) {
      return;
    } else {
      const id: number = parseFloat(loginUser.createdAt) + parseFloat(selectedUser.createdAt);
      if (isNaN(roomId) === true) {
        setRoomId(id);
      } else {
        setRoomId(id);
        dispatch(getAllMessages(id));
        if (id === roomId) {
          socketClient.current.emit('join_room', roomId);
        }
      }
    }
  }, [selectedUser, roomId, socketClient.current]);

  function handleUpdateUserStatus(socketClient:any) {
    const checkStatusAndHandle = () => {
        if (!isLoading) {
            socketClient.current.on('updateUserStatus', (data:any) => {
                const onlineUserIds = Object.keys(data);
                console.log('onlineUserIds', onlineUserIds);
                setOnlineUsers(onlineUserIds);
                // Recursive call
                handleUpdateUserStatus(socketClient);
            });
        } else {
            setTimeout(checkStatusAndHandle, 1000); // Check again after 1 second
        }
    };

    checkStatusAndHandle();
}


  const handleAddRoomId = (id: any) => {
    setGroupId(id);
  };

  const addConverationRoute = () => {
    setActiveNum(2);
  };

  const handleSetActiveNav = () => {
    handleDrawerOpen();
    setOpenSidebar(11);
  };

  const selectChatBox = () => {
    setActiveNum(1);
    setOpenSidebar(10);
  };

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
    setOpenSidebar(10);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
  };

  const iconsContainer = {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between ',
    mt: 1,
    mb: 4,
    background: "#5C4F81"
  };

  if (isLoading) return <h1>Loading..</h1>;

  return (
    <>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: '#4E426D'
          },
          display: { xs: 'block', lg: 'none' }
        }}
        variant="persistent"
        anchor="left"
        open={openDrawer}
      >
        <CloseIcon
          onClick={handleDrawerClose}
          sx={{
            mt: 3,
            color: "#fff",
            ml: 1
          }}
        />

        {openSidebar === 10 && <AddContracts socket={socketClient} />}
        {openSidebar === 11 && <Groups socket={socketClient} handleAddRoomId={handleAddRoomId} />}
      </Drawer>

      <Grid container id="home">
        <Grid item xs={3} md={4} lg={3} xl={2.5} id="sidebar">
          <Navigation />
          <Box sx={{ px: 2, pb: 1 }}>
            <input
              onChange={e => dispatch(saveSearchName(e.target.value))}
              placeholder='Search People for Messages'
              className='search_input'
              type="search"
            />
          </Box>
          <Box sx={iconsContainer}>
            <span onClick={() => { setActiveNum(1); setOpenSidebar(10); }} className={activeNum === 1 ? 'page_active' : 'top_nav'}>
              <BiConversation />
            </span>
            <span id="mobile_icon" onClick={handleDrawerOpen} className='top_nav'><IoPersonAddOutline /></span>
            <span id="mobile_icon" onClick={handleSetActiveNav} className='top_nav'><MdOutlineGroupAdd /></span>
            <span id="visible_icon" onClick={() => setActiveNum(2)} className={activeNum === 2 ? 'page_active' : 'top_nav'}>
              <IoPersonAddOutline />
            </span>
            <span id="visible_icon" onClick={() => setActiveNum(3)} className={activeNum === 3 ? 'page_active' : 'top_nav'}>
              <MdOutlineGroupAdd />
            </span>
            <span className="top_nav">
              <FiSettings onClick={() => navigate(`/setting/${loginUser.uid}`)} />
            </span>
          </Box>
          {(activeNum === 1 && !isLoading) && <Covertation
            selectChatBox={selectChatBox}
            handleDrawerOpen={handleDrawerOpen}
            addConverationRoute={addConverationRoute}
            socket={socketClient}
            roomId={roomId}
            onlineUsers={onlineUsers}
            uid={selectedUser?.uid}
          />}
          {activeNum === 2 && <AddContracts socket={socketClient} />}
          {activeNum === 3 && <Groups socket={socketClient} handleAddRoomId={handleAddRoomId} />}
        </Grid>

        {(convertationUsers?.length === 0 && activeNum !== 3) &&
  <Grid item xs={9} md={8} lg={9} xl={9.5} sx={{ backgroundColor: "#5C4F81", width: '100vh', transition: '1s', height: '100vh' }}>
    {!usersDataLoading &&
      <Typography id="emptyContactText" variant='h5'>Your contact list is empty. Please add people to start chatting. Happy chatting!</Typography>
    }
  </Grid>
}

  
      {(joinedGroups?.length === 0 && activeNum === 3 && !usersDataLoading) &&
        <Grid item xs={9} md={8} lg={9} xl={9.5} sx={{ backgroundColor: "#5C4F81", width: '100%', transition: '1s', height: '100vh' }}>
          {!usersDataLoading &&
            <Typography id="emptyGroupText" variant='h5'>You have not joined any group yet. Create a group or wait for someone to invite you to join.</Typography>
          }
        </Grid>
      }
  
      {(convertationUsers?.length === 0 && joinedGroups.length !== 0 && !usersDataLoading) &&
        <Grid item xs={9} md={8} lg={openDetailsSection ? 6 : 9} xl={!openDetailsSection ? 9.5 : 7} sx={{ backgroundColor: "#5C4F81", width: '100%', transition: '1s' }}>
          {activeNum === 3 &&
            <GroupChat onlineUsers={onlineUsers} groupId={groupId} socket={socketClient} openSidebar={openSidebar} />
          }
        </Grid>
      }
  
      {(convertationUsers?.length > 0) &&
        <Grid item xs={9} md={8} lg={openDetailsSection ? 6 : 9} xl={!openDetailsSection ? 9.5 : 7} sx={{ backgroundColor: "#5C4F81", width: '100%', transition: '1s' }}>
          {activeNum !== 3 && openSidebar !== 11 &&
            <Chat socket={socketClient} onlineUsers={onlineUsers} selectedUser={selectedUser} roomId={roomId} />
          }
          {(activeNum === 3 || openSidebar === 11) &&
            <GroupChat groupId={groupId} onlineUsers={onlineUsers} socket={socketClient} openSidebar={openSidebar} />
          }
        </Grid>
      }
  
      {openDetailsSection && convertationUsers.length > 0 && !usersDataLoading &&
        <Fade in={openDetailsSection}>
          <Grid item md={3} xs={6} lg={3} xl={2.5} sx={{ background: "#4E426D", display: { xs: 'none', lg: 'block' } }}>
            {activeNum !== 3 &&
              <UserDetails user={selectedUser} />
            }
            {activeNum === 3 &&
              <GroupDetails onlineUsers={onlineUsers} />
            }
          </Grid>
        </Fade>
      }
  
      {(convertationUsers?.length === 0 && joinedGroups.length !== 0 && !usersDataLoading) &&
        <Fade in={openDetailsSection}>
          <Grid item md={3} xs={6} lg={3} xl={2.5} sx={{ background: "#4E426D", display: { xs: 'none', lg: 'block' } }}>
            {activeNum === 3 &&
              <GroupDetails onlineUsers={onlineUsers} />
            }
          </Grid>
        </Fade>
      }
    </Grid>
  </>
  );
  }
  
  export default Home;
  