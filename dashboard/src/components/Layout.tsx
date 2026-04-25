import {
  Box, Flex, VStack, HStack, Text, IconButton, Button, useDisclosure,
  Drawer, DrawerOverlay, DrawerContent, DrawerBody, DrawerCloseButton,
  useBreakpointValue, Icon, Avatar,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FiCalendar, FiClock, FiHelpCircle, FiSettings, FiBell, FiZap } from "react-icons/fi";
import { useTranslation } from "../i18n";

const NAV_ITEMS = [
  { key: "appointments", icon: FiCalendar, path: "/" },
  { key: "availability", icon: FiClock, path: "/availability" },
  { key: "faq", icon: FiHelpCircle, path: "/faq" },
  { key: "settings", icon: FiSettings, path: "/settings" },
] as const;

const SIDEBAR_BG = "#0e1117";

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { t, dir } = useTranslation();

  return (
    <Flex direction="column" h="100%" bg={SIDEBAR_BG} py={5} px={3}>
      {/* Logo */}
      <HStack spacing={2.5} mb={7} px={2}>
        <Flex
          bg="linear-gradient(135deg, #6366f1, #8b5cf6)"
          borderRadius="10px"
          w="32px" h="32px"
          align="center" justify="center"
          flexShrink={0}
        >
          <Icon as={FiZap} color="white" boxSize={4} />
        </Flex>
        <VStack align="start" spacing={0}>
          <Text fontSize="13px" fontWeight="700" color="white" lineHeight="1.2">
            {t.sidebar.title}
          </Text>
          <Text fontSize="10.5px" fontWeight="500" color="whiteAlpha.300" textTransform="uppercase" letterSpacing="0.05em">
            Admin
          </Text>
        </VStack>
      </HStack>

      {/* Section label */}
      <Text
        fontSize="10px" fontWeight="600" color="whiteAlpha.250"
        textTransform="uppercase" letterSpacing="0.1em" px={2.5} mb={1.5}
      >
        Menu
      </Text>

      {/* Nav items */}
      <VStack spacing={0.5} align="stretch" flex={1}>
        {NAV_ITEMS.map((item) => (
          <Box
            as={NavLink}
            key={item.key}
            to={item.path}
            end={item.path === "/" ? true : undefined}
            onClick={onClose}
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: dir === "rtl" ? "row-reverse" : "row",
              gap: "10px",
              px: "12px",
              py: "9px",
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: "500",
              color: "rgba(255,255,255,0.5)",
              transition: "all 0.15s ease",
              textDecoration: "none",
              position: "relative",
              "&:hover": {
                bg: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.75)",
              },
              "&.active": {
                bg: "rgba(255,255,255,0.08)",
                color: "white",
                fontWeight: "600",
              },
              "&.active::before": {
                content: '""',
                position: "absolute",
                [dir === "rtl" ? "right" : "left"]: "-12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "3px",
                height: "60%",
                borderRadius: "0 3px 3px 0",
                bg: "#6366f1",
              },
              "&.active svg": {
                color: "#818cf8",
              },
            }}
          >
            <Icon as={item.icon} boxSize={4} flexShrink={0} />
            <Text as="span">{t.sidebar[item.key]}</Text>
          </Box>
        ))}
      </VStack>

      {/* Bottom user */}
      <Box borderTop="1px solid" borderColor="whiteAlpha.100" pt={4} px={2}>
        <HStack spacing={2.5}>
          <Avatar size="xs" name="Admin" bg="brand.600" color="white" fontSize="10px" />
          <VStack align="start" spacing={0} flex={1} overflow="hidden">
            <Text fontSize="12.5px" fontWeight="600" color="white" isTruncated>Administrator</Text>
            <Text fontSize="11px" color="whiteAlpha.300" isTruncated>admin@booking.ai</Text>
          </VStack>
        </HStack>
      </Box>
    </Flex>
  );
}

export default function Layout() {
  const { lang, setLang, dir, t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const location = useLocation();

  const PAGE_TITLES: Record<string, string> = {
    "/": t.sidebar.appointments,
    "/availability": t.sidebar.availability,
    "/faq": t.sidebar.faq,
    "/settings": t.sidebar.settings,
  };
  const pageTitle = PAGE_TITLES[location.pathname] ?? "";

  const today = new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <Flex dir={dir} minH="100vh">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          w="220px"
          bg={SIDEBAR_BG}
          position="fixed"
          top={0}
          bottom={0}
          {...(dir === "rtl" ? { right: 0 } : { left: 0 })}
          overflowY="auto"
          overflowX="hidden"
          zIndex={20}
        >
          <SidebarContent />
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} onClose={onClose} placement={dir === "rtl" ? "right" : "left"}>
        <DrawerOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
        <DrawerContent p={0} bg={SIDEBAR_BG} maxW="220px" shadow="2xl">
          <DrawerCloseButton color="white" top={4} right={4} />
          <DrawerBody p={0} h="100%">
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box
        flex={1}
        minH="100vh"
        {...(isMobile ? {} : dir === "rtl" ? { mr: "220px" } : { ml: "220px" })}
      >
        {/* Top Bar */}
        <HStack
          bg="white"
          px={7}
          borderBottom="1px solid"
          borderColor="gray.100"
          justify="space-between"
          position="sticky"
          top={0}
          zIndex={10}
          h="56px"
        >
          <HStack spacing={3}>
            {isMobile && (
              <IconButton
                aria-label="Menu"
                icon={<HamburgerIcon />}
                variant="ghost"
                onClick={onOpen}
                size="sm"
                borderRadius="8px"
              />
            )}
            {pageTitle && (
              <HStack spacing={3}>
                <Text fontWeight="700" fontSize="14px" color="gray.900">{pageTitle}</Text>
                <Text fontSize="13px" color="gray.400">{today}</Text>
              </HStack>
            )}
          </HStack>

          <HStack spacing={2}>
            {/* Language switcher */}
            <HStack spacing={0} bg="gray.100" borderRadius="8px" p="3px" gap="2px">
              {(["ar", "en"] as const).map((l) => (
                <Button
                  key={l}
                  size="xs"
                  variant="unstyled"
                  onClick={() => setLang(l)}
                  borderRadius="6px"
                  px={2.5}
                  minW="36px"
                  fontSize="12px"
                  fontWeight="600"
                  h="24px"
                  bg={lang === l ? "white" : "transparent"}
                  color={lang === l ? "gray.800" : "gray.400"}
                  boxShadow={lang === l ? "0 1px 3px rgba(0,0,0,0.08)" : "none"}
                  transition="all 0.12s"
                >
                  {l === "ar" ? "عربي" : "EN"}
                </Button>
              ))}
            </HStack>

            <IconButton
              aria-label="Notifications"
              icon={<Icon as={FiBell} boxSize={4} />}
              variant="ghost"
              size="sm"
              borderRadius="8px"
              color="gray.400"
              _hover={{ bg: "gray.100", color: "gray.600" }}
            />

            <Avatar size="sm" name="Admin" bg="brand.500" color="white" fontSize="xs" cursor="pointer" />
          </HStack>
        </HStack>

        {/* Page Content */}
        <Box p={{ base: 4, md: 6 }}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
}
