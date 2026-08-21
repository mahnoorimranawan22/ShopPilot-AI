'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

// ─── Voice Search Hook ───────────────────────────────────────
// Uses Web Speech API (SpeechRecognition) for browser-native voice-to-text
export function useVoiceSearch({ onResult, onError, language = 'en-US' } = {}) {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [isSupported, setIsSupported] = useState(false)
    const recognitionRef = useRef(null)

    useEffect(() => {
        const SpeechRecognition = typeof window !== 'undefined'
            && (window.SpeechRecognition || window.webkitSpeechRecognition)

        if (SpeechRecognition) {
            setIsSupported(true)
            const recognition = new SpeechRecognition()
            recognition.continuous = false
            recognition.interimResults = true
            recognition.lang = language
            recognition.maxAlternatives = 1

            recognition.onstart = () => {
                setIsListening(true)
                setTranscript('')
            }

            recognition.onresult = (event) => {
                let finalTranscript = ''
                let interimTranscript = ''

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i]
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript
                    } else {
                        interimTranscript += result[0].transcript
                    }
                }

                const currentTranscript = finalTranscript || interimTranscript
                setTranscript(currentTranscript)

                if (finalTranscript) {
                    onResult?.(finalTranscript.trim())
                }
            }

            recognition.onerror = (event) => {
                console.warn('Voice search error:', event.error)
                setIsListening(false)
                if (event.error === 'not-allowed') {
                    onError?.('Microphone access denied. Please allow microphone permissions.')
                } else if (event.error === 'no-speech') {
                    onError?.('No speech detected. Please try again.')
                } else {
                    onError?.('Voice recognition failed. Please try again.')
                }
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognitionRef.current = recognition
        }

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort() } catch {}
            }
        }
    }, [language, onResult, onError])

    const startListening = useCallback(() => {
        if (!recognitionRef.current || isListening) return
        try {
            setTranscript('')
            recognitionRef.current.start()
        } catch {
            // Already started
        }
    }, [isListening])

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return
        try {
            recognitionRef.current.stop()
        } catch {}
    }, [])

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening()
        } else {
            startListening()
        }
    }, [isListening, startListening, stopListening])

    return {
        isListening,
        transcript,
        isSupported,
        startListening,
        stopListening,
        toggleListening,
    }
}

// ─── Voice Button Component ──────────────────────────────────
// A pulsing microphone button that works standalone or with useVoiceSearch
export function VoiceButton({ onResult, onError, size = 'md', className = '' }) {
    const { isListening, isSupported, toggleListening } = useVoiceSearch({ onResult, onError })

    if (!isSupported) return null

    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-9 h-9',
        lg: 'w-12 h-12',
    }

    const iconSizes = { sm: 14, md: 16, lg: 20 }

    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleListening()
            }}
            className={`relative flex items-center justify-center rounded-xl transition-all ${sizes[size]} ${
                isListening
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                    : 'bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-500'
            } ${className}`}
            title={isListening ? 'Stop listening' : 'Voice search'}
        >
            {isListening ? (
                <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
            ) : (
                <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
            )}

            {/* Pulsing rings when listening */}
            {isListening && (
                <>
                    <motion.div
                        animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-xl border-2 border-red-400"
                    />
                    <motion.div
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                        className="absolute inset-0 rounded-xl border border-red-300"
                    />
                </>
            )}
        </motion.button>
    )
}


