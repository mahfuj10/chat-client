import React from 'react'
import { Avatar, Box, Typography } from '@mui/material';
import { MdReply } from 'react-icons/md';
import { useAppDispatch } from '../Redux/hooks';
import { selectUser } from '../Redux/counterSlice';
import { ActiveBadge } from '../ActiveBadge/ActiveBadge';


function CovertationUser({ convertionalUser, socket, uid, selectChatBox, onlineUsers }: any) {
    const dispatch = useAppDispatch();
     
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
                    onlineUsers.includes(convertionalUser.uid) ?
                       <ActiveBadge photoURL={convertionalUser.photoURL} />
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