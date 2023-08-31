import { useState } from "react";
import "./App.css";
import { useRef } from "react";
import { useEffect } from "react";
import * as faceapi from "face-api.js"

function App() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captureVideo, setCaptureVideo] = useState(false);

  const videoRef = useRef();
  const videoHeight = 480;
  const videoWidth = 640;
  const canvasRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
      ]).then(setModelsLoaded(true))
    }
    loadModels()
  }, [])

  const startVideo = () => {
    setCaptureVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error("error:", err);
      });
  };

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (canvasRef && canvasRef.current) {

        canvasRef.current.innerHTML = await faceapi.createCanvasFromMedia(videoRef.current)

        const displaySize = {
          width: videoWidth,
          height: videoHeight
        }

        faceapi.matchDimensions(canvasRef.current, displaySize)

        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

        const resizeDetections = faceapi.resizeResults(detections, displaySize)

        canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight)
        canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizeDetections)
        canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizeDetections)
      }
    }, 100)
  }

  const closeWebcam = () => {
    videoRef.current.pause()
    videoRef.current.srcObject.getTracks()[0].stop()
    setCaptureVideo(false)
  }

  return (
    <div className="app">

      <div className="container-btn">

        {captureVideo && modelsLoaded ? (
          <button onClick={closeWebcam}>Close Webcam</button>
        ) : (
          <button onClick={startVideo}>Open Webcam</button>
        )}
        
      </div>

      {captureVideo ? (
        modelsLoaded ? (

          <div>

            <div className="box">

              <video
                ref={videoRef}
                height={videoHeight}
                width={videoWidth}
                onPlay={handleVideoOnPlay}
              />

              <canvas ref={canvasRef} />

            </div>

          </div>

        ) : (
          <div>loading...</div>
        )
      ) : (
        <></>
      )}
    </div>
  );
}

export default App;
