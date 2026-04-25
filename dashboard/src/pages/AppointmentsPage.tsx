import { useEffect, useState, useMemo } from "react";
import {
  Box, Text, useToast, Spinner, HStack, IconButton,
  VStack, Grid, GridItem, Flex, Icon, Avatar,
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

const AVATAR_COLORS = [
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#dcfce7", color: "#15803d" },
  { bg: "#fef3c7", color: "#b45309" },
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#e0f2fe", color: "#0369a1" },
];

function nameAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function StatCard({ label, value, icon, iconColor, iconBg }: {
  label: string; value: number;
  icon: any; iconColor: string; iconBg: string;
}) {
  return (
    <Box
      bg="white"
      borderRadius="16px"
      p="20px 22px"
      border="1px solid"
      borderColor="gray.100"
      shadow="sm"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      transition="box-shadow 0.18s, transform 0.18s"
      _hover={{ shadow: "hover", transform: "translateY(-1px)" }}
    >
      <Box>
        <Text fontSize="30px" fontWeight="800" color="gray.900" lineHeight="1" letterSpacing="-0.03em">{value}</Text>
        <Text fontSize="12.5px" color="gray.400" mt="6px" fontWeight="500">{label}</Text>
      </Box>
      <Flex
        w="44px" h="44px" borderRadius="14px"
        bg={iconBg} color={iconColor}
        align="center" justify="center" flexShrink={0}
      >
        <Icon as={icon} boxSize={5} />
      </Flex>
    </Box>
  );
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
    ? ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
    : ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const dayNames = lang === "ar"
    ? ["أح","إث","ثل","أر","خم","جم","سب"]
    : ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const selected = selectedDate || todayStr;
  const selectedAppointments = byDate.get(selected) || [];
  const todayCount = (byDate.get(todayStr) || []).length;
  const upcomingCount = appointments.filter((a) => a.date >= todayStr).length;

  if (loading) return <Box textAlign="center" py={20}><Spinner size="xl" color="brand.500" thickness="3px" /></Box>;

  return (
    <Box>
      {/* Header */}
      <Box mb={6}>
        <Text fontSize="22px" fontWeight="800" color="gray.900" letterSpacing="-0.03em" lineHeight="1.2">
          {t.appointments.title}
        </Text>
        <Text fontSize="13px" color="gray.400" mt={1} fontWeight="500">
          {appointments.length} {t.appointments.totalAppointments.toLowerCase()}
        </Text>
      </Box>

      {/* Stats */}
      <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={4} mb={7}>
        <StatCard
          label={t.appointments.totalAppointments} value={appointments.length}
          icon={FiCalendar} iconColor="#6366f1" iconBg="#eef2ff"
        />
        <StatCard
          label={t.appointments.today} value={todayCount}
          icon={FiUser} iconColor="#16a34a" iconBg="#f0fdf4"
        />
        <StatCard
          label={t.appointments.upcoming} value={upcomingCount}
          icon={FiTrendingUp} iconColor="#9333ea" iconBg="#faf5ff"
        />
      </Grid>

      <Flex gap={5} direction={{ base: "column", lg: "row" }} align="flex-start">
        {/* Mini Calendar */}
        <Box
          bg="white" borderRadius="16px" shadow="sm"
          border="1px solid" borderColor="gray.100"
          w={{ base: "100%", lg: "300px" }} flexShrink={0} overflow="hidden"
        >
          {/* Calendar header — flat, no gradient */}
          <HStack
            justify="space-between" px={4} py={4}
            borderBottom="1px solid" borderColor="gray.100"
          >
            <IconButton
              aria-label="Previous"
              icon={lang === "ar" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              onClick={prevMonth}
              variant="ghost"
              size="sm"
              color="gray.500"
              borderRadius="8px"
              _hover={{ bg: "gray.100" }}
            />
            <Text fontWeight="700" fontSize="13.5px" color="gray.900">
              {monthNames[viewMonth]} {viewYear}
            </Text>
            <IconButton
              aria-label="Next"
              icon={lang === "ar" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              onClick={nextMonth}
              variant="ghost"
              size="sm"
              color="gray.500"
              borderRadius="8px"
              _hover={{ bg: "gray.100" }}
            />
          </HStack>

          {/* Day names */}
          <Grid templateColumns="repeat(7, 1fr)" px={2.5} pt={2.5} pb={1}>
            {dayNames.map((d: string) => (
              <GridItem key={d} textAlign="center" py={1}>
                <Text fontSize="10.5px" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="0.04em">{d}</Text>
              </GridItem>
            ))}
          </Grid>

          {/* Days */}
          <Grid templateColumns="repeat(7, 1fr)" px={2.5} pb={3} gap="2px">
            {Array.from({ length: firstDay }, (_, i) => <GridItem key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = formatDate(viewYear, viewMonth, day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selected;
              const count = byDate.get(dateStr)?.length || 0;

              return (
                <GridItem key={day} textAlign="center">
                  <Flex direction="column" align="center" gap="2px">
                    <Box
                      as="button"
                      w="32px" h="32px"
                      borderRadius={isSelected ? "10px" : "8px"}
                      fontSize="12.5px"
                      fontWeight={isToday || isSelected ? "700" : "400"}
                      bg={isSelected ? "brand.500" : isToday ? "brand.50" : "transparent"}
                      color={isSelected ? "white" : isToday ? "brand.600" : "gray.800"}
                      display="flex" alignItems="center" justifyContent="center"
                      _hover={{ bg: isSelected ? "brand.600" : isToday ? "brand.100" : "gray.100" }}
                      onClick={() => setSelectedDate(dateStr)}
                      transition="all 0.12s"
                    >
                      {day}
                    </Box>
                    {count > 0 && (
                      <Box
                        w="4px" h="4px" borderRadius="full"
                        bg={isSelected ? "brand.200" : "brand.500"}
                      />
                    )}
                  </Flex>
                </GridItem>
              );
            })}
          </Grid>
        </Box>

        {/* Appointments List */}
        <Box flex={1}>
          <HStack mb={3.5} spacing={2.5}>
            <Text fontWeight="700" fontSize="14px" color="gray.900">
              {t.appointments.appointmentsOn} {selected}
            </Text>
            {selectedAppointments.length > 0 && (
              <Box
                bg="brand.50" color="brand.600"
                fontSize="11.5px" fontWeight="700"
                px="9px" py="2px" borderRadius="full"
              >
                {selectedAppointments.length} {t.appointments.booked}
              </Box>
            )}
          </HStack>

          {selectedAppointments.length === 0 ? (
            <Box
              bg="white" borderRadius="16px"
              border="1.5px dashed" borderColor="gray.200"
              p={12} textAlign="center"
            >
              <Flex justify="center" mb={3}>
                <Flex bg="gray.50" borderRadius="14px" p={3.5} align="center" justify="center">
                  <Icon as={FiCalendar} boxSize={6} color="gray.300" />
                </Flex>
              </Flex>
              <Text color="gray.400" fontSize="13px" fontWeight="500">{t.appointments.empty}</Text>
            </Box>
          ) : (
            <VStack spacing={2} align="stretch">
              {[...selectedAppointments]
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((apt) => {
                  const ac = nameAvatarColor(apt.name);
                  return (
                    <Box
                      key={apt.id}
                      bg="white"
                      borderRadius="12px"
                      border="1px solid"
                      borderColor="gray.100"
                      p="14px 16px"
                      shadow="sm"
                      _hover={{ shadow: "md", borderColor: "brand.200", transform: "translateY(-1px)" }}
                      transition="all 0.18s ease"
                    >
                      <Flex justify="space-between" align="center">
                        <HStack spacing={3}>
                          <Avatar
                            name={apt.name} size="sm"
                            bg={ac.bg} color={ac.color}
                            fontWeight="700" fontSize="xs"
                          />
                          <Box>
                            <Text fontWeight="600" fontSize="13.5px" color="gray.900">{apt.name}</Text>
                            <HStack spacing={1.5} mt="3px">
                              <Icon as={FiClock} color="gray.300" boxSize={3} />
                              <Text fontSize="12px" color="gray.400" fontWeight="500">{apt.time}</Text>
                            </HStack>
                          </Box>
                        </HStack>
                        <IconButton
                          aria-label={t.common.delete}
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          borderRadius="8px"
                          color="gray.300"
                          _hover={{ bg: "#fef2f2", color: "#ef4444" }}
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
