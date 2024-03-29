import React, { useEffect, useState } from 'react'
import { Avatar, Box, Typography } from '@mui/material';
import { MdReply } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../Redux/hooks';
import { selectUser } from '../Redux/counterSlice';
import { ActiveBadge } from '../ActiveBadge/ActiveBadge';
import { useFirebase } from '../hooks/useFirebase';


function CovertationUser({ convertionalUser, socket, uid, selectChatBox }: any) {


    const dispatch = useAppDispatch();
    const [matchUser, setMatchUser] = useState<any>({});
    const [onlineUsers, setOnlineUsers] = useState([])
    const {user} = useFirebase()


    useEffect(() => {
        socket.current.emit("new-user-add", user.uid);
        socket.current.on("get-users", (users:any) => {
          setOnlineUsers(users);
        });
      }, [uid]);

      useEffect(() => {
        // Tab has focus
        const handleFocus = async () => {
          socket.current.emit("new-user-add", user.uid);
          socket.current.on("get-users", (users:any) => {
            setOnlineUsers(users);
          });
        };
    
        // Tab closed
        const handleBlur = () => {
          if(uid) {
            socket.current.emit("offline")   
          }
        };
    
        // Track if the user changes the tab to determine when they are online
        window?.addEventListener('focus', handleFocus);
        window?.addEventListener('blur', handleBlur);
    
        return () => {
          window?.removeEventListener('focus', handleFocus);
          window?.removeEventListener('blur', handleBlur);
        };   
      }, [uid]);

      
      function extractOnlineUsers(){
          const arr = []
          if(onlineUsers.length < 1) return []
          for(const user of onlineUsers as any){
              arr.push(user.userId)
            }
            return arr
        }
        
        console.log('sdfsdf',extractOnlineUsers());
    return (

        <>
            <Box
                onClick={() => {
                    dispatch(selectUser(convertionalUser))
                    selectChatBox()
                }}
                sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: 'center',
                    mb: 3,
                    p: 1,
                    borderRadius: uid === convertionalUser.uid ? 0 : 2,
                    background: uid === convertionalUser.uid ? 'none' : '#5C4F81',
                    borderRight: uid === convertionalUser.uid ? '3px solid #5C4F81' : ''
                }}>

                {/* ActiveBadge */}

                {
                    extractOnlineUsers().includes(convertionalUser?.uid) ?
                        <ActiveBadge 
                        src={convertionalUser.photoURL} />
                        :
                        <Avatar
                            alt="user photo"
                            sx={{
                                width: { xs: 30, md: 50 },
                                height: { xs: 30, md: 50 },
                            }}
                            src={convertionalUser.photoURL}
                        />

                }

                <Box sx={{ display: { xs: 'none', md: 'block' } }}>


                    <Typography variant='h6' sx={{ fontSize: 16, color: "whitesmoke" }}>
                        {convertionalUser.displayName}
                    </Typography>

                    <Typography variant='h6' sx={{ fontSize: 11, color: '#9881d6' }}>

                        {
                            uid === convertionalUser.uid && <MdReply className='reply_icon'
                            />
                        }

                        {convertionalUser.email}

                    </Typography>

                </Box>

            </Box>
        </>
    )
}

export default CovertationUser;