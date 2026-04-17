import { useEffect, useState } from "react";
import {
  Box, Heading, Text, useToast, Spinner, HStack, VStack,
  IconButton, Button, Textarea, Input, Icon, Flex,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, FormControl, FormLabel,
  SimpleGrid, Collapse, InputGroup, InputLeftElement,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, AddIcon, ChevronDownIcon, ChevronUpIcon, SearchIcon } from "@chakra-ui/icons";
import { FiHelpCircle, FiMessageSquare } from "react-icons/fi";
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
      borderRadius="xl"
      border="1px solid"
      borderColor={expanded ? "brand.200" : "gray.100"}
      overflow="hidden"
      shadow="sm"
      _hover={{ shadow: "md", borderColor: "brand.200" }}
      transition="all 0.2s"
    >
      <Flex
        px={5} py={4}
        cursor="pointer"
        onClick={() => setExpanded(!expanded)}
        align="center"
        justify="space-between"
      >
        <HStack spacing={3} flex={1}>
          <Box bg="brand.50" borderRadius="lg" p={2} flexShrink={0}>
            <Icon as={FiHelpCircle} color="brand.500" boxSize={4} />
          </Box>
          <Text fontWeight="600" fontSize="sm" noOfLines={expanded ? undefined : 1}>
            {faq.question}
          </Text>
        </HStack>
        <Icon
          as={expanded ? ChevronUpIcon : ChevronDownIcon}
          color="gray.400" boxSize={5} ml={2} flexShrink={0}
        />
      </Flex>

      <Collapse in={expanded} animateOpacity>
        <Box px={5} pb={4}>
          <Box bg="gray.50" borderRadius="lg" p={4} mb={3}>
            <HStack spacing={2} mb={2}>
              <Icon as={FiMessageSquare} color="gray.400" boxSize={3} />
              <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                {t.faq.answer}
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap" lineHeight="1.7">
              {faq.answer}
            </Text>
          </Box>
          <HStack spacing={2} justify="flex-end">
            <Button size="xs" variant="ghost" leftIcon={<EditIcon />} onClick={onEdit} borderRadius="lg">
              {t.common.edit}
            </Button>
            <Button size="xs" variant="ghost" colorScheme="red" leftIcon={<DeleteIcon />} onClick={onDelete} borderRadius="lg">
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
    <Box>
      <HStack justify="space-between" mb={4}>
        <Box>
          <Heading size="lg">{t.faq.title}</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>{faqs.length} {t.faq.question.toLowerCase()}s</Text>
        </Box>
        <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={openAdd} borderRadius="lg" shadow="sm">
          {t.faq.addFaq}
        </Button>
      </HStack>

      {faqs.length > 0 && (
        <InputGroup mb={5}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder={t.common.search + "..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="white"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
            _focus={{ borderColor: "brand.400", bg: "white" }}
          />
        </InputGroup>
      )}

      {filtered.length === 0 ? (
        <Box bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.200" p={10} textAlign="center">
          <Icon as={FiHelpCircle} boxSize={10} color="gray.300" mb={3} />
          <Text color="gray.400">{search ? "No results found" : t.faq.empty}</Text>
        </Box>
      ) : (
        <VStack spacing={3} align="stretch">
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
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box bg="brand.50" borderRadius="lg" p={2}>
                <Icon as={FiHelpCircle} color="brand.500" boxSize={5} />
              </Box>
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
                  borderRadius="lg"
                  placeholder="..."
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">{t.faq.answer}</FormLabel>
                <Textarea
                  rows={5}
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  borderRadius="lg"
                  placeholder="..."
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose} borderRadius="lg">{t.common.cancel}</Button>
            <Button colorScheme="brand" onClick={handleSave} borderRadius="lg" ml={3}>{t.common.save}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
