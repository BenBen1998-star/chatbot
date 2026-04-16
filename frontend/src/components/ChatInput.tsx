import { useState } from "react";
import { HStack, Input, IconButton } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <HStack p={3} bg="white" borderTop="1px solid" borderColor="gray.200">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="اكتب رسالتك هنا..."
        dir="rtl"
        size="md"
        variant="filled"
        bg="gray.50"
        _focus={{ bg: "white", borderColor: "brand.500" }}
        disabled={isLoading}
      />
      <IconButton
        aria-label="إرسال"
        icon={<ArrowForwardIcon />}
        colorScheme="brand"
        onClick={handleSend}
        isLoading={isLoading}
        borderRadius="full"
        size="md"
      />
    </HStack>
  );
}
