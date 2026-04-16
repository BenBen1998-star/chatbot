import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Textarea,
  Button,
  Text,
  IconButton,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import type { FaqEntry } from "../api";
import { createFaq, updateFaq, deleteFaq } from "../api";

interface FaqFormProps {
  faqs: FaqEntry[];
  onRefresh: () => void;
}

export default function FaqForm({ faqs, onRefresh }: FaqFormProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleAdd = async () => {
    if (!question.trim() || !answer.trim()) return;
    setIsSubmitting(true);
    try {
      await createFaq({ question: question.trim(), answer: answer.trim() });
      setQuestion("");
      setAnswer("");
      onRefresh();
      toast({ title: "تمت الإضافة", status: "success", duration: 2000 });
    } catch {
      toast({ title: "فشل في الإضافة", status: "error", duration: 2000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (faq: FaqEntry) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  const handleSaveEdit = async () => {
    if (editingId === null) return;
    try {
      await updateFaq(editingId, {
        question: editQuestion.trim(),
        answer: editAnswer.trim(),
      });
      setEditingId(null);
      onRefresh();
      toast({ title: "تم التعديل", status: "success", duration: 2000 });
    } catch {
      toast({ title: "فشل في التعديل", status: "error", duration: 2000 });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFaq(id);
      onRefresh();
      toast({ title: "تم الحذف", status: "success", duration: 2000 });
    } catch {
      toast({ title: "فشل في الحذف", status: "error", duration: 2000 });
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Add new FAQ form */}
      <Box bg="gray.50" p={4} borderRadius="md">
        <Text fontWeight="bold" mb={2}>
          إضافة سؤال جديد
        </Text>
        <VStack spacing={2}>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="السؤال..."
            dir="rtl"
            bg="white"
          />
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="الجواب..."
            dir="rtl"
            bg="white"
            rows={2}
          />
          <Button
            colorScheme="brand"
            onClick={handleAdd}
            isLoading={isSubmitting}
            w="full"
          >
            إضافة
          </Button>
        </VStack>
      </Box>

      <Divider />

      {/* Existing FAQ entries */}
      {faqs.length === 0 ? (
        <Text textAlign="center" color="gray.500" py={4}>
          ما فماش أسئلة متكررة
        </Text>
      ) : (
        faqs.map((faq) => (
          <Box key={faq.id} bg="white" p={4} borderRadius="md" boxShadow="xs">
            {editingId === faq.id ? (
              <VStack spacing={2} align="stretch">
                <Input
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  dir="rtl"
                  size="sm"
                />
                <Textarea
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  dir="rtl"
                  size="sm"
                  rows={2}
                />
                <HStack justify="flex-end">
                  <IconButton
                    aria-label="حفظ"
                    icon={<CheckIcon />}
                    size="sm"
                    colorScheme="green"
                    onClick={handleSaveEdit}
                  />
                  <IconButton
                    aria-label="إلغاء"
                    icon={<CloseIcon />}
                    size="sm"
                    onClick={() => setEditingId(null)}
                  />
                </HStack>
              </VStack>
            ) : (
              <>
                <HStack justify="space-between" align="start">
                  <Box flex={1}>
                    <Text fontWeight="bold" fontSize="sm" dir="rtl">
                      {faq.question}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mt={1} dir="rtl">
                      {faq.answer}
                    </Text>
                  </Box>
                  <HStack>
                    <IconButton
                      aria-label="تعديل"
                      icon={<EditIcon />}
                      size="xs"
                      variant="ghost"
                      onClick={() => handleEdit(faq)}
                    />
                    <IconButton
                      aria-label="حذف"
                      icon={<DeleteIcon />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(faq.id)}
                    />
                  </HStack>
                </HStack>
              </>
            )}
          </Box>
        ))
      )}
    </VStack>
  );
}
