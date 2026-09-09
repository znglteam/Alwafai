import React, { useState, useEffect } from 'react';
import { UserSession, ForumTopic, ForumReply } from '../types';
import { db } from '../utils/firebaseService';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { MessageSquareText, Plus, User, Clock, MessageCircle, Send, ArrowRight, CornerDownLeft, ChevronRight } from 'lucide-react';

interface ForumProps {
  currentSession: UserSession;
}

export default function Forum({ currentSession }: ForumProps) {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  
  const [newReplyContent, setNewReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch topics
  useEffect(() => {
    const q = query(collection(db, 'forumTopics'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTopics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // safely parse timestamps
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as ForumTopic[];
      setTopics(fetchedTopics);
    });
    return () => unsubscribe();
  }, []);

  // Fetch replies when a topic is selected
  useEffect(() => {
    if (!selectedTopic) return;
    
    const q = query(
      collection(db, 'forumTopics', selectedTopic.id, 'replies'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReplies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as ForumReply[];
      setReplies(fetchedReplies);
    });
    return () => unsubscribe();
  }, [selectedTopic]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !currentSession.name) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'forumTopics'), {
        title: newTopicTitle.trim(),
        content: newTopicContent.trim(),
        authorId: currentSession.userId || currentSession.email || 'unknown',
        authorName: currentSession.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        repliesCount: 0
      });
      setIsCreatingTopic(false);
      setNewTopicTitle('');
      setNewTopicContent('');
    } catch (error) {
      console.error("Error creating topic:", error);
      alert("حدث خطأ أثناء إضافة الموضوع");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyContent.trim() || !selectedTopic || !currentSession.name) return;
    
    setIsSubmitting(true);
    try {
      const topicRef = doc(db, 'forumTopics', selectedTopic.id);
      
      await addDoc(collection(topicRef, 'replies'), {
        topicId: selectedTopic.id,
        content: newReplyContent.trim(),
        authorId: currentSession.userId || currentSession.email || 'unknown',
        authorName: currentSession.name,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(topicRef, {
        repliesCount: increment(1),
        updatedAt: serverTimestamp()
      });
      
      setNewReplyContent('');
    } catch (error) {
      console.error("Error creating reply:", error);
      alert("حدث خطأ أثناء إضافة الرد");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto min-h-[600px] flex flex-col" dir="rtl">
      
      {/* Header */}
      <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <MessageSquareText size={26} className="text-indigo-600" />
            المنتدى العائلي
          </h2>
          <p className="text-sm text-slate-500 mt-2">مساحة حرة لنقاشات العائلة وتبادل الأفكار والأخبار.</p>
        </div>
        
        {!selectedTopic && !isCreatingTopic && (
          <button 
            onClick={() => setIsCreatingTopic(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus size={18} />
            موضوع جديد
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {isCreatingTopic ? (
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
              <button 
                onClick={() => setIsCreatingTopic(false)}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full transition-all"
              >
                <ArrowRight size={20} />
              </button>
              <h3 className="text-xl font-bold text-slate-800">إنشاء موضوع جديد</h3>
            </div>
            
            <form onSubmit={handleCreateTopic} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">عنوان الموضوع</label>
                <input 
                  type="text" 
                  required
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  placeholder="اكتب عنواناً واضحاً لموضوعك..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">محتوى الموضوع</label>
                <textarea 
                  required
                  rows={8}
                  value={newTopicContent}
                  onChange={e => setNewTopicContent(e.target.value)}
                  placeholder="اكتب ما تود مشاركته مع العائلة هنا..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                ></textarea>
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newTopicTitle.trim() || !newTopicContent.trim()}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <><Send size={18} /> نشر الموضوع</>
                  )}
                </button>
              </div>
            </form>
          </div>
          
        ) : selectedTopic ? (
          
          <div className="flex flex-col h-full">
            {/* Topic View Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-start gap-4">
              <button 
                onClick={() => setSelectedTopic(null)}
                className="mt-1 p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-full shadow-sm border border-slate-200 transition-all shrink-0"
              >
                <ArrowRight size={20} />
              </button>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-4">{selectedTopic.title}</h3>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {selectedTopic.authorName.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-700">{selectedTopic.authorName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>{formatDate(selectedTopic.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle size={16} />
                    <span>{selectedTopic.repliesCount || 0} ردود</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic Content */}
            <div className="p-6 md:p-8 text-slate-700 leading-loose whitespace-pre-wrap text-[15px] border-b border-slate-100">
              {selectedTopic.content}
            </div>
            
            {/* Replies Section */}
            <div className="p-6 md:p-8 bg-slate-50/50 flex-1">
              <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <MessageCircle size={20} className="text-indigo-500" />
                الردود والمشاركات
              </h4>
              
              {replies.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed">
                  <MessageSquareText size={32} className="mx-auto mb-3 opacity-50" />
                  <p>لا توجد ردود بعد. كن أول من يشارك برأيه!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {replies.map(reply => (
                    <div key={reply.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                            {reply.authorName.charAt(0)}
                          </div>
                          <span className="font-bold text-sm text-slate-700">{reply.authorName}</span>
                        </div>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap pr-10">
                        {reply.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Reply Form */}
              <div className="mt-8 bg-white p-5 rounded-2xl shadow-sm border border-indigo-100">
                <form onSubmit={handleCreateReply}>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                    <CornerDownLeft size={16} className="text-indigo-600" />
                    أضف رداً
                  </label>
                  <textarea 
                    required
                    rows={3}
                    value={newReplyContent}
                    onChange={e => setNewReplyContent(e.target.value)}
                    placeholder="اكتب ردك هنا..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none mb-3"
                  ></textarea>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isSubmitting || !newReplyContent.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <><Send size={16} /> إرسال</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
          </div>
          
        ) : (
          
          <div className="divide-y divide-slate-100">
            {topics.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquareText size={36} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد مواضيع بعد</h3>
                <p className="text-slate-500">بادر بإنشاء أول موضوع لنقاش العائلة!</p>
              </div>
            ) : (
              topics.map(topic => (
                <div 
                  key={topic.id} 
                  onClick={() => setSelectedTopic(topic)}
                  className="p-6 hover:bg-slate-50 cursor-pointer transition-colors group flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2 leading-tight">
                      {topic.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" />
                        {topic.authorName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        {formatDate(topic.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 md:gap-8 shrink-0">
                    <div className="flex flex-col items-center justify-center bg-slate-50 group-hover:bg-indigo-50 border border-slate-100 group-hover:border-indigo-100 rounded-xl px-4 py-2 transition-colors min-w-[70px]">
                      <span className="text-lg font-black text-slate-700 group-hover:text-indigo-700">
                        {topic.repliesCount || 0}
                      </span>
                      <span className="text-[10px] text-slate-500 group-hover:text-indigo-500 font-bold">
                        الردود
                      </span>
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                      <ChevronRight size={20} className="mr-0.5" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}
