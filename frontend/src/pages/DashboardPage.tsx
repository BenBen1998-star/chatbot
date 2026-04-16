import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Flex,
  Badge,
  Text,
} from "@chakra-ui/react";
import AppointmentList from "../components/AppointmentList";
import FaqForm from "../components/FaqForm";
import { getAppointments, getFaqs, type Appointment, type FaqEntry } from "../api";

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [faqs, setFaqs] = useState<FaqEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [appts, faqList] = await Promise.all([
        getAppointments(),
        getFaqs(),
      ]);
      setAppointments(appts);
      setFaqs(faqList);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshFaqs = async () => {
    try {
      const faqList = await getFaqs();
      setFaqs(faqList);
    } catch (error) {
      console.error("Failed to refresh FAQs:", error);
    }
  };

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <Container maxW="800px" py={6}>
      <Box mb={6}>
        <Heading size="lg" mb={1}>
          📊 لوحة التحكم
        </Heading>
        <Text color="gray.500" fontSize="sm">
          إدارة المواعيد و الأسئلة المتكررة
        </Text>
      </Box>

      <Tabs colorScheme="brand" variant="enclosed">
        <TabList>
          <Tab>
            المواعيد{" "}
            <Badge ml={2} colorScheme="blue" borderRadius="full">
              {appointments.length}
            </Badge>
          </Tab>
          <Tab>
            الأسئلة المتكررة{" "}
            <Badge ml={2} colorScheme="green" borderRadius="full">
              {faqs.length}
            </Badge>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <AppointmentList appointments={appointments} />
          </TabPanel>
          <TabPanel px={0}>
            <FaqForm faqs={faqs} onRefresh={refreshFaqs} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}
