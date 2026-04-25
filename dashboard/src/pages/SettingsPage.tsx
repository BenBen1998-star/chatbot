import { useEffect, useState } from "react";
import {
  Box, Input, Textarea,
  Button, VStack, useToast, Spinner, Text, Icon, Flex,
} from "@chakra-ui/react";
import { FiUser, FiMessageCircle, FiZap, FiEdit2 } from "react-icons/fi";
import { useTranslation } from "../i18n";
import { getSettings, updateSetting } from "../api";

function SettingCard({
  icon, title, children,
}: {
  icon: any; title: string; children: React.ReactNode;
}) {
  return (
    <Box bg="white" borderRadius="16px" shadow="sm" overflow="hidden" border="1px solid" borderColor="gray.100">
      <Flex px={5} py={3.5} align="center" gap={2.5} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
        <Flex bg="brand.50" borderRadius="8px" w="30px" h="30px" align="center" justify="center" flexShrink={0}>
          <Icon as={icon} color="brand.500" boxSize={3.5} />
        </Flex>
        <Text fontWeight="600" fontSize="13.5px" color="gray.900">{title}</Text>
      </Flex>
      <Box px={5} py={4}>
        {children}
      </Box>
    </Box>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    system_prompt: "",
    business_name: "",
    welcome_message: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        setForm({
          system_prompt: settings.system_prompt || "",
          business_name: settings.business_name || "",
          welcome_message: settings.welcome_message || "",
        });
      } catch {
        toast({ title: t.common.error, status: "error" });
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateSetting("system_prompt", form.system_prompt),
        updateSetting("business_name", form.business_name),
        updateSetting("welcome_message", form.welcome_message),
      ]);
      toast({ title: t.settings.saved, status: "success", duration: 2000 });
    } catch {
      toast({ title: t.common.error, status: "error" });
    }
    setSaving(false);
  };

  if (loading) return <Box textAlign="center" py={20}><Spinner size="xl" color="brand.500" thickness="3px" /></Box>;

  return (
    <Box maxW="680px">
      <Flex justify="space-between" align="flex-start" mb={7}>
        <Box>
          <Text fontSize="22px" fontWeight="800" color="gray.900" letterSpacing="-0.03em">{t.settings.title}</Text>
          <Text color="gray.400" fontSize="13px" mt={1} fontWeight="500">{t.settings.systemPromptHelp}</Text>
        </Box>
        <Button
          leftIcon={<Icon as={FiEdit2} />}
          bg="brand.500"
          color="white"
          onClick={handleSave}
          isLoading={saving}
          borderRadius="10px"
          fontSize="13px"
          fontWeight="600"
          px={4}
          shadow="0 2px 8px rgba(99,102,241,0.3)"
          _hover={{ bg: "brand.600", shadow: "0 4px 12px rgba(99,102,241,0.35)" }}
        >
          {t.settings.saveSettings}
        </Button>
      </Flex>

      <VStack spacing={4} align="stretch">
        <SettingCard icon={FiUser} title={t.settings.businessName}>
          <Input
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
            placeholder="..."
          />
        </SettingCard>

        <SettingCard icon={FiMessageCircle} title={t.settings.welcomeMessage}>
          <Input
            value={form.welcome_message}
            onChange={(e) => setForm({ ...form, welcome_message: e.target.value })}
            placeholder="..."
          />
        </SettingCard>

        <SettingCard icon={FiZap} title={t.settings.systemPrompt}>
          <Textarea
            rows={14}
            value={form.system_prompt}
            onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
            fontFamily="monospace"
            fontSize="sm"
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            _focus={{ bg: "white", borderColor: "brand.400", boxShadow: "none" }}
            dir="auto"
            resize="vertical"
          />
        </SettingCard>
      </VStack>
    </Box>
  );
}
