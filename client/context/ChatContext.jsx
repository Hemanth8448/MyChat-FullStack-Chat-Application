import {createContext, useContext, useEffect, useState} from "react";
import {AuthContext} from "./AuthContext.jsx";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unSeenMessages, setUnseenMessages] = useState({});

    const {socket, axios} =useContext(AuthContext);

    //function to get all users for sidebar
    const getUsers = async () => {
        try{
            const {data} =await axios.get("/api/messages/user");
            if (data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        }catch(error){
            console.log(error.message);
            console.log("get messages error is executing")
            toast.error(error.message);
        }
    }

    //function to get messages for selected user
    const getMessages= async (userId) =>{
        try{
            const {data} =await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages)
            }
        }catch(error){
            console.log(error.message);
            toast.error(error.message);
        }
    }

    //function to send messages to selected user
    const sendMessage =async (messageData)=>{
        try{
            const {data} =await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
            if (data.success) {
                setMessages((prevMessages)=>[...prevMessages, data.newMessage])
            }else{
                toast.error(data.message);
            }
        }catch(error){
            toast.error(error.message);
        }
    }
    //function to subscribe to messages for selected users
    const subscribeToMessages = async ()=>{
        if(!socket) return;

        socket.on("newMessage",(newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.Seen = true;
                setMessages((prevMessages)=>[...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,[newMessage.senderId] : prevUnseenMessages[newMessage.senderId]? prevUnseenMessages[newMessage.senderId] + 1: 1
                }))
            }
        })
    }

    //function to unsubscribe from messages
    const unSubscribeFromMessages = ()=>{
        if (socket) socket.off("newMessage");
    }

    useEffect(() => {
        subscribeToMessages();
        return () => unSubscribeFromMessages();
    },[socket, selectedUser])

    const value ={
        messages, users, selectedUser, getUsers, getMessages, sendMessage, setSelectedUser, unSeenMessages, setUnseenMessages

    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}