import { useState } from "react";
import { Box, Text, HStack, Button, VStack, Icon } from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

interface BookingConfirmCardProps {
  name: string;
  date: string;
  time: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function BookingConfirmCard({
  name,
  date,
  time,
  onConfirm,
  onCancel,
}: BookingConfirmCardProps) {
  const [loading, setLoading] = useState(false);
  const [decided, setDecided] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setDecided(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDecided(true);
    onCancel();
  };

  return (
    <Box display="flex" justifyContent="flex-start" mb={3} px={2}>
      <Box
        maxW="85%"
        bg="white"
        borderRadius="xl"
        borderBottomLeftRadius="sm"
        boxShadow="sm"
        overflow="hidden"
        border="1px solid"
        borderColor="blue.100"
      >
        <Box bg="blue.50" px={4} py={2}>
          <Text fontSize="xs" fontWeight="600" color="blue.600" dir="rtl">
            📋 تأكيد الحجز
          </Text>
        </Box>
        <VStack align="stretch" spacing={2} px={4} py={3}>
          <HStack justify="space-between" dir="rtl">
            <Text fontSize="xs" color="gray.500">الاسم</Text>
            <Text fontSize="sm" fontWeight="600">{name}</Text>
          </HStack>
          <HStack justify="space-between" dir="rtl">
            <Text fontSize="xs" color="gray.500">التاريخ</Text>
            <Text fontSize="sm" fontWeight="600">{date}</Text>
          </HStack>
          <HStack justify="space-between" dir="rtl">
            <Text fontSize="xs" color="gray.500">الوقت</Text>
            <Text fontSize="sm" fontWeight="600">{time}</Text>
          </HStack>
          {!decided && (
            <HStack spacing={2} pt={1}>
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<CheckIcon />}
                onClick={handleConfirm}
                isLoading={loading}
                borderRadius="lg"
                flex={1}
              >
                أكّد
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorScheme="red"
                leftIcon={<CloseIcon boxSize={2.5} />}
                onClick={handleCancel}
                isDisabled={loading}
                borderRadius="lg"
                flex={1}
              >
                إلغاء
              </Button>
            </HStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
