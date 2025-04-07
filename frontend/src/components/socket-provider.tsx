import { createContext, useEffect, useRef } from "react";
import { Socket, Channel } from "phoenix";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { updatePixel } from "../redux/slices/canvasSlice";
import { Pixel } from "../types";

const PhoenixContext = createContext(null);

export const PhoenixProvider = ({ children }: {children: React.ReactNode}) => {
    const user = useSelector((state: RootState) => state.account.user)
    const token = useSelector((state: RootState) => state.account.token)
    const currentCanvasId = useSelector((state: RootState) => state.canvas.currentCanvasId)
    
    const dispatch = useDispatch()
    const socketRef = useRef<Socket | null>(null)
    const canvasChannelRef = useRef<Channel | null>(null);

    const joinChannel = async (socket: Socket, topic: string, onJoin: (channel: Channel) => void) => {
        const channel = socket.channel(topic, {});
    
        channel.join()
            .receive("ok", (resp) => {
                console.log(`Joined ${topic} successfully`, resp)
                onJoin(channel);
            })
            .receive("error", (resp) => {
                console.error(`Unable to join ${topic}`, resp)
            });
    };

    const setupCanvasChannel = (channel: Channel) => {
        if (canvasChannelRef.current) {
            canvasChannelRef.current.leave() 
        }

        channel.on("pixel.updated", (pixel: Pixel) => {
            if(!currentCanvasId) return;
            dispatch(updatePixel({
                canvasId: currentCanvasId,
                pixel
            }))
        })

        canvasChannelRef.current = channel
    }

    useEffect(() => {
        console.log("🧩 PhoenixProvider mounted");
    }, []);

    useEffect(() => {
        if (!token || !user) return;
        if (socketRef.current && socketRef.current.isConnected()) {
            console.log("🟢 Socket already connected");
            return;
        }
    
        const socket = new Socket("ws://localhost:4000/socket", {
            params: { token: token },
        });
        socket.connect();
        socketRef.current = socket;
    
        return () => {
            if (socketRef.current) {
                console.log("❌ Disconnecting socket...");
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [dispatch, token, user])

    useEffect(() => {
        if (currentCanvasId) {
            const socket = socketRef.current
            if (socket) {
                const topic = `canvas:${currentCanvasId}`
                joinChannel(socket, topic, (channel) => {
                    setupCanvasChannel(channel);
                });
            }
        }
    }, [currentCanvasId, dispatch])

    return (
        <PhoenixContext.Provider value={null}>
            {children}
        </PhoenixContext.Provider>
    );
}