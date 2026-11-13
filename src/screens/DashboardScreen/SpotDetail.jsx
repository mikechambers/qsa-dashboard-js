import { Table, TagsInput } from "@mantine/core";

export const SpotDetail = ({ spot }) => {
    return (
        <Table variant="vertical" layout="fixed" withTableBorder>
            <Table.Tbody>
                <Table.Tr>
                    <Table.Th ta="right">Receiver</Table.Th>
                    <Table.Td>{spot?.receiverCall}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th ta="right">Distance</Table.Th>
                    <Table.Td>{spot?.distance}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th ta="right">SNR</Table.Th>
                    <Table.Td>{spot?.snr}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th ta="right">Location</Table.Th>
                    <Table.Td>{spot?.receiverCall}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th ta="right">Mode</Table.Th>
                    <Table.Td>{spot?.mode}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th ta="right">Band</Table.Th>
                    <Table.Td>{spot?.band}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th ta="right">Frequency</Table.Th>
                    <Table.Td>{spot?.frequency}</Table.Td>
                </Table.Tr>
            </Table.Tbody>
        </Table>
    );
};
