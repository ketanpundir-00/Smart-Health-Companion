import React, { useState, useRef, useEffect } from 'react';
import { MultimediaInput } from '../types';

interface AudioInputProps {
  onAudioCapture: (audio: MultimediaInput | null) => void;
}

const AudioInput: React.FC<AudioInputProps> = ({ onAudioCapture }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' }); // Use webm for broad support
        setAudioBlob(blob);
        convertAndEmit(blob);
        stream.getTracks().forEach(track => track.stop()); // Stop stream
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const convertAndEmit = (blob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      onAudioCapture({
        mimeType: blob.type,
        data: base64Data
      });
    };
  };

  const clearAudio = () => {
    setAudioBlob(null);
    onAudioCapture(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col items-start space-y-3 w-full p-4 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-semibold text-blue-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          Voice Description
        </span>
        {isRecording && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 w-full">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            className="flex-1 bg-white border border-blue-300 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors shadow-sm font-medium text-sm"
          >
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="flex-1 bg-red-50 border border-red-200 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors shadow-sm font-medium text-sm flex items-center justify-center gap-2"
          >
            <div className="w-2 h-2 bg-red-600 rounded-sm"></div>
            Stop ({formatTime(recordingTime)})
          </button>
        )}

        {audioBlob && !isRecording && (
          <div className="flex items-center gap-2 w-full">
            <audio controls src={URL.createObjectURL(audioBlob)} className="h-10 flex-1 w-full rounded-lg" />
            <button
              onClick={clearAudio}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Remove audio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioInput;
