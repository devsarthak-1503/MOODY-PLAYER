import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

export default function ExpressionDetector({ setSongs }) {
    const videoRef = useRef();

    useEffect(() => {
        const init = async () => {
            const MODEL_URL = "/models";

            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            ]);

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
        };

        init();
    }, []);

    const detectMood = async () => {
        const result = await faceapi
            .detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceExpressions();

        if (!result) return;

        const dominant = Object.entries(result.expressions)
            .sort((a, b) => b[1] - a[1])[0][0];

        try {
            const response = await axios.get(
                `http://localhost:3000/songs?mood=${dominant}`
            );

            console.log("Backend response:", response.data);

            setSongs(response.data.songs || []);
        } catch (err) {
            console.log("Error fetching songs:", err);
        }
    };

    return (
        <div className="camera-section">
            <video ref={videoRef} autoPlay muted className="video" />
            <button className="detect-btn" onClick={detectMood}>
                Detect Mood
            </button>
        </div>
    );
}
