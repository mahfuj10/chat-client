import { Avatar, Box, CircularProgress, IconButton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { IoMdSend } from 'react-icons/io';
import ScrollToBottom from "react-scroll-to-bottom";
import { MdCameraAlt } from 'react-icons/md';
import { useFirebase } from '../hooks/useFirebase';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '../Redux/hooks';
import { FacebookCircularProgress } from '../Loader/Loader';
import Message from '../Message/Message';
import '../../App.css';
import { ExpendMenu } from './ExpendMenu';
import UserTypeing from '../UserTypeing/UserTypeing';


function Chat({ socket, roomId, onlineUsers }: any) {

    const { user } = useFirebase();
    const { register, watch, setValue, } = useForm();
    const { selectedUser, messageDataLoading, deleteTextLoading, allMessageDeleteLoading, loginUser } = useAppSelector(state => state.data);
    const [currentMessage, setCurrentMessage] = useState<any>("");
    const [imgLoading, setImgLoading] = useState<boolean>(false);
    const [photoUrl, setPhotoUrl] = useState<string>('');
    const [messageList, setMessageList] = useState<any[]>([]);
    const [typeingUser, setTypeingUser] = useState<any>({});
    const [textLoading, setTextLoading] = useState<boolean>(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [audio] = useState(new Audio('../../utlis/message.mp3'));


    // load message 
    useEffect(() => {
        const getMessages = async () => {
            try {
                await axios.get(`http://localhost:8080/chat/${roomId}`)
                    .then(res => {
                        setMessageList(res.data);
                    });
                
                const unreadMessages = messageList.filter(message => !message.read)
                if(unreadMessageCount > 0){
                    await readMessages()
                }
                setUnreadMessageCount(unreadMessages.length)
            } catch (err) {
                console.error(err);
            };
        };
        getMessages();
    }, [roomId, selectedUser, deleteTextLoading, allMessageDeleteLoading]);


    // message data
    const senderMessageData = async () => {
        setTextLoading(true);
        const messageData = {
            roomId: parseInt(roomId),
            message: currentMessage,
            image: user.photoURL,
            userId: user.uid,
            picture: photoUrl,
            read: false,
            time: Date.now()
        };
        try {
            await axios.post(`http://localhost:8080/chat`, messageData)
            console.log(messageData);
            setTextLoading(false);
            setPhotoUrl('');
        } catch (err) {
            console.error(err)
        }

        await socket.current.emit("send_message", messageData);
        await socket.current.emit('chatSound');
        setMessageList((list) => [...list, messageData]);
        setPhotoUrl('');
        setCurrentMessage("");
    };

    // send message another people 
    const sendMessage = async () => {

        if (photoUrl !== '' && currentMessage === '') {
            senderMessageData();
        };
        if (currentMessage !== "" && photoUrl === '') {
            senderMessageData();
        };
        if (currentMessage !== "" && photoUrl !== '') {
            senderMessageData();
        };
    };

    //image uploading
    useEffect(() => {
        const imgFile = watch('picFile');
        if (imgFile?.length) {
            let body = new FormData();
            body.set('key', '18b523a65ed553a3bb7441153cbee867')
            body.append('image', imgFile[0])
            setImgLoading(true);
            axios({
                method: 'post',
                url: 'https://api.imgbb.com/1/upload',
                data: body
            }).then(res => {
                setPhotoUrl(res.data.data.url);
                setValue('picFile', res.data.data.url);
            }).finally(() => setImgLoading(false))
        }
        else {
        }

    }, [watch('picFile')]);

    async function readMessages(){
      try{
        const res = await axios.put(`http://localhost:8080/chat/read_messages?roomId=${roomId}`)
        // console.log(res);
        console.log('object', res);
      }catch(err){
        console.log(err);
      }
    }

    // recive message from another person
    useEffect(() => {
        const handleReceiveMessage = (data: any) => {
            const upcomeingMessages: any[] = [...messageList, data];
            setTypeingUser({});
            setMessageList(upcomeingMessages);
            
            if (data.userId === selectedUser.uid) {
                readMessages();
            }
        };
    
        socket.current?.on("recive_message", handleReceiveMessage);
    
        return () => {
            socket.current?.off("recive_message", handleReceiveMessage);
        };
    }, [messageList, selectedUser, socket]);
    

    // user typeing message function
    const userData = { name: loginUser.displayName, photo: loginUser.photoURL, roomId, uid: loginUser.uid }

    const userTypeing = () => {
        socket?.current.emit('typing', userData);
    };
 
    useEffect(() => {
        const handleFocusOut = () => {
            socket?.current.emit('typing', {});
        };
    
        const handleTyping = (data:any) => {
            setTypeingUser(data);
        };
    
        const handleDeleteMessage = (data:any) => {
            const filterMessages = messageList?.filter(message => message._id !== data._id);
            setMessageList(filterMessages);
        };
    
        document?.getElementById("message_field")?.addEventListener('focusout', handleFocusOut);
        socket?.current?.on('typing', handleTyping);
        socket?.current?.on("deleteMessage", handleDeleteMessage);
    
        // Cleanup function
        return () => {
            document?.getElementById("message_field")?.removeEventListener('focusout', handleFocusOut);
            socket?.current?.off('typing', handleTyping);
            socket?.current?.off("deleteMessage", handleDeleteMessage);
        };
    
    }, [socket, messageList, currentMessage]);
    

    // styleSheet
    const chatHeader = {
        boxShadow: 0,
        width: "100%",
        background: "#4E426D",
        ml: { xs: 0, md: 4 },
        mt: { xs: 0, md: 4 },
        mb: 0,
        p: 1.3,
        display: { xs: 'block', md: 'flex' },
        justifyContent: 'space-between'
    };


    return (
        <>
            {/* chat header */}
{/* {unreadMessageCount} */}
            <Box sx={chatHeader}>

                <Box sx={{ display: 'flex', gap: 2 }}>

                    <Avatar alt="userimage" sx={{ width: { xs: 'none', md: 'block' } }} src={selectedUser.photoURL} />

                    <span>
                        <Typography sx={{ fontSize: 15, color: "#fff" }} variant="h6">
                            {selectedUser.displayName}
                        </Typography>

                        <small style={{ color: "#ddd6d6" }}>
                            { 
                                 onlineUsers.includes(selectedUser.uid) ? 'Online' : '' 
                            }
                        </small>

                    </span>

                </Box>

                <Box sx={{ mt: 0.5 }}>
                    <ExpendMenu
                        roomId={roomId}
                    />
                </Box>

            </Box>



            {/* messages  */}

            <Box sx={{ p: 4 }}>

                {
                    messageDataLoading && <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: { xs: '30rem', md: '34rem', xl: 680 }
                    }}>
                        <FacebookCircularProgress />
                    </Box>
                }

                <Box className="message_container" sx={{ height: { xs: '30rem', md: '34rem',lg: 400, xl: 550 } }}>


                    {
                        messageList?.length === 0 && !messageDataLoading && <Box className='' sx={{ mt: 5, height: { xl: 680, md: 350, lg: 400 } }}>

                            <Avatar alt="userimage" sx={{ height: 80, width: 80, m: '0 auto' }} src={selectedUser.photoURL} />

                            <Typography sx={{ textAlign: 'center', color: 'whitesmoke' }} variant="h6">{selectedUser.displayName}</Typography>

                        </Box>
                    }


                    {
                        !messageDataLoading && <ScrollToBottom>
                            {
                                messageList.map((messageContent) => <Message
                                    messageContent={messageContent}
                                    user={user}
                                    socket={socket}
                                    roomId={roomId}
                                    key={messageContent._id}
                                    textLoading={textLoading}
                                />)
                            }
                        </ScrollToBottom>
                    }

                </Box>

            </Box>
            {/* { xl: 680 } */}

            {/* typeing user */}
            <UserTypeing
                roomId={roomId}
                typeingUser={typeingUser}
            />

            {/* send message section */}
            {!messageDataLoading &&

                <Box sx={{ p: 4, mb: 4 }} id="bottom_nav">


                    {
                        photoUrl !== '' &&
                        <Box sx={{ position: 'absolute', bottom: 140 }}>
                            <Avatar sx={{ width: 150, height: 100, borderRadius: 2, boxShadow: 2 }} alt="yourselectpicture" src={photoUrl} />
                        </Box>
                    }


                    <textarea
                        onKeyPress={userTypeing}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder='Enter a Message'
                        value={currentMessage}
                        id="message_field"
                        style={{
                            width: '100%',
                            height: 60,
                            background: "#4E426D",
                            borderRadius: 10,
                            marginBottom: 5,
                            color:'white',
                            padding:'10px'
                        }}
                    />


                    <Box sx={{ mt: 0, float: "right" }}>

                        <label htmlFor="icon-button-file">

                            <input
                                style={{ display: 'none' }}
                                id="icon-button-file"
                                accept='image/*'
                                {...register("picFile")}
                                type="file"
                            />

                            <IconButton sx={{ background: "#4E426D", color: "#fff", fontSize: 18 }} aria-label="upload picture" component="span">
                                <MdCameraAlt />
                            </IconButton>
                        </label>
                        {
                            !imgLoading ?
                                <IconButton onClick={sendMessage} sx={{ background: "#4E426D", color: "#fff", fontSize: 14, ml: 3, '&:hover': { background: "#4E426D" } }} >
                                    <IoMdSend />
                                </IconButton>
                                :
                                <IconButton sx={{ background: "#4E426D", color: "#fff", ml: 3, '&:hover': { background: "#4E426D" } }} >
                                    <CircularProgress size={14} sx={{ color: "#fff" }} />
                                </IconButton>

                        }
                    </Box>



                </Box>

            }

        </>

    )
}

export default Chat;