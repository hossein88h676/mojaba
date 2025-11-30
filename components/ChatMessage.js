function ChatMessage({ message, onDownload }) {
    const isBot = message.sender === 'bot';
    const time = new Date(message.timestamp || Date.now()).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`} data-name="chat-message" data-file="components/ChatMessage.js">
            <div className={`message-bubble ${isBot ? 'message-in' : 'message-out'}`}>
                {message.type === 'text' && (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                
                {message.type === 'file-upload' && (
                    <div className="flex items-center gap-3 py-1">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                            <div className="icon-file-spreadsheet text-xl"></div>
                        </div>
                        <div>
                            <div className="font-bold text-green-700 text-sm">{message.fileName}</div>
                            <div className="text-xs text-green-600/70">فایل اکسل دریافتی</div>
                        </div>
                    </div>
                )}

                {message.type === 'table' && (
                    <div className="overflow-x-auto mt-2">
                        <div className="mb-2 text-xs text-slate-500 flex justify-between items-center">
                            <span>نتایج محاسبه تعداد خالص:</span>
                            {message.resultData && (
                                <button 
                                    onClick={() => onDownload(message.resultData)}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                >
                                    <div className="icon-download w-3 h-3"></div>
                                    <span>دانلود اکسل</span>
                                </button>
                            )}
                        </div>
                        <table className="min-w-full text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="py-1 px-2 text-right font-bold text-blue-600">کد تنوع</th>
                                    <th className="py-1 px-2 text-left font-bold text-blue-600">جزییات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {message.content.map((row, idx) => (
                                    <React.Fragment key={idx}>
                                        <tr className="bg-slate-50/50 font-bold">
                                            <td colSpan="2" className="py-2 px-2 text-slate-800 text-right dir-rtl border-t border-slate-200">
                                                <div className="text-sm text-blue-700">{row.group}</div>
                                                {row.desc && <div className="text-xs text-slate-500 font-normal mt-0.5">{row.desc}</div>}
                                            </td>
                                        </tr>
                                        {row.details.map((detail, dIdx) => (
                                            <tr key={`${idx}-${dIdx}`} className={detail.highlight ? "bg-yellow-50" : ""}>
                                                <td className={`py-1 px-2 text-slate-500 pr-4 ${detail.highlight ? "font-bold text-slate-800" : ""}`}>
                                                    {detail.label}
                                                </td>
                                                <td className={`py-1 px-2 text-left font-mono dir-ltr ${detail.highlight ? "font-bold text-slate-800" : "text-slate-700"}`}>
                                                    {detail.value}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                        {message.grandTotals && (
                            <div className="mt-2 pt-2 border-t border-slate-200 text-xs">
                                <div className="font-bold mb-1 text-blue-700">مجموع‌های کل:</div>
                                {Object.entries(message.grandTotals).map(([key, val]) => (
                                    <div key={key} className="flex justify-between py-0.5">
                                        <span>{key}:</span>
                                        <span className="font-mono" dir="ltr">{val}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className={`text-[10px] mt-1 flex items-center gap-1 ${isBot ? 'text-slate-400 justify-end' : 'text-green-700 justify-start'}`}>
                    <span>{time}</span>
                    {!isBot && <div className="icon-check-check w-3 h-3"></div>}
                </div>
            </div>
        </div>
    );
}