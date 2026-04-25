import { useEffect, useState } from "react";
import {
  Box, Text, useToast, Spinner, HStack, VStack,
  Button, Textarea, Input, Icon, Flex,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, FormControl, FormLabel,
  Collapse, InputGroup, InputLeftElement,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, AddIcon, SearchIcon } from "@chakra-ui/icons";
import { FiHelpCircle, FiPlus } from "react-icons/fi";
import { useTranslation } from "../i18n";
import { getFaqs, createFaq, updateFaq, deleteFaq, FaqEntry } from "../api";

function FaqCard({ faq, onEdit, onDelete, t }: {
  faq: FaqEntry;
  onEdit: () => void;
  onDelete: () => void;
  t: any;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      bg="white"
      borderRadius="12px"
      border="1px solid"
      borderColor={expanded ? "brand.200" : "gray.100"}
      overflow="hidden"
      shadow="sm"
      transition="border-color 0.15s"
      _hover={{ borderColor: "brand.200" }}
    >
      <Flex
        px={5} py={4}
        cursor="pointer"
        onClick={() => setExpanded(!expanded)}
        align="center"
        justify="space-between"
        as="button"
        w="100%"
        textAlign="left"
      >
        <Text fontWeight="600" fontSize="13.5px" color="gray.900" flex={1} noOfLines={expanded ? undefined : 1}>
          {faq.question}
        </Text>
        <Icon
          as={FiPlus}
          color="brand.500"
          boxSize={4}
          ml={3}
          flexShrink={0}
          transform={expanded ? "rotate(45deg)" : "none"}
          transition="transform 0.2s"
        />
      </Flex>

      <Collapse in={expanded} animateOpacity>
        <Box px={5} pb={4} borderTop="1px solid" borderColor="gray.100" pt={3}>
          <Text fontSize="13px" color="gray.600" lineHeight="1.7" whiteSpace="pre-wrap">
            {faq.answer}
          </Text>
          <HStack spacing={2} justify="flex-end" mt={3}>
            <Button size="xs" variant="ghost" leftIcon={<EditIcon />} onClick={onEdit} borderRadius="8px">
              {t.common.edit}
            </Button>
            <Button size="xs" variant="ghost" colorScheme="red" leftIcon={<DeleteIcon />} onClick={onDelete} borderRadius="8px">
              {t.common.delete}
            </Button>
          </HStack>
        </Box>
      </Collapse>
    </Box>
  );
}

export default function FaqPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [faqs, setFaqs] = useState<FaqEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FaqEntry | null>(null);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try { setFaqs(await getFaqs()); } catch { toast({ title: t.common.error, status: "error" }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ question: "", answer: "" }); onOpen(); };

  const openEdit = (faq: FaqEntry) => {
    setEditing(faq);
    setForm({ question: faq.question, answer: faq.answer });
    onOpen();
  };

  const handleSave = async () => {
    try {
      if (editing) {
        const updated = await updateFaq(editing.id, form);
        setFaqs((prev) => prev.map((f) => (f.id === editing.id ? updated : f)));
      } else {
        const created = await createFaq(form);
        setFaqs((prev) => [...prev, created]);
      }
      toast({ title: t.common.success, status: "success", duration: 2000 });
      onClose();
    } catch { toast({ title: t.common.error, status: "error" }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.faq.deleteConfirm)) return;
    try {
      await deleteFaq(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      toast({ title: t.common.success, status: "success", duration: 2000 });
    } catch { toast({ title: t.common.error, status: "error" }); }
  };

  if (loading) return <Box textAlign="center" py={20}><Spinner size="xl" color="brand.500" thickness="3px" /></Box>;

  const filtered = search.trim()
    ? faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(search.toLowerCase()) ||
          f.answer.toLowerCase().includes(search.toLowerCase())
      )
    : faqs;

  return (
    <Box maxW="680px">
      <HStack justify="space-between" mb={1} align="flex-start">
        <Box>
          <Text fontSize="22px" fontWeight="800" color="gray.900" letterSpacing="-0.03em">{t.faq.title}</Text>
          <Text color="gray.400" fontSize="13px" mt={1} fontWeight="500">
            {faqs.length} {t.faq.question.toLowerCase()}s
          </Text>
        </Box>
        <Button
          leftIcon={<AddIcon />}
          bg="brand.500"
          color="white"
          onClick={openAdd}
          borderRadius="10px"
          fontSize="13px"
          fontWeight="600"
          px={4}
          shadow="0 2px 8px rgba(99,102,241,0.3)"
          _hover={{ bg: "brand.600", shadow: "0 4px 12px rgba(99,102,241,0.35)" }}
        >
          {t.faq.addFaq}
        </Button>
      </HStack>

      {faqs.length > 0 && (
        <InputGroup mt={5} mb={5}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder={t.common.search + "..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="white"
            borderRadius="8px"
            border="1px solid"
            borderColor="gray.200"
            _focus={{ borderColor: "brand.400" }}
          />
        </InputGroup>
      )}

      {filtered.length === 0 ? (
        <Box bg="white" borderRadius="12px" border="1.5px dashed" borderColor="gray.200" p={10} textAlign="center" mt={faqs.length === 0 ? 6 : 0}>
          <Icon as={FiHelpCircle} boxSize={10} color="gray.300" mb={3} />
          <Text color="gray.400" fontSize="13px">{search ? "No results found" : t.faq.empty}</Text>
        </Box>
      ) : (
        <VStack spacing={2.5} align="stretch">
          {filtered.map((faq) => (
            <FaqCard
              key={faq.id}
              faq={faq}
              onEdit={() => openEdit(faq)}
              onDelete={() => handleDelete(faq.id)}
              t={t}
            />
          ))}
        </VStack>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px" mx={4}>
          <ModalHeader>
            <HStack spacing={3}>
              <Flex bg="brand.50" borderRadius="8px" p={2} align="center" justify="center">
                <Icon as={FiHelpCircle} color="brand.500" boxSize={5} />
              </Flex>
              <Text fontSize="lg" fontWeight="600">
                {editing ? t.faq.editFaq : t.faq.addFaq}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">{t.faq.question}</FormLabel>
                <Input
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="..."
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">{t.faq.answer}</FormLabel>
                <Textarea
                  rows={5}
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  placeholder="..."
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>{t.common.cancel}</Button>
            <Button bg="brand.500" color="white" onClick={handleSave} ml={3} _hover={{ bg: "brand.600" }}>{t.common.save}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
