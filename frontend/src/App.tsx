import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Box, Flex, HStack, Button } from "@chakra-ui/react";
import DashboardPage from "./pages/DashboardPage";
import ChatWidget from "./components/ChatWidget";

export default function App() {
  return (
    <BrowserRouter>
      {/* Navigation Bar */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" px={4} py={2}>
        <Flex maxW="800px" mx="auto" justify="center">
          <HStack spacing={4}>
            <Button as={Link} to="/" variant="ghost" size="sm">
              📊 لوحة التحكم
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>

      {/* Chat Widget - floating on all pages */}
      <ChatWidget />
    </BrowserRouter>
  );
}
