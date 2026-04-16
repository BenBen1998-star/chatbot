import { useState } from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { ChatIcon, CloseIcon } from "@chakra-ui/icons";
import ChatWindow from "./ChatWindow";

interface ChatWidgetProps {
  apiUrl?: string;
}

export default function ChatWidget({ apiUrl }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box position="fixed" bottom="24px" right="24px" zIndex={9999}>
      {isOpen && (
        <Box
          position="absolute"
          bottom="70px"
          right="0"
          w={{ base: "calc(100vw - 32px)", sm: "380px" }}
          h={{ base: "70vh", sm: "520px" }}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="2xl"
          border="1px solid"
          borderColor="gray.200"
        >
          <ChatWindow onClose={() => setIsOpen(false)} apiUrl={apiUrl} />
        </Box>
      )}

      <IconButton
        aria-label={isOpen ? "إغلاق المحادثة" : "فتح المحادثة"}
        icon={isOpen ? <CloseIcon /> : <ChatIcon boxSize={5} />}
        onClick={() => setIsOpen(!isOpen)}
        colorScheme="brand"
        borderRadius="full"
        w="56px"
        h="56px"
        boxShadow="lg"
        _hover={{ transform: "scale(1.05)" }}
        transition="all 0.2s"
      />
    </Box>
  );
}
