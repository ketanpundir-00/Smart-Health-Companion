import React, { useState } from 'react';
import AudioInput from './components/AudioInput';
import ImageInput from './components/ImageInput';
import { analyzeSymptoms } from './services/geminiService';
import { AnalysisResult, MultimediaInput } from './types';

function App() {
  const [textInput, setTextInput] = useState('');
  const [imageInput, setImageInput] = useState<MultimediaInput | null>(null);
  const [audioInput, setAudioInput] = useState<MultimediaInput | null>(null);
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!textInput && !imageInput && !audioInput) {
      setError("Please provide at least one input (text, image, or voice) describing your symptoms.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeSymptoms(textInput, imageInput, audioInput);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("Analysis failed. Please try again. " + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const AlertBadge = ({ level }: { level: string }) => {
    let colorClass = "bg-gray-100 text-gray-800";
    if (level === "Critical") colorClass = "bg-red-100 text-red-800 border border-red-200";
    if (level === "Moderate") colorClass = "bg-yellow-100 text-yellow-800 border border-yellow-200";
    if (level === "Low") colorClass = "bg-green-100 text-green-800 border border-green-200";

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${colorClass}`}>
        {level} Priority
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              +
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Smart Health Companion</h1>
          </div>
          <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
            Powered by Gemini 3 Pro
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Intro Card */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">How are you feeling today?</h2>
          <p className="text-blue-100 max-w-xl">
            Describe your symptoms using text, voice, or images. Our AI companion will analyze your inputs to provide a summary and wellness recommendations.
          </p>
        </section>

        {/* Inputs Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Text Input (Span 7) */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Describe your symptoms</label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="E.g., I have a headache and a sore throat that started yesterday..."
                className="w-full h-40 p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Column: Media Inputs (Span 5) */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <AudioInput onAudioCapture={setAudioInput} />
              <ImageInput onImageCapture={setImageInput} />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className={`
              relative overflow-hidden group w-full md:w-auto px-12 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1
              ${isLoading ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30'}
            `}
          >
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Symptoms...
                </>
              ) : (
                <>Analyze Symptoms</>
              )}
            </span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-fade-in-up">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Summary Card */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                <div className="bg-blue-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Symptom Summary
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 leading-relaxed">{result.summary}</p>
                </div>
              </div>

              {/* Alert Card */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col">
                 <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Health Alert
                  </h3>
                  <AlertBadge level={result.alert.level} />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <p className="text-slate-700 font-medium mb-1">{result.alert.level === 'Critical' ? 'Immediate Attention Advised' : 'Analysis Assessment'}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{result.alert.details}</p>
                </div>
              </div>
            </div>

            {/* Recommendations Card */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
               <div className="bg-teal-50/50 px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    Wellness Recommendations
                  </h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-1 min-w-[20px] h-5 w-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <span className="text-slate-600">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-xs text-amber-800 flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p>
                <strong>Medical Disclaimer:</strong> This analysis is generated by AI (Gemini 3 Pro) and is for informational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you think you may have a medical emergency, call your doctor or emergency services immediately.
              </p>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;
