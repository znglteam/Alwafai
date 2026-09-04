import React, { useState } from 'react';
import { FamilyMessage, UserSession } from '../types';
import { Send, Paperclip, Image, Video, CheckCircle, Info, MessageSquare } from 'lucide-react';

interface ContactAdminProps {
  currentSession: UserSession;
  onSendMessage: (message: Omit<FamilyMessage, 'id' | 'createdAt'>) => void;
}

export default function ContactAdmin({ currentSession, onSendMessage }: ContactAdminProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachmentType, setAttachmentType] = useState<'none' | 'image' | 'video'>('none');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;

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
    }, 5000);
  };

  return (
    <div id="contact-admin-container" className="max-w-2xl mx-auto py-4 space-y-8 dir-rtl text-right">
      
      {/* Intro Header */}
      <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4 border border-indigo-700/10">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20">
            <MessageSquare className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold">مراسلة إدارة العائلة</h2>
            <p className="text-xs text-indigo-100 mt-1">
              مرحباً بك. يمكنك عبر هذه البوابة إرسال الاقتراحات، الاستفسارات، أو إرفاق ملفات مرئية وصور لعرضها في ألبوم العائلة.
            </p>
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-3xl text-center space-y-4 shadow-xs">
          <CheckCircle className="mx-auto text-emerald-600" size={48} />
          <h3 className="text-lg font-bold">تم إرسال رسالتك بنجاح!</h3>
          <p className="text-xs text-emerald-700 leading-relaxed max-w-md mx-auto">
            شكراً لتواصلك مع إدارة عائلة غانم. ستتم مراجعة طلبك أو الملفات المرفقة وتثبيتها في لوحة التحكم أو ألبوم الصور من قبل الآدمن قريباً.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-2 text-xs bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100/40 px-4 py-2 rounded-xl transition-colors font-semibold"
          >
            إرسال رسالة أخرى
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
          
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
            <label className="block text-xs font-bold text-[#414141] mb-1">نص الرسالة أو الطلب التفصيلي *</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="اكتب هنا تفاصيل طلبك أو رسالتك لمدير ومجلس العائلة..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white leading-relaxed"
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
            <Send size={14} />
            إرسال الرسالة إلى إدارة العائلة
          </button>

        </form>
      )}

    </div>
  );
}
