import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Heading,
  Badge,
  Text,
} from "@chakra-ui/react";
import type { Appointment } from "../api";

interface AppointmentListProps {
  appointments: Appointment[];
}

export default function AppointmentList({ appointments }: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">ما فماش مواعيد حاليا</Text>
      </Box>
    );
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>الاسم</Th>
            <Th>التاريخ</Th>
            <Th>الوقت</Th>
          </Tr>
        </Thead>
        <Tbody>
          {appointments.map((appt) => {
            const isToday = appt.date === new Date().toISOString().split("T")[0];
            return (
              <Tr key={appt.id}>
                <Td fontWeight="medium">{appt.name}</Td>
                <Td>
                  {appt.date}
                  {isToday && (
                    <Badge ml={2} colorScheme="green" fontSize="xs">
                      اليوم
                    </Badge>
                  )}
                </Td>
                <Td>{appt.time}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}
