import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Terminal,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Code2,
  Play,
  BookOpen,
  MessageSquare,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Cpu,
  Zap,
  Check,
  X,
  Layers,
  Flame,
  Trophy,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

// --- INITIAL DATA & CONSTANTS ---

const SCENARIOS = [
  {
    id: 'standup',
    title: 'Daily Standup Simulator',
    desc: 'მოყევი რა გააკეთე გუშინ, რას აკეთებ დღეს და რა გბლოკავს.',
    badge: 'Agile / Scrum',
    initialAiMessage: "Hey! Welcome to our daily standup. What did you work on yesterday, and what's your plan for today?",
    aiResponses: [
      "Thanks for the update! Did you run into any blockers with that task?",
      "Got it. Do you need any assistance from the backend team before pushing to staging?",
      "Great progress! Let me know once the pull request is ready for review."
    ],
    feedbacks: [
      {
        tip: "💡 **გრამატიკული რჩევა:** 'I worked on fix bug'-ის ნაცვლად უკეთესია თქვა: 'I focused on fixing the bug' ან 'I worked on a bug fix'.",
        betterVersion: "I worked on fixing the authentication bug yesterday."
      },
      {
        tip: "🚀 **პროფესიული ფრაზა:** 'I have no problem'-ის ნაცვლად Standup-ზე ხშირად ამბობენ: 'No blockers on my side'.",
        betterVersion: "Everything is going smoothly, no blockers on my side."
      }
    ]
  },
  {
    id: 'code-review',
    title: 'Code Review & PRs',
    desc: 'ისწავლე კონსტრუქციული შენიშვნების დაწერა და მიღება Pull Request-ებში.',
    badge: 'Git Workflow',
    initialAiMessage: "Hi! I just left a comment on your Pull Request regarding async error handling. Could you take a look?",
    aiResponses: [
      "I see your point, but using a try-catch block here might make the code cleaner. What do you think?",
      "Makes sense! Could you also add a unit test to cover this edge case?",
      "Awesome! Approving the PR now. Great work on refactoring this."
    ],
    feedbacks: [
      {
        tip: "💡 **კონსტრუქციული ტონი:** PR შენიშვნისას 'Change this code' ნაცვლად გამოიყენე ზრდილობიანი ფორმა: 'How about refactoring this...?' ან 'What do you think about...?'",
        betterVersion: "What do you think about extracting this logic into a custom hook?"
      }
    ]
  },
  {
    id: 'interview',
    title: 'Tech Job Interview',
    desc: 'გაიარე ტექნიკური გასაუბრების სიმულაცია უცხოურ კომპანიაში.',
    badge: 'Career Growth',
    initialAiMessage: "Hello! Thank you for joining today. To start off, could you briefly introduce yourself and your core tech stack?",
    aiResponses: [
      "That sounds like a solid background. Can you explain a challenging technical problem you recently solved?",
      "Impressive! How do you handle performance bottlenecks in React applications?",
      "Thank you for sharing that! Do you have any questions for us about our team or stack?"
    ],
    feedbacks: [
      {
        tip: "🎯 **ინტერვიუს ტექნიკა:** გამოიყენე STAR მეთოდი (Situation, Task, Action, Result) პასუხის გაცემისას.",
        betterVersion: "In my previous project, we faced high latency. I optimized rendering by memoizing selectors, reducing load time by 40%."
      }
    ]
  }
];

