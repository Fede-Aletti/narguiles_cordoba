"use client";
import React from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUsersWithAuthEmail as fetchServerSideUsers,
  updateUser,
  deactivateUser,
  type UserWithAuthEmail as UserWithAuth,
  type UpdateUserPayload,
} from "@/actions/user-actions";
import { fetchClientSideUsers } from "@/lib/queries/user-queries";
import { UserForm } from "./user-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { IUser } from "@/interfaces/user";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAddressesByUserId } from "@/lib/queries/address-queries";
import type { IAddress } from "@/interfaces/address";

interface UserRowDetailProps {
  userId: string;
}

function UserRowDetail({ userId }: UserRowDetailProps) {
  const { data: addresses, isLoading: isLoadingAddresses, error: addressesError } = useAddressesByUserId(userId);

  return (
    <div className="p-4 bg-muted/50">
      <h4 className="font-semibold mb-2">Detalles Adicionales:</h4>
      
      <div className="mb-4">
        <h5 className="font-medium mb-1">Direcciones:</h5>
        {isLoadingAddresses && <p>Cargando direcciones...</p>}
        {addressesError && <p className="text-red-500">Error al cargar direcciones: {addressesError.message}</p>}
        {addresses && addresses.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {addresses.map(addr => (
              <li key={addr.id}>
                {addr.street} {addr.street_number}, {addr.city}, {addr.province}
              </li>
            ))}
          </ul>
        ) : addresses && addresses.length === 0 ? (
          <p>No hay direcciones registradas.</p>
        ) : null}
      </div>

      <div className="mb-4">
        <h5 className="font-medium mb-1">Favoritos:</h5>
        <p>Datos de favoritos aquí...</p>
      </div>

      <div>
        <h5 className="font-medium mb-1">Órdenes:</h5>
        <p>Datos de órdenes aquí...</p>
      </div>
    </div>
  );
}

interface UserTableProps {
  initialUsers: UserWithAuth[];
}

export function UserTable({ initialUsers }: UserTableProps) {
  const queryClient = useQueryClient();
  const [editUser, setEditUser] = useState<UserWithAuth | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserWithAuth | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const { data: users = [], isLoading } = useQuery<UserWithAuth[], Error>({
    queryKey: ["users"],
    queryFn: fetchClientSideUsers,
    initialData: initialUsers,
  });

  const updateMutation = useMutation<
    IUser,
    Error,
    { id: string; payload: UpdateUserPayload }
  >({
    mutationFn: (variables) => updateUser(variables.id, variables.payload),
    onSuccess: () => {
      toast.success("Usuario actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditUser(null);
    },
    onError: (error) => {
      toast.error(`Error al actualizar usuario: ${error.message}`);
    },
  });

  const deactivateMutation = useMutation<IUser, Error, string>({
    mutationFn: deactivateUser,
    onSuccess: () => {
      toast.success("Usuario desactivado correctamente");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteUser(null);
    },
    onError: (error) => {
      toast.error(`Error al desactivar usuario: ${error.message}`);
    },
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Badge className="bg-purple-500">Superadmin</Badge>;
      case "admin":
        return <Badge className="bg-blue-500">Admin</Badge>;
      case "marketing":
        return <Badge className="bg-green-500">Marketing</Badge>;
      case "client":
        return <Badge className="bg-gray-500">Cliente</Badge>;
      default:
        return <Badge className="bg-gray-300">{role}</Badge>;
    }
  };

  const toggleRowExpansion = (userId: string) => {
    setExpandedRows(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No hay usuarios
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <React.Fragment key={user.id}>
                  <TableRow>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => toggleRowExpansion(user.id)} aria-label={expandedRows[user.id] ? "Colapsar fila" : "Expandir fila"}>
                        {expandedRows[user.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone_number || "No disponible"}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setEditUser(user)}
                          aria-label="Editar usuario"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setDeleteUser(user)}
                          aria-label="Desactivar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRows[user.id] && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <UserRowDetail userId={user.id} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {editUser && (
            <UserForm
              defaultValues={{
                first_name: editUser.first_name || "",
                last_name: editUser.last_name || "",
                phone_number: editUser.phone_number,
                role: editUser.role,
              }}
              onSubmit={(data) => {
                if (editUser?.id) {
                  const payload: UpdateUserPayload = {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    phone_number: data.phone_number,
                    role: data.role,
                  };
                  updateMutation.mutate({ id: editUser.id, payload });
                }
              }}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará al usuario {deleteUser?.first_name}{" "}
              {deleteUser?.last_name}({deleteUser?.email}). El usuario ya no
              podrá iniciar sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteUser && deactivateMutation.mutate(deleteUser.id)
              }
              className="bg-red-500 hover:bg-red-600"
            >
              {deactivateMutation.isPending ? "Desactivando..." : "Desactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
