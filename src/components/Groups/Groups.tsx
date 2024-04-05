import React, { useEffect, useState } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import GroupsModal from './GroupsModal';
import { useAppDispatch, useAppSelector } from '../Redux/hooks';
import Group from './Group';
import './Groups.css';
import { getJoinedGroups } from '../Redux/counterSlice';

const Groups = ({ socket, handleAddRoomId }: any) => {

    const [open, setOpen] = React.useState<boolean>(false);
    const [myGroups, setMyGroups] = useState<any[]>([]);
    const dispatch = useAppDispatch();
    const { loginUser, allUsers, allGroups, groupsDataLoading } = useAppSelector(state => state?.data);
    const currentUser = allUsers?.find(user => user?.uid === loginUser?.uid);


    useEffect(() => {

        if (!currentUser?.groups) return;
    
        const groups: any[] = [];
    
        for (let groupID of currentUser?.groups) {
            const matchGroup = allGroups?.find(group => group.groupId === groupID);
            groups.push(matchGroup);
        };
    
        setMyGroups(groups);
        dispatch(getJoinedGroups(groups));
    }, [allGroups, currentUser?.groups, dispatch]);


    useEffect(() => {
        socket.current?.on('joinedgroup', function (data: any) {
            setMyGroups(prev => [...prev, data])
            console.log('joined',data)
        });
    }, [socket, dispatch])

    const handleAddCreatedGroup = (data: any) => {
        setMyGroups(prev => [...prev, data])
    } 

    const handleOpen = () => setOpen(true);

    const handleClose = () => setOpen(false);
    
    // stylesheet
    const textStyle = {
        mb: 2,
        textAlign: 'center',
        color: 'whitesmoke',
        letterSpacing: 2,
        fontSize: '1.5rem',
    }


    return (

        <>
                <button type='button' onClick={handleOpen} className='creatGroupBtn'>CREATE GROUP</button>


            {
                myGroups?.length !== 0 && !groupsDataLoading && <Box sx={{ height: 550, overflowY: 'scroll' }}>


                    {
                        myGroups.map((group: any) => <Group
                            key={group?._id}
                            group={group}
                            mygroups={myGroups}
                            socket={socket}
                            handleAddRoomId={handleAddRoomId}
                        />
                        )
                    }


                </Box>
            }

            {
                groupsDataLoading && <Box>

                    {
                        [...new Array(5)].map((ske, index) => <Skeleton
                            sx={{ height: 90 }}
                            key={index}
                        />)
                    }

                </Box>
            }

            {
                !groupsDataLoading && myGroups.length === 0 &&
                <Typography sx={textStyle} variant="h5">
                    You've not joined any group yet.
                </Typography>
            }

           


            <GroupsModal
                socket={socket}
                open={open}
                handleClose={handleClose}
                handleAddCreatedGroup={handleAddCreatedGroup}
            />
        </>
    )
}

export default Groups;