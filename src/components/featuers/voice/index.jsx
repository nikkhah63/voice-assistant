import { useRef, useState, useEffect } from "react";

import ResponseMode from "./partial/responseMode";
import Bar from "../../shared/bar/bar";
import Toast from "../../shared/toast/bar";

const VoiceWrapper = () => {
    const [responseMode, setResponseMode] = useState("voice");
    const [isRecording, setIsRecording] = useState(false);
    const [onPlay, setOnPaly] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingText, setIsLoadingText] = useState(false);
    const voiceRecorderRef = useRef(null);
    const voiceChunksRef = useRef([]);
    const voiceBlob = useRef(null);
    const voiceRef = useRef(null);
    const bufferRef = useRef(null);
    const timeoutRef = useRef(null);
    const [responseText, setResponseText] = useState("");
    const[toast,setToast]=useState({isError:false,message:""})
    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);  // Clear timeout on unmount
    }, []);
    const handleChangeMode = e => {
        clearData();
        setResponseMode(e.target.value);
      
    };

    const startRecording = async () => {
        clearData();
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                voiceRecorderRef.current = new MediaRecorder(stream);


                voiceRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0)
                        voiceChunksRef.current.push(event.data);
                };

                voiceRecorderRef.current.onstop = () => {
                    const blob = new Blob(voiceChunksRef.current, { type: 'audio/wav' });
                    voiceBlob.current = blob
                    voiceChunksRef.current = []
                };
                voiceRecorderRef.current.start();
                setIsRecording(true);
            } catch (error) {
                showToast({isError:true,message:error?.message})
               
            }
        } else {
            showToast({isError:true,message:"Device not Support!"})
        }
    };

    const stopRecording = () => {
        if (voiceRecorderRef.current) {
            voiceRecorderRef.current.stop();
            setIsRecording(false);
            if (responseMode == "voice") {
                setOnPaly(true);
                //start voice after 3 second
                timeoutRef.current = setTimeout(() => {
                    handlePlayVoice();
                }, 3000);
            } else {
                callApi();
            }
        }
    };

    const handlePlayVoice = async () => {
        if (voiceBlob.current) {
            setIsPlaying(true);
            setOnPaly(false);
            if (voiceRef.current) {
                voiceRef.current.close();
            }
            const arrayBuffer = await voiceBlob.current.arrayBuffer();
            voiceRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await voiceRef.current.decodeAudioData(arrayBuffer);

            bufferRef.current = voiceRef.current.createBufferSource();
            bufferRef.current.buffer = audioBuffer;
            bufferRef.current.connect(voiceRef.current.destination);
            bufferRef.current.onended = handleEndOfVoice;
            bufferRef.current.start();

        }
    };

    const handleEndOfVoice = () => {
        setIsPlaying(false);
    };

    const callApi = async () => {
        const requestOptions = {
            method: "GET",
        };
        setIsLoadingText(true);
        fetch("https://run.mocky.io/v3/0fe94463-722f-48c4-aade-18eb5598ae76", requestOptions)
            .then((response) => {
                if (response.ok) {
                    return response.body;
                }               
            })
            .then(stream => {             
                handleStream(stream);
            })
            .catch((err) => {
                showToast({isError:true,message:err?.message})
            
            })

    }
   
    function handleStream(stream) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let chunks = '';

        reader.read().then(function processText({ done, value }) {
            if (done) {               
                try {
                    const jsonObject = eval(`(${chunks})`);
                    setResponseText(jsonObject?.message)
                    setIsLoadingText(false);
                } catch (error) {
                    showToast({isError:true,message:error?.message})                  
                }
                return;
            }

            chunks += decoder.decode(value, { stream: true });
            return reader.read().then(processText);
        });
    }
    const clearData = () => {
        setToast({isError:false,message:""})
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
        if (bufferRef.current)
            bufferRef.current.stop();
        voiceRecorderRef.current = null;
        voiceChunksRef.current = [];
        setResponseText("");
        setIsPlaying(false);
        setOnPaly(false);
        setIsRecording(false);
    }
    //نمایش خطاعا
    const showToast=({isError,message})=>{
        setToast({isError:isError,message:message})
        setTimeout(() => {
            setToast({isError:"",message:""})
          }, 5000);
    }
    return (<>
        <div className="container">
            <ResponseMode responseMode={responseMode} handleChangeMode={handleChangeMode} />
            <div className="flex flex-row flex-center w-full mb-2">
                <button className={`btn-record ${isRecording ? "ping-animation" : ""}`} onClick={isRecording ? stopRecording : startRecording}>
                    <img src={isRecording ? "record.svg" : (isPlaying || onPlay) ? "stop.svg" : "mic.svg"} />
                </button>
            </div>

            <div className="flex flex-row flex-center w-full mb-2">

                <div>
                    {(!onPlay && !isPlaying) ?
                        isRecording ? <span className="text-pink">Voice Being Rrecorded!</span>
                            : <span className="text-gray">Click To Record Voice!</span> : <></>
                    }
                    {responseMode == "voice" && (onPlay || isPlaying) ?
                        onPlay ? <span className="text-pink">Voice will Play After 3 Second Later!</span>
                            : <>
                                <Bar />
                            </> :

                        isLoadingText ? <span className="text-bluelight">Text Will Load ....</span> :
                            <div className="text-blue">{responseText} </div>
                    }

                </div>


            </div>
            {toast.message &&<Toast message={toast.message} isError={toast.isError}/>}
        </div>
    </>);
}

export default VoiceWrapper;