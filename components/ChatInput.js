function ChatInput({ onSend, onFileUpload }) {
    const [text, setText] = React.useState('');
    const fileInputRef = React.useRef(null);

    const handleSend = () => {
        if (text.trim()) {
            onSend(text);
            setText('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
            // Reset input so the same file can be selected again if needed
            e.target.value = '';
        }
    };

    return (
        <div className="bg-white p-2 flex items-end gap-2 border-t border-slate-200 flex-shrink-0" data-name="chat-input" data-file="components/ChatInput.js">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
            />
            <button 
                onClick={handleAttachmentClick}
                className="p-3 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
                title="ارسال فایل اکسل"
            >
                <div className="icon-paperclip w-6 h-6"></div>
            </button>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="پیام خود را بنویسید یا فایل اکسل ارسال کنید..."
                className="flex-grow bg-slate-100 rounded-2xl px-4 py-3 max-h-32 min-h-[48px] focus:outline-none resize-none text-sm"
                dir="auto"
                rows={1}
            />
            {text.trim() ? (
                <button onClick={handleSend} className="p-3 text-blue-500 hover:text-blue-600 transition-colors">
                    <div className="icon-send w-6 h-6"></div>
                </button>
            ) : (
                <button className="p-3 text-slate-400 hover:text-slate-600 transition-colors">
                    <div className="icon-mic w-6 h-6"></div>
                </button>
            )}
        </div>
    );
}