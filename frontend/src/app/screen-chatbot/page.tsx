"use client";

import { clsx, type ClassValue } from "clsx";
import { BarChart2, Home, Plus, User, WalletCards, SendHorizontal, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import React, { useState, useEffect, useRef } from "react";
import BottomNav from "@/components/layout/BottomNav";
import { getTransactions, createTransaction } from "@/lib/zunoApi";
import { useRouter } from "next/navigation";

const figmaAssets = {
  avatar:
    "https://www.figma.com/api/mcp/asset/56992f53-f6c7-48df-924f-d61490d60d14",
  botNav:
    "https://www.figma.com/api/mcp/asset/cf6fd9f2-7d63-4ea5-9a75-ac56f6d56a2b",
  forkKnife:
    "https://www.figma.com/api/mcp/asset/f5feab98-71b0-46ee-bbad-1e8f066c95bc",
  menuDots:
    "https://www.figma.com/api/mcp/asset/5f90d3eb-cfd9-4336-98fe-b8c11f3855b8",
  sendMic:
    "https://www.figma.com/api/mcp/asset/267b32f9-5cde-41c4-80b8-cc04d8272bbe",
  activeHalo:
    "https://www.figma.com/api/mcp/asset/c653b6ff-ed8a-47bc-8b22-f629d34d505b",
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Message = {
  id: string;
  label: string;
  sender: "ai" | "user";
  lines: string[];
};

const quickReplies = ['"Còn bao nhiêu tiền ăn?"', '"Xem đề xuất tối ưu"'];

export default function ScreenChatbotPage() {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [hasBBQTransaction, setHasBBQTransaction] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  const router = useRouter();

  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputValueRef = useRef("");
  const simulationTimeoutsRef = useRef<number[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    async function checkBBQ() {
      try {
        const month = new Date().toISOString().slice(0, 7) + '-01';
        const txs = await getTransactions(month);
        
        const hasBBQPurchase = txs.some(
          (tx) =>
            tx.amount === 420000 &&
            (tx.description?.toLowerCase().includes("bbq") ||
              tx.category?.toLowerCase().includes("bbq") ||
              tx.description?.toLowerCase().includes("buffet") ||
              tx.description?.toLowerCase().includes("garden"))
        );

        const hasBBQRefund = txs.some(
          (tx) =>
            tx.amount === 315000 &&
            (tx.description?.toLowerCase().includes("hoàn trả") ||
              tx.description?.toLowerCase().includes("refund"))
        );

        setHasBBQTransaction(hasBBQPurchase && !hasBBQRefund);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkBBQ();
  }, []);

  useEffect(() => {
    if (!isLoading && !isInitializedRef.current) {
      isInitializedRef.current = true;
      if (hasBBQTransaction) {
        setChatMessages([
          {
            id: "welcome",
            label: "ZUNO Secretary",
            sender: "ai",
            lines: ["Chào Hoàng! Hôm nay bạn muốn", "kiểm tra ngân sách hay chia hóa đơn", "nhóm thế?"],
          },
          {
            id: "bbq_detect",
            label: "ZUNO Secretary",
            sender: "ai",
            lines: [
              "Tôi phát hiện bạn vừa thanh toán 420.000đ tại BBQ Garden.",
              "ZUNO đề xuất chia hóa đơn nhóm này như sau:"
            ],
          },
        ]);
      } else {
        setChatMessages([
          {
            id: "welcome",
            label: "ZUNO Secretary",
            sender: "ai",
            lines: ["Chào Hoàng! Hôm nay bạn muốn", "kiểm tra ngân sách hay chia hóa đơn", "nhóm thế?"],
          },
        ]);
      }
    }
  }, [hasBBQTransaction, isLoading]);

  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  // Clean up speech recognition and timeouts on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      simulationTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `user_${Date.now()}`,
      label: "Bạn",
      sender: "user",
      lines: [text],
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI response after 1.5 seconds
    setTimeout(() => {
      let responseLines = [
        `ZUNO đã nhận được yêu cầu: "${text}"`,
        "Tôi đang phân tích dữ liệu chi tiêu của bạn, hãy chờ trong giây lát nhé!"
      ];

      const cleanText = text.toLowerCase();
      if (cleanText.includes("còn bao nhiêu tiền ăn") || cleanText.includes("tiền ăn")) {
        responseLines = [
          "Hiện tại quỹ Food (ăn uống) của bạn còn 245.000 VNĐ.",
          "Bạn có muốn xem gợi ý chi tiêu tiết kiệm từ giờ đến cuối tuần không?"
        ];
      } else if (cleanText.includes("xem đề xuất tối ưu") || cleanText.includes("đề xuất") || cleanText.includes("tối ưu")) {
        responseLines = [
          "ZUNO đề xuất bạn giảm bữa phụ ngày mai xuống còn 20.000 VNĐ để giữ streak tuần này.",
          "Và hạn chế đặt đồ ăn khuya nhé!"
        ];
      } else if (cleanText.includes("thống kê chi tiêu tuần này")) {
        responseLines = [
          "Tuần này bạn đã tiêu tổng cộng 1.250.000 VNĐ.",
          "Trong đó: Ăn uống (Food) chiếm 65%, Đi lại chiếm 15%, còn lại là các quỹ khác.",
          "Nhìn chung chi tiêu của bạn vẫn đang ở mức An toàn!"
        ];
      }

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        label: "ZUNO Secretary",
        sender: "ai",
        lines: responseLines,
      };

      setIsTyping(false);
      setChatMessages((prev) => [...prev, aiMsg]);
    }, 1500);
  };

  const handleCompleteRefund = async () => {
    setIsProcessingRefund(true);
    try {
      await createTransaction({
        amount: 315000,
        transactionType: "refund",
        category: "Food and Drinks",
        description: "Nhóm bạn hoàn trả tiền BBQ [via:mock-bank]",
        inputMethod: "manual",
      });

      const refundMsg: Message = {
        id: `ai_refund_${Date.now()}`,
        label: "ZUNO Secretary",
        sender: "ai",
        lines: [
          "Tuyệt vời! ZUNO đã ghi nhận nhóm bạn hoàn trả lại 315.000 VNĐ cho bạn.",
          "Khoản hoàn tiền này đã được cộng lại vào quỹ Food (ăn uống) của bạn, giúp khôi phục ngân sách chi tiêu."
        ]
      };
      setChatMessages((prev) => [
        ...prev.filter(msg => msg.id !== 'bbq_detect'),
        refundMsg
      ]);
      setShowQrModal(false);
    } catch (err) {
      console.error("Failed to create refund transaction", err);
      alert("Có lỗi xảy ra khi hoàn thành chia tiền. Vui lòng thử lại.");
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Trình duyệt không hỗ trợ Web Speech API. Chuyển sang mô phỏng.");
      runSimulation();
      return;
    }

    try {
      if (!recognitionRef.current) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = "vi-VN";

        rec.onstart = () => {
          setIsListening(true);
          setInputValue("");
        };

        rec.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setInputValue(transcript);
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          if (event.error === "not-allowed") {
            alert("Vui lòng cho phép quyền truy cập Micro để sử dụng tính năng ghi âm giọng nói.");
          } else {
            runSimulation();
          }
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
          const finalVal = inputValueRef.current.trim();
          if (finalVal) {
            handleSend(finalVal);
            setInputValue("");
          }
        };

        recognitionRef.current = rec;
      }

      recognitionRef.current.start();
    } catch (err) {
      console.error("Failed to start speech recognition", err);
      runSimulation();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    stopSimulation();
    setIsListening(false);
  };

  const runSimulation = () => {
    setIsListening(true);
    setInputValue("");
    
    simulationTimeoutsRef.current.forEach(clearTimeout);
    
    const typeTimeout = setTimeout(() => {
      setInputValue("Thống kê chi tiêu tuần này giúp mình");
    }, 1500);

    const sendTimeout = setTimeout(() => {
      setIsListening(false);
      handleSend("Thống kê chi tiêu tuần này giúp mình");
      setInputValue("");
    }, 3500);

    simulationTimeoutsRef.current = [typeTimeout, sendTimeout] as any;
  };

  const stopSimulation = () => {
    simulationTimeoutsRef.current.forEach(clearTimeout);
    simulationTimeoutsRef.current = [];
  };

  const toggleListening = (value?: boolean) => {
    const shouldListen = typeof value === 'boolean' ? value : !isListening;
    if (shouldListen) {
      startListening();
    } else {
      stopListening();
    }
  };

  return (
    <main className="min-h-dvh bg-slate-100 text-[#0b1c30]">
      <div
        data-name="Screen chatbot"
        data-node-id="1338:1100"
        className="relative mx-auto h-[852px] w-full max-w-[393px] overflow-hidden bg-[#f8f9ff] font-inter shadow-2xl"
      >
        <ChatHeader />

        <section
          data-name="Main Chat Area"
          data-node-id="1338:1101"
          className="no-scrollbar h-full overflow-y-auto px-4 pb-[160px] pt-[96px]"
        >
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-400 text-sm">
                <span className="animate-spin mr-2">⏳</span> Đang tải cuộc hội thoại...
              </div>
            ) : (
              chatMessages.map((message) => (
                <React.Fragment key={message.id}>
                  <ChatMessage message={message} />
                  {message.id === "bbq_detect" && (
                    <SharedExpenseCard 
                      onOpenQr={() => setShowQrModal(true)} 
                      onViewBudget={() => router.push("/budgets")}
                      onClose={() => setChatMessages((prev) => prev.filter(msg => msg.id !== 'bbq_detect'))}
                    />
                  )}
                </React.Fragment>
              ))
            )}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
            <QuickReplies onSelect={handleSend} />
          </div>
        </section>

        <BottomInterface
          inputValue={inputValue}
          setInputValue={setInputValue}
          isListening={isListening}
          setIsListening={toggleListening}
          onSend={handleSend}
        />

        {showQrModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-[340px] rounded-2xl bg-white p-6 shadow-2xl animate-fade-in text-center">
              <h3 className="text-[18px] font-bold text-[#112945] mb-4">VietQR Chia Tiền Nhóm</h3>
              
              <div className="mx-auto size-48 bg-slate-100 flex items-center justify-center border border-slate-200 rounded-lg p-2 mb-4">
                <img 
                  src="https://img.vietqr.io/image/mbbank-123456789-compact2.png?amount=315000&addInfo=Hoang%20chia%20tien%20BBQ&accountName=NGUYEN%20VAN%20A" 
                  alt="VietQR 315k"
                  className="size-full object-contain"
                />
              </div>
              
              <div className="text-left space-y-2 mb-6">
                <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5 text-[13px]">
                  <span className="text-slate-500">Số tiền:</span>
                  <span className="font-bold text-[#006e2f]">315.000đ</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5 text-[13px]">
                  <span className="text-slate-500">Nội dung chuyển:</span>
                  <span className="font-semibold text-slate-700">Hoang chia tien BBQ</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500">Tài khoản nhận:</span>
                  <span className="font-semibold text-slate-700">NGUYEN VAN A (MB Bank)</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isProcessingRefund}
                  onClick={handleCompleteRefund}
                  className="w-full h-11 bg-[#006e2f] text-white rounded-lg font-bold text-[14px] shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessingRefund ? "Đang xử lý..." : "Hoàn thành chia tiền"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="w-full h-11 border border-slate-300 text-slate-600 rounded-lg font-semibold text-[14px] transition-all active:scale-98 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function TypingIndicator() {
  return (
    <div className="flex w-full flex-col items-start animate-pulse">
      <div className="flex max-w-[331.5px] flex-col gap-1">
        <div className="flex justify-start pb-1">
          <span className="text-[16px] font-semibold leading-6 text-[#565e74]">ZUNO Secretary</span>
        </div>
        <div className="w-[80px] rounded-bl-xl rounded-br-xl rounded-tr-xl border border-[rgba(188,203,185,0.3)] bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-center gap-1.5 py-1">
            <span className="size-2 animate-bounce rounded-full bg-[#112945]/40 [animation-delay:-0.3s]" />
            <span className="size-2 animate-bounce rounded-full bg-[#112945]/40 [animation-delay:-0.15s]" />
            <span className="size-2 animate-bounce rounded-full bg-[#112945]/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatHeader() {
  return (
    <header
      data-name="Header - TopAppBar"
      data-node-id="1338:1162"
      className="absolute left-0 top-0 z-30 flex h-20 w-full items-center justify-between bg-[linear-gradient(180deg,#112945_0%,#4d78a8_1.235%,#f7f8fa_100%)] px-4"
    >
      <div className="flex items-center gap-3">
        <div
          data-name="Background+Border"
          data-node-id="1338:1164"
          className="size-12 overflow-hidden rounded-full"
        >
          <img alt="ZUNO Secretary avatar" className="size-full object-cover" src={figmaAssets.avatar} />
        </div>

        <div className="w-[171px]">
          <h1 className="text-[20px] font-bold leading-7 text-[#0b1c30] text-balance">ZUNO Secretary</h1>
          <div className="mt-0.5 inline-flex h-[26px] items-center rounded-full bg-[rgba(0,110,47,0.1)] px-2">
            <span className="text-[12px] font-bold leading-[15px] text-[#006e2f]">
              Health Score: 85/100 (Tốt)
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Mở tuỳ chọn cuộc trò chuyện"
        data-name="Button"
        data-node-id="1338:1172"
        className="flex size-10 items-center justify-center rounded-full text-[#3d4a3d] transition-transform active:scale-95"
      >
        <img alt="" aria-hidden="true" className="h-4 w-1" src={figmaAssets.menuDots} />
      </button>
    </header>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.sender === "user";

  return (
    <article
      data-name={isUser ? "User Message:align-flex-end" : "AI Message:align-flex-start"}
      data-node-id={isUser ? "1338:1111" : "1338:1102"}
      className={cn("flex w-full flex-col", isUser ? "items-end" : "items-start")}
    >
      <div className="flex max-w-[331.5px] flex-col gap-1">
        <div className={cn("flex pb-1", isUser ? "justify-end" : "justify-start")}>
          <span className="text-[16px] font-semibold leading-6 text-[#565e74]">{message.label}</span>
        </div>

        <div
          className={cn(
            "shadow-sm",
            isUser
              ? "w-[250px] rounded-bl-xl rounded-br-xl rounded-tl-xl bg-[linear-gradient(180deg,#112945_0%,#4d78a8_37.5%,#5e85b0_99.005%,#f7f8fa_100%)] py-3 pl-[34px] pr-4 text-white"
              : "w-[294px] rounded-bl-xl rounded-br-xl rounded-tr-xl border border-[rgba(188,203,185,0.3)] bg-white px-[17px] py-[13px] text-[#0b1c30]"
          )}
        >
          <p className="text-pretty text-[15px] font-normal leading-[22px]">
            {message.lines.map((line, index) => (
              <span key={line} className="block">
                {line}
                {index === message.lines.length - 1 ? null : " "}
              </span>
            ))}
          </p>
        </div>
      </div>
    </article>
  );
}

function SharedExpenseCard({
  onOpenQr,
  onViewBudget,
  onClose,
}: {
  onOpenQr: () => void;
  onViewBudget: () => void;
  onClose: () => void;
}) {
  return (
    <article
      data-name="AI Shared Expense Card:align-flex-start"
      data-node-id="1338:1120"
      className="flex w-full flex-col items-start"
    >
      <div className="flex w-[322.19px] max-w-[351px] flex-col gap-1">
        <div className="pb-1">
          <h2 className="text-balance text-[16px] font-semibold leading-6 text-[#565e74]">
            ZUNO Secretary
          </h2>
        </div>

        <div
          data-name="Background+Border+Shadow"
          data-node-id="1338:1126"
          className="w-full overflow-hidden rounded-xl border border-[#bccbb9] bg-white shadow-sm"
        >
          <div
            data-name="Background+HorizontalBorder"
            data-node-id="1338:1127"
            className="border-b border-[rgba(188,203,185,0.3)] bg-white px-4 pb-[17px] pt-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[rgba(0,110,47,0.1)]">
                  <img alt="" aria-hidden="true" className="h-5 w-[15px]" src={figmaAssets.forkKnife} />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold uppercase leading-5 text-[#0b1c30]">
                    HÓA ĐƠN BBQ CHIỀU NAY
                  </h3>
                  <p className="text-[14px] font-bold leading-5 text-[#006e2f] tabular-nums">TỔNG: 420.000đ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                title="Tắt đề xuất"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4">
            <ExpenseRow
              dotClassName="bg-[#006e2f]"
              label="Phần của bạn:"
              note="(Trích quỹ Food)"
              value="105.000đ"
            />
            <ExpenseRow
              dotClassName="bg-[#f97316]"
              label="Chờ hoàn lại:"
              note="(Phát QR động)"
              value="315.000đ"
            />
          </div>

          <div className="flex items-start justify-center gap-2 bg-[#eff4ff] p-3">
            <button
              type="button"
              onClick={onOpenQr}
              className="flex h-[34px] w-[143.09px] items-center justify-center rounded-lg bg-[#006e2f] text-center text-[12px] font-bold leading-4 text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              Tạo VietQR Nhóm
            </button>
            <button
              type="button"
              onClick={onViewBudget}
              className="flex h-[34px] w-[145.09px] items-center justify-center rounded-lg border border-[#006e2f] bg-transparent text-center text-[12px] font-bold leading-4 text-[#006e2f] transition-transform active:scale-95 cursor-pointer"
            >
              Xem Chi Tiết Quỹ
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ExpenseRow({
  dotClassName,
  label,
  note,
  value,
}: {
  dotClassName: string;
  label: string;
  note: string;
  value: string;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex shrink-0 items-center gap-2">
        <span className={cn("size-1.5 rounded-full", dotClassName)} />
        <span className="text-[14px] font-normal leading-5 text-[#3d4a3d]">{label}</span>
      </div>
      <p className="whitespace-nowrap text-[14px] font-bold leading-5 text-[#0b1c30] tabular-nums">
        {value} <span className="font-normal text-[#565e74]">{note}</span>
      </p>
    </div>
  );
}

function QuickReplies({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div data-name="Quick Replies:margin" data-node-id="1338:1156" className="w-full pt-2">
      <div className="flex w-full items-start gap-2">
        {quickReplies.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => onSelect(reply.replace(/"/g, ""))}
            className="flex h-[34px] shrink-0 items-center justify-center rounded-full border border-[rgba(188,203,185,0.5)] bg-[#eff4ff] px-[17px] text-center text-[12px] font-medium leading-4 text-[#3d4a3d] transition-transform active:scale-95"
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}

function BottomInterface({
  inputValue,
  setInputValue,
  isListening,
  setIsListening,
  onSend,
}: {
  inputValue: string;
  setInputValue: (val: string) => void;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  onSend: (text: string) => void;
}) {
  return (
    <div
      data-name="Bottom Interface Area"
      data-node-id="1338:1175"
      className="absolute bottom-0 left-[-2px] z-40 flex w-[393px] flex-col"
    >
      <ChatInputBar
        inputValue={inputValue}
        setInputValue={setInputValue}
        isListening={isListening}
        setIsListening={setIsListening}
        onSend={onSend}
      />
      <BottomNav className="relative" />
    </div>
  );
}

function ChatInputBar({
  inputValue,
  setInputValue,
  isListening,
  setIsListening,
  onSend,
}: {
  inputValue: string;
  setInputValue: (val: string) => void;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  onSend: (text: string) => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      onSend(inputValue.trim());
      setInputValue("");
    }
  };

  const handleButtonClick = () => {
    if (inputValue.trim()) {
      onSend(inputValue.trim());
      setInputValue("");
    } else {
      setIsListening(!isListening);
    }
  };

  return (
    <div
      data-name="Input Bar"
      data-node-id="1338:1176"
      className="w-full bg-[rgba(248,249,255,0.9)] px-4 pb-4 pt-0 backdrop-blur-[2px]"
    >
      <div
        data-name="Background+Border+Shadow"
        data-node-id="1338:1177"
        className="flex h-[70px] w-full items-center gap-3 rounded-full border border-[#bccbb9] bg-white py-[9px] pl-[17px] pr-[9px] shadow-sm"
      >
        <button
          type="button"
          aria-label="Thêm nội dung"
          className="flex size-6 shrink-0 items-center justify-center text-[#4b5e78] transition-transform active:scale-95"
        >
          <Plus className="size-[18px]" strokeWidth={2} />
        </button>

        <label className="sr-only" htmlFor="chatbot-input">
          Nhập câu hỏi cho ZUNO Secretary
        </label>
        <input
          id="chatbot-input"
          className="h-18 min-6w-0 flex-1 bg-transparent text-[18px] leading-normal text-[#0b1c30] outline-none placeholder:text-[#6b7280]"
          placeholder="Hỏi Secretary ..."
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          type="button"
          aria-label={inputValue.trim() ? "Gửi tin nhắn" : (isListening ? "Dừng thu âm" : "Gửi bằng giọng nói")}
          onClick={handleButtonClick}
          className={cn(
            "relative flex size-10 shrink-0 items-center justify-center rounded-full shadow-md transition-all duration-300 active:scale-95",
            isListening
              ? "bg-gradient-to-b from-[#3b82f6] to-[#60a5fa] opacity-90 shadow-[0_0_18px_rgba(59,130,246,0.6)] scale-105"
              : "bg-[linear-gradient(180deg,#112945_0%,#4d78a8_97.764%,#f7f8fa_100%)]"
          )}
        >
          {isListening && <ListeningCircle />}
          {!isListening && (
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#112945_0%,#4d78a8_97.764%,#f7f8fa_100%)]" />
          )}
          {inputValue.trim() ? (
            <SendHorizontal className="relative z-10 size-5 text-white" />
          ) : (
            <img
              alt=""
              aria-hidden="true"
              className={cn(
                "relative z-10 h-[19px] w-[14px] transition-transform duration-300",
                isListening && "scale-105 brightness-200"
              )}
              src={figmaAssets.sendMic}
            />
          )}
        </button>
      </div>
    </div>
  );
}

function ChatBottomNav() {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="grid h-[58px] w-full grid-cols-5 items-center bg-white px-[34px] shadow-[-2px_-2px_20px_rgba(0,0,0,0.25)]"
    >
      <BottomNavItem ariaLabel="Trang chủ">
        <Home className="size-[29px] fill-[#174f84] text-[#174f84]" strokeWidth={1.8} />
      </BottomNavItem>
      <BottomNavItem ariaLabel="Thống kê">
        <BarChart2 className="size-[27px] text-[#546982]" strokeWidth={4} />
      </BottomNavItem>
      <BottomNavItem ariaLabel="Chatbot ZUNO" active>
        <span className="relative flex size-[58px] items-center justify-center">
          <img alt="" aria-hidden="true" className="absolute size-[39.507px]" src={figmaAssets.activeHalo} />
          <img alt="" aria-hidden="true" className="relative size-[58px] object-cover" src={figmaAssets.botNav} />
        </span>
      </BottomNavItem>
      <BottomNavItem ariaLabel="Ngân sách">
        <WalletCards className="size-[26px] text-[#546982]" strokeWidth={2.3} />
      </BottomNavItem>
      <BottomNavItem ariaLabel="Hồ sơ">
        <User className="size-[25px] fill-[#546982] text-[#546982]" strokeWidth={1.6} />
      </BottomNavItem>
    </nav>
  );
}

function BottomNavItem({
  active = false,
  ariaLabel,
  children,
}: {
  active?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      aria-label={ariaLabel}
      className="flex size-[42px] items-center justify-center justify-self-center rounded-full text-[#546982] transition-transform active:scale-95"
    >
      {children}
    </button>
  );
}

function ListeningCircle() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Sóng lan tỏa 1 (Ping ring) */}
      <span className="absolute size-full rounded-full bg-blue-400/40 animate-ping" />
      {/* Sóng lan tỏa 2 (Outer pulse halo) */}
      <span className="absolute -inset-2 rounded-full bg-sky-400/30 animate-pulse blur-sm" />
      {/* Halo phát sáng xung quanh */}
      <span className="absolute -inset-4 rounded-full bg-blue-500/15 blur-md animate-pulse" />
    </div>
  );
}
