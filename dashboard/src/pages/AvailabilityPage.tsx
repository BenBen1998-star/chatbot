import { useEffect, useState, useMemo } from "react";
import {
  Box, Heading, Text, useToast, Spinner, HStack, IconButton,
  Button, Select, Grid, GridItem, VStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, FormControl, FormLabel,
  Flex, Icon,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, DeleteIcon } from "@chakra-ui/icons";
import { FiClock, FiCheck } from "react-icons/fi";
import { useTranslation } from "../i18n";
import {
  getAvailability, createAvailability, updateAvailability,
  deleteAvailability, AvailableDate,
} from "../api";

const TIME_OPTIONS = Array.from({ length: 24 }, (_, h) =>
  [`${String(h).padStart(2, "0")}:00`, `${String(h).padStart(2, "0")}:30`]
).flat();

const INTERVAL_OPTIONS = [15, 20, 30, 45, 60];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function countSlots(startTime: string, endTime: string, interval: number): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
  return Math.max(0, Math.floor(totalMinutes / interval));
}

export default function AvailabilityPage() {
  const { t, lang } = useTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dates, setDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AvailableDate | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [form, setForm] = useState({ date: "", start_time: "09:00", end_time: "17:00", slot_interval: 30 });

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const dateSet = useMemo(() => new Map(dates.map((d) => [d.date, d])), [dates]);

  const load = async () => {
    setLoading(true);
    try { setDates(await getAvailability()); } catch { toast({ title: t.common.error, status: "error" }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); };

  const handleDayClick = (dateStr: string) => {
    const existing = dateSet.get(dateStr);
    if (existing) {
      setSelectedDate(dateStr);
      setEditing(existing);
      setForm({ date: existing.date, start_time: existing.start_time, end_time: existing.end_time, slot_interval: existing.slot_interval });
      onOpen();
    } else {
      setSelectedDate(dateStr);
      setEditing(null);
      setForm({ date: dateStr, start_time: "09:00", end_time: "17:00", slot_interval: 30 });
      onOpen();
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        const updated = await updateAvailability(editing.id, {
          start_time: form.start_time, end_time: form.end_time, slot_interval: form.slot_interval,
        });
        setDates((prev) => prev.map((d) => (d.id === editing.id ? updated : d)));
      } else {
        const created = await createAvailability(form);
        setDates((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
      }
      toast({ title: t.common.success, status: "success", duration: 2000 });
      onClose();
    } catch (err: any) {
      toast({ title: err?.response?.data?.error || t.common.error, status: "error" });
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    if (!confirm(t.availability.deleteConfirm)) return;
    try {
      await deleteAvailability(editing.id);
      setDates((prev) => prev.filter((d) => d.id !== editing.id));
      toast({ title: t.common.success, status: "success", duration: 2000 });
      onClose();
    } catch { toast({ title: t.common.error, status: "error" }); }
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  if (loading) return <Box textAlign="center" py={20}><Spinner size="xl" color="brand.500" thickness="3px" /></Box>;

  return (
    <Box>
      <Heading size="lg" mb={2} fontWeight="700" color="gray.900">{t.availability.title}</Heading>
      <Text color="gray.400" mb={6} fontSize="sm">{t.availability.clickToAdd}</Text>

      {/* Calendar Header */}
      <Box bg="white" borderRadius="16px" shadow="sm" overflow="hidden" border="1px solid" borderColor="gray.100">
        <HStack justify="space-between" px={6} py={4} borderBottom="1px solid" borderColor="gray.100">
          <IconButton
            aria-label="Previous"
            icon={lang === "ar" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            onClick={prevMonth}
            variant="outline"
            size="sm"
            borderRadius="8px"
            color="gray.500"
            borderColor="gray.200"
            _hover={{ bg: "gray.50" }}
          />
          <HStack spacing={3}>
            <Button variant="ghost" size="sm" onClick={goToday} borderRadius="8px" fontSize="xs" color="gray.500" _hover={{ bg: "gray.100" }}>
              {t.availability.today}
            </Button>
            <Text fontSize="15px" fontWeight="700" color="gray.900" letterSpacing="-0.02em">
              {t.availability.monthNames[viewMonth]} {viewYear}
            </Text>
          </HStack>
          <IconButton
            aria-label="Next"
            icon={lang === "ar" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            onClick={nextMonth}
            variant="outline"
            size="sm"
            borderRadius="8px"
            color="gray.500"
            borderColor="gray.200"
            _hover={{ bg: "gray.50" }}
          />
        </HStack>

        {/* Day Names */}
        <Grid templateColumns="repeat(7, 1fr)" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
          {t.availability.dayNames.map((day: string) => (
            <GridItem key={day} py={3} textAlign="center">
              <Text fontSize="2xs" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                {day}
              </Text>
            </GridItem>
          ))}
        </Grid>

        {/* Calendar Grid */}
        <Grid templateColumns="repeat(7, 1fr)">
          {/* Empty cells for days before the first */}
          {Array.from({ length: firstDay }, (_, i) => (
            <GridItem key={`empty-${i}`} minH="100px" borderBottom="1px solid" borderRight="1px solid" borderColor="gray.50" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = formatDate(viewYear, viewMonth, day);
            const isToday = dateStr === todayStr;
            const config = dateSet.get(dateStr);
            const isPast = dateStr < todayStr;

            return (
              <GridItem
                key={day}
                minH="100px"
                p={2}
                borderBottom="1px solid"
                borderRight="1px solid"
                borderColor="gray.50"
                cursor={isPast ? "default" : "pointer"}
                onClick={() => !isPast && handleDayClick(dateStr)}
                bg={config ? "brand.50" : isToday ? "purple.50" : "white"}
                _hover={isPast ? {} : { bg: config ? "brand.100" : "gray.50" }}
                transition="background 0.15s"
                opacity={isPast ? 0.5 : 1}
                position="relative"
              >
                <Flex justify="space-between" align="flex-start">
                  <Text
                    fontSize="sm"
                    fontWeight={isToday ? "bold" : "500"}
                    bg={isToday ? "brand.500" : undefined}
                    color={isToday ? "white" : "gray.700"}
                    w={isToday ? "28px" : undefined}
                    h={isToday ? "28px" : undefined}
                    lineHeight={isToday ? "28px" : undefined}
                    textAlign="center"
                    borderRadius="full"
                  >
                    {day}
                  </Text>
                  {config && (
                    <Icon as={FiCheck} color="brand.500" boxSize={4} />
                  )}
                </Flex>
                {config && (
                  <VStack spacing={0} align="stretch" mt={1}>
                    <HStack spacing={1}>
                      <Icon as={FiClock} color="brand.600" boxSize={3} />
                      <Text fontSize="2xs" color="brand.700" fontWeight="500">
                        {config.start_time} - {config.end_time}
                      </Text>
                    </HStack>
                    <Text fontSize="2xs" color="gray.500">
                      {countSlots(config.start_time, config.end_time, config.slot_interval)} {t.availability.slotsCount} \u00b7 {config.slot_interval}{t.availability.minutes}
                    </Text>
                  </VStack>
                )}
              </GridItem>
            );
          })}
        </Grid>
      </Box>

      {/* Legend */}
      <HStack mt={4} spacing={6} justify="center">
        <HStack spacing={2}>
          <Box w={3} h={3} borderRadius="sm" bg="brand.100" border="1px solid" borderColor="brand.300" />
          <Text fontSize="xs" color="gray.600">{t.availability.configured}</Text>
        </HStack>
        <HStack spacing={2}>
          <Box w={3} h={3} borderRadius="full" bg="brand.500" />
          <Text fontSize="xs" color="gray.600">{t.availability.today}</Text>
        </HStack>
      </HStack>

      {/* Edit/Add Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader pb={2}>
            <HStack spacing={3}>
              <Box bg="brand.50" borderRadius="lg" p={2}>
                <Icon as={FiClock} color="brand.500" boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="600">
                  {editing ? t.availability.editDate : t.availability.addDate}
                </Text>
                <Text fontSize="sm" color="gray.500" fontWeight="normal">{selectedDate}</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="500">{t.availability.startTime}</FormLabel>
                  <Select value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} borderRadius="lg">
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="500">{t.availability.endTime}</FormLabel>
                  <Select value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} borderRadius="lg">
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">{t.availability.slotInterval}</FormLabel>
                <Select value={form.slot_interval} onChange={(e) => setForm({ ...form, slot_interval: Number(e.target.value) })} borderRadius="lg">
                  {INTERVAL_OPTIONS.map((v) => <option key={v} value={v}>{v} min</option>)}
                </Select>
              </FormControl>
              {form.start_time && form.end_time && (
                <Box bg="gray.50" borderRadius="lg" p={3} w="100%">
                  <Text fontSize="sm" color="gray.600">
                    {countSlots(form.start_time, form.end_time, form.slot_interval)} {t.availability.slotsCount} \u00b7 {form.slot_interval}{t.availability.minutes} each
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter pt={2}>
            <HStack w="100%" justify={editing ? "space-between" : "flex-end"}>
              {editing && (
                <Button variant="ghost" colorScheme="red" size="sm" leftIcon={<DeleteIcon />} onClick={handleDelete}>
                  {t.common.delete}
                </Button>
              )}
              <HStack>
                <Button variant="ghost" onClick={onClose} borderRadius="lg">{t.common.cancel}</Button>
                <Button colorScheme="brand" onClick={handleSave} borderRadius="lg">{t.common.save}</Button>
              </HStack>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
