import { useEffect, useState } from "react";
import {
  Box, Heading, FormControl, FormLabel, Input, Textarea,
  Button, VStack, useToast, Spinner, Text, HStack, Icon, Flex, Divider,
} from "@chakra-ui/react";
import { FiSettings, FiUser, FiMessageCircle, FiCpu, FiSave } from "react-icons/fi";
import { useTranslation } from "../i18n";
import { getSettings, updateSetting } from "../api";

function SettingCard({
  icon, title, description, children,
}: {
  icon: any; title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
      <Flex px={5} py={4} align="center" gap={3} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
        <Box bg="brand.50" borderRadius="lg" p={2}>
          <Icon as={icon} color="brand.500" boxSize={4} />
        </Box>
        <Box>
          <Text fontWeight="600" fontSize="sm">{title}</Text>
          {description && <Text fontSize="xs" color="gray.500">{description}</Text>}
        </Box>
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
    <Box maxW="720px">
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg">{t.settings.title}</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>{t.settings.systemPromptHelp}</Text>
        </Box>
        <Button
          leftIcon={<Icon as={FiSave} />}
          colorScheme="brand"
          onClick={handleSave}
          isLoading={saving}
          borderRadius="lg"
          shadow="sm"
        >
          {t.settings.saveSettings}
        </Button>
      </Flex>

      <VStack spacing={4} align="stretch">
        <SettingCard icon={FiUser} title={t.settings.businessName}>
          <Input
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
            borderRadius="lg"
            placeholder="..."
          />
        </SettingCard>

        <SettingCard icon={FiMessageCircle} title={t.settings.welcomeMessage}>
          <Input
            value={form.welcome_message}
            onChange={(e) => setForm({ ...form, welcome_message: e.target.value })}
            borderRadius="lg"
            placeholder="..."
          />
        </SettingCard>

        <SettingCard
          icon={FiCpu}
          title={t.settings.systemPrompt}
          description={t.settings.systemPromptHelp}
        >
          <Textarea
            rows={14}
            value={form.system_prompt}
            onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
            fontFamily="monospace"
            fontSize="sm"
            borderRadius="lg"
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            _focus={{ bg: "white", borderColor: "brand.400" }}
            dir="auto"
          />
        </SettingCard>
      </VStack>
    </Box>
  );
}
