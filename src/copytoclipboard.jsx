import React, { useState } from 'react';

import "./chatstyle.css"

const CopyToClipboardButton = ({ text }) => {
    const [buttonIcon, setButtonIcon] = useState('fa-copy'); // default icon

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setButtonIcon('fa-check'); 

            setTimeout(() => {
                setButtonIcon('fa-copy'); 
            }, 3000);
            
        } catch (error) {
            console.error('Failed to copy:', error);
            setButtonIcon('fa-times'); 
            
            setTimeout(() => {
                setButtonIcon('fa-copy'); 
            }, 3000);
        }
    };

    return (
        <button onClick={copyToClipboard} className='CopyButton'>
            <i className={`fas ${buttonIcon}`}></i>
        </button>
    );
};

export default CopyToClipboardButton;
