import React, { useState } from 'react';
import { TranscriptionResult } from '../types';

interface ResultDisplayProps {
  result: TranscriptionResult;
}

// Componente auxiliar para renderizar texto com formatação simples (Bold e Italic)
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Função para processar o texto
  const renderContent = () => {
    // 1. Dividir por blocos de negrito (**texto**)
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      // Se for um bloco de negrito
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Se for texto normal, processar itálico (*texto*) dentro dele
      return (
        <span key={index}>
          {part.split(/(\*.*?\*)/g).map((subPart, subIndex) => {
            if (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) {
              return (
                <em key={subIndex} className="italic text-indigo-300">
                  {subPart.slice(1, -1)}
                </em>
              );
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  return <>{renderContent()}</>;
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'transcription' | 'highlights' | 'summary'>('transcription');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let textToCopy = '';
    if (activeTab === 'transcription') textToCopy = result.transcription;
    if (activeTab === 'highlights') textToCopy = result.highlights.map(h => `- ${h}`).join('\n');
    if (activeTab === 'summary') textToCopy = result.summary || '';

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-sm mt-8 shadow-xl flex flex-col h-[600px]">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-700 flex-shrink-0 bg-slate-900/40">
        <button
          onClick={() => setActiveTab('transcription')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
            activeTab === 'transcription' 
              ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-800/60' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Transcrição
        </button>
        <button
          onClick={() => setActiveTab('highlights')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
            activeTab === 'highlights' 
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/60' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Highlights
        </button>
        {result.summary && (
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'summary' 
                ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-800/60' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Resumo
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Copy Button Overlay */}
        <div className="absolute top-4 right-6 z-10">
            <button
            onClick={handleCopy}
            className="p-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 backdrop-blur rounded-lg transition-all shadow-lg flex items-center gap-2 group"
            >
            {copied ? (
                <>
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="text-green-400">Copiado!</span>
                </>
            ) : (
                <>
                <svg className="w-4 h-4 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                Copiar
                </>
            )}
            </button>
        </div>

        <div className="h-full overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {activeTab === 'transcription' && (
            <div className="prose prose-invert prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-slate-300 leading-loose text-justify font-light tracking-wide">
                  <FormattedText text={result.transcription} />
                </div>
            </div>
            )}

            {activeTab === 'highlights' && (
            <ul className="space-y-4">
                {result.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600 transition-all group">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 group-hover:scale-110 transition-all text-sm font-bold mt-0.5 border border-emerald-500/20">
                    {index + 1}
                    </span>
                    <span className="text-slate-300 leading-relaxed text-lg">
                        <FormattedText text={highlight} />
                    </span>
                </li>
                ))}
            </ul>
            )}

            {activeTab === 'summary' && (
            <div className="relative">
                <div className="absolute -left-2 -top-2 text-6xl text-amber-500/10 font-serif">"</div>
                <div className="p-6 md:p-8 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                    <p className="text-slate-200 leading-loose text-lg font-light">
                        <FormattedText text={result.summary || ''} />
                    </p>
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;