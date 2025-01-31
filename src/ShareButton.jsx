import React from 'react';

const ShareButton = ({ text }) => {

    // text += "\n\nGenerated Using AryBot\nTry AryBot at https://arybot.vercel.app";
    const shareContent = () => {
        if (navigator.share) {
            navigator.share({
                title: "Check this out!",
                text: text,
            }).catch((error) => console.error("Error sharing:", error));
        } else {
            alert("Sharing is not supported on this browser.");
        }
    };

    return (
        <button onClick={shareContent} className="share-button">
            <i className='fas fa-share-alt'></i>
            {/* <i class="fas fa-paper-plane"></i> */}
        </button>
    );
};

export default ShareButton;
