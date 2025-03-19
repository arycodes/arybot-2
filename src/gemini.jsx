import React, { useState, useRef, useEffect } from 'react';
import "./chatstyle.css"
import Spinner from "./spinner.svg"
import SendIcon from "./send.svg"
import ShareButton from './ShareButton';
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";

import convertMarkdownToHTML from './convertmarkedtohtml';
import CopyToClipboardButton from './copytoclipboard';

const API_KEY = "AIzaSyDsQPFA9YEx4PeeYJOQzV9OueebgS6WJLI";
const CHAT_MODEL = "gemini-1.5-flash";
const IMAGE_GEN_MODEL = "gemini-2.0-flash-exp-image-generation";

const ChatComponent = () => {
    const [userInput, setUserInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef(null);
    const chatRef = useRef(null);
    const historyRef = useRef([]);

    useEffect(() => {
        initChat();
    }, []);

    const initChat = async () => {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

        const generationConfig = {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 10000,
        };

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ];

        // Initialize chat with empty history
        chatRef.current = model.startChat({
            generationConfig,
            safetySettings,
            history: historyRef.current,
        });
    };

    const handleUserInput = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
            autoResizeTextarea();
            setSelectedImage(null);
        } else {
            setUserInput(event.target.value);
            autoResizeTextarea();
        }
    };

    const autoResizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        }
    };

    const reinitializeChat = async () => {
        await initChat();
    };

    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result); // Base64 encoded image
            };
            reader.readAsDataURL(file);
        }
    };

    const generateImage = async (imagePrompt) => {
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        // Configure the image generation model
        const model = genAI.getGenerativeModel({
            model: IMAGE_GEN_MODEL,
            generationConfig: {
                responseModalities: ['Text', 'Image']
            },
        });

        try {
            const response = await model.generateContent(imagePrompt);
            let generatedImageData = null;
            let generatedText = null;
            
            for (const part of response.response.candidates[0].content.parts) {
                if (part.text) {
                    generatedText = part.text;
                } else if (part.inlineData) {
                    generatedImageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
            
            return { imageData: generatedImageData, text: generatedText };
        } catch (error) {
            console.error("Error generating image:", error);
            throw error;
        }
    };

    const handleSendMessage = async () => {
        if (userInput.trim() === '' && !selectedImage) return;
        
        setLoading(true);
        const messageId = Date.now();
        const userMessage = userInput.trim();
        setUserInput('');
        
        // Check if this is an image generation request
        const isImageGenRequest = userMessage.startsWith("@genimg");
        
        // Add user message to chat history
        setChatHistory(prev => [...prev, { 
            id: messageId, 
            user: userMessage, 
            bot: '', 
            image: selectedImage,
            generatedImage: null
        }]);
        
        try {
            if (isImageGenRequest) {
                // Extract the image prompt (remove the @genimg prefix)
                const imagePrompt = userMessage.replace("@genimg", "").trim();
                
                // Generate the image
                const { imageData, text } = await generateImage(imagePrompt);
                
                // Update chat history with the generated image and any accompanying text
                setChatHistory(prev =>
                    prev.map(msg =>
                        msg.id === messageId
                            ? { 
                                ...msg, 
                                bot: text ? convertMarkdownToHTML(text) : "Image generated successfully.", 
                                generatedImage: imageData 
                              }
                            : msg
                    )
                );
                
                // Don't add image generation requests to the chat history with the main model
            } else {
                // Regular chat processing
                const imageBase64 = selectedImage ? selectedImage.split(',')[1] : null;

                historyRef.current.push({
                    role: "user",
                    parts: [
                        { text: userMessage },
                        imageBase64 ? { inlineData: { data: imageBase64, mimeType: "image/jpeg" } } : null
                    ].filter(Boolean),
                });

                if (!chatRef.current) {
                    await reinitializeChat();
                }

                const result = await chatRef.current.sendMessageStream([
                    imageBase64 ? { inlineData: { data: imageBase64, mimeType: "image/jpeg" } } : null,
                    userMessage
                ].filter(Boolean));

                let accumulatedResponse = '';

                const updateChatHistory = (response) => {
                    setChatHistory(prev =>
                        prev.map(msg =>
                            msg.id === messageId
                                ? { ...msg, bot: convertMarkdownToHTML(response) }
                                : msg
                        )
                    );
                };

                for await (const chunk of result.stream) {
                    accumulatedResponse += chunk.text();
                    updateChatHistory(accumulatedResponse);
                }

                historyRef.current.push({ role: "model", parts: [{ text: accumulatedResponse }] });
            }
        } catch (error) {
            console.error("Error processing message:", error);
            const errorMessage = "An error occurred while processing your request. Please try again or contact the AryBot Team.";
            setChatHistory(prev =>
                prev.map(msg =>
                    msg.id === messageId
                        ? { ...msg, bot: `<span class="error">Error: ${errorMessage}</span>` }
                        : msg
                )
            );
        }

        setSelectedImage(null); // Clear selected image
        setLoading(false);
    };

    function speakText(text, elem) {
        const button = elem;
        const speechButtons = document.querySelectorAll('.speechbutton');
        speechButtons.forEach(sb => {
            sb.innerHTML = `<i class="fas fa-volume-down"></i>`;
        });

        if (!button) {
            console.error("Button element is not available.");
            return;
        }

        const synthesis = new SpeechSynthesisUtterance(text);
        const speech = window.speechSynthesis;

        if (speech.speaking) {
            speech.cancel();
            button.innerHTML = `<i class="fas fa-volume-down"></i>`;
        } else {
            speech.speak(synthesis);
            button.innerHTML = `<i class="fas fa-volume-up"></i>`;
            synthesis.onend = function () {
                button.innerHTML = `<i class="fas fa-volume-down"></i>`;
            };
        }
    }

    const startSpeechRecognition = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

        recognition.lang = "en-US";
        recognition.start();

        recognition.onstart = () => {
            console.log("Voice recognition started...");
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setUserInput(prevInput => prevInput + (prevInput ? ' ' : '') + transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };

        recognition.onend = () => {
            console.log("Voice recognition ended.");
        };
    };

    function decodeHtmlEntities(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        let textContent = '';

        function traverse(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                textContent += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.nodeName === 'BR') {
                    textContent += '\n';
                }
                for (let childNode of node.childNodes) {
                    traverse(childNode);
                }
            }
        }

        traverse(doc.body);

        return textContent.trim();
    }

    return (
        <div className="chat-container" ref={chatRef}>
            <div className="message-container">
                {chatHistory.map((item) => (
                    <div key={item.id} className='chatgroup'>
                        <div className="user-message">
                            {item.image && <img src={item.image} alt="Uploaded" className='uploaded-image' />}
                            <pre>{item.user}</pre>
                        </div>
                        <div className="bot-message txt">
                            {item.generatedImage && (
                                <div className="generated-image-container">
                                    <img src={item.generatedImage} alt="Generated" className="generated-image" />
                                </div>
                            )}
                            <p>
                                <button className='speechbutton' onClick={(e) => speakText(decodeHtmlEntities(item.bot), e.currentTarget)}>
                                    <i className="fas fa-volume-down"></i>
                                </button>
                                <span dangerouslySetInnerHTML={{ __html: item.bot }} className='txt' />
                            </p>
                            <CopyToClipboardButton text={decodeHtmlEntities(item.bot)} />
                            <ShareButton text={decodeHtmlEntities(item.bot)} />
                        </div>
                    </div>
                ))}
            </div>

            <div className='msgfrm'>
                {selectedImage && (
                    <div className="image-preview">
                        <img src={selectedImage} alt="Selected" className="preview-image" />
                        <button className="remove-image-btn" onClick={() => setSelectedImage(null)}>✖</button>
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="imageInput"
                />
                <button className="attach-btn" onClick={() => document.getElementById('imageInput').click()}>
                    <i className='fa fa-paperclip'></i>
                </button>
                <button className="mic-btn" onClick={startSpeechRecognition}>
                    <i className="fa fa-microphone"></i>
                </button>

                <input type="file" id="imageInput" accept="image/*" capture="camera" onChange={handleImageUpload} />

                <textarea
                    ref={textareaRef}
                    type="text"
                    value={userInput}
                    onChange={handleUserInput}
                    onKeyDown={handleUserInput}
                    autoFocus
                    placeholder='Message AryBot (Type @genimg to generate images)'
                    id='queryinput'
                />

                <button onClick={handleSendMessage} disabled={loading} className='send-btn'>
                    {loading ? <img src={Spinner} alt="" /> : <img src={SendIcon} alt="" />}
                </button>
            </div>
        </div>
    );
};

export default ChatComponent;