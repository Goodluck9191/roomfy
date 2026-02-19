import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from "react-router";
import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import {
    PROGRESS_INTERVAL_MS,
    PROGRESS_STEP,
    REDIRECT_DELAY_MS,
} from "../lib/constants";
interface UploadProps {
    onComplete?: (base64: string) => void;
}
const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const { isSignedIn } = useOutletContext<AuthContext>();
    const inputRef = useRef<HTMLInputElement>(null);
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const readerRef = useRef<FileReader | null>(null);
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            readerRef.current?.abort();
        };
    }, []);
    const processFile = (selectedFile: File) => {
        if (!isSignedIn) return;

        const MAX_BYTES = 50 * 1024 * 1024; // 50MB
        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];
        if (!ALLOWED_TYPES.includes(selectedFile.type) || selectedFile.size > MAX_BYTES) {
            return;
        }




        setFile(selectedFile);
        setProgress(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        readerRef.current?.abort();
        const reader = new FileReader();
        readerRef.current = reader;
        reader.onload = () => {
            const base64 = reader.result as string;
            let current = 0;
            intervalRef.current = window.setInterval(() => {
                current += PROGRESS_STEP;
                if (current >= 100) {
                    current = 100;
                    setProgress(100);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    timeoutRef.current = window.setTimeout(() => {
                        onComplete?.(base64);
                    }, REDIRECT_DELAY_MS);
                } else {
                    setProgress(current);
                }
            }, PROGRESS_INTERVAL_MS);
        };

        reader.readAsDataURL(selectedFile);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) processFile(selected);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!isSignedIn) return;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (!isSignedIn) return;
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) processFile(dropped);
    };

    const isClient = typeof window !== "undefined";

    return (
        <div className={'upload'}>
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => isSignedIn && inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className={'drop-input'}
                        accept=".jpg, .jpeg, .png, .gif"
                        disabled={!isSignedIn}
                        onChange={handleChange}
                    />

                    <div className={'drop-content'}>
                        <div className={'drop-icon'}>
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn
                                ? 'Click to upload file or drag and drop file'
                                : 'Sign in or sign up with Puter to upload'}
                        </p>
                        <p className={'help'}>Maximum file size 50 MB</p>
                    </div>
                </div>
            ) : (
                <div className={'upload-status'}>
                    <div className={'status-content'}>
                        <div className={'status-icon'}>
                            {progress === 100 ? (
                                <CheckCircle2 className={'check'} />
                            ) : (
                                <ImageIcon className={'image'} />
                            )}
                        </div>

                        <h3>{file.name}</h3>

                        <div className={'progress'}>
                            <div className={'bar'} style={{ width: `${progress}%` }} />
                            <p className={'status-text'}>
                                {progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting..'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;