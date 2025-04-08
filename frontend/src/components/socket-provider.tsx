import { createContext, useEffect, useRef } from "react";
import { Socket, Channel, Presence } from "phoenix";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setCanvas, updatePixel } from "../redux/slices/canvasSlice";
import { PresenceState, removeUserPresence, setPresenceState, updateUserPresence } from '../redux/slices/presenceSlice';
import { Pixel } from "../types";

type PhoenixContextType = {
    sendPresenceUpdate: (x: number, y: number, color: string) => void;
};
  
export const PhoenixContext = createContext<PhoenixContextType | null>(null);

export const PhoenixProvider = ({ children }: {children: React.ReactNode}) => {
    const user = useSelector((state: RootState) => state.account.user)
    const token = useSelector((state: RootState) => state.account.token)
    const currentCanvasId = useSelector((state: RootState) => state.canvas.currentCanvasId)
    
    const dispatch = useDispatch()
    const socketRef = useRef<Socket | null>(null)
    const canvasChannelRef = useRef<Channel | null>(null);
    const canvasChannelPresence = useRef<Presence | null>(null);

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

        const presence = new Presence(channel);
        presence.onSync(() => {
            const list = presence.list((id, { metas }) => {
              const latest = metas[metas.length - 1];
              return {
                userId: id,
                username: latest.username ?? "unknown",
                x: Number(latest.x ?? 0),
                y: Number(latest.y ?? 0),
                color: latest.color ?? "#000000",
              };
            });
          
            // Convert array to { [userId]: PresenceEntry }
            const state: PresenceState = {};
            for (const user of list) {
              state[user.userId] = {
                username: user.username,
                x: user.x,
                y: user.y,
                color: user.color,
              };
            }
          
            dispatch(setPresenceState(state));
          });
          
          
          presence.onJoin((id, _current, newPresence) => {
            if (!id) return;
          
            const latest = newPresence.metas[newPresence.metas.length - 1];
          
            dispatch(updateUserPresence({
              userId: id,
              data: {
                username: latest.username ?? "unknown",
                x: Number(latest.x ?? 0),
                y: Number(latest.y ?? 0),
                color: latest.color ?? "#000000"
              }
            }));
          });
          
          presence.onLeave((id, current) => {
            if (id && current.metas.length === 1) {
              dispatch(removeUserPresence(id));
            }
          });

        canvasChannelPresence.current = presence;
        canvasChannelRef.current = channel;

        channel.on("pixel.updated", (pixel: Pixel) => {
            if(!currentCanvasId) return;
            dispatch(updatePixel({
                canvasId: currentCanvasId,
                pixel
            }))
        })

        channel.on("canvas.updated", (payload) => {
            if (!currentCanvasId) return;
            
            dispatch(setCanvas({
              meta: payload,
              pixels: undefined,
              colors: payload.colors,
            }));
          });

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

    const sendPresenceUpdate = (x: number, y: number, color: string) => {
        if (canvasChannelRef.current) {
          canvasChannelRef.current.push("presence.update", { x, y, color });
        }
    };

    return (
        <PhoenixContext.Provider value={{ sendPresenceUpdate }}>
            {children}
        </PhoenixContext.Provider>
    );
}