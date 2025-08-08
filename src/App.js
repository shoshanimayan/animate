import React, { useState, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from 'three'
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';


import "./styles.css";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function Scene({ orbitControlsRef, isRecording, setAnimation ,clip,setClip, clipName}) {



  function CamRecord({orbitControlsRef, isRecording, setRecord,clip,setClip,clipName})
  {
    const [index,setIndex]= useState(0);
    const { gl } = useThree();
    const canvas = gl.domElement;


    useEffect(()=>{console.log(clip)},[clip])
    const vec = new Vector3()
    const ffmpegRef = useRef(new FFmpeg());
    const [loaded, setLoaded] = useState(false);
const videoRef = useRef(null);
    const messageRef = useRef(null);

      useEffect(() => {
             const loadFFmpeg = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
        const ffmpeg = ffmpegRef.current;
       
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setLoaded(true);
    }
            if(!loaded){
            loadFFmpeg();
            }
        }, []);
    
        const  deleteFiles= async()=>{
         for(let i=0;i<index+1;i++)
          {
            await ffmpegRef.current.deleteFile( `frame_${String(index).padStart(6,'0')}`); 
    
          }
          setIndex(0)
    
        }
    
        const saveFile= async(name,file)=>{
                await ffmpegRef.current.writeFile(name, file);
    
        }
    
        const exportToVideo=async()=>{
       // await delay(2000)
        const exec = await ffmpegRef.current.exec([
         
            '-i','frame_%06d.png' ,
            '-c:v', 'libx264', 
            '-pix_fmt', 'yuv420p', 
            "output.mp4" ]
        );
        if(exec)
        {
          
          ffmpegRef.current.readFile("output.mp4");
        }
       // console.log(1)
           //    await delay(2000)
//await ffmpegRef.current.ffprobe(["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", "output.mp4", "-o", "output.txt"]);
//const data = ffmpeg.readFile("output.txt");
    //const fileData = await ffmpegRef.current.readFile("output.mp4");
        //console.log(fileData)
       
    }

    function delay(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const handleDownload = (dataUrl) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = "output.png";
    document.body.appendChild(link); // Append to body
    link.click();
    document.body.removeChild(link); // Remove from body
  };
        useFrame((state,delta)=>{
          
          if(!isRecording)
          {
            if(clip.length>0)
            {
              if(index<clip.length)
              {
                orbitControlsRef.current.object.position.lerp(vec.set(clip[index].x,clip[index].y,clip[index].z),delta*5)
                if(loaded)
                {
                  const dataURL = canvas.toDataURL('image/png');
                  console.log(dataURL)
                 // handleDownload(dataURL)
                  saveFile(`frame_${String(index).padStart(6,'0')}`, dataURL)
                }   
                setIndex(prev=>
                {
                  prev++;
                  setIndex(prev);
                }
                )
              }
              else
              {
    
                setClip([]);
                exportToVideo();
              //  deleteFiles();
              }
    
            }
              
          }
      })
    return (<OrbitControls
      ref={orbitControlsRef}
      clip= {clip}
      setClip={setClip}
      onChange={
        (e)=>{
          if(isRecording)
            {
              let target = e.target;

              setRecord(prev=>{
                let pos = target.object.position
                prev.push({x:pos.x,y:pos.y,z:pos.z})
                return prev;
              })
            }
        }
      }
    />)
  }

  const [record,setRecord]= useState([])
  
  useEffect(()=>{

    if(isRecording)
    {
      setRecord([])
    }
    else
    {
      

      if(record.length>0)
      {
        setAnimation(record)
        setRecord([])

      }
    }

  

  },[isRecording])

  useEffect(()=>{},[clip])

  return (


    <Canvas gl={{ preserveDrawingBuffer: true }}>
      <ambientLight intensity={3.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <Model url="https://modelviewer.dev/shared-assets/models/Astronaut.glb" />
      <CamRecord orbitControlsRef={orbitControlsRef} isRecording={isRecording} setRecord={setRecord} clip ={clip} setClip={setClip}/>
    </Canvas>
  );
}

function App() {
  const [animationName, setAnimationName] = useState("");
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [animations, setAnimations] = useState([]);
  const [animation, setAnimation] = useState([]);
  const [playedClip, setPlayedClip] = useState([]);
  const [currentName, setCurrentName] = useState("");

  const orbitControlsRef = useRef();

  useEffect(() => {
    if (isRecording) {
      setAnimation([]);
    }
    else
    {
     
    }
  }, [isRecording]);

  useEffect(() => {
   
    if (animation.length > 0) {
      setAnimations((prev) => {
        prev.push({ name: animationName, clip: animation });
    
        return prev;
      });
      setAnimation([]);

    }
  }, [isConfiguring]);

  return (
    <div className="app">
      <div className="panel left-panel">
        <Scene
          orbitControlsRef={orbitControlsRef}
          isRecording={isRecording}
          setAnimation={setAnimation}
          clip={playedClip}
          setClip={setPlayedClip}
          clipName={currentName}
        />
      </div>
      <div className="panel right-panel">
        {isConfiguring ? (
          <>
            <input
              type="text"
              value={animationName}
              onChange={(e) => setAnimationName(e.target.value)}
              placeholder="Animation Name"
            />

            <button
              onClick={() => {
                setIsRecording(!isRecording);
              }}
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </button>
            <button
              onClick={() => {
                setIsConfiguring(false);
                // push the animation configuration to animations
              }}
            >
              Save Animation
            </button>
          </>
        ) : (
          <>
            {animations &&
              animations.length > 0 &&
              animations.map((a, index) => (
                <div key={index}>
                                  {console.log(a)}

                  <span>{a.name+" "}</span>
                  <button
                    onClick={() => {
                      console.log(a.clip);
                      setCurrentName(a.name)
                      setPlayedClip(a.clip)
                    }}
                  >
                    Play
                  </button>
                </div>
              ))}
            <button
              onClick={() => {
                setIsConfiguring(true);
              }}
            >
              Add Animation
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
