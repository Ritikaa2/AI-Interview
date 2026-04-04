/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React from "react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "framer-motion";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import axios from "axios";
import { ServerUrl } from "../App";
import { BsArrowRight } from "react-icons/bs";

const Step2Interview = ({ interviewData, onFinish }) => {
  const { interviewId, questions, userName } = interviewData;

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const recognitionRef = useRef(null);
  const [isAiPlaying, setIsAiPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);
  const currentQuestion = questions?.[currentIndex];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Try known female voices first
      const femaleVoice = voices.find(
        (v) =>
          v.name.toLocaleLowerCase().includes("zira") ||
          v.name.toLocaleLowerCase().includes("samantha") ||
          v.name.toLocaleLowerCase().includes("female"),
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      // Try known male voices first
      const maleVoice = voices.find(
        (v) =>
          v.name.toLocaleLowerCase().includes("david") ||
          v.name.toLocaleLowerCase().includes("mark") ||
          v.name.toLocaleLowerCase().includes("male"),
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      // Fallback: first voice (assume female)
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  /***************  Speak Function  ******************/
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      // Add natural pauses after commas and periods
      const humanText = text.replace(/,/g, ", ...").replace(/\./g, ", ...");

      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;

      // Human-Like pacing
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onStart = () => {
        setIsAiPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAiPlaying(false);
        setIsListening(false);

        if (isMicOn) {
          startMic();
        }

        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);

      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice) {
      return;
    }

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`,
        );

        await speakText(
          `I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.`,
        );

        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));

        // if last question (hard level)
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }
    };

    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      setAnswer((prev) => prev + " " + transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startMic = () => {
    const recognition = recognitionRef.current;

    if (!recognition || isAiPlaying) return;

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      if (error.name === "InvalidStateError") {
        console.log("Mic already running");
      } else {
        console.log(error);
      }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }

    setIsMicOn(!isMicOn);
  };

  const submitAnswer = async () => {
    if (isSubmitting) return;

    stopMic();
    setIsSubmitting(true);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true },
      );

      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if (isMicOn) {
        startMic();
      }
    }, 500);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        { interviewId },
        {
          withCredentials: true,
        },
      );

      // console.log("Finishing interview:", interviewId);
      // console.log(result.data);
      onFinish(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="h-screen relative overflow-hidden bg-linear-to-br from-amber-50 via-white to-amber-100 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute w-[500px] h-[500px] bg-amber-500/20 blur-[140px] -top-20 -left-20 rounded-full" />
      <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] -bottom-20 -right-20 rounded-full" />

      <div className="w-full max-w-7xl min-h-[80vh] bg-white rounded-3xl overflow-hidden shadow-xl flex flex-col lg:flex-row">
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-amber-200">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              autoPlay
              loop
              className="w-full h-auto object-cover"
            />
          </div>

          {/* subtitle  */}
          {subtitle && (
            <div className="w-full max-w-md bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}

          {/* Timer Card */}
          <div className="w-full max-w-md bg-white border border-amber-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interview Status</span>
              {isAiPlaying && (
                <span className="text-sm font-medium text-amber-600">
                  {isAiPlaying ? "AI Speaking" : ""}
                </span>
              )}
            </div>

            <div className="h-px bg-amber-200"></div>

            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit || 60}
              />
            </div>

            <div className="h-px bg-amber-200"></div>

            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <span className="text-2xl font-bold text-amber-600">
                  {currentIndex + 1}
                </span>
                <span className="text-sm text-gray-400">Current Question</span>
              </div>

              <div>
                <span className="text-2xl font-bold text-amber-600">
                  {questions.length}
                </span>
                <span className="text-sm text-gray-400">Total Questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (QUESTION + ANSWER) */}
        <div className="flex-1 flex flex-col p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-amber-600 mb-6">
            AI Smart Interview
          </h2>

          {/* Question Card */}
          {!isIntroPhase && (
            <div className="relative mb-6 bg-amber-50 sm:p-6 rounded-2xl border border-amber-200 shadow-sm">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
                {currentQuestion?.question}
              </div>
            </div>
          )}

          {/* Answer Box */}
          <textarea
            placeholder="Type your answer here..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="flex-1 min-h-40 bg-white p-4 rounded-xl resize-none outline-none border border-amber-200 focus:ring-2 focus:ring-amber-500 transition text-gray-800"
          />

          {/* Buttons */}
          {!feedback ? (
            <div className="flex items-center gap-4 mt-6">
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-black text-white shadow-lg"
              >
                {isMicOn ? (
                  <FaMicrophone size={20} />
                ) : (
                  <FaMicrophoneSlash size={20} />
                )}
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className="flex-1 cursor-pointer bg-linear-to-r from-amber-500 to-yellow-400 text-black py-3 rounded-xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-400"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-emerald-50 border border-amber-200 rounded-2xl shadow-sm"
            >
              <p className="text-emerald-700 font-medium mb-4">{feedback}</p>

              <button
                onClick={handleNext}
                className="w-full bg-linear-to-r from-emerald-500 to-yellow-400 text-black py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1"
              >
                Next Question <BsArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="absolute w-[500px] h-[500px] bg-amber-500/20 blur-[140px] -bottom-20 -right-20 rounded-full" />
      <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] -bottom-12 -right-12 rounded-full" />
    </div>
  );
};

export default Step2Interview;
