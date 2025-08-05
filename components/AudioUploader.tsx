
import React, { useCallback, useState } from 'react';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';

interface AudioUploaderProps {
    onFileSelect: (file: File) => void;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            if (e.dataTransfer.files[0].type.startsWith('audio/')) {
                onFileSelect(e.dataTransfer.files[0]);
            } else {
                alert('Please upload a valid audio file.');
            }
        }
    }, [onFileSelect]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
             if (e.target.files[0].type.startsWith('audio/')) {
                onFileSelect(e.target.files[0]);
            } else {
                alert('Please upload a valid audio file.');
            }
        }
    };

    const activeDragClasses = isDragging ? 'border-cyan-400 bg-gray-700' : 'border-gray-600';

    return (
        <div 
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop}
            className={`w-full max-w-2xl mx-auto p-10 border-2 border-dashed ${activeDragClasses} rounded-lg text-center transition-all duration-300 ease-in-out cursor-pointer hover:border-cyan-500 bg-gray-800`}
        >
            <input 
                type="file" 
                id="audio-upload" 
                className="hidden" 
                accept="audio/*"
                onChange={handleFileChange}
            />
            <label htmlFor="audio-upload" className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
                <Icon path={ICON_PATHS.UPLOAD} className="w-16 h-16 text-gray-500" />
                <p className="text-xl font-semibold">Drag & Drop your music here</p>
                <p className="text-gray-400">or</p>
                <span className="bg-cyan-600 text-white px-6 py-2 rounded-md font-medium hover:bg-cyan-500 transition-colors">
                    Browse Files
                </span>
            </label>
        </div>
    );
};

export default AudioUploader;
