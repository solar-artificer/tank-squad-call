const {useState, useRef} = BdApi.React;

import {Field, Label} from '@headlessui/react'

export default function PicturePicker({value, onChange, label, placeholder}) {
    const [preview, setPreview] = useState(value || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                reject(new Error('Please select an image file'));
                return;
            }

            // Check file size (limit to 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                reject(new Error('File size must be less than 5MB'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const base64String = e.target.result;
                resolve(base64String);
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        try {
            const base64 = await convertToBase64(file);
            setPreview(base64);
            onChange(base64);
        } catch (error) {
            console.error('Error converting image:', error);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();

        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) {
            return;
        }

        try {
            const base64 = await convertToBase64(file);
            setPreview(base64);
            onChange(base64);
        } catch (error) {
            console.error('Error converting image:', error);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleClear = (e) => {
        e.stopPropagation();

        setPreview(null);

        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Field>
            <Label className="discord-label block mb-2">
                {label}
            </Label>

            <div
                className={`picture-picker-container ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{display: 'none'}}
                />

                {
                    preview ?
                        (
                            <div className="picture-preview">
                                <img src={preview} alt="Preview"/>
                                <button
                                    className="clear-button"
                                    onClick={handleClear}
                                    type="button"
                                >
                                    ✕
                                </button>
                            </div>
                        )
                        : (
                            <div className="picture-placeholder">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="upload-icon"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                    />
                                </svg>
                                <p className="upload-text">
                                    {placeholder}
                                </p>
                                <p className="upload-hint">
                                    PNG, JPG, GIF, WEBP (макс 5MB)
                                </p>
                            </div>
                        )
                }
            </div>
        </Field>
    );
}

