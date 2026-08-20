'use client'
import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { MessageCircleIcon, SendIcon, XIcon, MinusIcon } from 'lucide-react'
import { joinChatRoom, leaveChatRoom, sendChatMessage, onSocket } from '@/lib/socket'

export default function LiveChatWidget() {
    const { isLoggedIn, userData } = useSelector(state => state.user)
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [typing, setTyping] = useState(false)
    const [unread, setUnread] = useState(0)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    const roomId = userData ? `support-${userData._id || userData.id || 'guest'}` : 'support-guest'

    useEffect(() => {
        if (isOpen && isLoggedIn) {
            joinChatRoom(roomId)

            // Add welcome message
            setMessages([{
                id: 'welcome',
                senderName: 'ShopPilot AI',
                senderRole: 'system',
                message: 'Hi! 👋 Welcome to ShopPilot AI support. How can we help you today?',
                timestamp: new Date().toISOString(),
            }])

            const unsub = onSocket('chat:message', (data) => {
                if (data.roomId === roomId && data.sender !== userData?.id) {
                    setMessages(prev => [...prev, data])
                    if (isMinimized) setUnread(prev => prev + 1)
                }
            })

            const unsubTyping = onSocket('chat:typing', (data) => {
                if (data.roomId === roomId) {
                    setTyping(true)
                    setTimeout(() => setTyping(false), 2000)
                }
            })

            return () => {
                leaveChatRoom(roomId)
                unsub()
                unsubTyping()
            }
        }
    }, [isOpen, isLoggedIn, roomId, userData, isMinimized])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = (e) => {
        e.preventDefault()
        if (!message.trim()) return

        const msgData = {
            roomId,
            message: message.trim(),
            sender: userData?.id || 'guest',
            senderName: userData?.name || 'Guest',
            senderRole: userData?.role || 'buyer',
        }

        sendChatMessage(msgData)
        setMessages(prev => [...prev, { ...msgData, id: Date.now(), timestamp: new Date().toISOString() }])
        setMessage('')

        // Save to backend
        if (isLoggedIn) {
            fetch(`http://localhost:5000/api/chat/${roomId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('shoppilot_token')}` },
                body: JSON.stringify({ message: msgData.message, senderName: msgData.senderName, senderRole: msgData.senderRole }),
            }).catch(() => {})
        }
    }

    if (!isLoggedIn) return null

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => { setIsOpen(true); setIsMinimized(false); setUnread(0) }}
                    className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center justify-center active:scale-95"
                >
                    <MessageCircleIcon size={24} />
                    {unread > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all ${isMinimized ? 'h-14' : 'h-[480px]'} flex flex-col`}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">SP</div>
                            <div>
                                <p className="text-sm font-semibold">ShopPilot Support</p>
                                <p className="text-[10px] text-indigo-200">Usually replies in minutes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
                                <MinusIcon size={16} />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
                                <XIcon size={16} />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender === userData?.id || msg.sender === (userData?.id || 'guest') ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] ${msg.senderRole === 'system' ? 'mx-auto' : ''}`}>
                                            {msg.senderName && msg.senderRole !== 'system' && (
                                                <p className="text-[10px] text-slate-400 mb-0.5 px-1">{msg.senderName}</p>
                                            )}
                                            <div className={`px-3 py-2 rounded-2xl text-sm ${msg.sender === userData?.id || msg.sender === (userData?.id || 'guest')
                                                ? 'bg-indigo-600 text-white rounded-br-md'
                                                : msg.senderRole === 'system'
                                                    ? 'bg-indigo-100 text-indigo-800 text-center text-xs'
                                                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-md'
                                            }`}>
                                                {msg.message}
                                            </div>
                                            <p className="text-[9px] text-slate-300 mt-0.5 px-1">
                                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {typing && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-3 py-2">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white shrink-0">
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={inputRef}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 text-sm bg-slate-100 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200 transition"
                                    />
                                    <button type="submit" disabled={!message.trim()} className="bg-indigo-600 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-40">
                                        <SendIcon size={16} />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            )}
        </>
    )
}
