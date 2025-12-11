import React, { useState } from 'react';
import { AppStatus, FileData, ProcessingState } from './types';
import UploadArea from './components/UploadArea';
import ResultDisplay from './components/ResultDisplay';
import { transcribeMedia } from './services/geminiService';

const App: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [state, setState] = useState<ProcessingState>({
    status: AppStatus.IDLE,
    progress: 0,
    message: ''
  });

  const handleFileSelect = (data: FileData) => {
    setFileData(data);
    setState({
      status: AppStatus.IDLE,
      progress: 0,
      message: 'Arquivo pronto para processar'
    });
  };

  const handleProcess = async () => {
    if (!fileData?.file) return;

    setState({
      status: AppStatus.UPLOADING,
      progress: 10,
      message: 'Preparando arquivo para envio...'
    });

    try {
      // Simulation of upload progress (since we use base64 mostly for this demo structure)
      // For a real huge file app, we'd use XHR upload progress here.
      const interval = setInterval(() => {
        setState(prev => {
           if (prev.status !== AppStatus.UPLOADING && prev.status !== AppStatus.PROCESSING) return prev;
           const newProgress = prev.progress + (prev.status === AppStatus.UPLOADING ? 2 : 0.5);
           return {
             ...prev,
             progress: Math.min(newProgress, 90)
           };
        });
      }, 500);

      setState({
        status: AppStatus.PROCESSING,
        progress: 30,
        message: 'A IA do Gemini está analisando o áudio...'
      });

      const result = await transcribeMedia(fileData.file);
      
      clearInterval(interval);

      setState({
        status: AppStatus.COMPLETED,
        progress: 100,
        message: 'Transcrição concluída!',
        result
      });

    } catch (error: any) {
      setState({
        status: AppStatus.ERROR,
        progress: 0,
        message: 'Erro no processamento',
        error: error.message
      });
    }
  };

  const handleReset = () => {
    setFileData(null);
    setState({
      status: AppStatus.IDLE,
      progress: 0,
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-indigo-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[128px]"></div>
      </div>

      <main className="relative container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 mb-4 bg-slate-800/50 rounded-xl border border-slate-700 backdrop-blur-md">
            <span className="text-xs font-semibold px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white">
              Powered by Gemini 2.5
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-4">
            Transcreve<span className="text-indigo-400">AI</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Transforme seus áudios e vídeos em texto instantaneamente. 
            Obtenha transcrições precisas, destaques inteligentes e resumos em segundos.
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Upload Section (Visible if no result yet) */}
          {state.status !== AppStatus.COMPLETED && (
            <div className="space-y-6">
              {!fileData ? (
                <UploadArea onFileSelect={handleFileSelect} disabled={false} />
              ) : (
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 flex-shrink-0">
                      {fileData.mimeType.startsWith('video') ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{fileData.file?.name}</p>
                      <p className="text-xs text-slate-500">{(fileData.file?.size || 0) / 1024 / 1024 < 1 ? Math.round((fileData.file?.size || 0) / 1024) + ' KB' : ((fileData.file?.size || 0) / 1024 / 1024).toFixed(2) + ' MB'}</p>
                    </div>
                  </div>
                  {state.status === AppStatus.IDLE && (
                    <button onClick={handleReset} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {fileData && state.status === AppStatus.IDLE && (
                <button
                  onClick={handleProcess}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  Iniciar Transcrição
                </button>
              )}

              {/* Progress State */}
              {(state.status === AppStatus.UPLOADING || state.status === AppStatus.PROCESSING) && (
                <div className="space-y-3 animate-in fade-in duration-300">
                   <div className="flex justify-between text-sm text-slate-400">
                     <span>{state.message}</span>
                     <span>{Math.round(state.progress)}%</span>
                   </div>
                   <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-indigo-500 transition-all duration-300 ease-out rounded-full relative overflow-hidden"
                        style={{ width: `${state.progress}%` }}
                     >
                       <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                     </div>
                   </div>
                   <p className="text-xs text-center text-slate-500 mt-2">
                     Arquivos grandes podem levar alguns minutos. Por favor, aguarde.
                   </p>
                </div>
              )}

              {/* Error State */}
              {state.status === AppStatus.ERROR && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-200">Erro ao processar</h3>
                    <p className="text-sm text-red-300/80 mt-1">{state.error}</p>
                    <button 
                      onClick={handleReset}
                      className="mt-3 text-xs font-medium text-red-400 hover:text-red-300 underline"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Result Section */}
          {state.status === AppStatus.COMPLETED && state.result && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Resultado</h2>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                >
                  Nova Transcrição
                </button>
              </div>
              
              <ResultDisplay result={state.result} />
            </div>
          )}
        </div>
        
        <footer className="mt-12 text-center text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} TranscreveAI. Todos os direitos reservados.</p>
        </footer>
      </main>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default App;