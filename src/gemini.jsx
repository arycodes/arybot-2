import React, { useState } from 'react';
import "./chatstyle.css"
import Spinner from "./spinner.svg"
import SendIcon from "./send.svg"
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";

import convertMarkdownToHTML from './convertmarkedtohtml';


const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = "AIzaSyBS96idceF6SbZeLX1rbVvaDsv43bVTDvY";

const ChatComponent = () => {
    const [userInput, setUserInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);


    const handleUserInput = (event) => {
        setUserInput(event.target.value);
    };

    const handleSendMessage = async () => {
        if (userInput.trim() === '') return;
        setLoading(true);


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

        const result = await chat.sendMessage(userInput);
        const responsem = result.response.text();

        const response = convertMarkdownToHTML(responsem)

        const updatedChatHistory = [...chatHistory, { id: Date.now(), user: userInput, bot: response }];
        setChatHistory(updatedChatHistory);

        setUserInput('');
        setLoading(false);

    };



    function speakText(text, elem) {
        const button = elem


        const speechButtons = document.querySelectorAll('.speechbutton');
        speechButtons.forEach(sb => {

            sb.innerHTML = `<i class="fas fa-volume-off"></i>       `

        });


        if (!button) {
            console.error("Button element is not available.");
            return;
        }

        const synthesis = new SpeechSynthesisUtterance(text);
        const speech = window.speechSynthesis;

        if (speech.speaking) {
            speech.cancel();
            button.innerHTML = `<i class="fas fa-volume-off"></i>       `
        } else {
            speech.speak(synthesis);
            button.innerHTML = `<i class="fas fa-volume-up"></i>        `
            synthesis.onend = function () {
                button.innerHTML = `<i class="fas fa-volume-off"></i>       `
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
                        <div className="user-message ">
                            <p><strong>You: <br /></strong> {item.user}</p>
                        </div>
                        <div className="bot-message txt">
                            <p>
                                <strong>Ary:</strong>
                                <button className='speechbutton' onClick={(e) => speakText(decodeHtmlEntities(item.bot), e.currentTarget)}><i className="fas fa-volume-off"></i></button>
                                <br />
                                <span dangerouslySetInnerHTML={{ __html: item.bot }} className='txt' /></p>
                        </div>


                    </div>
                ))}
            </div>
            <div className='msgfrm'>
                <input type="text" value={userInput} contentEditable="true" onChange={handleUserInput} />
                <button onClick={handleSendMessage} disabled={loading} >{loading ? <img src={Spinner} alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', height: '30px' }} /> : <img src={SendIcon} alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', height: '30px' }} />}</button>
            </div>
        </div>
    );
};

export default ChatComponent;
