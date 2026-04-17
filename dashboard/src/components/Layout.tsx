import { Box, Flex, VStack, HStack, Text, IconButton, Button, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerBody, DrawerCloseButton, useBreakpointValue, Icon } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FiCalendar, FiClock, FiHelpCircle, FiSettings } from "react-icons/fi";
import { useTranslation } from "../i18n";

const NAV_ITEMS = [
  { key: "appointments", icon: FiCalendar, path: "/" },
  { key: "availability", icon: FiClock, path: "/availability" },
  { key: "faq", icon: FiHelpCircle, path: "/faq" },
  { key: "settings", icon: FiSettings, path: "/settings" },
] as const;

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { t, dir } = useTranslation();

  return (
    <VStack align="stretch" spacing={1} py={5} px={3}>
      <HStack px={3} mb={6} spacing={3}>
        <Box
          bgGradient="linear(to-br, brand.400, brand.600)"
          borderRadius="xl"
          p={2}
          shadow="md"
        >
          <Text fontSize="sm" fontWeight="800" color="white" letterSpacing="tight">AI</Text>
        </Box>
        <VStack align="start" spacing={0}>
          <Text fontSize="md" fontWeight="700" color="gray.800" lineHeight="1.2">
            {t.sidebar.title}
          </Text>
          <Text fontSize="2xs" fontWeight="500" color="gray.400" textTransform="uppercase" letterSpacing="wide">
            Admin Panel
          </Text>
        </VStack>
      </HStack>
      <Text fontSize="2xs" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="wider" px={3} pb={1}>
        Menu
      </Text>
      {NAV_ITEMS.map((item) => (
        <Button
          as={NavLink}
          key={item.key}
          to={item.path}
          end={item.path === "/"}
          variant="ghost"
          justifyContent={dir === "rtl" ? "flex-end" : "flex-start"}
          leftIcon={dir === "ltr" ? <item.icon /> : undefined}
          rightIcon={dir === "rtl" ? <item.icon /> : undefined}
          onClick={onClose}
          _activeLink={{ bg: "brand.50", color: "brand.600", fontWeight: "600" }}
          borderRadius="lg"
          size="md"
          fontWeight="400"
          color="gray.600"
          _hover={{ bg: "gray.50", color: "gray.800" }}
        >
          {t.sidebar[item.key]}
        </Button>
      ))}
      <Box flex={1} />
      <Box px={3} pt={4} mt={4} borderTop="1px solid" borderColor="gray.100">
        <Text fontSize="2xs" color="gray.400" textAlign="center">v1.0 &middot; AI Booking</Text>
      </Box>
    </VStack>
  );
}

export default function Layout() {
  const { lang, setLang, dir, t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const location = useLocation();

  const PAGE_ICONS: Record<string, any> = {
    "/": FiCalendar,
    "/availability": FiClock,
    "/faq": FiHelpCircle,
    "/settings": FiSettings,
  };
  const PAGE_TITLES: Record<string, string> = {
    "/": t.sidebar.appointments,
    "/availability": t.sidebar.availability,
    "/faq": t.sidebar.faq,
    "/settings": t.sidebar.settings,
  };
  const pageTitle = PAGE_TITLES[location.pathname] ?? "";
  const PageIcon = PAGE_ICONS[location.pathname];

  return (
    <Flex dir={dir} minH="100vh">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          w="250px"
          bg="white"
          borderRight={dir === "ltr" ? "1px solid" : undefined}
          borderLeft={dir === "rtl" ? "1px solid" : undefined}
          borderColor="gray.100"
          position="fixed"
          top={0}
          bottom={0}
          {...(dir === "rtl" ? { right: 0 } : { left: 0 })}
          overflowY="auto"
        >
          <SidebarContent />
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} onClose={onClose} placement={dir === "rtl" ? "right" : "left"}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={0}>
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box
        flex={1}
        {...(isMobile ? {} : dir === "rtl" ? { mr: "250px" } : { ml: "250px" })}
      >
        {/* Top Bar */}
        <HStack
          bg="white"
          px={5}
          py={3}
          borderBottom="1px solid"
          borderColor="gray.100"
          justify="space-between"
          position="sticky"
          top={0}
          zIndex={10}
        >
          {isMobile && (
            <IconButton
              aria-label="Menu"
              icon={<HamburgerIcon />}
              variant="ghost"
              onClick={onOpen}
            />
          )}
          {pageTitle && (
            <HStack spacing={2} opacity={isMobile ? 1 : 0.9}>
              {PageIcon && <Icon as={PageIcon} color="brand.500" boxSize={4} />}
              <Text fontWeight="600" fontSize="sm" color="gray.700">{pageTitle}</Text>
            </HStack>
          )}
          <Box flex={1} />
          <HStack spacing={1} bg="gray.100" borderRadius="lg" p={0.5}>
            <Button
              size="xs"
              variant={lang === "ar" ? "solid" : "ghost"}
              colorScheme={lang === "ar" ? "brand" : "gray"}
              onClick={() => setLang("ar")}
              borderRadius="md"
              px={3}
            >
              عربي
            </Button>
            <Button
              size="xs"
              variant={lang === "en" ? "solid" : "ghost"}
              colorScheme={lang === "en" ? "brand" : "gray"}
              onClick={() => setLang("en")}
              borderRadius="md"
              px={3}
            >
              EN
            </Button>
          </HStack>
        </HStack>

        {/* Page Content */}
        <Box p={6}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
}
