import React, { useState, useEffect, useRef } from 'react';
import { UserSession, ForumTopic, ForumReply, FamilyMember, FamilyMessage } from '../types';
import { db, saveMessageToCloud } from '../utils/firebaseService';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { MessageSquareText, Plus, Clock, MessageCircle, Send, ArrowRight, CornerDownLeft, ChevronRight, X, CheckCircle2 } from 'lucide-react';
import AvatarImage from './AvatarImage';
import { GenderUserIcon } from './GenderIcon';

interface ForumProps {
  currentSession: UserSession;
  allMembers: FamilyMember[];
  onSendMessage?: (message: FamilyMessage) => void;
  onLiveNotify?: (text: string) => void;
}

export default function Forum({ currentSession, allMembers, onSendMessage, onLiveNotify }: ForumProps) {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  
  const [newReplyContent, setNewReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<ForumReply | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch topics
  useEffect(() => {
    const q = query(collection(db, 'forumTopics'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTopics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // safely parse timestamps
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt || new Date().toISOString(),
      })) as ForumTopic[];
      setTopics(fetchedTopics);
    });
    return () => unsubscribe();
  }, []);

  // Fetch replies when a topic is selected
  useEffect(() => {
    if (!selectedTopic) {
      setReplies([]);
      setReplyingTo(null);
      return;
    }
    
    const topicRef = doc(db, 'forumTopics', selectedTopic.id);
    const q = query(collection(topicRef, 'replies'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReplies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt || new Date().toISOString(),
      })) as ForumReply[];
      setReplies(fetchedReplies);
    });
    
    return () => unsubscribe();
  }, [selectedTopic]);

  const handleStartReplyTo = (reply: ForumReply) => {
    setReplyingTo(reply);
    setTimeout(() => {
      replyInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      replyInputRef.current?.focus();
    }, 50);
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !currentSession.name) return;
    
    setIsSubmitting(true);
    try {
      const topicDoc = await addDoc(collection(db, 'forumTopics'), {
        title: newTopicTitle.trim(),
        content: newTopicContent.trim(),
        authorId: currentSession.userId || currentSession.email || 'unknown',
        authorName: currentSession.name,
        authorEmail: currentSession.email || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        repliesCount: 0
      });
      
      // Notify Admin if someone other than admin created a topic
      if (currentSession.role !== 'admin') {
        const topicAdminMsg: FamilyMessage = {
          id: 'msg-' + Date.now().toString() + '-topic-adm',
          senderName: currentSession.name,
          senderEmail: currentSession.email || 'member@family.com',
          recipientEmail: 'admin@family.com',
          messageType: 'forum_reply_admin',
          subject: `موضوع جديد في المنتدى من (${currentSession.name})`,
          content: `قام العضو "${currentSession.name}" بإنشاء موضوع جديد في المنتدى العائلي بعنوان:\n"${newTopicTitle.trim()}"\n\nمحتوى الموضوع:\n"${newTopicContent.trim()}"\n\nتاريخ النشر: ${new Date().toLocaleString('ar-SA')}`,
          attachmentType: 'none',
          createdAt: new Date().toISOString(),
          isReadByAdmin: false,
          isReadByMember: true,
          replies: []
        };
        try {
          await saveMessageToCloud(topicAdminMsg);
          if (onSendMessage) onSendMessage(topicAdminMsg);
        } catch (err) {
          console.warn('Could not save topic admin notification:', err);
        }
      }

      setNewTopicTitle('');
      setNewTopicContent('');
      setIsCreatingTopic(false);
      setFeedbackToast('تم نشر الموضوع الجديد بنجاح!');
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch (error) {
      console.error("Error creating topic:", error);
      alert("حدث خطأ أثناء إنشاء الموضوع");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyContent.trim() || !selectedTopic || !currentSession.name) return;
    
    setIsSubmitting(true);
    const replyText = newReplyContent.trim();
    const currentReplyingTo = replyingTo;

    try {
      const topicRef = doc(db, 'forumTopics', selectedTopic.id);
      
      await addDoc(collection(topicRef, 'replies'), {
        topicId: selectedTopic.id,
        content: replyText,
        authorId: currentSession.userId || currentSession.email || 'unknown',
        authorName: currentSession.name,
        authorEmail: currentSession.email || '',
        createdAt: serverTimestamp(),
        replyToReplyId: currentReplyingTo?.id || null,
        replyToAuthorName: currentReplyingTo?.authorName || null,
        replyToAuthorId: currentReplyingTo?.authorId || null,
        replyToAuthorEmail: currentReplyingTo?.authorEmail || null,
        replyToContent: currentReplyingTo?.content ? (currentReplyingTo.content.length > 90 ? currentReplyingTo.content.substring(0, 90) + '...' : currentReplyingTo.content) : null
      });
      
      await updateDoc(topicRef, {
        repliesCount: increment(1),
        updatedAt: serverTimestamp()
      });

      // --- Dispatch Notifications ---

      // 1. Notify Admin (if the replier is NOT admin)
      const isReplierAdmin = currentSession.role === 'admin' || currentSession.email === 'admin@family.com';
      if (!isReplierAdmin) {
        const adminMsg: FamilyMessage = {
          id: 'msg-' + Date.now().toString() + '-forum-adm',
          senderName: currentSession.name,
          senderEmail: currentSession.email || 'member@family.com',
          recipientEmail: 'admin@family.com',
          messageType: 'forum_reply_admin',
          subject: `رد جديد في المنتدى من (${currentSession.name}) على موضوع (${selectedTopic.title})`,
          content: `قام "${currentSession.name}" بإضافة رد جديد في المنتدى على موضوع "${selectedTopic.title}".${currentReplyingTo ? `\n\n(رداً على مشاركة: ${currentReplyingTo.authorName})` : ''}\n\nنص الرد:\n"${replyText}"\n\nتاريخ الرد: ${new Date().toLocaleString('ar-SA')}`,
          attachmentType: 'none',
          createdAt: new Date().toISOString(),
          isReadByAdmin: false,
          isReadByMember: true,
          replies: []
        };
        try {
          await saveMessageToCloud(adminMsg);
          if (onSendMessage) onSendMessage(adminMsg);
        } catch (err) {
          console.warn('Could not save forum reply admin notification:', err);
        }
      }

      // 2. Notify Topic Author (if replier is NOT topic author)
      const isTopicAuthor = (currentSession.userId && selectedTopic.authorId === currentSession.userId) ||
        (currentSession.email && selectedTopic.authorEmail && selectedTopic.authorEmail.toLowerCase() === currentSession.email.toLowerCase());
      
      if (!isTopicAuthor) {
        const topicAuthorMember = allMembers.find(m => m.id === selectedTopic.authorId || (selectedTopic.authorEmail && m.email === selectedTopic.authorEmail));
        const topicAuthorEmail = selectedTopic.authorEmail || topicAuthorMember?.email;
        
        const topicAuthorMsg: FamilyMessage = {
          id: 'msg-' + Date.now().toString() + '-forum-topic',
          senderName: currentSession.name,
          senderEmail: currentSession.email || 'forum@family.com',
          recipientEmail: topicAuthorEmail || undefined,
          targetMemberId: topicAuthorMember?.id || selectedTopic.authorId,
          messageType: 'forum_reply_member',
          subject: `رد جديد على موضوعك: "${selectedTopic.title}"`,
          content: `قام "${currentSession.name}" بالرد على موضوعك في المنتدى العائلي بعنوان "${selectedTopic.title}".\n\nنص الرد:\n"${replyText}"\n\nتاريخ الرد: ${new Date().toLocaleString('ar-SA')}`,
          attachmentType: 'none',
          createdAt: new Date().toISOString(),
          isReadByAdmin: true,
          isReadByMember: false,
          replies: []
        };
        try {
          await saveMessageToCloud(topicAuthorMsg);
          if (onSendMessage) onSendMessage(topicAuthorMsg);
        } catch (err) {
          console.warn('Could not save forum reply topic author notification:', err);
        }
      }

      // 3. Notify Parent Reply Author (if replying to a reply, and parent author is NOT replier and NOT already topic author)
      if (currentReplyingTo) {
        const isParentAuthor = (currentSession.userId && currentReplyingTo.authorId === currentSession.userId) ||
          (currentSession.email && currentReplyingTo.authorEmail && currentReplyingTo.authorEmail.toLowerCase() === currentSession.email.toLowerCase());
        const isParentSameAsTopicAuthor = currentReplyingTo.authorId === selectedTopic.authorId;

        if (!isParentAuthor && !isParentSameAsTopicAuthor) {
          const parentMember = allMembers.find(m => m.id === currentReplyingTo.authorId || (currentReplyingTo.authorEmail && m.email === currentReplyingTo.authorEmail));
          const parentEmail = currentReplyingTo.authorEmail || parentMember?.email;

          const replyAuthorMsg: FamilyMessage = {
            id: 'msg-' + Date.now().toString() + '-forum-reply',
            senderName: currentSession.name,
            senderEmail: currentSession.email || 'forum@family.com',
            recipientEmail: parentEmail || undefined,
            targetMemberId: parentMember?.id || currentReplyingTo.authorId,
            messageType: 'forum_reply_member',
            subject: `قام (${currentSession.name}) بالرد على مشاركتك في المنتدى`,
            content: `قام "${currentSession.name}" بالرد على مشاركتك في موضوع "${selectedTopic.title}".\n\nمشاركتك الأصلية:\n"${currentReplyingTo.content.slice(0, 100)}..."\n\nالرد الجديد:\n"${replyText}"\n\nتاريخ الرد: ${new Date().toLocaleString('ar-SA')}`,
            attachmentType: 'none',
            createdAt: new Date().toISOString(),
            isReadByAdmin: true,
            isReadByMember: false,
            replies: []
          };
          try {
            await saveMessageToCloud(replyAuthorMsg);
            if (onSendMessage) onSendMessage(replyAuthorMsg);
          } catch (err) {
            console.warn('Could not save forum reply parent author notification:', err);
          }
        }
      }

      setNewReplyContent('');
      setReplyingTo(null);

      const toast = currentReplyingTo 
        ? `تم إرسال ردك على مشاركة ${currentReplyingTo.authorName} وإشعار الإدارة بنجاح!` 
        : `تم نشر ردك وإشعار صاحب الموضوع والإدارة بنجاح!`;
      setFeedbackToast(toast);
      if (onLiveNotify) onLiveNotify(toast);
      setTimeout(() => setFeedbackToast(null), 5000);
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

  const getAuthorMember = (authorId: string) => {
    return allMembers.find(m => m.id === authorId || m.email === authorId || m.registeredUserId === authorId);
  };

  return (
    <div className="w-full max-w-5xl mx-auto min-h-[600px] flex flex-col" dir="rtl">
      
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="mb-4 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-200" />
            <span>{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-emerald-200 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 md:p-8 rounded-3xl shadow-xs border border-slate-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <MessageSquareText size={26} className="text-indigo-600" />
            المنتدى العائلي
          </h2>
          <p className="text-sm text-slate-500 mt-2">مساحة حرة لنقاشات العائلة وتبادل الأفكار والأخبار ومتابعة الردود.</p>
        </div>
        
        {!selectedTopic && !isCreatingTopic && (
          <button 
            onClick={() => setIsCreatingTopic(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <Plus size={18} />
            موضوع جديد
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
        
        {isCreatingTopic ? (
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
              <button 
                onClick={() => setIsCreatingTopic(false)}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full transition-all cursor-pointer"
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
              
              <div className="pt-4 flex items-center gap-3">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newTopicTitle.trim() || !newTopicContent.trim()}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <><Send size={18} /> نشر الموضوع</>
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsCreatingTopic(false)}
                  className="text-sm font-bold text-slate-500 hover:text-slate-800 px-4 py-3"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
          
        ) : selectedTopic ? (
          <div className="flex flex-col h-full">
            {/* Topic View Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-start gap-4">
              <button 
                onClick={() => {
                  setSelectedTopic(null);
                  setReplyingTo(null);
                }}
                className="mt-1 p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-full shadow-xs border border-slate-200 transition-all shrink-0 cursor-pointer"
              >
                <ArrowRight size={20} />
              </button>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-4">{selectedTopic.title}</h3>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const authorMember = getAuthorMember(selectedTopic.authorId);
                      if (authorMember?.avatar) {
                        return (
                          <div className="w-8 h-8 rounded-full overflow-hidden relative border border-indigo-200 shrink-0 bg-white shadow-xs">
                            <AvatarImage 
                              src={authorMember.avatar} 
                              alt={selectedTopic.authorName}
                              avatarX={authorMember.avatarX}
                              avatarY={authorMember.avatarY}
                              avatarScale={authorMember.avatarScale}
                            />
                          </div>
                        );
                      }
                      return (
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                          <GenderUserIcon gender={authorMember?.gender || 'male'} size={20} isAlive={true} />
                        </div>
                      );
                    })()}
                    <span className="font-medium text-slate-700">{selectedTopic.authorName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span dir="ltr">{formatDate(selectedTopic.createdAt)}</span>
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
                الردود والمشاركات ({replies.length})
              </h4>
              
              {replies.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed">
                  <MessageSquareText size={32} className="mx-auto mb-3 opacity-50" />
                  <p>لا توجد ردود بعد. كن أول من يشارك برأيه!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {replies.map(reply => (
                    <div 
                      key={reply.id} 
                      className={`bg-white p-5 rounded-2xl shadow-xs border transition-all ${
                        reply.replyToReplyId ? 'mr-3 md:mr-6 border-indigo-100 bg-indigo-50/15' : 'border-slate-100'
                      }`}
                    >
                      {/* Quoted Header if replying to a specific reply */}
                      {reply.replyToAuthorName && (
                        <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl bg-slate-50 border-r-3 border-indigo-500 text-xs text-slate-600">
                          <CornerDownLeft size={13} className="text-indigo-600 shrink-0" />
                          <span className="font-bold text-indigo-900">رداً على مشاركة {reply.replyToAuthorName}:</span>
                          {reply.replyToContent && (
                            <span className="text-slate-500 italic truncate max-w-sm">"{reply.replyToContent}"</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          {(() => {
                            const authorMember = getAuthorMember(reply.authorId);
                            if (authorMember?.avatar) {
                              return (
                                <div className="w-7 h-7 rounded-full overflow-hidden relative border border-slate-200 shrink-0 bg-white shadow-xs">
                                  <AvatarImage 
                                    src={authorMember.avatar} 
                                    alt={reply.authorName}
                                    avatarX={authorMember.avatarX}
                                    avatarY={authorMember.avatarY}
                                    avatarScale={authorMember.avatarScale}
                                  />
                                </div>
                              );
                            }
                            return (
                              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                                <GenderUserIcon gender={authorMember?.gender || 'male'} size={16} isAlive={true} />
                              </div>
                            );
                          })()}
                          <span className="font-bold text-sm text-slate-700">{reply.authorName}</span>
                        </div>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} />
                          <span dir="ltr">{formatDate(reply.createdAt)}</span>
                        </span>
                      </div>

                      <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap pr-9">
                        {reply.content}
                      </div>

                      {/* Reply to this reply button */}
                      <div className="mt-3 pr-9 pt-2 border-t border-slate-100/60 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleStartReplyTo(reply)}
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-850 font-bold py-1 px-2.5 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                          title={`الرد على مشاركة ${reply.authorName}`}
                        >
                          <CornerDownLeft size={13} />
                          <span>رد على هذه المشاركة</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Reply Form */}
              <div className="mt-8 bg-white p-5 rounded-2xl shadow-xs border border-indigo-100">
                <form onSubmit={handleCreateReply}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <CornerDownLeft size={16} className="text-indigo-600" />
                      {replyingTo ? `أضف رداً على مشاركة (${replyingTo.authorName})` : 'أضف رداً على المنشور'}
                    </label>
                    {replyingTo && (
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-bold py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <X size={13} />
                        إلغاء الرد على المشاركة
                      </button>
                    )}
                  </div>

                  {/* Replying context banner */}
                  {replyingTo && (
                    <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-200 px-3.5 py-2.5 rounded-xl mb-3">
                      <div className="flex items-center gap-2 text-xs text-indigo-900 overflow-hidden">
                        <CornerDownLeft size={14} className="text-indigo-600 shrink-0" />
                        <span className="truncate">
                          أنت ترد على مشاركة <strong className="font-extrabold text-indigo-700">{replyingTo.authorName}</strong>: "{replyingTo.content.slice(0, 70)}{replyingTo.content.length > 70 ? '...' : ''}"
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="text-xs text-slate-500 hover:text-rose-600 font-bold px-2 py-0.5 rounded-md hover:bg-white transition-colors shrink-0"
                      >
                        إلغاء
                      </button>
                    </div>
                  )}

                  <textarea 
                    ref={replyInputRef}
                    required
                    rows={3}
                    value={newReplyContent}
                    onChange={e => setNewReplyContent(e.target.value)}
                    placeholder={replyingTo ? `اكتب ردك المباشر على مشاركة ${replyingTo.authorName}...` : "اكتب ردك ومشاركتك هنا..."}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none mb-3"
                  ></textarea>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {replyingTo ? 'سيتم إشعار صاحب المشاركة وإدارة العائلة بردك تلقائياً.' : 'سيتم إشعار صاحب الموضوع وإدارة العائلة بردك تلقائياً.'}
                    </span>
                    <button 
                      type="submit" 
                      disabled={isSubmitting || !newReplyContent.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <><Send size={16} /> {replyingTo ? 'إرسال الرد على المشاركة' : 'إرسال الرد'}</>
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
                        {(() => {
                          const authorMember = getAuthorMember(topic.authorId);
                          if (authorMember?.avatar) {
                            return (
                              <div className="w-5 h-5 rounded-full overflow-hidden relative border border-slate-200 shrink-0 bg-white">
                                <AvatarImage 
                                  src={authorMember.avatar} 
                                  alt={topic.authorName}
                                  avatarX={authorMember.avatarX}
                                  avatarY={authorMember.avatarY}
                                  avatarScale={authorMember.avatarScale}
                                />
                              </div>
                            );
                          }
                          return (
                            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                              <GenderUserIcon gender={authorMember?.gender || 'male'} size={12} isAlive={true} />
                            </div>
                          );
                        })()}
                        {topic.authorName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        <span dir="ltr">{formatDate(topic.createdAt)}</span>
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
                    
                    <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all shadow-xs">
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