const GLOSSARY_ITEMS = [
  {
    id: 1,
    term: 'Asynchronous',
    phonetic: '/eɪˈsɪŋ.krə.nəs/',
    translation: 'ასინქრონული (ოპერაცია, რომელიც არ ბლოკავს კოდის შესრულებას)',
    example: 'Node.js uses asynchronous I/O operations to handle concurrent requests efficiently.'
  },
  {
    id: 2,
    term: 'Refactoring',
    phonetic: '/riːˈfæk.tər.ɪŋ/',
    translation: 'რეფაქტორინგი (კოდის გაუმჯობესება ფუნქციონალის შეცვლის გარეშე)',
    example: 'We spent two sprints refactoring the legacy codebase to improve readability.'
  },
  {
    id: 3,
    term: 'CI/CD Pipeline',
    phonetic: '/siː-aɪ siː-diː paɪp.laɪn/',
    translation: 'ავტომატიზირებული ინტეგრაციისა და დანერგვის პროცესი',
    example: 'The build failed in the CI/CD pipeline due to a failing integration test.'
  },
  {
    id: 4,
    term: 'Bottleneck',
    phonetic: '/ˈbɒt.əl.nek/',
    translation: 'შემაფერხებელი ფაქტორი / წარმადობის პრობლემა',
    example: 'Unoptimized database queries were the main performance bottleneck.'
  },
  {
    id: 5,
    term: 'Deprecated',
    phonetic: '/ˈdep.rə.keɪ.tɪd/',
    translation: 'მოძველებული / გამოყენებიდან ამოღებული (ფუნქცია ან ბიბლიოთეკა)',
    example: 'This API method is deprecated and will be removed in the next major release.'
  },
  {
    id: 6,
    term: 'Middleware',
    phonetic: '/ˈmɪd.əl.weər/',
    translation: 'შუალედური პროგრამული უზრუნველყოფა (რომელიც ამუშავებს მოთხოვნას სერვერამდე)',
    example: 'Express.js uses middleware functions to execute code before sending a response.'
  },
  {
    id: 7,
    term: 'Payload',
    phonetic: '/ˈpeɪ.ləʊd/',
    translation: 'მონაცემთა პაკეტი (მოთხოვნით გაგზავნილი ძირითადი ინფორმაცია)',
    example: 'The POST request payload contains the user authorization details in JSON format.'
  },
  {
    id: 8,
    term: 'Concurrency',
    phonetic: '/kənˈkʌr.ən.si/',
    translation: 'პარალელურობა (რამდენიმე დავალების ერთდროულად შესრულება)',
    example: 'Go handles concurrency gracefully using goroutines and channels.'
  },
  {
    id: 9,
    term: 'Latency',
    phonetic: '/ˈleɪ.tən.si/',
    translation: 'დაყოვნება (დრო, რომელიც სჭირდება მონაცემების ერთი წერტილიდან მეორემდე მიღწევას)',
    example: 'Optimizing database indexes significantly reduced network latency in our API responses.'
  },
  {
    id: 10,
    term: 'Deploy',
    phonetic: '/dɪˈplɔɪ/',
    translation: 'დანერგვა / გაშვება (პროგრამული უზრუნველყოფის სერვერზე განთავსება)',
    example: 'We are planning to deploy the new microservices architecture to production tonight.'
  }
];

const BUG_CHALLENGES = [
  {
    id: 1,
    title: 'Standup Blocker Clarification',
    description: 'გასწორე შეცდომა ფრაზაში, რომელსაც დეველოპერი ამბობს Standup-ზე:',
    brokenCode: "I am block because backend API is not respond since morning.",
    options: [
      "I am blocked because the backend API hasn't been responding since this morning.",
      "I am blocking because backend API is no responding.",
      "I blocked because backend API does not responded today."
    ],
    correctIndex: 0,
    explanation: "'Blocked' გამოიყენება პასიურ ფორმაში (მე ვარ დაბლოკილი). ასევე 'hasn't been responding' სწორად გამოხატავს დროის მონაკვეთს დილიდან ახლანდლამდე."
  },
  {
    id: 2,
    title: 'Code Review Suggestion',
    description: 'როგორ იტყვი უფრო პროფესიულად და ზრდილობიანად PR-ის განხილვისას?',
    brokenCode: "Your code is bad, change this function now.",
    options: [
      "This code is not good, replace function.",
      "Would you mind refactoring this function to improve performance?",
      "You must fix this function as soon as possible."
    ],
    correctIndex: 1,
    explanation: "Code Review-ს დროს მნიშვნელოვანია კონსტრუქციული და ზრდილობიანი ტონი ('Would you mind...', 'What do you think about...')."
  },
  {
    id: 3,
    title: 'Technical Discussion on Scaling',
    description: 'რომელი ფორმაა გრამატიკულად და ტექნიკურად სწორი?',
    brokenCode: "We need optimize database query for lower latency.",
    options: [
      "We need optimizing database query for lower latency.",
      "We need to optimize our database queries to reduce latency.",
      "We need optimize database for making lower latency."
    ],
    correctIndex: 1,
    explanation: "ზმნა 'need'-ს სჭირდება ინფინიტივი ('to optimize'), ხოლო 'reduce latency' უფრო ბუნებრივი კოლოკაციაა, ვიდრე 'lower latency'."
  }
];

