import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from 'three'

import "./styles.css";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function Scene({ orbitControlsRef, isRecording, setAnimation ,clip,setClip}) {



  function CamRecord({orbitControlsRef, isRecording, setRecord,clip,setClip})
  {
    const [index,setIndex]= useState(0);
    useEffect(()=>{console.log(clip)},[clip])
    const vec = new Vector3()

    useFrame((state,delta)=>{
      
      if(!isRecording)
      {
        if(clip.length>0)
        {
          if(index<clip.length)
          {
            orbitControlsRef.current.object.position.lerp(vec.set(clip[index].x,clip[index].y,clip[index].z),delta*5)
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
            setIndex(0)
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


    <Canvas>
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
