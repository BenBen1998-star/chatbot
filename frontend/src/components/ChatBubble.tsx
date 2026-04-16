import { Box, Text } from "@chakra-ui/react";

interface ChatBubbleProps {
  content: string;
  isUser: boolean;
}

export default function ChatBubble({ content, isUser }: ChatBubbleProps) {
  return (
    <Box
      display="flex"
      justifyContent={isUser ? "flex-end" : "flex-start"}
      mb={3}
      px={2}
    >
      <Box
        maxW="75%"
        bg={isUser ? "brand.500" : "white"}
        color={isUser ? "white" : "gray.800"}
        px={4}
        py={3}
        borderRadius="xl"
        borderBottomRightRadius={isUser ? "sm" : "xl"}
        borderBottomLeftRadius={isUser ? "xl" : "sm"}
        boxShadow="sm"
      >
        <Text fontSize="sm" whiteSpace="pre-wrap" dir="rtl">
          {content}
        </Text>
      </Box>
    </Box>
  );
}
