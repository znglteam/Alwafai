import React, { useState, useMemo, useEffect } from 'react';
import { FamilyMessage, UserSession } from '../types';
import { Send, Paperclip, Image, Video, CheckCircle, Info, MessageSquare, Edit3, Inbox, MessageCircle, Bell, Heart, Shield } from 'lucide-react';

interface ContactAdminProps {
  messages: FamilyMessage[];
  currentSession: UserSession;
  activeMemberId?: string;
  onSendMessage: (message: Omit<FamilyMessage, 'id' | 'createdAt'>) => void;
  onUpdateMessage: (updatedMessage: FamilyMessage) => Promise<void> | void;
}

export default function ContactAdmin({ messages, currentSession, activeMemberId, onSendMessage, onUpdateMessage }: ContactAdminProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachmentType, setAttachmentType] = useState<'none' | 'image' | 'video'>('none');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [msgError, setMsgError] = useState<string | null>(null);

  const userCleanEmail = currentSession.email?.trim().toLowerCase();
  const userId = currentSession.userId;

  const myMessages = useMemo(() => {
    return messages.filter(m => {
      const recEmail = m.recipientEmail?.trim().toLowerCase();
      const sndEmail = m.senderEmail?.trim().toLowerCase();
      
      if (userCleanEmail && recEmail && recEmail === userCleanEmail) return true;
      if (userCleanEmail && sndEmail && sndEmail === userCleanEmail) return true;
      if (userId && (m.senderId === userId || m.targetMemberId === userId)) return true;
      if (activeMemberId && m.targetMemberId === activeMemberId) return true;
      return false;
    });
  }, [messages, userCleanEmail, userId, activeMemberId]);

  const unreadCount = useMemo(() => {
    return myMessages.filter(m => m.isReadByMember === false).length;
  }, [myMessages]);

  const [activeTab, setActiveTab] = useState<'new' | 'inbox'>('inbox');

  useEffect(() => {
    if (activeTab === 'inbox') {
      const unread = myMessages.filter(m => m.isReadByMember === false);
      unread.forEach(msg => {
        onUpdateMessage({ ...msg, isReadByMember: true });
      });
    }
  }, [activeTab, myMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) { setMsgError("يرجى تعبئة الحقول المطلوبة (موضوع الرسالة، والرسالة)."); return; } if (attachmentType !== "none" && !attachmentUrl) { setMsgError("يرجى إرفاق الملف أو إلغاء المرفقات."); return; } setMsgError(null);

    onSendMessage({
      senderName: currentSession.name || 'عضو العائلة',
      senderEmail: currentSession.email || 'no-email@ghanem.family',
      subject,
      content,
      attachmentType,
      attachmentUrl: attachmentType !== 'none' ? attachmentUrl : undefined
    });

    setSubject('');
    setContent('');
    setAttachmentType('none');
    setAttachmentUrl('');
    
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setActiveTab('inbox');
    }, 3000);
  };

  return (
    <div id="contact-admin-container" className="max-w-3xl mx-auto py-4 space-y-8 dir-rtl text-right">
      
      {/* Intro Header */}
      <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4 border border-indigo-700/10">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20">
            <MessageSquare className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold">مراسلة إدارة العائلة</h2>
            <p className="text-xs text-indigo-100 mt-1">
              تواصل مع الإدارة وأرسل استفساراتك واقتراحاتك وتابع الردود عليها في مكان واحد.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('new')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'new' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Edit3 size={14} />
          إنشاء رسالة جديدة
        </button>
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inbox' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Inbox size={14} />
          <span>صندوق الرسائل والإشعارات ({myMessages.length})</span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#bb5791] animate-pulse"></span>
          )}
        </button>
      </div>

      {activeTab === 'new' && (
        <>
          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-3xl text-center space-y-4 shadow-xs animate-fade-in">
              <CheckCircle className="mx-auto text-emerald-600" size={48} />
              <h3 className="text-lg font-bold">تم إرسال رسالتك بنجاح!</h3>
              <p className="text-xs text-emerald-700 leading-relaxed max-w-md mx-auto">
                شكراً لتواصلك مع إدارة العائلة. سيتم نقلك الآن إلى صندوق المحادثات لمتابعة الردود.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 animate-fade-in"> {msgError && <p className="text-[10px] text-rose-500 font-bold border border-rose-200 bg-rose-50 p-2 rounded-lg text-center mb-4">{msgError}</p>}
              
              <div>
                <label className="block text-xs font-bold text-[#414141] mb-1">موضوع الرسالة *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="مثال: اقتراح بخصوص صندوق العائلة أو رغبة بإضافة صور قديمة"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414141] mb-1">الرسالة *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="اكتب هنا تفاصيل طلبك أو رسالتك لمدير ومجلس العائلة..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white leading-relaxed resize-y"
                />
              </div>

              {/* Attachment Selector */}
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#414141] flex items-center gap-1">
                    <Paperclip size={14} className="text-indigo-600" />
                    إرفاق ملفات مرئية (اختياري)
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setAttachmentType(attachmentType === 'image' ? 'none' : 'image'); setAttachmentUrl(''); }}
                      className={`text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${attachmentType === 'image' ? 'bg-[#414141] text-white font-bold' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                    >
                      <Image size={10} />
                      صورة
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAttachmentType(attachmentType === 'video' ? 'none' : 'video'); setAttachmentUrl(''); }}
                      className={`text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${attachmentType === 'video' ? 'bg-[#414141] text-white font-bold' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                    >
                      <Video size={10} />
                      فيديو
                    </button>
                  </div>
                </div>

                {attachmentType !== 'none' && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        اختر {attachmentType === 'image' ? 'صورة' : 'فيديو'} من جهازك
                      </label>
                      <input
                        type="file"
                        required
                        accept={attachmentType === 'image' ? 'image/*' : 'video/*'}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setAttachmentUrl(e.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setAttachmentUrl('');
                          }
                        }}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-[#414141] hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Send size={14} className="rtl:rotate-180" />
                إرسال الرسالة إلى إدارة العائلة
              </button>
            </form>
          )}
        </>
      )}

      {activeTab === 'inbox' && (
        <div className="space-y-6 animate-fade-in">
          {myMessages.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl space-y-3 shadow-sm">
              <MessageCircle className="mx-auto text-slate-300" size={48} />
              <h4 className="text-sm font-bold text-slate-600">لا توجد رسائل أو إشعارات حالياً</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                ستظهر هنا رسائلك للإدارة، والردود الواردة، وإشعارات التعليقات والمباركات على ملفك الشخصي.
              </p>
            </div>
          ) : (
            myMessages.map(msg => {
              const isReceivedNotification = (msg.recipientEmail && userCleanEmail && msg.recipientEmail.trim().toLowerCase() === userCleanEmail) || msg.messageType === 'profile_comment_member';
              const isProfileComment = msg.messageType === 'profile_comment_member' || msg.subject?.includes('تعليق جديد على ملفك');
              const isDirectAdminMsg = msg.messageType === 'admin_direct' || 
                msg.senderEmail === 'admin@family.com' || 
                msg.senderName?.includes('الآدمن') || 
                msg.senderName?.includes('إدارة العائلة') || 
                msg.senderId === 'admin-id';

              return (
              <div 
                key={msg.id} 
                className={`rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4 border transition-all ${
                  isDirectAdminMsg 
                    ? 'bg-gradient-to-b from-emerald-50/30 to-white border-emerald-300 ring-1 ring-emerald-200/60 shadow-md' 
                    : 'bg-white border-slate-100'
                }`}
              >
                <div className={`flex justify-between items-start border-b pb-3 ${isDirectAdminMsg ? 'border-emerald-100' : 'border-slate-100'}`}>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isDirectAdminMsg ? (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3 py-1 rounded-full font-bold shadow-xs">
                          <Shield size={13} className="fill-white/20" />
                          رسالة خاصة من إدارة العائلة (الآدمن)
                        </span>
                      ) : isProfileComment ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-0.5 rounded-md font-bold">
                          <Heart size={11} className="text-amber-600 fill-amber-600/20" />
                          تعليق على ملفك الشخصي
                        </span>
                      ) : isReceivedNotification ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold">
                          <Bell size={11} />
                          إشعار وارد
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold">
                          الموضوع الأساسي
                        </span>
                      )}
                      {msg.isReadByMember === false && (
                        <span className="text-[10px] bg-[#bb5791] text-white px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                          جديدة
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-bold">{new Date(msg.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                    <h4 className={`font-bold text-sm md:text-base ${isDirectAdminMsg ? 'text-emerald-950 font-extrabold' : 'text-[#414141]'}`}>
                      {msg.subject}
                    </h4>
                  </div>
                </div>
                
                {/* Initial Message */}
                <div className="flex flex-col items-start gap-1">
                  <div className={`w-full max-w-[95%] md:max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed ${
                    isDirectAdminMsg
                      ? 'bg-emerald-50/80 border border-emerald-200/90 text-slate-800 rounded-tr-sm shadow-xs'
                      : isProfileComment 
                      ? 'bg-amber-50/60 border border-amber-200/70 text-slate-800 rounded-tr-sm' 
                      : isReceivedNotification
                      ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tr-sm'
                      : 'bg-indigo-50 border border-indigo-100 text-slate-700 rounded-tr-sm'
                  }`}>
                    <div className={`text-[10px] font-bold mb-1.5 flex items-center justify-between ${
                      isDirectAdminMsg ? 'text-emerald-800 border-b border-emerald-200/60 pb-1.5' : 'text-indigo-600'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        {isDirectAdminMsg && <Shield size={12} className="text-emerald-600" />}
                        <span>{isDirectAdminMsg ? 'إدارة العائلة (الآدمن)' : isReceivedNotification ? `المرسل: ${msg.senderName}` : 'أنت'}</span>
                      </span>
                      {isDirectAdminMsg ? (
                        <span className="text-[9px] text-emerald-800 bg-emerald-100 border border-emerald-200/60 px-2 py-0.5 rounded-md font-bold">
                          رسالة مباشرة رسمية
                        </span>
                      ) : isProfileComment && (
                        <span className="text-[9px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                          شجرة العائلة
                        </span>
                      )}
                    </div>
                    <div className="whitespace-pre-line font-medium text-slate-800 leading-relaxed text-xs md:text-sm">{msg.content}</div>
                  </div>
                  {msg.attachmentUrl && (
                    <div className="mt-2 text-[10px] font-bold text-indigo-600 border border-indigo-100 bg-indigo-50 px-2 py-1 rounded-md">
                      يوجد ملف مرفق
                    </div>
                  )}
                </div>

                {/* Replies Thread */}
                {msg.replies && msg.replies.map(reply => (
                  <div key={reply.id} className={`flex flex-col gap-1 ${reply.isAdmin ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[90%] p-3.5 text-xs leading-relaxed ${
                      reply.isAdmin 
                        ? 'bg-emerald-900 text-white rounded-2xl rounded-tl-sm self-start shadow-xs' 
                        : 'bg-indigo-50 border border-indigo-100 text-slate-700 rounded-2xl rounded-tr-sm self-end'
                    }`}>
                      <div className={`text-[9px] font-bold mb-1 flex items-center gap-1 ${reply.isAdmin ? 'text-emerald-200' : 'text-indigo-500'}`}>
                        {reply.isAdmin && <Shield size={10} />}
                        <span>{reply.isAdmin ? 'إدارة العائلة (الآدمن)' : 'أنت'}</span>
                      </div>
                      <div className="whitespace-pre-line">{reply.content}</div>
                    </div>
                    <span className={`text-[9px] text-slate-400 px-1 ${reply.isAdmin ? 'self-start' : 'self-end'}`}>
                      {new Date(reply.createdAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}

                {/* Reply Box */}
                <div className={`mt-2 pt-4 border-t ${isDirectAdminMsg ? 'border-emerald-100' : 'border-slate-100'}`}>
                  <div className="flex gap-2">
                    <textarea
                      value={replyDrafts[msg.id] || ''}
                      onChange={e => setReplyDrafts(prev => ({...prev, [msg.id]: e.target.value}))}
                      placeholder={isDirectAdminMsg ? "اكتب ردك المباشر على رسالة الآدمن هنا..." : "أضف رداً على هذه المحادثة..."}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px] max-h-32 resize-y"
                      rows={2}
                    />
                    <button
                      type="button"
                      disabled={!replyDrafts[msg.id]?.trim()}
                      onClick={async () => {
                        try {
                          const content = replyDrafts[msg.id].trim();
                          const reply = {
                            id: 'rep-' + Date.now().toString(),
                            senderId: currentSession.userId || 'member',
                            senderName: currentSession.name || 'عضو العائلة',
                            content,
                            createdAt: new Date().toISOString(),
                            isAdmin: false
                          };
                          // Mark unread by admin so admin is notified of the member's reply
                          await onUpdateMessage({ ...msg, replies: [...(msg.replies || []), reply], isReadByAdmin: false });
                          setReplyDrafts(prev => ({...prev, [msg.id]: ''}));
                          setMsgError(null);
                        } catch (err) {
                          setMsgError('Error: ' + String(err));
                        }
                      }}
                      className={`${isDirectAdminMsg ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#414141] hover:bg-slate-800'} disabled:bg-slate-300 text-white p-3 rounded-xl flex items-center justify-center shrink-0 self-end transition-colors cursor-pointer`}
                      title="إرسال الرد"
                    >
                      <Send size={15} className="rtl:rotate-180" />
                    </button>
                  </div>
                  {isDirectAdminMsg && (
                    <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 mt-2 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                      <Shield size={12} className="shrink-0" />
                      <span>يمكنك الرد على الآدمن مباشرة وسيتلقى ردك في لوحة التحكم وتنبيهات الإدارة فوراً.</span>
                    </p>
                  )}
                  {msgError && <p className="text-[10px] text-rose-500 mt-1 font-bold">{msgError}</p>}
                </div>
              </div>
            ); })
          )}
        </div>
      )}
    </div>
  );
}
