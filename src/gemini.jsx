import React, { useState, useRef, useEffect } from 'react';
import "./chatstyle.css"
import Spinner from "./spinner.svg"
import SendIcon from "./send.svg"
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";

import convertMarkdownToHTML from './convertmarkedtohtml';

import CopyToClipboardButton from './copytoclipboard';

const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = "AIzaSyBS96idceF6SbZeLX1rbVvaDsv43bVTDvY";

const ChatComponent = () => {
    const [userInput, setUserInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef(null);
    const chatRef = useRef(null);

    useEffect(() => {
        const initChat = async () => {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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

            const chat = model.startChat({
                generationConfig,
                safetySettings,
                history: [],
            });

            chatRef.current = chat;
        };

        initChat();
    }, []);

    const handleUserInput = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
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

    const handleSendMessage = async () => {
        if (userInput.trim() === '') return;
        setLoading(true);

        try {
            const result = await chatRef.current.sendMessage(userInput);
            const responsem = result.response.text();
            let response = convertMarkdownToHTML(responsem);
            if (response.length < 1) {
                response = `<p style="color: lightcoral; font-size: 16px;">Error: Text generation failed. Please retry or contact support.</p>`
            }
            const updatedChatHistory = [...chatHistory, { id: Date.now(), user: userInput, bot: response }];
            setChatHistory(updatedChatHistory);
        } catch (error) {
            console.error("Error generating response:", error);
            const response = `<p style="color: lightcoral; font-size: 16px;">Error: Text generation failed. Please retry/refresh or contact support.</p>`;
            const updatedChatHistory = [...chatHistory, { id: Date.now(), user: userInput, bot: response }];
            setChatHistory(updatedChatHistory);
        }

        setUserInput('');
        setLoading(false);
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
        }
    };

    function speakText(text, elem) {
        const button = elem
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
        <div className="chat-container">
            <div className="message-container">
                {chatHistory.map((item) => (
                    <div key={item.id} style={{ marginBottom: '10px' }} className='chatgroup'>
                        <div className="user-message">
                            <p><strong>You: <br /></strong> {item.user}</p>
                        </div>
                        <div className="bot-message txt">
                            <p>
                                <strong>Ary:</strong>
                                <button className='speechbutton' onClick={(e) => speakText(decodeHtmlEntities(item.bot), e.currentTarget)}><i className="fas fa-volume-down"></i></button>
                                <br />
                                <span dangerouslySetInnerHTML={{ __html: item.bot }} className='txt' />                            </p>
                            <CopyToClipboardButton text={decodeHtmlEntities(item.bot)} />                        </div>
                    </div>
                ))}
            </div>
            <div className='msgfrm'>
                <textarea ref={textareaRef} type="text" value={userInput} onChange={handleUserInput} onKeyDown={handleUserInput} autoFocus placeholder='Message AryBot' id='queryinput' />
                <button onClick={handleSendMessage} disabled={loading}>
                    {loading ? <img src={Spinner} alt="" /> : <img src={SendIcon} alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', height: '30px' }} />}
                </button>
            </div>
        </div>
    );
};

export default ChatComponent;