const FLASHCARDS = [
  { id: 1, term: 'Trade-off', definition: 'კომპრომისი / არჩევანი ორ ალტერნატივას შორის (მაგ. სიჩქარე vs მეხსიერება)', example: 'Choosing SQL over NoSQL was a trade-off between consistency and dynamic scaling.' },
  { id: 2, term: 'Out of the box', definition: 'მზა ფუნქციონალი, რომელიც დამატებით კონფიგურაციას არ საჭიროებს', example: 'Next.js provides server-side rendering out of the box.' },
  { id: 3, term: 'Boilerplate', definition: 'შაბლონური კოდი, რომელიც მეორდება სხვადასხვა ადგილას', example: 'We used Create React App to eliminate initial boilerplate setup.' },
  { id: 4, term: 'Graceful Degradation', definition: 'სისტემის უნარი გააგრძელოს მუშაობა (შეზღუდულად) ხარვეზის დროსაც', example: 'The website uses graceful degradation when offline mode is activated.' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('simulations');
  const [selectedScenarioId, setSelectedScenarioId] = useState('standup');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [autoTts, setAutoTts] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [expandedFeedbackId, setExpandedFeedbackId] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  // New Features States
  const [bugIndex, setBugIndex] = useState(0);
  const [selectedBugOption, setSelectedBugOption] = useState(null);
  const [isBugSubmitted, setIsBugSubmitted] = useState(false);

  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [completedScenarios, setCompletedScenarios] = useState(1);
  const [userStreak] = useState(3);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const currentScenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Speech Synthesis Helper
  const speakText = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Initialize Scenario Messages
  const startScenario = useCallback((scenario) => {
    const initialMsg = {
      id: Date.now(),
      sender: 'ai',
      text: scenario.initialAiMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initialMsg]);
    if (autoTts) {
      speakText(scenario.initialAiMessage);
    }
  }, [autoTts, speakText]);

  useEffect(() => {
    startScenario(currentScenario);
  }, [selectedScenarioId, startScenario, currentScenario]);

  // Web Speech API Initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((res) => res[0].transcript)
        .join('');
      setInputText(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      alert('თქვენს ბრაუზერს არ აქვს ხმოვანი ამოცნობის მხარდაჭერა (გამოიყენეთ Chrome/Edge).');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInputText('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Handle User Message Submission
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isThinking) return;

    const userMsgText = inputText.trim();
    setInputText('');
    setIsListening(false);
    recognitionRef.current?.stop();

    const currentFeedback =
      currentScenario.feedbacks[messages.filter((m) => m.sender === 'user').length % currentScenario.feedbacks.length];

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      feedback: currentFeedback
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    setTimeout(() => {
      const aiResponseIndex = Math.min(
        messages.filter((m) => m.sender === 'ai').length - 1,
        currentScenario.aiResponses.length - 1
      );
      const aiResponseText =
        currentScenario.aiResponses[aiResponseIndex] || "Great progress! Let's continue testing your scenarios.";

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
      setCompletedScenarios((prev) => prev + 1);

      if (autoTts) {
        speakText(aiResponseText);
      }
    }, 1200);
  };

  const handleBugSubmit = () => {
    if (selectedBugOption !== null) {
      setIsBugSubmitted(true);
    }
  };

  const nextBugChallenge = () => {
    setIsBugSubmitted(false);
    setSelectedBugOption(null);
    setBugIndex((prev) => (prev + 1) % BUG_CHALLENGES.length);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-slate-900">
      
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('simulations')}>
            <div className="p-2 bg-slate-800 rounded-lg border border-slate-700 text-emerald-400 shadow-sm shadow-emerald-500/10">
              <Terminal className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold font-mono tracking-tight text-slate-100">
                DevEnglish<span className="text-emerald-400">.ge</span>
              </span>
              <span className="ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Georgian Devs
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('simulations')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'simulations'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>სიმულაციები</span>
            </button>

            <button
              onClick={() => setActiveTab('bugfix')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'bugfix'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Bug Fix Challenge</span>
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'flashcards'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Flashcards</span>
            </button>

            <button
              onClick={() => setActiveTab('glossary')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'glossary'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>ლექსიკონი</span>
            </button>
          </nav>

          {/* AI Active & User Stats */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-amber-400 text-xs font-mono">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{userStreak} Day Streak</span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-medium text-slate-300">AI Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800/80 via-slate-800/40 to-slate-900 border border-slate-800 p-6 md:p-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>სპეციალურად ქართველი დეველოპერებისთვის</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              გააუმჯობესე IT ინგლისური რეალური სიმულაციებით
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              ივარჯიშე Daily Standup-ზე, Code Review-სა და ტექნიკურ ინტერვიუებზე AI ასისტენტთან ერთად.
              მიიღე მყისიერი ქართული უკუკავშირი და გაზარდე შენი კარიერული შესაძლებლობები.
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold font-mono text-slate-200">10+ IT</div>
                <div className="text-xs text-slate-400">ტერმინები</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Play className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold font-mono text-slate-200">3 რეალური</div>
                <div className="text-xs text-slate-400">სიმულაცია</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold font-mono text-slate-200">Bug Fix</div>
                <div className="text-xs text-slate-400">გამოწვევები</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold font-mono text-slate-200">{completedScenarios} პასუხი</div>
                <div className="text-xs text-slate-400">შესრულებულია</div>
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE NAVIGATION TABS */}
        <div className="grid grid-cols-2 gap-2 md:hidden border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('simulations')}
            className={`py-2 text-center text-xs font-medium rounded-lg ${
              activeTab === 'simulations' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400'
            }`}
          >
            სიმულაციები
          </button>
          <button
            onClick={() => setActiveTab('bugfix')}
            className={`py-2 text-center text-xs font-medium rounded-lg ${
              activeTab === 'bugfix' ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'text-slate-400'
            }`}
          >
            Bug Fix
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`py-2 text-center text-xs font-medium rounded-lg ${
              activeTab === 'flashcards' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400'
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`py-2 text-center text-xs font-medium rounded-lg ${
              activeTab === 'glossary' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400'
            }`}
          >
            ლექსიკონი
          </button>
        </div>

        {/* --- SECTION 1: SIMULATIONS --- */}
        {activeTab === 'simulations' && (
          <div className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
                <span>აირჩიეთ სიმულაციის რეჟიმი</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SCENARIOS.map((sc) => {
                  const isSelected = sc.id === selectedScenarioId;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => setSelectedScenarioId(sc.id)}
                      className={`text-left p-4 rounded-xl transition-all duration-200 border relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                          : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-700/60 text-slate-300">
                            {sc.badge}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <h3 className="font-bold text-slate-100 text-base mb-1">{sc.title}</h3>
                        <p className="text-slate-400 text-xs leading-relaxed">{sc.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* VOICE CHAT PLAYGROUND */}
            <section className="bg-slate-800/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
              <div className="bg-slate-800/90 border-b border-slate-700/60 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{currentScenario.title}</h3>
                    <p className="text-xs text-slate-400">AI Senior Technical Mentor</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => startScenario(currentScenario)}
                    className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/50 transition-colors"
                    title="საუბრის თავიდან დაწყება"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setAutoTts(!autoTts)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                      autoTts
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-700/40 border-slate-700 text-slate-400'
                    }`}
                  >
                    {autoTts ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>TTS Auto</span>
                  </button>
                </div>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const isFeedbackOpen = expandedFeedbackId === msg.id;

                  return (
                    <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-start max-w-[85%] md:max-w-[75%] space-x-2">
                        {!isUser && (
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                            <Terminal className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div className="space-y-1">
                          <div
                            className={`p-4 rounded-2xl text-sm leading-relaxed ${
                              isUser
                                ? 'bg-emerald-600 text-slate-900 font-medium rounded-br-none shadow-lg'
                                : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/80 shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between space-x-4 mb-1 border-b border-black/10 pb-1">
                              <span className="text-[10px] opacity-75 font-mono">{isUser ? 'You' : 'AI Mentor'}</span>
                              <div className="flex items-center space-x-1">
                                {!isUser && (
                                  <button
                                    onClick={() => speakText(msg.text)}
                                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
                                    title="Listen again"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                  </button>
                                )}
                                <span className="text-[10px] opacity-60 font-mono">{msg.timestamp}</span>
                              </div>
                            </div>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>

                          {/* Georgian Feedback Panel */}
                          {isUser && msg.feedback && (
                            <div className="mt-2 w-full">
                              <button
                                onClick={() => setExpandedFeedbackId(isFeedbackOpen ? null : msg.id)}
                                className="flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>AI რჩევა და ფრაზები</span>
                                {isFeedbackOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>

                              {isFeedbackOpen && (
                                <div className="mt-2 p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-2 text-xs text-slate-300 animate-fadeIn shadow-xl">
                                  <p className="leading-relaxed text-slate-200">{msg.feedback.tip}</p>
                                  <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-emerald-400">
                                    <span className="text-slate-500">Suggested: </span>
                                    "{msg.feedback.betterVersion}"
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isThinking && (
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Terminal className="w-3 h-3 animate-spin" />
                    </div>
                    <span>AI ფიქრობს პასუხზე...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-slate-800/90 border-t border-slate-700/60">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-3 rounded-xl transition-all duration-200 border flex items-center justify-center shrink-0 ${
                      isListening
                        ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/30'
                        : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-emerald-400'
                    }`}
                    title={isListening ? 'საუბრის შეწყვეტა' : 'ხმოვანი ჩაწერა'}
                  >
                    {isListening ? <MicOff className="w-5 h-5 animate-bounce" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isListening
                        ? 'გისმენთ, ისაუბრეთ ინგლისურად...'
                        : 'ჩაწერეთ პასუხი ინგლისურად ან გამოიყენეთ მიკროფონი...'
                    }
                    className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors font-sans"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isThinking}
                    className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20 shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>

                {!speechSupported && (
                  <p className="mt-2 text-[11px] text-amber-400 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>თქვენს ბრაუზერს ხმოვანი შეყვანის მხარდაჭერა არ აქვს. (გამოიყენეთ Google Chrome).</span>
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* --- SECTION 2: BUG FIX CHALLENGE --- */}
        {activeTab === 'bugfix' && (
          <section className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h2 className="font-bold text-lg text-slate-100">Bug Fix Challenge #{BUG_CHALLENGES[bugIndex].id}</h2>
                </div>
                <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
                  Grammar & Style Bug
                </span>
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-200">{BUG_CHALLENGES[bugIndex].title}</h3>
                <p className="text-xs text-slate-400 mt-1">{BUG_CHALLENGES[bugIndex].description}</p>
              </div>

              {/* Broken Code / Phrase Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 font-mono text-sm text-rose-300 relative">
                <div className="text-[10px] uppercase tracking-wider text-rose-400/80 mb-1">❌ Broken Phrase / Code:</div>
                "{BUG_CHALLENGES[bugIndex].brokenCode}"
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 block">აირჩიეთ სწორი ვარიანტი:</label>
                {BUG_CHALLENGES[bugIndex].options.map((opt, idx) => {
                  const isSelected = selectedBugOption === idx;
                  let optionStyle = "bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500";

                  if (isBugSubmitted) {
                    if (idx === BUG_CHALLENGES[bugIndex].correctIndex) {
                      optionStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-300";
                    } else if (isSelected) {
                      optionStyle = "bg-rose-950/80 border-rose-500 text-rose-300";
                    }
                  } else if (isSelected) {
                    optionStyle = "bg-amber-500/10 border-amber-500 text-amber-300";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isBugSubmitted}
                      onClick={() => setSelectedBugOption(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm font-mono transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <span>{opt}</span>
                      {isBugSubmitted && idx === BUG_CHALLENGES[bugIndex].correctIndex && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit & Explanation */}
              {!isBugSubmitted ? (
                <button
                  disabled={selectedBugOption === null}
                  onClick={handleBugSubmit}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
                >
                  შეამოწმე პასუხი
                </button>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                      <Lightbulb className="w-4 h-4" />
                      <span>განმარტება:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{BUG_CHALLENGES[bugIndex].explanation}</p>
                  </div>

                  <button
                    onClick={nextBugChallenge}
                    className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold text-sm transition-all"
                  >
                    შემდეგი გამოწვევა 
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* --- SECTION 3: INTERACTIVE FLASHCARDS --- */}
        {activeTab === 'flashcards' && (
          <section className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-100">IT ინგლისურის ფლეშბარათები</h2>
              <p className="text-xs text-slate-400">დააჭირე ბარათს განმარტებისა და მაგალითის სანახავად.</p>
            </div>

            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="cursor-pointer min-h-[260px] bg-slate-800/80 border border-cyan-500/30 hover:border-cyan-500 rounded-2xl p-8 flex flex-col justify-between items-center text-center transition-all duration-300 shadow-2xl relative"
            >
              <div className="w-full flex justify-between items-center text-xs font-mono text-slate-500">
                <span>Card {flashcardIndex + 1} / {FLASHCARDS.length}</span>
                <span className="text-cyan-400 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{isFlipped ? 'Back' : 'Front'}</span>
                </span>
              </div>

              {!isFlipped ? (
                <div className="space-y-3 my-auto">
                  <h3 className="text-2xl font-extrabold text-cyan-400 font-mono tracking-wide">
                    {FLASHCARDS[flashcardIndex].term}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">(დააჭირე გადასაბრუნებლად)</p>
                </div>
              ) : (
                <div className="space-y-4 my-auto animate-fadeIn">
                  <p className="text-base font-medium text-slate-100 leading-relaxed">
                    {FLASHCARDS[flashcardIndex].definition}
                  </p>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                    "{FLASHCARDS[flashcardIndex].example}"
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(FLASHCARDS[flashcardIndex].term);
                  }}
                  className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                  title="გამოთქმის მოსმენა"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Flashcard Controls */}
            <div className="flex items-center justify-between space-x-4">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setFlashcardIndex((prev) => (prev - 1 + FLASHCARDS.length) % FLASHCARDS.length);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 font-medium text-xs transition-colors"
              >
                 წინა
              </button>
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setFlashcardIndex((prev) => (prev + 1) % FLASHCARDS.length);
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
              >
                შემდეგი ▶
              </button>
            </div>
          </section>
        )}

        {/* --- SECTION 4: DEV GLOSSARY --- */}
        {activeTab === 'glossary' && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">IT ინგლისურის ლექსიკონი</h2>
              <p className="text-sm text-slate-400">ხშირად გამოყენებული ტერმინები დეველოპერულ ყოველდღიურობაში.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GLOSSARY_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold font-mono text-emerald-400">{item.term}</h3>
                      <span className="text-xs text-slate-500 font-mono">{item.phonetic}</span>
                    </div>
                    <button
                      onClick={() => speakText(item.term)}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                      title="გამოთქმის მოსმენა"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-slate-200 font-medium">{item.translation}</p>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">მაგალითი კონტექსტში:</span>
                    <p className="text-xs font-mono text-slate-300 leading-relaxed">"{item.example}"</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <p>გაფრთხილება! საიტი სატესტო რეჟიმშია და მოსალოდნელია ხარვეზები.</p>
        </div>
      </footer>
    </div>
  );
}