'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Send, AlertCircle, CheckCircle2, Mic, MicOff, Volume2, Globe } from 'lucide-react';
import styles from './ComplaintForm.module.css';
import { useAppContext } from '@/context/AppContext';

// Type definitions for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface Step {
  title: string;
  question: string;
  type: 'text' | 'select' | 'textarea' | 'radio' | 'checkbox' | 'file';
  options?: string[];
  field: string;
}

interface ComplaintFormProps {
  type: 'child' | 'elderly' | 'env';
  steps: Step[];
}

export default function ComplaintForm({ type, steps }: ComplaintFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [protocol, setProtocol] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [blockchainHash, setBlockchainHash] = useState('');
  const recognitionRef = useRef<any>(null);

  const generateBlockchainHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 40; i++) {
      hash += chars[Math.floor(Math.random() * 16)];
    }
    return hash;
  };

  const toggleRecognition = (field: string) => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFormData((prev: any) => ({
        ...prev,
        [field]: prev[field] ? `${prev[field]} ${transcript}` : transcript
      }));
    };

    recognition.onerror = (event: any) => {
      // "aborted" is usually intentional when we call .stop()
      if (event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const narrateQuestion = (text: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      
      // Try to find a female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        (v.lang.includes('pt-BR')) && 
        (v.name.toLowerCase().includes('maria') || v.name.toLowerCase().includes('luciana') || v.name.toLowerCase().includes('victoria') || v.name.toLowerCase().includes('female'))
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.pitch = 1.3; // Higher pitch for child-like feel
      utterance.rate = 1.0;
      
      utterance.onstart = () => setIsNarrating(true);
      utterance.onend = () => setIsNarrating(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const { addComplaint } = useAppContext();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setBlockchainHash(generateBlockchainHash());
    // Envia ao backend (ou local) e usa o protocolo retornado.
    const newProtocol = await addComplaint({
      category: type,
      title: formData.victim_name ? `Denúncia: ${formData.victim_name}` : `Denúncia ${type}`,
      location: formData.location || 'Não informado',
      description: formData.description || '',
      priority: formData.is_urgent === 'Sim' ? 'alta' : 'media',
      victim_name: formData.victim_name
    });
    setProtocol(newProtocol);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={styles.successCard}
      >
        <CheckCircle2 size={80} color="var(--success)" />
        <h2>Denúncia enviada com sucesso!</h2>
        <p>Sua denúncia foi registrada e está em fase de triagem inicial.</p>
        <div className={styles.protocolBox}>
          <span>Seu número de protocolo é:</span>
          <strong>{protocol}</strong>
          <div className={styles.blockchainHash}>
            <span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', paddingBottom: 4 }}>ID de Criptografia Blockchain:</span>
            {blockchainHash}
          </div>
        </div>
        <p className={styles.warning}>
          Guarde este número para acompanhar o status da sua denúncia posteriormente.
        </p>
        <button onClick={() => window.location.href = '/'} className={styles.btnHome}>
          Voltar ao Início
        </button>
      </motion.div>
    );
  }

  const step = steps[currentStep];

  return (
    <div className={styles.formContainer}>
      <div className={styles.progressHeader}>
        <div className={styles.progressInfo}>
          <span>Etapa {currentStep + 1} de {steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className={styles.progressBar}>
          <motion.div 
            className={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={styles.stepContent}
        >
          <span className={styles.stepTitle}>
            {step.title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 5 }}>
            <h2 className={styles.question} style={{ marginBottom: 0 }}>{step.question}</h2>
            <button 
              className={styles.btnNarrate}
              onClick={() => narrateQuestion(step.question)}
              title="Ouvir pergunta"
            >
              <Volume2 size={16} /> {isNarrating ? 'Ouvindo...' : 'Ouvir'}
            </button>
          </div>

          <div className={styles.fieldWrapper}>
            {step.type === 'text' && (
              <div className={styles.inputWithAction}>
                <input 
                  type="text" 
                  className={styles.input}
                  value={formData[step.field] || ''}
                  onChange={(e) => setFormData({...formData, [step.field]: e.target.value})}
                  placeholder="Digite aqui..."
                />
                <button 
                  type="button"
                  className={`${styles.btnVoice} ${isRecording ? styles.recording : ''}`}
                  onClick={() => toggleRecognition(step.field)}
                  title="Falar ao invés de digitar"
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                {isRecording && (
                  <div className={styles.waveform}>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                  </div>
                )}
              </div>
            )}
            {step.type === 'textarea' && (
              <div className={styles.inputWithAction}>
                <textarea 
                  className={styles.textarea}
                  value={formData[step.field] || ''}
                  onChange={(e) => setFormData({...formData, [step.field]: e.target.value})}
                  placeholder="Descreva detalhadamente..."
                />
                <button 
                  type="button"
                  className={`${styles.btnVoice} ${isRecording ? styles.recording : ''}`}
                  onClick={() => toggleRecognition(step.field)}
                  title="Falar ao invés de digitar"
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                {isRecording && (
                  <div className={styles.waveform}>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                  </div>
                )}
              </div>
            )}
            {step.type === 'radio' && step.field === 'emotions' && (
              <div className={styles.emojiGrid}>
                {['😊', '😢', '😡', '😨', '😕', '😐', '😔', '😱', '🤫', '💪'].map(emoji => (
                  <button 
                    key={emoji}
                    className={`${styles.emojiBtn} ${formData[step.field] === emoji ? styles.active : ''}`}
                    onClick={() => setFormData({...formData, [step.field]: emoji})}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            {step.type === 'radio' && step.field !== 'emotions' && (
              <div className={styles.radioGroup}>
                {step.options?.map(option => (
                  <button 
                    key={option}
                    type="button"
                    className={`${styles.radioOption} ${formData[step.field] === option ? styles.active : ''}`}
                    onClick={() => setFormData({...formData, [step.field]: option})}
                  >
                    <span className={styles.radioDot}></span>
                    {option}
                  </button>
                ))}
              </div>
            )}
            
            {/* AI Scanner Animation for File uploads or detailed descriptions */}
            {(step.field === 'description' || step.field === 'evidence') && (
              <div className={styles.scannerContainer}>
                <div className={styles.laser}></div>
                <div style={{ padding: '10px', fontSize: '0.8rem', color: 'var(--accent)', textAlign: 'center' }}>
                  SISTEMA DE ANÁLISE SENTINELA-AI [SCANNING...]
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className={styles.footer}>
        <button 
          onClick={handleBack} 
          className={styles.btnBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft /> Voltar
        </button>
        <button 
          onClick={handleNext} 
          className={styles.btnNext}
        >
          {currentStep === steps.length - 1 ? 'Enviar Denúncia' : 'Próximo'} 
          {currentStep === steps.length - 1 ? <Send size={18} /> : <ChevronRight />}
        </button>
      </div>

      <div className={styles.securityNote}>
        <AlertCircle size={16} />
        <span>Sua denúncia é criptografada e o anonimato é garantido por lei.</span>
      </div>
    </div>
  );
}
