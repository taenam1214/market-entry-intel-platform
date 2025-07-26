import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

interface Column<T> {
  header: string;
  accessor: keyof T;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

function DataTable<T extends object>({ columns, data }: DataTableProps<T>) {
  return (
    <Table variant="simple" bg="white" boxShadow="sm" borderRadius="md">
      <Thead>
        <Tr>
          {columns.map(col => (
            <Th key={col.header}>{col.header}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data.map((row, i) => (
          <Tr key={i}>
            {columns.map(col => (
              <Td key={col.header}>{row[col.accessor] as React.ReactNode}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default DataTable; 