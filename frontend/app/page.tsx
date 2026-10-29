'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Backend Live URL (Render)
const API_BASE_URL = "https://dsa-mastery-platform.onrender.com";

interface TestCase {
  input: string;
  expected_output: string;
}

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  starter_code: {
    python: string;
    javascript: string;
    cpp: string;
  };
  test_cases: TestCase[];
}

export default function Home() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');

  // Fetch problems from Backend
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/problems`);
        setProblems(res.data);
        if (res.data.length > 0) {
          setCurrentProblem(res.data[0]);
          setCode(res.data[0].starter_code['python'] || '');
        }
      } catch (err) {
        console.error("Error fetching problems:", err);
      }
    };
    fetchProblems();
  }, []);

  // Update starter code when problem or language changes
  const handleProblemSelect = (prob: Problem) => {
    setCurrentProblem(prob);
    setCode(prob.starter_code[language as keyof typeof prob.starter_code] || '');
    setOutput(null);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (currentProblem) {
      setCode(currentProblem.starter_code[lang as keyof typeof currentProblem.starter_code] || '');
    }
  };

  // Run Code Execution
  const handleRun = async () => {
    if (!currentProblem) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/run`, {
        language,
        code,
        problem_id: currentProblem.id,
        test_cases: currentProblem.test_cases
      });
      setOutput(res.data);
    } catch (err) {
      setOutput({ error: 'Failed to connect to backend server' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Code
  const handleSubmit = async () => {
    if (!currentProblem) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/submit`, {
        language,
        code,
        problem_id: currentProblem.id
      });
      setOutput(res.data);
    } catch (err) {
      setOutput({ error: 'Failed to submit code' });
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter(p => 
    difficultyFilter === 'All' ? true : p.difficulty === difficultyFilter
  );

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Sidebar - Problems List */}
      <div className="w-1/4 border-r border-slate-800 p-4 flex flex-col bg-slate-900">
        <h1 className="text-xl font-bold text-blue-400 mb-4">⚡ Problem Explorer</h1>
        
        {/* Difficulty Filter */}
        <div className="flex gap-2 mb-4">
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1 text-xs rounded-md transition ${
                difficultyFilter === diff 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Problem List Items */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredProblems.map((prob) => (
            <div
              key={prob.id}
              onClick={() => handleProblemSelect(prob)}
              className={`p-3 rounded-lg cursor-pointer transition border ${
                currentProblem?.id === prob.id 
                  ? 'bg-slate-800 border-blue-500' 
                  : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              <div className="font-medium text-sm text-slate-200">{prob.title}</div>
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className={`px-2 py-0.5 rounded ${
                  prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                  prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-rose-500/10 text-rose-400'
                }`}>
                  {prob.difficulty}
                </span>
                <span className="text-slate-500">{prob.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar / Controls */}
        <div className="h-14 border-b border-slate-800 bg-slate-900 px-6 flex justify-between items-center">
          <div className="font-semibold text-lg text-slate-200">
            {currentProblem ? currentProblem.title : 'Select a Problem'}
          </div>

          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="python">Python 3</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
            </select>

            <button
              onClick={handleRun}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              Run Code
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-1.5 rounded-md text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Submit 🚀'}
            </button>
          </div>
        </div>

        {/* Code & Problem Description Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Problem Details */}
          <div className="w-1/3 border-r border-slate-800 p-6 overflow-y-auto bg-slate-950">
            {currentProblem ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">{currentProblem.title}</h2>
                <div className="prose prose-invert text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {currentProblem.description}
                </div>
              </div>
            ) : (
              <div className="text-slate-500">Select a problem from sidebar</div>
            )}
          </div>

          {/* Code Editor & Execution Console */}
          <div className="flex-1 flex flex-col bg-slate-900/30">
            {/* Editor Input */}
            <div className="flex-1 p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your code here..."
                className="w-full h-full bg-slate-950 text-slate-100 font-mono text-sm p-4 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500/50 resize-none"
                spellCheck={false}
              />
            </div>

            {/* Console Output */}
            <div className="h-48 border-t border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-y-auto">
              <div className="text-slate-500 mb-2 font-semibold uppercase tracking-wider">Execution Console</div>
              {output ? (
                <pre className="text-slate-200 whitespace-pre-wrap">
                  {JSON.stringify(output, null, 2)}
                </pre>
              ) : (
                <div className="text-slate-600 italic">Click 'Run Code' or 'Submit' to see test results...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}