import React, { useState, useMemo } from 'react';
import { FamilyMessage, UserSession } from '../types';
import { Send, Paperclip, Image, Video, CheckCircle, Info, MessageSquare, Edit3, Inbox, MessageCircle } from 'lucide-react';

interface ContactAdminProps {
  messages: FamilyMessage[];
  currentSession: UserSession;
  onSendMessage: (message: Omit<FamilyMessage, 'id' | 'createdAt'>) => void;
  onUpdateMessage: (updatedMessage: FamilyMessage) => Promise<void> | void;
}

export default function ContactAdmin({ messages, currentSession, onSendMessage, onUpdateMessage }: ContactAdminProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'inbox'>('new');
  
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachmentType, setAttachmentType] = useState<'none' | 'image' | 'video'>('none');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [msgError, setMsgError] = useState<string | null>(null);
  useEffect(() => {
    const unreadMessages = messages.filter(m => (m.senderEmail === currentSession.email || m.senderId === currentSession.userId) && m.isReadByMember === false);
    unreadMessages.forEach(msg => {
      onUpdateMessage({ ...msg, isReadByMember: true });
    });
  }, []);

  const myMessages = useMemo(() => {
    if (!currentSession.email) return [];
    return messages.filter(m => 
      m.senderEmail.toLowerCase() === currentSession.email?.toLowerCase() ||
      m.recipientEmail?.toLowerCase() === currentSession.email?.toLowerCase()
    );
  }, [messages, currentSession.email]);

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
          صندوق المحادثات ({myMessages.length})
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
              <h4 className="text-sm font-bold text-slate-600">لا توجد محادثات سابقة</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                لم تقم بإرسال أي رسائل إلى الإدارة حتى الآن. انقر على "إنشاء رسالة جديدة" للبدء.
              </p>
            </div>
          ) : (
            myMessages.map(msg => (
              <div key={msg.id} className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#414141]">{msg.subject}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(msg.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold">
                    الموضوع الأساسي
                  </span>
                </div>
                
                {/* Initial Message */}
                <div className="flex flex-col items-start gap-1">
                  <div className="max-w-[90%] bg-indigo-50 border border-indigo-100 text-slate-700 p-3 rounded-2xl rounded-tr-sm text-xs leading-relaxed">
                    <div className="text-[9px] font-bold text-indigo-400 mb-1">أنت</div>
                    <div className="whitespace-pre-line">{msg.content}</div>
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
                    <div className={`max-w-[90%] p-3 text-xs leading-relaxed ${reply.isAdmin ? 'bg-slate-800 text-white rounded-2xl rounded-tl-sm self-end' : 'bg-indigo-50 border border-indigo-100 text-slate-700 rounded-2xl rounded-tr-sm'}`}>
                      <div className={`text-[9px] font-bold mb-1 ${reply.isAdmin ? 'text-slate-400' : 'text-indigo-400'}`}>
                        {reply.isAdmin ? 'إدارة العائلة' : 'أنت'}
                      </div>
                      <div className="whitespace-pre-line">{reply.content}</div>
                    </div>
                    <span className={`text-[9px] text-slate-400 px-1 ${reply.isAdmin ? 'self-end' : ''}`}>
                      {new Date(reply.createdAt).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}

                {/* Reply Box */}
                <div className="mt-2 pt-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    <textarea
                      value={replyDrafts[msg.id] || ''}
                      onChange={e => setReplyDrafts(prev => ({...prev, [msg.id]: e.target.value}))}
                      placeholder="أضف رداً على هذه المحادثة..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[40px] max-h-32 resize-y"
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
                          await onUpdateMessage({ ...msg, replies: [...(msg.replies || []), reply] });
                          setReplyDrafts(prev => ({...prev, [msg.id]: ''}));
                          setMsgError(null);
                        } catch (err) {
                          setMsgError('Error: ' + String(err));
                        }
                      }}
                      className="bg-[#414141] hover:bg-slate-800 disabled:bg-slate-300 text-white p-2.5 rounded-xl flex items-center justify-center shrink-0 self-end transition-colors"
                    >
                      <Send size={14} className="rtl:rotate-180" />
                    </button>
                  </div>
                  {msgError && <p className="text-[10px] text-rose-500 mt-1 font-bold">{msgError}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
