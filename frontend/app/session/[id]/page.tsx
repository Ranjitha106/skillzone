"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import Editor from "@monaco-editor/react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Mic, MicOff, Video, VideoOff, Copy } from "lucide-react"; // ✅ added Copy icon

interface Message {
  sender: string;
  text: string;
  time: string;
}

export default function SessionRoom() {
  useAuth();
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [user, setUser] = useState<any>(null);

  const [code, setCode] = useState("// Start collaborating...");
  const [language, setLanguage] = useState("javascript");

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState("");

  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // ✅ COPY SESSION ID FUNCTION
  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    alert("Session ID copied!");
  };

  const endSession = async () => {
    const confirmEnd = confirm("Are you sure you want to end this mentorship session?");
    if (!confirmEnd) return;

    try {
      await api.post(`/session/end/${sessionId}`);

      socket.emit("end-session", {
        sessionId,
        role: user?.role || "student",
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to end session", err);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);

    const init = async () => {
      try {
        await api.get(`/session/${sessionId}`);

        socket.connect();
        socket.emit("join-room", sessionId);

        socket.off("code-update");
        socket.off("receive-message");
        socket.off("offer");
        socket.off("answer");
        socket.off("ice-candidate");

        socket.on("code-update", (newCode: string) => setCode(newCode));

        socket.on("language-update", (newLang: string) => {
          setLanguage(newLang);
        });

        socket.on("code-result", (result: string) => {
  setOutput(result);
  setIsRunning(false);
});

        socket.on("receive-message", (msg: any) => {
          const formattedMessage = {
            sender: msg.sender,
            text: msg.message,
            time: new Date(msg.time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMessages((prev) => [...prev, formattedMessage]);
        });

        socket.on("offer", async (offer) => {
          if (!peerConnection.current) createPeerConnection();

          await startCamera();

          const stream = localVideoRef.current?.srcObject as MediaStream;

          if (stream) {
            stream.getTracks().forEach((track) => {
              const senders = peerConnection.current?.getSenders();
              const alreadyAdded = senders?.some(s => s.track === track);
              if (!alreadyAdded) {
                peerConnection.current?.addTrack(track, stream);
              }
            });
          }

          await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.current?.createAnswer();
          await peerConnection.current?.setLocalDescription(answer);

          socket.emit("answer", { sessionId, answer });
        });

        socket.on("answer", async (answer) => {
          await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("ice-candidate", async (candidate) => {
          try {
            if (
              candidate &&
              peerConnection.current &&
              peerConnection.current.remoteDescription
            ) {
              await peerConnection.current.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
            }
          } catch (err) {
            console.log("ICE error ignored:", err);
          }
        });

        socket.on("session-ended", (data: any) => {
          if (data?.role === "mentor") {
            alert("Mentor ended the session.");
          } else {
            alert("Student ended the session.");
          }
          router.push("/dashboard");
        });

        await startCamera();
      } catch (err) {
        alert("Invalid session ID");
        router.push("/dashboard");
      }
    };

    init();

    return () => {
      socket.off("code-update");
      socket.off("receive-message");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("session-ended");
      socket.off("language-update");
      socket.off("code-result");
    };
  }, [sessionId, router]);

  const startCamera = async () => {
    try {
      if (localVideoRef.current?.srcObject) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      createPeerConnection();

      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });
    } catch (err) {
      console.log("Camera error:", err);
    }
  };

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (!stream) return;

    stream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsMuted(prev => !prev);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (!stream) return;

    stream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsCameraOff(prev => !prev);
  };

  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(iceServers);

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          sessionId,
          candidate: event.candidate,
        });
      }
    };
  };

  const startCall = async () => {
    await startCamera();

    if (!peerConnection.current) {
      createPeerConnection();
    }

    const stream = localVideoRef.current?.srcObject as MediaStream;

    if (stream) {
      stream.getTracks().forEach((track) => {
        const senders = peerConnection.current?.getSenders();
        const alreadyAdded = senders?.some((s) => s.track === track);

        if (!alreadyAdded) {
          peerConnection.current?.addTrack(track, stream);
        }
      });
    }

    const offer = await peerConnection.current?.createOffer();
    await peerConnection.current?.setLocalDescription(offer);

    socket.emit("offer", { sessionId, offer });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEditorChange = (value: string | undefined) => {
    const updatedCode = value || "";
    setCode(updatedCode);
    socket.emit("code-change", { sessionId, code: updatedCode });
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    socket.emit("language-change", { sessionId, language: newLang });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const timestamp = new Date();

    const newMessage: Message = {
      sender: user.name || user.email || "User",
      text: inputMsg,
      time: timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);

    socket.emit("send-message", {
      sessionId,
      message: inputMsg,
      sender: user.name || user.email || "User",
    });

    setInputMsg("");
  };
  const runCode = () => {
  setIsRunning(true);
  setOutput("Compiling and Running...");
  socket.emit("run-code", { sessionId, code, language });
};

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white">
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#252526]">
        <div className="flex items-center gap-4">
          <h2 className="text-blue-400 text-sm font-bold flex items-center gap-2">
            Room: <span className="text-zinc-400 font-mono">{sessionId}</span>

            {/* ✅ COPY BUTTON */}
            <button
              onClick={copySessionId}
              className="text-zinc-400 hover:text-white"
            >
              <Copy size={16} />
            </button>
          </h2>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-zinc-800 text-xs border border-zinc-700 rounded px-2 py-1 outline-none hover:bg-zinc-700 transition-colors"
          >
           <option value="javascript">JavaScript</option>
<option value="python">Python</option>
<option value="java">Java</option>
<option value="cpp">C++</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button onClick={startCall} className="bg-green-600 px-4 py-1 rounded text-xs">
            Start Video Call
          </button>

          <button onClick={toggleMute} className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full">
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <button onClick={toggleVideo} className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full">
            {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
          </button>

          <button onClick={endSession} className="bg-red-600 px-4 py-1 rounded text-xs">
            End Session
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
       <div className="flex-[0.7] flex flex-col border-r border-zinc-800">

  {/* Editor Area */}
  <div className="flex-[0.7] border-b border-zinc-800">
    <Editor 
      height="100%" 
      theme="vs-dark" 
      language={language} 
      value={code} 
      onChange={handleEditorChange} 
    />
  </div>

  {/* Terminal Area */}
  <div className="flex-[0.4] flex flex-col bg-[#0a0a0a] font-mono text-xs border-t border-zinc-800">
  
  <div className="h-9 bg-[#1a1a1a] flex items-center justify-between px-4 border-b border-zinc-800">
    
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-red-500"></div>
      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
      <div className="w-2 h-2 rounded-full bg-green-500"></div>
      <span className="ml-2 text-zinc-500 uppercase font-bold tracking-widest text-[9px]">
        Console Output
      </span>
    </div>

    <div className="flex gap-2">
      <button 
        onClick={() => setOutput("")}
        className="text-[9px] text-zinc-500 hover:text-white uppercase transition"
      >
        Clear
      </button>

      <button 
        onClick={runCode}
        disabled={isRunning}
        className={`px-4 py-1 rounded text-[10px] text-white font-bold transition flex items-center gap-2 ${
          isRunning ? 'bg-zinc-700' : 'bg-green-600 hover:bg-green-500'
        }`}
      >
        {isRunning ? "Executing..." : "▶ Run"}
      </button>
    </div>

  </div>

  <div className="flex-1 p-4 overflow-y-auto whitespace-pre-wrap font-mono">
    {output ? (
      <code className="text-zinc-200 leading-relaxed">{output}</code>
    ) : (
      <span className="text-zinc-700 italic">
        // Click Run to execute {language} code...
      </span>
    )}
  </div>

</div>
</div>

        <div className="flex-[0.3] flex flex-col bg-[#252526]">
          <div className="grid grid-rows-2 h-64 bg-black border-b border-zinc-800">

            {/* ✅ LOCAL VIDEO WITH NAME */}
            <div className="relative">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover border-b" />
              <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 text-xs rounded">
                {user?.name || "You"}
              </div>
            </div>

            {/* ✅ REMOTE VIDEO WITH NAME */}
            <div className="relative">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 text-xs rounded">
                Other User
              </div>
            </div>

          </div>

          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 border-b border-zinc-800 text-sm font-semibold text-zinc-300">
              Chat
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-400">{m.sender}</span>
                    <span className="text-zinc-500">{m.time}</span>
                  </div>
                  <p className="bg-zinc-800 p-2 rounded mt-1 text-sm">{m.text}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t border-zinc-800">
              <input
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-zinc-900 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}