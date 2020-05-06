import React, { useEffect, useRef } from 'react';
import { Toast } from '../components/Toast';
import NavBar from "../components/navbar";

const url = 'https://jueinin.oss-cn-hongkong.aliyuncs.com/code.jpg';
const Scan: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>();
    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({
                video: { facingMode: { exact: 'environment' }, width: { min: 1024, ideal: 1280, max: 1920 }, height: { min: 776, ideal: 720, max: 1080 } },
            })
            .then((mediaStream) => {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => videoRef.current.play();
                // wait for scan
            })
            .catch((err) => {
                console.log(err);
                Toast.info('请给权限哦');
            });
    }, []);
    return (
        <div className="flex flex-col h-full">
            <NavBar centerPart={'扫一扫'}/>
            <div className="relative">
                <video id="video" className="w-full" ref={videoRef} />
            </div>
            <div className="flex-center flex-grow bg-black">
                <button className="w-16 h-16 rounded-full bg-white active:bg-gray-200"/>
            </div>
        </div>
    );
};
export default Scan;
