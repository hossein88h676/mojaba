function ChatInterface() {
    const [messages, setMessages] = React.useState([
        {
            id: 1,
            sender: 'bot',
            type: 'text',
            content: 'سلام! 👋\nمن ربات هوشمند صورتحساب هستم.\n\nفایل اکسل (شامل شیت‌های فروش، برگشتی و...) را ارسال کنید. من علاوه بر جمع مبالغ، «تعداد خالص فروش» را برای هر کد تنوع محاسبه می‌کنم.',
            timestamp: Date.now()
        }
    ]);
    const messagesEndRef = React.useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const processSummary = (sheets) => {
        if (!sheets || sheets.length === 0) throw new Error('No data');

        const { summary, varietyCodeCol } = summarizeData(sheets);

        if (summary.length === 0) {
             return {
                type: 'text',
                content: '⚠️ داده‌ای برای پردازش یافت نشد.'
            };
        }

        // Format for display (Detailed Table)
        const formattedContent = summary.map(row => ({
            group: row.varietyCode,
            desc: row.varietyDesc,
            details: [
                { label: 'تعداد خالص فروش', value: new Intl.NumberFormat('fa-IR').format(row.netCount), highlight: true },
                { label: 'درآمد کل', value: new Intl.NumberFormat('fa-IR').format(row.totalRevenue) + ' ﷼', highlight: true },
                { label: 'درآمد واحد', value: new Intl.NumberFormat('fa-IR').format(row.revenuePerUnit) + ' ﷼', highlight: false },
                { label: 'فروش', value: new Intl.NumberFormat('fa-IR').format(row.countSale) },
                { label: 'فروش اعتباری', value: new Intl.NumberFormat('fa-IR').format(row.countSaleCredit) },
                { label: 'برگشت از فروش', value: new Intl.NumberFormat('fa-IR').format(row.countReturn) },
                { label: 'برگشت اعتباری', value: new Intl.NumberFormat('fa-IR').format(row.countReturnCredit) },
            ]
        }));

        // Grand Totals
        const grandTotals = {
            'تعداد خالص کل': 0,
            'درآمد کل': 0,
            'جمع بدهکار کل': 0,
            'جمع بستانکار کل': 0
        };
        
        summary.forEach(row => {
            grandTotals['تعداد خالص کل'] += row.netCount;
            grandTotals['درآمد کل'] += row.totalRevenue;
            grandTotals['جمع بدهکار کل'] += row.totalDebtor;
            grandTotals['جمع بستانکار کل'] += row.totalCreditor;
        });

        const formattedGrandTotals = {};
        Object.keys(grandTotals).forEach(key => {
            formattedGrandTotals[key] = new Intl.NumberFormat('fa-IR').format(grandTotals[key]);
        });
        
        return {
            type: 'table',
            content: formattedContent,
            grandTotals: formattedGrandTotals,
            resultData: summary,
            varietyCodeCol
        };
    };

    const handleSendMessage = (text) => {
        const userMsg = {
            id: Date.now(),
            sender: 'user',
            type: 'text',
            content: text,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);

        setTimeout(() => {
            try {
                const { sheets } = parseTextData(text);
                if (sheets.length === 0 || sheets[0].data.length === 0) {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        sender: 'bot',
                        type: 'text',
                        content: '⚠️ داده‌ای یافت نشد. لطفاً متن یا فایل معتبر ارسال کنید.',
                        timestamp: Date.now()
                    }]);
                    return;
                }
                
                const response = processSummary(sheets);
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'bot',
                    ...response,
                    timestamp: Date.now()
                }]);

            } catch (e) {
                console.error(e);
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'bot',
                    type: 'text',
                    content: '❌ خطا در پردازش متن. لطفاً ساختار داده‌ها را بررسی کنید.',
                    timestamp: Date.now()
                }]);
            }
        }, 600);
    };

    const handleFileUpload = async (file) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'user',
            type: 'file-upload',
            fileName: file.name,
            timestamp: Date.now()
        }]);

        setTimeout(async () => {
            try {
                const { sheets } = await readExcelFile(file);
                const response = processSummary(sheets);
                
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'bot',
                    ...response,
                    timestamp: Date.now()
                }]);
            } catch (e) {
                console.error(e);
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'bot',
                    type: 'text',
                    content: '❌ خطا در خواندن فایل اکسل. لطفاً مطمئن شوید فایل سالم است.',
                    timestamp: Date.now()
                }]);
            }
        }, 800);
    };

    const handleDownload = (data) => {
        exportToExcel(data, 'invoice_net_sales_summary.xlsx');
    };

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto bg-[#8cacec] shadow-2xl overflow-hidden" data-name="chat-interface" data-file="components/ChatInterface.js">
            <Header />
            
            <div className="flex-grow overflow-y-auto px-2 py-4 space-y-1 custom-scrollbar bg-[url('https://web.telegram.org/img/bg_0.png')] bg-cover bg-fixed">
                {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} onDownload={handleDownload} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <ChatInput onSend={handleSendMessage} onFileUpload={handleFileUpload} />
        </div>
    );
}