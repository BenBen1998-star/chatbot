import { useRef, useState, useEffect } from "react";
import { Box, Flex, Heading, Spinner, Text, IconButton, HStack, Wrap, WrapItem, Tag } from "@chakra-ui/react";
import { CheckCircleIcon, CloseIcon } from "@chakra-ui/icons";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import BookingConfirmCard from "./BookingConfirmCard";
import { sendChatMessage, confirmBooking, type ChatMessage, type ChatResponse } from "../api";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  action?: ChatResponse["action"];
  bookingData?: ChatResponse["bookingData"];
  slots?: string[];
}

interface ChatWindowProps {
  onClose: () => void;
  apiUrl?: string;
}

export default function ChatWindow({ onClose, apiUrl }: ChatWindowProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      role: "assistant",
      content:
        "مرحبا بيك! 👋 أنا المساعد الذكي متاع الصالون. كيفاش نجم نعاونك؟\n\nتنجم تسألني على:\n• الأسعار و الخدمات\n• أوقات العمل\n• حجز موعد",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (message: string) => {
    const userMsg: DisplayMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history: ChatMessage[] = messages
        .slice(1)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await sendChatMessage(message, history, apiUrl);

      const assistantMsg: DisplayMessage = {
        role: "assistant",
        content: response.reply,
        action: response.action,
        bookingData: response.bookingData,
        slots: response.slots,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ صار مشكل في الاتصال. عاود حاول من بعد." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async (msgIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg.bookingData) return;

    try {
      const response = await confirmBooking(msg.bookingData, apiUrl);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.reply,
          action: "booking_confirmed",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ صار مشكل في تأكيد الحجز. عاود حاول." },
      ]);
    }
  };

  const handleCancelBooking = (msgIndex: number) => {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "🚫 تم إلغاء الحجز. إذا تحب تحجز وقت آخر قلّي." },
    ]);
  };

  const handleSlotClick = (slot: string) => {
    handleSend(slot);
  };

  const renderMessage = (msg: DisplayMessage, index: number) => {
    // Booking confirmation card
    if (msg.action === "confirm_booking" && msg.bookingData) {
      return (
        <Box key={index}>
          {msg.content && <ChatBubble content={msg.content} isUser={false} />}
          <BookingConfirmCard
            name={msg.bookingData.name}
            date={msg.bookingData.date}
            time={msg.bookingData.time}
            onConfirm={() => handleConfirmBooking(index)}
            onCancel={() => handleCancelBooking(index)}
          />
        </Box>
      );
    }

    // Booking confirmed success card
    if (msg.action === "booking_confirmed") {
      return (
        <Box key={index} display="flex" justifyContent="flex-start" mb={3} px={2}>
          <Box
            maxW="85%"
            bg="green.50"
            borderRadius="xl"
            borderBottomLeftRadius="sm"
            boxShadow="sm"
            px={4}
            py={3}
            border="1px solid"
            borderColor="green.200"
          >
            <HStack spacing={2} mb={1}>
              <CheckCircleIcon color="green.500" />
              <Text fontSize="xs" fontWeight="600" color="green.600">تم التأكيد</Text>
            </HStack>
            <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap" dir="rtl">
              {msg.content}
            </Text>
          </Box>
        </Box>
      );
    }

    // Show slots as clickable tags
    if (msg.action === "show_slots" && msg.slots && msg.slots.length > 0) {
      return (
        <Box key={index}>
          <ChatBubble content={msg.content} isUser={false} />
          <Box display="flex" justifyContent="flex-start" mb={3} px={2}>
            <Box maxW="85%">
              <Wrap spacing={1}>
                {msg.slots.map((slot) => (
                  <WrapItem key={slot}>
                    <Tag
                      size="sm"
                      colorScheme="blue"
                      cursor="pointer"
                      borderRadius="full"
                      _hover={{ bg: "blue.500", color: "white" }}
                      onClick={() => handleSlotClick(slot)}
                    >
                      {slot}
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          </Box>
        </Box>
      );
    }

    // Regular message
    return <ChatBubble key={index} content={msg.content} isUser={msg.role === "user"} />;
  };

  return (
    <Flex direction="column" h="100%" bg="gray.100">
      <HStack bg="brand.600" color="white" px={3} py={2} justify="space-between">
        <Box>
          <Heading size="sm" fontWeight="bold">
            🤖 مساعد الحجز الذكي
          </Heading>
          <Text fontSize="xs" opacity={0.8}>
            متصل دايما
          </Text>
        </Box>
        <IconButton
          aria-label="إغلاق"
          icon={<CloseIcon />}
          size="xs"
          variant="ghost"
          color="white"
          _hover={{ bg: "brand.700" }}
          onClick={onClose}
        />
      </HStack>

      <Box flex={1} overflowY="auto" py={3}>
        {messages.map((msg, i) => renderMessage(msg, i))}
        {isLoading && (
          <Flex justify="flex-start" px={4} mb={3}>
            <Box bg="white" px={4} py={3} borderRadius="xl" boxShadow="sm">
              <Spinner size="sm" color="brand.500" />
            </Box>
          </Flex>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </Flex>
  );
}
