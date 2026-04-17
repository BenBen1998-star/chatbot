import { useEffect, useState, useMemo } from "react";
import {
  Box, Heading, Text, useToast, Spinner, HStack, IconButton,
  VStack, Badge, Grid, GridItem, Flex, Icon, Avatar, SimpleGrid,
} from "@chakra-ui/react";
import { DeleteIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { FiUser, FiClock, FiCalendar, FiTrendingUp } from "react-icons/fi";
import { useTranslation } from "../i18n";
import { getAppointments, deleteAppointment, Appointment } from "../api";

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const COLORS = ["blue", "purple", "teal", "orange", "pink", "cyan", "green"];
function nameColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function AppointmentsPage() {
  const { t, lang } = useTranslation();
  const toast = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const load = async () => {
    setLoading(true);
    try { setAppointments(await getAppointments()); } catch { toast({ title: t.common.error, status: "error" }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Group by date
  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((a) => {
      const arr = map.get(a.date) || [];
      arr.push(a);
      map.set(a.date, arr);
    });
    return map;
  }, [appointments]);

  const handleDelete = async (id: number) => {
    if (!confirm(t.appointments.deleteConfirm)) return;
    try {
      await deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      toast({ title: t.common.success, status: "success", duration: 2000 });
    } catch { toast({ title: t.common.error, status: "error" }); }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const monthNames = lang === "ar"
    ? ["\u062c\u0627\u0646\u0641\u064a", "\u0641\u064a\u0641\u0631\u064a", "\u0645\u0627\u0631\u0633", "\u0623\u0641\u0631\u064a\u0644", "\u0645\u0627\u064a", "\u062c\u0648\u0627\u0646", "\u062c\u0648\u064a\u0644\u064a\u0629", "\u0623\u0648\u062a", "\u0633\u0628\u062a\u0645\u0628\u0631", "\u0623\u0643\u062a\u0648\u0628\u0631", "\u0646\u0648\u0641\u0645\u0628\u0631", "\u062f\u064a\u0633\u0645\u0628\u0631"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const dayNames = lang === "ar"
    ? ["\u0623\u062d\u062f", "\u0625\u062b\u0646\u064a\u0646", "\u062b\u0644\u0627\u062b\u0627\u0621", "\u0623\u0631\u0628\u0639\u0627\u0621", "\u062e\u0645\u064a\u0633", "\u062c\u0645\u0639\u0629", "\u0633\u0628\u062a"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const selected = selectedDate || todayStr;
  const selectedAppointments = byDate.get(selected) || [];

  if (loading) return <Box textAlign="center" py={20}><Spinner size="xl" color="brand.500" thickness="3px" /></Box>;

  const thisMonthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const thisMonthCount = appointments.filter((a) => a.date.startsWith(thisMonthStr)).length;
  const todayCount = (byDate.get(todayStr) || []).length;
  const upcomingCount = appointments.filter((a) => a.date > todayStr).length;

  return (
    <Box>
      <HStack justify="space-between" mb={6} align="flex-start">
        <Box>
          <Heading size="lg">{t.appointments.title}</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            {t.appointments.totalAppointments}: {appointments.length}
          </Text>
        </Box>
      </HStack>

      {/* Stats Row */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={6}>
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" shadow="sm" p={4}>
          <HStack spacing={3}>
            <Box bg="brand.50" borderRadius="lg" p={2.5}>
              <Icon as={FiCalendar} color="brand.500" boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="2xl" fontWeight="700" color="gray.800" lineHeight="1">{appointments.length}</Text>
              <Text fontSize="xs" color="gray.500" mt={0.5}>{t.appointments.totalAppointments}</Text>
            </Box>
          </HStack>
        </Box>
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" shadow="sm" p={4}>
          <HStack spacing={3}>
            <Box bg="green.50" borderRadius="lg" p={2.5}>
              <Icon as={FiUser} color="green.500" boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="2xl" fontWeight="700" color="gray.800" lineHeight="1">{todayCount}</Text>
              <Text fontSize="xs" color="gray.500" mt={0.5}>{t.appointments.today}</Text>
            </Box>
          </HStack>
        </Box>
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" shadow="sm" p={4}>
          <HStack spacing={3}>
            <Box bg="purple.50" borderRadius="lg" p={2.5}>
              <Icon as={FiTrendingUp} color="purple.500" boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="2xl" fontWeight="700" color="gray.800" lineHeight="1">{upcomingCount}</Text>
              <Text fontSize="xs" color="gray.500" mt={0.5}>{t.appointments.upcoming}</Text>
            </Box>
          </HStack>
        </Box>
      </SimpleGrid>

      <Flex gap={6} direction={{ base: "column", lg: "row" }}>
        {/* Mini Calendar */}
        <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" w={{ base: "100%", lg: "340px" }} flexShrink={0} overflow="hidden">
          <HStack justify="space-between" px={4} py={3} bg="brand.500">
            <IconButton
              aria-label="Previous"
              icon={lang === "ar" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              onClick={prevMonth} variant="ghost" color="white" size="sm" _hover={{ bg: "brand.600" }}
            />
            <Text color="white" fontWeight="600" fontSize="sm">
              {monthNames[viewMonth]} {viewYear}
            </Text>
            <IconButton
              aria-label="Next"
              icon={lang === "ar" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              onClick={nextMonth} variant="ghost" color="white" size="sm" _hover={{ bg: "brand.600" }}
            />
          </HStack>

          <Grid templateColumns="repeat(7, 1fr)" px={2} py={1}>
            {dayNames.map((d: string) => (
              <GridItem key={d} py={2} textAlign="center">
                <Text fontSize="2xs" fontWeight="600" color="gray.400" textTransform="uppercase">{d}</Text>
              </GridItem>
            ))}
          </Grid>

          <Grid templateColumns="repeat(7, 1fr)" px={2} pb={3}>
            {Array.from({ length: firstDay }, (_, i) => <GridItem key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = formatDate(viewYear, viewMonth, day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selected;
              const count = byDate.get(dateStr)?.length || 0;

              return (
                <GridItem key={day} textAlign="center" py={1}>
                  <Box
                    as="button"
                    w="36px" h="36px"
                    lineHeight="36px"
                    borderRadius="lg"
                    fontSize="sm"
                    fontWeight={isToday || isSelected ? "700" : "400"}
                    bg={isSelected ? "brand.500" : isToday ? "brand.50" : "transparent"}
                    color={isSelected ? "white" : isToday ? "brand.600" : "gray.700"}
                    _hover={{ bg: isSelected ? "brand.600" : "gray.100" }}
                    onClick={() => setSelectedDate(dateStr)}
                    position="relative"
                    transition="all 0.15s"
                  >
                    {day}
                    {count > 0 && (
                      <Box
                        position="absolute" bottom="2px" left="50%" transform="translateX(-50%)"
                        w="5px" h="5px" borderRadius="full"
                        bg={isSelected ? "white" : "brand.400"}
                      />
                    )}
                  </Box>
                </GridItem>
              );
            })}
          </Grid>
        </Box>

        {/* Appointments List */}
        <Box flex={1}>
          <HStack mb={4} spacing={3}>
            <Icon as={FiCalendar} color="brand.500" />
            <Text fontWeight="600" fontSize="lg">
              {t.appointments.appointmentsOn} {selected}
            </Text>
            {selectedAppointments.length > 0 && (
              <Badge colorScheme="brand" borderRadius="full" px={2}>
                {selectedAppointments.length} {t.appointments.booked}
              </Badge>
            )}
          </HStack>

          {selectedAppointments.length === 0 ? (
            <Box bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.200" p={10} textAlign="center">
              <Icon as={FiCalendar} boxSize={10} color="gray.300" mb={3} />
              <Text color="gray.400" fontSize="sm">{t.appointments.empty}</Text>
            </Box>
          ) : (
            <VStack spacing={3} align="stretch">
              {selectedAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((apt) => {
                  const color = nameColor(apt.name);
                  return (
                    <Box
                      key={apt.id}
                      bg="white"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="gray.100"
                      p={4}
                      shadow="sm"
                      _hover={{ shadow: "md", borderColor: "gray.200" }}
                      transition="all 0.2s"
                    >
                      <Flex justify="space-between" align="center">
                        <HStack spacing={3}>
                          <Avatar name={apt.name} size="sm" bg={`${color}.100`} color={`${color}.700`} />
                          <Box>
                            <Text fontWeight="600" fontSize="sm">{apt.name}</Text>
                            <HStack spacing={2} mt={0.5}>
                              <Icon as={FiClock} color="gray.400" boxSize={3} />
                              <Text fontSize="xs" color="gray.500">{apt.time}</Text>
                            </HStack>
                          </Box>
                        </HStack>
                        <IconButton
                          aria-label={t.common.delete}
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          borderRadius="lg"
                          onClick={() => handleDelete(apt.id)}
                        />
                      </Flex>
                    </Box>
                  );
                })}
            </VStack>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
