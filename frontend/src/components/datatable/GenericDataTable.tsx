
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface GenericDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function GenericDataTable<T extends { id?: string }>({ data, columns, isLoading, onEdit, onDelete }: GenericDataTableProps<T>) {
  const [search, setSearch] = useState('');

  const filtered = data.filter((item: any) => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input 
          placeholder="Buscar..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(c => <TableHead key={c.key}>{c.header}</TableHead>)}
              {(onEdit || onDelete) && <TableHead className="w-[150px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map(c => (
                    <TableCell key={c.key}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                  {(onEdit || onDelete) && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center h-24 text-zinc-500">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item, i) => (
                <TableRow key={item.id || i}>
                  {columns.map(c => (
                    <TableCell key={c.key}>{c.render ? c.render(item) : (item as any)[c.key]}</TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell className="space-x-2">
                      {onEdit && <Button variant="outline" size="sm" onClick={() => onEdit(item)}>Editar</Button>}
                      {onDelete && <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>Excluir</Button>}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
